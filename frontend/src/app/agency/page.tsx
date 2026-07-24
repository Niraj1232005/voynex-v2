'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiPackage, FiUsers, FiDollarSign, FiStar, FiTrendingUp, FiArrowUpRight, FiArrowRight, FiCalendar, FiMapPin, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { api } from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const statusColors: Record<string, string> = {
  confirmed: 'bg-teal/10 text-teal', pending: 'bg-yellow-500/10 text-yellow-600',
  cancelled: 'bg-red-500/10 text-red-500', completed: 'bg-primary/10 text-primary',
};

export default function AgencyDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/organizations/stats'),
      api.get('/bookings'),
    ])
      .then(([statsRes, bookingsRes]) => {
        if (statsRes) {
          setStats(statsRes);
        }
        if (Array.isArray(bookingsRes)) {
          setRecentBookings(bookingsRes.slice(0, 5));
        }
      })
      .catch(err => {
        console.error('Error loading agency stats:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted text-sm mt-1">Welcome back! Here&apos;s your agency overview.</p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total Trips', value: stats.totalTrips, icon: FiPackage, color: 'text-primary bg-primary/10' },
          { label: 'Active Trips', value: stats.activeTrips, icon: FiCheckCircle, color: 'text-teal bg-teal/10' },
          { label: 'Inactive', value: stats.inactiveTrips, icon: FiXCircle, color: 'text-orange bg-orange/10' },
          { label: 'Bookings', value: stats.totalBookings, icon: FiCalendar, color: 'text-purple-500 bg-purple-500/10' },
          { label: 'Revenue', value: `₹${Number(stats.revenue).toLocaleString()}`, icon: FiDollarSign, color: 'text-green-500 bg-green-500/10' },
          { label: 'Avg Rating', value: stats.averageRating?.toFixed(1) || '4.5', icon: FiStar, color: 'text-yellow-500 bg-yellow-500/10' },
        ].map((s, i) => (
          <div key={i} className="p-4 rounded-2xl border border-border bg-card hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl ${s.color}`}><s.icon size={16} /></div>
            </div>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs text-muted mt-0.5">{s.label}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div variants={fadeUp} className="xl:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold">Revenue Overview</h3>
              <p className="text-xs text-muted mt-0.5">Monthly revenue trend</p>
            </div>
          </div>
          <div className="space-y-3">
            {stats.monthlyRevenue && stats.monthlyRevenue.map((m: any, i: number) => {
              const maxRev = Math.max(...stats.monthlyRevenue.map((r: any) => r.revenue)) || 1;
              const pct = (m.revenue / maxRev) * 100;
              return (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="w-8 text-xs text-muted font-medium">{m.month}</span>
                  <div className="flex-1 h-8 rounded-lg bg-surface-hover overflow-hidden relative">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="h-full rounded-lg bg-gradient-to-r from-primary to-teal" />
                  </div>
                  <span className="text-xs font-semibold w-14 text-right">₹{Number(m.revenue).toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Top Trips */}
        <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Top Performing Trips</h3>
            <FiTrendingUp className="text-teal" size={16} />
          </div>
          <div className="space-y-4">
            {stats.topTrips && stats.topTrips.map((t: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-teal flex items-center justify-center text-white text-xs font-bold">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.name}</p>
                  <p className="text-[10px] text-muted">{t.bookings} bookings</p>
                </div>
                <span className="text-xs font-semibold text-primary">₹{Number(t.revenue).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Bookings */}
      <motion.div variants={fadeUp} className="mt-6 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Bookings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 pr-4 text-xs text-muted font-medium">Customer ID</th>
                <th className="pb-3 pr-4 text-xs text-muted font-medium">Trip</th>
                <th className="pb-3 pr-4 text-xs text-muted font-medium hidden sm:table-cell">Date</th>
                <th className="pb-3 pr-4 text-xs text-muted font-medium">Amount</th>
                <th className="pb-3 text-xs text-muted font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b: any) => (
                <tr key={b._id} className="border-b border-border last:border-0 hover:bg-surface-hover/50 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-teal flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {String(b.userId || b.user || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">Customer #{b.user?.slice(0, 8) || 'User'}</p>
                        <p className="text-[10px] text-muted truncate">{b.userId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-sm truncate max-w-[180px]">{b.trip?.title || 'Trip Details'}</p>
                  </td>
                  <td className="py-3 pr-4 text-muted text-xs hidden sm:table-cell">
                    {b.startDate || b.travelDate}
                  </td>
                  <td className="py-3 pr-4 font-medium">₹{Number(b.totalPrice || b.totalAmount).toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${statusColors[b.status] || 'bg-surface-hover'}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
