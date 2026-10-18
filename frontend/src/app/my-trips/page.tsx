'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { TbTicket, TbHeart, TbMapPin, TbCalendar, TbUsers, TbSettings, TbArrowRight } from 'react-icons/tb';
import { Trip } from '@/types';
import Breadcrumbs from '@/components/Breadcrumbs';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

type Tab = 'bookings' | 'saved';

function getGuestsString(b: any): string {
  const parts: string[] = [];
  if (b.adultsCount) parts.push(`${b.adultsCount} Adult${b.adultsCount > 1 ? 's' : ''}`);
  if (b.childrenCount) parts.push(`${b.childrenCount} Child${b.childrenCount > 1 ? 'ren' : ''}`);
  if (b.seniorsCount) parts.push(`${b.seniorsCount} Senior${b.seniorsCount > 1 ? 's' : ''}`);
  return parts.join(', ') || `${b.travelersCount || b.guests || 1} Traveler${(b.travelersCount || b.guests || 1) > 1 ? 's' : ''}`;
}

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

export default function MyTripsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('bookings');
  const [savedTrips, setSavedTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumingId, setResumingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchBookings = () => {
    Promise.all([
      api.get('/bookings').catch(() => []),
      api.get('/wishlist').catch(() => []),
    ])
      .then(([bookingsRes, wishlistRes]) => {
        if (Array.isArray(bookingsRes)) setBookings(bookingsRes);
        if (Array.isArray(wishlistRes)) {
          setSavedTrips(wishlistRes.map((w: any) => ({
            ...w.item,
            _id: w.item?._id || w.item?.id || w._id,
          })).filter((item: any) => item.title));
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
    loadRazorpayScript();
  }, []);

  const { awaitingPayment, upcoming, past } = useMemo(() => {
    const now = new Date();
    const awaitingPayment: any[] = [];
    const upcoming: any[] = [];
    const past: any[] = [];

    bookings.forEach(b => {
      const travelDate = new Date(b.travelDate || b.startDate);
      if (b.status === 'cancelled' || (travelDate < now && b.paymentStatus !== 'pending')) {
        past.push(b);
      } else if (b.paymentStatus === 'pending') {
        awaitingPayment.push(b);
      } else {
        upcoming.push(b);
      }
    });

    return { awaitingPayment, upcoming, past };
  }, [bookings]);

  const handleResumePayment = async (b: any) => {
    const bookingId = b._id || b.id;
    setResumingId(bookingId);

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        showToast('Razorpay SDK failed to load. Please check your internet connection.', 'error');
        setResumingId(null);
        return;
      }

      const orderRes = await api.post('/payments/create-order', { bookingId });
      const itemTitle = b.trip?.title || b.rental?.title || 'Trip Reservation';

      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: 'Voynex Marketplace',
        description: `Complete payment for ${itemTitle}`,
        order_id: orderRes.orderId,
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
            showToast('Payment completed successfully!', 'success');
            fetchBookings();
          } catch (err: any) {
            showToast(err.message || 'Payment verification failed.', 'error');
          } finally {
            setResumingId(null);
          }
        },
        modal: {
          ondismiss: function () {
            setResumingId(null);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        showToast(resp.error?.description || 'Payment failed.', 'error');
        setResumingId(null);
      });
      rzp.open();
    } catch (err: any) {
      showToast(err.message || 'Failed to initiate payment resume.', 'error');
      setResumingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <Breadcrumbs />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Trips & Bookings</h1>
            <p className="text-muted text-sm mt-1">Manage your active reservations and saved wishlist packages</p>
          </div>

          <div className="flex gap-2 p-1 bg-card border border-border rounded-xl">
            <button onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'bookings' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted hover:text-foreground'
              }`}>
              <TbTicket size={16} /> My Bookings ({bookings.length})
            </button>
            <button onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'saved' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted hover:text-foreground'
              }`}>
              <TbHeart size={16} /> Saved Wishlist ({savedTrips.length})
            </button>
          </div>
        </div>

        {activeTab === 'bookings' && (
          <div className="space-y-8">
            {/* Awaiting Payment Section */}
            {awaitingPayment.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-amber-500 flex items-center gap-2">
                  ⚠️ Awaiting Payment ({awaitingPayment.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {awaitingPayment.map(b => {
                    const item = b.trip || b.rental || {};
                    const bId = b._id || b.id;
                    return (
                      <div key={bId} className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase">
                            Payment Pending
                          </span>
                          <span className="text-xs text-muted font-mono">{bId}</span>
                        </div>
                        <h3 className="font-bold text-lg text-foreground mb-1">{item.title || item.name || 'Unpaid Booking'}</h3>
                        <p className="text-xs text-muted flex items-center gap-1 mb-3">
                          <TbMapPin size={14} /> {item.destination || item.location || 'India'}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted border-t border-border/60 pt-3">
                          <span className="flex items-center gap-1"><TbCalendar size={14} /> {b.travelDate || 'Date pending'}</span>
                          <span className="flex items-center gap-1"><TbUsers size={14} /> {getGuestsString(b)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/60">
                          <span className="text-xl font-black text-amber-500">₹{Number(b.totalAmount || b.totalPrice || 0).toLocaleString()}</span>
                          <button
                            onClick={() => handleResumePayment(b)}
                            disabled={resumingId === bId}
                            className="px-5 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-all disabled:opacity-50"
                          >
                            {resumingId === bId ? 'Processing...' : 'Resume Payment'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upcoming Trips Section */}
            <div>
              <h2 className="text-xl font-bold mb-4">Upcoming Trips ({upcoming.length})</h2>
              {upcoming.length === 0 ? (
                <div className="p-8 border border-dashed border-border rounded-2xl bg-card text-center text-muted text-sm">
                  No upcoming confirmed trip bookings found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcoming.map(b => {
                    const item = b.trip || b.rental || {};
                    return (
                      <div key={b._id || b.id} className="p-5 rounded-2xl border border-border bg-card hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase">
                            {b.status}
                          </span>
                          <span className="text-xs text-muted font-mono">{b.id || b._id}</span>
                        </div>
                        <h3 className="font-bold text-lg text-foreground mb-1">{item.title || item.name || 'Trip Booking'}</h3>
                        <p className="text-xs text-muted flex items-center gap-1 mb-3">
                          <TbMapPin size={14} /> {item.destination || item.location || 'India'}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted border-t border-border/60 pt-3">
                          <span className="flex items-center gap-1"><TbCalendar size={14} /> {b.travelDate || 'Date pending'}</span>
                          <span className="flex items-center gap-1"><TbUsers size={14} /> {getGuestsString(b)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/60">
                          <span className="text-xl font-black text-primary">₹{Number(b.totalAmount || b.totalPrice || 0).toLocaleString()}</span>
                          <Link href={`/booking-success?bookingId=${b._id || b.id}`} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90">
                            View Receipt
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Past / Cancelled Trips ({past.length})</h2>
              {past.length === 0 ? (
                <div className="p-8 border border-dashed border-border rounded-2xl bg-card text-center text-muted text-sm">
                  No past or cancelled bookings.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {past.map(b => {
                    const trip = b.trip || {};
                    return (
                      <div key={b._id || b.id} className="p-5 rounded-2xl border border-border bg-card opacity-80">
                        <div className="flex justify-between items-start mb-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            b.status === 'cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-muted text-muted'
                          }`}>
                            {b.status}
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-foreground mb-1">{trip.title || 'Trip Booking'}</h3>
                        <p className="text-xs text-muted mb-2">{trip.destination}</p>
                        <p className="text-sm font-bold text-foreground">Total: ₹{Number(b.totalAmount || b.totalPrice || 0).toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Saved Wishlist ({savedTrips.length})</h2>
            {savedTrips.length === 0 ? (
              <div className="p-10 border border-dashed border-border rounded-2xl bg-card text-center text-muted text-sm">
                Your wishlist is empty. Tap the heart icon on any trip or rental to bookmark it.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedTrips.map(trip => (
                  <Link key={trip._id || (trip as any).id} href={`/trips/${trip._id || (trip as any).id}`}
                    className="group rounded-2xl border border-border bg-card p-5 hover:shadow-lg transition-all">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">{trip.title}</h3>
                    <p className="text-xs text-muted mt-1">{trip.destination}</p>
                    <p className="text-primary font-black mt-4 text-xl">₹{(trip.price || 0).toLocaleString()}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
