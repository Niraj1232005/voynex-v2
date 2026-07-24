'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiPackage } from 'react-icons/fi';
import Breadcrumbs from '@/components/Breadcrumbs';
import { api } from '@/lib/api';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const CATEGORIES = ['all', 'gear', 'vehicle', 'electronics', 'apparel'];
const typeEmoji: Record<string, string> = { gear: '🎒', vehicle: '🏍️', electronics: '📷', apparel: '🧥' };

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

export default function RentalsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [rentals, setRentals] = useState<any[]>([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRentals();
    loadRazorpayScript();
  }, []);

  const fetchRentals = () => {
    setLoading(true);
    api.get('/rentals')
      .then(res => {
        if (Array.isArray(res)) {
          setRentals(res);
        }
      })
      .catch(err => {
        console.error('Error fetching rentals:', err);
        setRentals([]);
      })
      .finally(() => setLoading(false));
  };

  const handleRentNow = async (rental: any) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const rentalId = rental._id || rental.id;
    const inputDays = prompt(`Enter rental duration in days for "${rental.title || rental.name}":`, '3');
    if (!inputDays) return;
    const daysCount = parseInt(inputDays, 10);
    if (isNaN(daysCount) || daysCount < 1) {
      alert('Please enter a valid number of days (1 or more).');
      return;
    }

    setSubmittingId(rentalId);

    try {
      // 1. Create rental booking in DB
      const bookingRes = await api.post(`/rentals/${rentalId}/book`, { daysCount });
      const realBookingId = bookingRes._id || bookingRes.id;

      // 2. Create Razorpay Payment order
      const orderRes = await api.post('/payments/create-order', { bookingId: realBookingId });

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        setSubmittingId(null);
        return;
      }

      // 3. Open Razorpay Checkout Modal
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: 'Voynex Rental Marketplace',
        description: `Rental: ${rental.title || rental.name}`,
        order_id: orderRes.orderId,
        prefill: {
          name: `${(user as any)?.firstName || ''} ${(user as any)?.lastName || ''}`.trim() || 'Traveler',
          email: user?.email || 'traveler@voynex.com',
        },
        theme: {
          color: '#6366f1',
        },
        handler: async function (response: any) {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            router.push(`/booking-success?bookingId=${realBookingId}&destination=${encodeURIComponent(rental.title || 'Rental Gear')}`);
          } catch (err: any) {
            alert(err.message || 'Payment verification failed.');
          } finally {
            setSubmittingId(null);
          }
        },
        modal: {
          ondismiss: function () {
            setSubmittingId(null);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        alert(resp.error?.description || 'Payment failed.');
        setSubmittingId(null);
      });
      rzp.open();
    } catch (err: any) {
      alert(err.message || 'Failed to initiate rental booking.');
      setSubmittingId(null);
    }
  };

  const filtered = category === 'all'
    ? rentals
    : rentals.filter(r => (r.category || r.type || '').toLowerCase() === category);

  return (
    <div className="min-h-screen">
      <Breadcrumbs />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 pb-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Travel Rentals</h1>
          <p className="text-muted mt-2">Rent high-quality gear, vehicles, and equipment for your upcoming adventure</p>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-all tap-target ${
                category === c ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card border border-border hover:bg-muted/40'}`}>
              {c === 'all' ? '🌐 All Rentals' : `${typeEmoji[c] || '📦'} ${c}`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-2xl bg-card text-center text-muted">
            <FiPackage size={40} className="mb-3 text-muted/60" />
            <p className="font-semibold text-base">No rentals found</p>
            <p className="text-sm text-muted/60 mt-1">Try selecting a different category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((rental, idx) => (
              <motion.div key={rental._id || rental.id || idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="h-52 bg-muted relative flex items-center justify-center overflow-hidden">
                    {rental.images && rental.images[0] ? (
                      <img src={rental.images[0]} alt={rental.title || rental.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <span className="text-6xl">{typeEmoji[rental.category || rental.type] || '🎒'}</span>
                    )}
                    {rental.isAvailable === false && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                        <span className="px-4 py-1.5 rounded-full bg-red-500 text-white text-xs font-bold">Currently Rented</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold capitalize">
                        {rental.category || rental.type || 'gear'}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted">
                        <FiMapPin size={12} /> {rental.location || 'Pan-India'}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-1.5 group-hover:text-primary transition-colors">{rental.title || rental.name}</h3>
                    <p className="text-sm text-muted mb-4 line-clamp-2">{rental.description}</p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between border-t border-border/60 mt-2">
                  <div>
                    <span className="text-2xl font-black text-foreground">₹{rental.pricePerDay || rental.price}</span>
                    <span className="text-xs text-muted font-medium"> / day</span>
                  </div>
                  <button
                    onClick={() => handleRentNow(rental)}
                    disabled={submittingId === (rental._id || rental.id)}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {submittingId === (rental._id || rental.id) ? 'Processing...' : 'Rent Now'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
