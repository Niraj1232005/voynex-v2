'use client';
import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TbCheck, TbCreditCard, TbLock, TbBuildingBank, TbChevronLeft, TbAlertCircle, TbPackage } from 'react-icons/tb';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

type CheckoutStep = 1 | 2 | 3;

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

function CheckoutPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  
  const tripId = searchParams.get('tripId');
  const date = searchParams.get('date');
  const adults = parseInt(searchParams.get('adults') || '2');
  const children = parseInt(searchParams.get('children') || '0');
  const seniors = parseInt(searchParams.get('seniors') || '0');
  const rentalsParam = searchParams.get('rentals');

  const parsedRentals: { rentalId: string; quantity: number }[] = useMemo(() => {
    if (!rentalsParam) return [];
    try {
      const parsed = JSON.parse(rentalsParam);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [rentalsParam]);
  
  const [trip, setTrip] = useState<any>(null);
  const [rentalDetails, setRentalDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<CheckoutStep>(1);

  // Form States
  const [firstName, setFirstName] = useState((user as any)?.firstName || 'Traveler');
  const [lastName, setLastName] = useState((user as any)?.lastName || '');
  const [email, setEmail] = useState(user?.email || 'traveler@voynex.com');
  const [phone, setPhone] = useState('+91 9876543210');
  const [specialRequests, setSpecialRequests] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (tripId) {
      api.get(`/trips/${tripId}`)
        .then(async (res) => {
          setTrip(res);
          const orgId = res.organizationId || res.organization_id || res.organization?.id;
          if (orgId && parsedRentals.length > 0) {
            try {
              const rRes = await api.get(`/rentals?organizationId=${orgId}`);
              if (Array.isArray(rRes)) {
                setRentalDetails(rRes);
              }
            } catch (rErr) {
              console.warn('Could not load rental equipment details for checkout:', rErr);
            }
          }
        })
        .catch(err => console.error('Error fetching trip for checkout:', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, router, tripId, parsedRentals.length]);

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!trip) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl font-bold">Invalid Booking Request</p>
        <p className="text-sm text-muted mt-1">Trip details could not be loaded from the database.</p>
        <button onClick={() => router.push('/trips')} className="mt-4 text-primary font-bold hover:underline">Return to Trips</button>
      </div>
    </div>
  );

  const totalGuests = adults + children + seniors;
  const tripSubtotal = Number(trip.price || 0) * totalGuests;
  const durationDays = trip.durationDays || trip.duration || 1;

  // Process selected rentals
  let rentalSubtotal = 0;
  let depositSubtotal = 0;

  const populatedRentals = parsedRentals.map(item => {
    const detail = rentalDetails.find(r => (r.id || r._id) === item.rentalId);
    const pricePerDay = Number(detail?.pricePerDay || 0);
    const deposit = Number(detail?.deposit || 0);
    const itemTotal = pricePerDay * durationDays * item.quantity;
    const itemDeposit = deposit * item.quantity;
    rentalSubtotal += itemTotal;
    depositSubtotal += itemDeposit;
    return {
      ...item,
      title: detail?.title || detail?.name || 'Equipment Rental',
      category: detail?.category || 'Gear',
      pricePerDay,
      deposit,
      itemTotal,
      itemDeposit,
    };
  });

  const total = tripSubtotal + rentalSubtotal + depositSubtotal;

  const handleConfirmPayment = async () => {
    setErrorMessage('');
    setSubmitting(true);

    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      setErrorMessage('Razorpay SDK failed to load. Please check your internet connection.');
      setSubmitting(false);
      return;
    }

    try {
      // Step 1: Create Booking in DB
      const travelDateStr = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const bookingPayload: any = {
        tripId,
        travelersCount: totalGuests,
        travelDate: travelDateStr,
        adultsCount: adults,
        childrenCount: children,
        seniorsCount: seniors,
        notes: specialRequests,
      };

      if (parsedRentals.length > 0) {
        bookingPayload.rentals = parsedRentals.map(r => ({
          rentalId: r.rentalId,
          quantity: r.quantity,
        }));
      }

      const bookingRes = await api.post('/bookings', bookingPayload);
      const realBookingId = bookingRes._id || bookingRes.id;

      // Step 2: Create Payment Order on Backend
      const orderRes = await api.post('/payments/create-order', { bookingId: realBookingId });

      // Step 3: Open Official Razorpay Checkout Modal
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: 'Voynex Travel Marketplace',
        description: `Booking for ${trip.title}`,
        order_id: orderRes.orderId,
        prefill: {
          name: `${firstName} ${lastName}`.trim() || 'Traveler',
          email: email,
          contact: phone,
        },
        theme: {
          color: '#6366f1',
        },
        handler: async function (response: any) {
          try {
            // Step 4: Verify Payment Server-Side with Real Signature
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Step 5: Redirect to Booking Success Page
            const destName = trip.destination || trip.title;
            router.push(`/booking-success?bookingId=${realBookingId}&destination=${encodeURIComponent(destName)}&date=${encodeURIComponent(travelDateStr)}`);
          } catch (err: any) {
            console.error('Payment verification error:', err);
            setErrorMessage(err.message || 'Payment verification failed on server.');
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
        setErrorMessage(resp.error?.description || 'Payment failed in Razorpay checkout.');
        setSubmitting(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Payment initiation failed. Please try again.');
      setSubmitting(false);
    }
  };

  const renderProgress = () => (
    <div className="mb-10">
      <div className="flex items-center justify-between relative max-w-lg mx-auto">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-hover -z-10 -translate-y-1/2 rounded-full" />
        <div className="absolute top-1/2 left-0 h-1 bg-accent -z-10 -translate-y-1/2 rounded-full transition-all duration-500" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} />
        
        {[
          { num: 1, label: 'Review' },
          { num: 2, label: 'Details' },
          { num: 3, label: 'Payment' }
        ].map(s => (
          <div key={s.num} className="flex flex-col items-center gap-2 bg-background px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
              step >= s.num ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'bg-surface border-2 border-border text-muted'
            }`}>
              {step > s.num ? <TbCheck size={16} /> : s.num}
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${step >= s.num ? 'text-foreground' : 'text-muted'}`}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24 pt-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        <button onClick={() => step > 1 ? setStep((step - 1) as CheckoutStep) : router.back()} className="flex items-center gap-2 text-sm font-bold text-muted hover:text-foreground mb-8 tap-target">
          <TbChevronLeft size={16} /> {step === 1 ? 'Back to Trip' : 'Previous Step'}
        </button>

        {renderProgress()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: Form Steps */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: REVIEW */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Review your booking</h2>
                  
                  <div className="p-6 rounded-2xl border border-border bg-card">
                    <h3 className="font-bold text-lg mb-4 text-accent">Trip Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-muted uppercase">Destination</p>
                        <p className="font-medium mt-1">{trip.title}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted uppercase">Dates</p>
                        <p className="font-medium mt-1">{date ? new Date(date).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Flexible'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted uppercase">Duration</p>
                        <p className="font-medium mt-1">{trip.durationDays || trip.duration || 1} Days</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted uppercase">Guests</p>
                        <p className="font-medium mt-1">{totalGuests} ({adults} Adults{children > 0 ? `, ${children} Children` : ''}{seniors > 0 ? `, ${seniors} Seniors` : ''})</p>
                      </div>
                    </div>
                  </div>

                  {populatedRentals.length > 0 && (
                    <div className="p-6 rounded-2xl border border-border bg-card">
                      <div className="flex items-center gap-2 mb-4">
                        <TbPackage className="text-accent" size={20} />
                        <h3 className="font-bold text-lg text-accent">Optional Equipment Rental</h3>
                      </div>
                      <div className="space-y-3">
                        {populatedRentals.map((r, i) => (
                          <div key={i} className="flex justify-between items-center text-sm border-b border-border/40 pb-2.5 last:border-0 last:pb-0">
                            <div>
                              <p className="font-bold text-foreground">{r.title} <span className="text-xs text-muted font-normal">&times; {r.quantity}</span></p>
                              <p className="text-xs text-muted">₹{r.pricePerDay}/day for {durationDays} days {r.deposit > 0 ? `• ₹${r.deposit} deposit/item` : ''}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">₹{r.itemTotal.toLocaleString()}</p>
                              {r.itemDeposit > 0 && <p className="text-[10px] text-muted">+ ₹{r.itemDeposit.toLocaleString()} dep.</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl border border-border bg-surface-hover">
                    <p className="text-xs font-semibold flex items-center gap-2 text-muted">
                      <TbCheck className="text-green-500" /> Cancellations and refunds are subject to agency booking terms.
                    </p>
                  </div>

                  <button onClick={() => setStep(2)} className="w-full py-4 rounded-xl bg-accent text-white font-bold text-lg hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 transition-all tap-target">
                    Continue to Details
                  </button>
                </motion.div>
              )}

              {/* STEP 2: DETAILS */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Traveler Details</h2>
                  
                  <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">First Name *</label>
                        <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-accent" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Last Name *</label>
                        <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-accent" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Email Address *</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-accent" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Phone Number *</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-accent" />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Special Requests (Optional)</label>
                      <textarea value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} placeholder="Dietary requirements, accessibility needs..." rows={3} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-accent resize-none" />
                    </div>
                  </div>

                  <button onClick={() => setStep(3)} className="w-full py-4 rounded-xl bg-accent text-white font-bold text-lg hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 transition-all tap-target">
                    Continue to Payment
                  </button>
                </motion.div>
              )}

              {/* STEP 3: PAYMENT */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
                  
                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-semibold flex items-center gap-2">
                      <TbAlertCircle size={18} /> {errorMessage}
                    </div>
                  )}

                  <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface-hover">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                          <TbCreditCard size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Cards, UPI, Netbanking & Wallets</p>
                          <p className="text-xs text-muted">Secured by Razorpay Official Payment Gateway</p>
                        </div>
                      </div>
                      <div className="flex gap-2 text-muted text-xs font-bold">
                        <span className="px-2 py-1 bg-background rounded border border-border">UPI</span>
                        <span className="px-2 py-1 bg-background rounded border border-border">Cards</span>
                        <span className="px-2 py-1 bg-background rounded border border-border">Netbanking</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-muted bg-green-500/10 p-3 rounded-lg border border-green-500/20 text-green-600">
                      <TbLock size={16} /> Payments are processed securely via official Razorpay SSL encryption.
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={handleConfirmPayment} 
                    disabled={submitting}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-teal text-white font-bold text-lg hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 transition-all tap-target flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <TbLock size={20} /> {submitting ? 'Opening Razorpay Gateway...' : `Proceed to Pay ₹${total.toLocaleString()}`}
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Right Column: Sticky Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border border-border bg-card p-6 shadow-xl">
              <h3 className="font-bold text-lg mb-6 pb-4 border-b border-border">Order Summary</h3>
              
              <div className="flex items-start gap-4 mb-6">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-400 to-purple-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-sm leading-tight line-clamp-2 mb-1">{trip.title}</h4>
                  <p className="text-xs text-muted font-medium">{totalGuests} Guests • {trip.durationDays || trip.duration || 1} Days</p>
                </div>
              </div>

              <div className="space-y-3 text-sm font-medium mb-6">
                <div className="flex justify-between text-muted">
                  <span>Trip ({trip.price.toLocaleString()} &times; {totalGuests})</span>
                  <span>₹{tripSubtotal.toLocaleString()}</span>
                </div>
                {rentalSubtotal > 0 && (
                  <div className="flex justify-between text-muted">
                    <span>Optional Gear ({populatedRentals.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span>₹{rentalSubtotal.toLocaleString()}</span>
                  </div>
                )}
                {depositSubtotal > 0 && (
                  <div className="flex justify-between text-muted">
                    <span>Security Deposit (Refundable)</span>
                    <span>₹{depositSubtotal.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4 flex justify-between items-center">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-2xl text-accent">₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    }>
      <CheckoutPageInner />
    </Suspense>
  );
}
