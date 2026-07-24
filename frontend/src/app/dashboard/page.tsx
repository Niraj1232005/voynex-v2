'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiMapPin, FiCalendar, FiUsers, FiStar, FiArrowRight, FiHeart, FiSettings, FiShoppingBag } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Breadcrumbs from '@/components/Breadcrumbs';
import { api } from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const statusColors: Record<string, string> = {
  confirmed: 'bg-emerald-500/10 text-emerald-500', pending: 'bg-yellow-500/10 text-yellow-600',
  cancelled: 'bg-red-500/10 text-red-500', completed: 'bg-primary/10 text-primary',
};

function DashboardContent() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/bookings').catch(() => []),
      api.get('/wishlist').catch(() => []),
    ])
      .then(([bookingsRes, wishlistRes]) => {
        if (Array.isArray(bookingsRes)) setBookings(bookingsRes);
        if (Array.isArray(wishlistRes)) setSavedItems(wishlistRes);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Breadcrumbs />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          {/* Welcome Header */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {(user as any)?.firstName || user?.name || 'Traveler'} 👋</h1>
              <p className="text-muted mt-1">Manage your bookings, saved trips, and travel preferences</p>
            </div>
            <Link href="/account" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-semibold hover:bg-muted/40 transition-all">
              <FiSettings size={16} /> Account Settings
            </Link>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="p-5 rounded-2xl border border-border bg-card">
              <span className="text-muted text-xs font-semibold">Total Bookings</span>
              <p className="text-3xl font-black mt-1 text-foreground">{bookings.length}</p>
            </div>
            <div className="p-5 rounded-2xl border border-border bg-card">
              <span className="text-muted text-xs font-semibold">Saved Items</span>
              <p className="text-3xl font-black mt-1 text-foreground">{savedItems.length}</p>
            </div>
            <div className="p-5 rounded-2xl border border-border bg-card">
              <span className="text-muted text-xs font-semibold">Confirmed Trips</span>
              <p className="text-3xl font-black mt-1 text-emerald-500">{bookings.filter(b => b.status === 'confirmed').length}</p>
            </div>
            <div className="p-5 rounded-2xl border border-border bg-card">
              <span className="text-muted text-xs font-semibold">Pending Requests</span>
              <p className="text-3xl font-black mt-1 text-yellow-500">{bookings.filter(b => b.status === 'pending').length}</p>
            </div>
          </motion.div>

          {/* Bookings Section */}
          <motion.div variants={fadeUp}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">My Bookings</h2>
              <Link href="/my-trips" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                View all <FiArrowRight size={14} />
              </Link>
            </div>

            {bookings.length === 0 ? (
              <div className="p-10 rounded-2xl border border-dashed border-border bg-card text-center text-muted">
                <FiShoppingBag size={36} className="mx-auto mb-3 text-muted/60" />
                <p className="font-bold text-base">No bookings found</p>
                <p className="text-sm text-muted/60 mt-1 mb-4">Explore our trips marketplace to book your first adventure.</p>
                <Link href="/trips" className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/90">
                  Explore Trips
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(b => {
                  const trip = b.trip || {};
                  return (
                    <div key={b._id || b.id} className="p-5 rounded-2xl border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-all">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${statusColors[b.status] || 'bg-muted text-muted'}`}>
                            {b.status}
                          </span>
                          <span className="text-xs text-muted flex items-center gap-1">
                            <FiMapPin size={12} /> {trip.destination || 'India'}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-foreground">{trip.title || 'Trip Booking'}</h3>
                        <p className="text-xs text-muted mt-1 flex items-center gap-3">
                          <span className="flex items-center gap-1"><FiCalendar size={12} /> Date: {b.travelDate || b.startDate || 'Upcoming'}</span>
                          <span className="flex items-center gap-1"><FiUsers size={12} /> {b.travelersCount || b.guests || 1} Travelers</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-border/60">
                        <div className="text-right">
                          <span className="text-xl font-black text-foreground">₹{Number(b.totalAmount || b.totalPrice || 0).toLocaleString()}</span>
                          <p className="text-[10px] text-muted capitalize">{b.paymentStatus || 'pending'}</p>
                        </div>
                        <Link href={b.status === 'confirmed' ? `/booking-success?id=${b._id || b.id}` : `/trips/${trip._id || trip.id || ''}`}
                          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all">
                          Details
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Saved Wishlist Section */}
          <motion.div variants={fadeUp} className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Saved Wishlist</h2>
              <Link href="/my-trips/saved" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                View all <FiArrowRight size={14} />
              </Link>
            </div>

            {savedItems.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-border bg-card text-center text-muted">
                <FiHeart size={32} className="mx-auto mb-2 text-muted/60" />
                <p className="font-semibold text-sm">No saved items yet</p>
                <p className="text-xs text-muted/60 mt-1">Bookmark trips or rentals to save them for later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedItems.slice(0, 3).map((wish, idx) => {
                  const item = wish.item || {};
                  return (
                    <Link key={wish._id || idx} href={wish.itemType === 'trip' ? `/trips/${item._id || item.id}` : '/rentals'}
                      className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all p-5">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                        {wish.itemType}
                      </span>
                      <h3 className="font-bold text-base mt-2 group-hover:text-primary transition-colors line-clamp-1">{item.title}</h3>
                      <p className="text-xs text-muted mt-1">{item.destination || item.location || 'India'}</p>
                      <p className="text-primary font-black mt-3 text-lg">₹{(item.price || item.pricePerDay || 0).toLocaleString()}</p>
                    </Link>
                  );
                })}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['user', 'agency', 'admin', 'platform_admin']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
