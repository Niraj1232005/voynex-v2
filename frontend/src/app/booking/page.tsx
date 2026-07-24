'use client';
import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiCheck, FiMapPin, FiCalendar, FiUsers, FiCreditCard } from 'react-icons/fi';
import ProtectedRoute from '@/components/ProtectedRoute';
import Breadcrumbs from '@/components/Breadcrumbs';
import { api } from '@/lib/api';

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tripId = searchParams.get('tripId');
  const [trip, setTrip] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (tripId) {
      api.get(`/trips/${tripId}`)
        .then(res => setTrip(res))
        .catch(err => console.error('Error fetching trip for booking page:', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [tripId]);

  const date = searchParams.get('date') || '';
  const adults = parseInt(searchParams.get('adults') || '2');
  const children = parseInt(searchParams.get('children') || '0');
  const seniors = parseInt(searchParams.get('seniors') || '0');
  const totalGuests = adults + children + seniors;
  const totalPrice = trip ? (trip.price || 0) * totalGuests : 0;

  const [step, setStep] = useState<'summary' | 'payment' | 'confirmed'>('summary');
  const [processing, setProcessing] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!trip) return (
    <div className="min-h-screen">
      <Breadcrumbs />
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted">Invalid booking. Please select a trip first.</p>
      </div>
    </div>
  );

  const handlePayment = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    setStep('confirmed');
    setProcessing(false);
  };

  const steps = [
    { id: 'summary', label: 'Summary' },
    { id: 'payment', label: 'Payment' },
    { id: 'confirmed', label: 'Confirmed' },
  ];

  return (
    <div className="min-h-screen">
      <Breadcrumbs tripTitle="Booking" />
      <div className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-4xl font-bold mb-10 text-center">Secure Checkout</h1>

          {/* Progress */}
          <div className="flex items-center justify-center mb-12">
            {steps.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className="flex items-center">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-colors ${
                    steps.findIndex(x => x.id === step) >= i ? 'bg-accent text-white shadow-accent/20' : 'bg-surface-hover text-muted'}`}>
                    {steps.findIndex(x => x.id === step) > i ? <FiCheck size={20} /> : i + 1}
                  </div>
                  <span className={`ml-3 text-sm font-semibold hidden sm:block ${steps.findIndex(x => x.id === step) >= i ? 'text-foreground' : 'text-muted'}`}>{s.label}</span>
                </div>
                {i < steps.length - 1 && <div className={`w-12 sm:w-24 h-1 mx-4 rounded-full ${steps.findIndex(x => x.id === step) > i ? 'bg-accent' : 'bg-surface-hover'}`} />}
              </React.Fragment>
            ))}
          </div>

          {step === 'summary' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="rounded-3xl border border-border bg-card p-8 shadow-xl">
                <h2 className="text-2xl font-bold mb-6">Booking Details</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0"><FiMapPin size={24} /></div>
                    <div>
                      <p className="text-sm font-medium text-muted">Trip</p>
                      <p className="font-semibold text-lg">{trip.title}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0"><FiCalendar size={24} /></div>
                    <div>
                      <p className="text-sm font-medium text-muted">Date</p>
                      <p className="font-semibold text-lg">{date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Flexible'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-orange/10 flex items-center justify-center text-orange flex-shrink-0"><FiUsers size={24} /></div>
                    <div>
                      <p className="text-sm font-medium text-muted">Guests</p>
                      <p className="font-semibold text-lg">{adults} Adults, {children} Children, {seniors} Seniors</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-border mt-8 pt-6 space-y-3">
                  <div className="flex justify-between text-base"><span className="text-muted">₹{trip.price.toLocaleString()} × {totalGuests} guests</span><span className="font-medium">₹{totalPrice.toLocaleString()}</span></div>
                  <div className="flex justify-between text-base"><span className="text-muted">Taxes & fees (5%)</span><span className="font-medium">₹{Math.round(totalPrice * 0.05).toLocaleString()}</span></div>
                  <div className="flex justify-between font-bold text-2xl pt-4 border-t border-border mt-4">
                    <span>Total</span><span className="text-accent">₹{Math.round(totalPrice * 1.05).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setStep('payment')}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-teal text-white font-bold text-lg hover:shadow-xl hover:shadow-accent/20 transition-all tap-target">
                Proceed to Payment
              </button>
            </motion.div>
          )}

          {step === 'payment' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="rounded-3xl border border-border bg-card p-8 shadow-xl">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><FiCreditCard className="text-accent" /> Payment Method</h2>
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Card Number</label>
                    <input placeholder="4242 4242 4242 4242" className="w-full px-5 py-4 rounded-xl border border-border bg-background font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 tap-target" />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Expiry</label>
                      <input placeholder="MM/YY" className="w-full px-5 py-4 rounded-xl border border-border bg-background font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 tap-target" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-2 block">CVV</label>
                      <input placeholder="123" type="password" maxLength={4} className="w-full px-5 py-4 rounded-xl border border-border bg-background font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 tap-target" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Name on Card</label>
                    <input placeholder="John Doe" className="w-full px-5 py-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 tap-target" />
                  </div>
                </div>
                <div className="mt-6 p-4 rounded-xl bg-accent/5 border border-accent/10 flex items-start gap-3">
                  <FiCheck className="text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted leading-relaxed">Your payment is secured by industry-standard encryption. We never store your full card details.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setStep('summary')} className="flex-1 py-4 rounded-xl border-2 border-border font-bold hover:bg-surface-hover transition-all tap-target">Back</button>
                <button onClick={handlePayment} disabled={processing}
                  className="flex-[2] py-4 rounded-xl bg-gradient-to-r from-primary to-teal text-white font-bold text-lg hover:shadow-xl hover:shadow-accent/20 disabled:opacity-50 transition-all tap-target flex items-center justify-center gap-2">
                  {processing ? (
                    <><div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> Processing...</>
                  ) : `Pay ₹${Math.round(totalPrice * 1.05).toLocaleString()}`}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'confirmed' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="rounded-3xl border border-border bg-card p-12 shadow-2xl">
                <div className="h-24 w-24 rounded-full bg-accent text-white flex items-center justify-center mx-auto mb-8 shadow-lg shadow-accent/30"><FiCheck size={48} /></div>
                <h2 className="text-4xl font-bold mb-4">Booking Confirmed! 🎉</h2>
                <p className="text-lg text-muted mb-8 max-w-md mx-auto">Pack your bags! Your trip to <strong className="text-foreground">{trip.destination}</strong> has been successfully booked.</p>
                
                <div className="inline-block px-8 py-4 rounded-2xl bg-surface-hover mb-10 border border-border">
                  <p className="text-sm text-muted mb-1">Your Booking ID</p>
                  {/* eslint-disable-next-line react-hooks/purity */}
                  <p className="font-mono font-bold text-2xl text-accent tracking-widest">VOY-{Date.now().toString().slice(-6)}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={() => router.push('/dashboard')} className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-teal text-white font-bold hover:shadow-lg transition-all tap-target">
                    View My Dashboard
                  </button>
                  <button onClick={() => router.push('/trips')} className="px-8 py-4 rounded-xl border-2 border-border font-bold hover:bg-surface-hover transition-all tap-target">
                    Browse More Trips
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-12 w-12 rounded-full border-4 border-accent border-t-transparent animate-spin" /></div>}>
        <BookingContent />
      </Suspense>
    </ProtectedRoute>
  );
}
