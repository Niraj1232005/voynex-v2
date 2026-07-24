'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiMinus, FiPlus, FiTrash2, FiArrowRight, FiShoppingBag, FiCheckCircle } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import Breadcrumbs from '@/components/Breadcrumbs';
import { api } from '@/lib/api';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice, totalItems } = useCart();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setSubmitting(true);

    const payload = {
      items: items.map(item => ({
        productId: item.product._id || (item.product as any).id,
        title: item.product.name || (item.product as any).title,
        quantity: item.quantity,
        price: item.product.price,
      })),
      shippingAddress: { city: 'Pan-India Delivery' },
    };

    try {
      // 1. Create order in DB (pending) & create Razorpay order
      const orderRes = await api.post('/shop/orders', payload);

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        setSubmitting(false);
        return;
      }

      // 2. Open Razorpay Popup
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: 'Voynex Travel Gear Shop',
        description: `Order #${(orderRes.orderId || '').slice(0, 8)}`,
        order_id: orderRes.razorpayOrderId,
        prefill: {
          name: `${(user as any)?.firstName || ''} ${(user as any)?.lastName || ''}`.trim() || 'Traveler',
          email: user?.email || 'traveler@voynex.com',
        },
        theme: {
          color: '#6366f1',
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await api.post('/shop/orders/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setOrderSuccess(verifyRes.order || orderRes.normalizedOrder);
            clearCart();
          } catch (err: any) {
            alert(err.message || 'Shop order payment verification failed.');
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        alert(resp.error?.description || 'Shop order payment failed.');
        setSubmitting(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error('Error placing shop order:', err);
      alert(err.message || 'Failed to place shop order.');
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen">
        <Breadcrumbs />
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
          <div className="h-20 w-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
            <FiCheckCircle size={48} />
          </div>
          <h2 className="text-3xl font-bold mb-2 text-foreground">Order Placed Successfully!</h2>
          <p className="text-muted mb-2 text-center max-w-sm">Order ID: <span className="font-mono text-primary font-bold">{orderSuccess._id || orderSuccess.id}</span></p>
          <p className="text-sm text-muted mb-8 text-center max-w-md">Thank you for ordering your gear from Voynex Shop. Your items are being prepared for dispatch.</p>
          <Link href="/shop" className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Breadcrumbs />
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
          <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-muted/60 mb-6">
            <FiShoppingBag size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted mb-8 text-center max-w-sm">Looks like you haven&apos;t added any travel gear yet. Explore our shop for premium items.</p>
          <Link href="/shop" className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all">
            Browse Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Breadcrumbs />
      <div className="py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Shopping Cart <span className="text-muted text-xl font-normal">({totalItems} items)</span></h1>
            <button onClick={clearCart} className="text-sm font-medium text-red-500 hover:underline">Clear Cart</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <motion.div key={item.product._id || (item.product as any).id} layout className="flex flex-col sm:flex-row gap-4 p-5 rounded-2xl border border-border bg-card hover:shadow-md transition-all">
                  <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-xl bg-muted flex-shrink-0 flex items-center justify-center text-3xl overflow-hidden">
                    {item.product.images && item.product.images[0] ? (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      '🎒'
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-muted capitalize mb-1">{item.product.category || 'gear'}</p>
                        <h3 className="font-bold text-lg line-clamp-1 text-foreground">{item.product.name || (item.product as any).title}</h3>
                      </div>
                      <button onClick={() => removeFromCart(item.product._id || (item.product as any).id)} className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateQuantity(item.product._id || (item.product as any).id, item.quantity - 1)}
                          className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                          <FiMinus size={14} />
                        </button>
                        <span className="w-6 text-center font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product._id || (item.product as any).id, item.quantity + 1)}
                          className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                          <FiPlus size={14} />
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-primary text-lg">₹{(item.product.price * item.quantity).toLocaleString()}</span>
                        {item.quantity > 1 && <div className="text-xs text-muted">₹{item.product.price.toLocaleString()} each</div>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-lg">
                <h3 className="font-bold text-xl mb-6">Order Summary</h3>
                <div className="space-y-4 text-sm border-b border-border pb-6 mb-6">
                  <div className="flex justify-between"><span className="text-muted">Subtotal ({totalItems} items)</span><span className="font-semibold">₹{totalPrice.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Shipping</span><span className="text-emerald-500 font-bold">FREE</span></div>
                  <div className="flex justify-between"><span className="text-muted">Estimated Tax (5%)</span><span className="font-semibold">₹{Math.round(totalPrice * 0.05).toLocaleString()}</span></div>
                </div>
                <div className="flex justify-between font-black text-xl mb-8">
                  <span>Total</span><span className="text-primary">₹{Math.round(totalPrice * 1.05).toLocaleString()}</span>
                </div>
                <button onClick={handleCheckout} disabled={submitting}
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-md disabled:opacity-50">
                  {submitting ? 'Processing Order...' : <>Checkout <FiArrowRight /></>}
                </button>
                <div className="mt-4 text-center">
                  <Link href="/shop" className="text-xs font-semibold text-primary hover:underline">Continue Shopping</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
