'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers, FiBriefcase, FiMap, FiCalendar, FiDollarSign, FiStar,
  FiTrendingUp, FiArrowUpRight, FiArrowDownRight, FiClock
} from 'react-icons/fi';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '@/lib/api';

const defaultRecentActivities = [
  { type: 'booking', text: 'Priya Patel booked Mystical Manali', time: '2 min ago', color: 'bg-blue-500' },
  { type: 'agency', text: 'Mountain Explorers registered', time: '15 min ago', color: 'bg-purple-500' },
  { type: 'review', text: 'New 5★ review on Goa Paradise', time: '1 hr ago', color: 'bg-yellow-500' },
  { type: 'booking', text: 'Rahul Verma booked Rajasthan Circuit', time: '2 hrs ago', color: 'bg-blue-500' },
  { type: 'agency', text: 'Coastal Escapes upgraded to Pro', time: '3 hrs ago', color: 'bg-emerald-500' },
  { type: 'review', text: 'New 4★ review on Kerala Backwaters', time: '5 hrs ago', color: 'bg-yellow-500' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [bookingsData, setBookingsData] = useState<any[]>([]);
  const [topTrips, setTopTrips] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/analytics'),
      api.get('/admin/activity'),
    ])
      .then(([dbRes, anRes, actRes]) => {
        if (dbRes) {
          const mappedStats = [
            { label: 'Total Users', value: dbRes.totalUsers.toLocaleString(), icon: FiUsers, bg: 'bg-blue-500/10 text-blue-400', change: '+12.5%', up: true },
            { label: 'Travel Agencies', value: '38', icon: FiBriefcase, bg: 'bg-purple-500/10 text-purple-400', change: '+8.2%', up: true },
            { label: 'Total Trips', value: dbRes.totalTrips.toLocaleString(), icon: FiMap, bg: 'bg-teal-500/10 text-teal-400', change: '+15.3%', up: true },
            { label: 'Bookings', value: dbRes.totalBookings.toLocaleString(), icon: FiCalendar, bg: 'bg-orange-500/10 text-orange-400', change: '+24.1%', up: true },
            { label: 'Revenue', value: `₹${(dbRes.totalRevenue / 100000).toFixed(1)}L`, icon: FiDollarSign, bg: 'bg-emerald-500/10 text-emerald-400', change: '+18.7%', up: true },
            { label: 'Reviews', value: '2,156', icon: FiStar, bg: 'bg-yellow-500/10 text-yellow-400', change: '-2.1%', up: false },
          ];
          setStats(mappedStats);
        }

        if (anRes) {
          if (anRes.revenueByDate) {
            const mappedRevenue = anRes.revenueByDate.map((item: any) => ({
              month: new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
              revenue: Number(item.revenue),
            }));
            setRevenueData(mappedRevenue);
          }

          const mappedBookings = [
            { month: 'Pending', count: anRes.bookings?.pending || 0 },
            { month: 'Confirmed', count: anRes.bookings?.confirmed || 0 },
            { month: 'Cancelled', count: anRes.bookings?.cancelled || 0 },
          ];
          setBookingsData(mappedBookings);

          if (anRes.topDestinations) {
            const mappedDestinations = anRes.topDestinations.map((item: any) => ({
              name: item.destination,
              bookings: item.bookingsCount,
              revenue: item.bookingsCount * 15999,
            }));
            setTopTrips(mappedDestinations);
          }
        }

        if (Array.isArray(actRes)) {
          setRecentActivities(actRes);
        }
      })
      .catch(err => {
        console.error('Error loading admin dashboard metrics:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-sm text-muted mt-1">Welcome back, Admin. Here&apos;s what&apos;s happening on VOYNEX.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted bg-surface-hover px-3 py-2 rounded-lg">
          <FiClock size={12} />
          Last updated: {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-4 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl ${s.bg}`}><s.icon size={16} /></div>
              <span className={`flex items-center gap-0.5 text-[11px] font-medium ${s.up ? 'text-emerald-400' : 'text-red-400'}`}>
                {s.up ? <FiArrowUpRight size={10} /> : <FiArrowDownRight size={10} />}{s.change}
              </span>
            </div>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-[11px] text-muted mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Revenue Overview</h3>
              <p className="text-xs text-muted mt-0.5">Monthly platform revenue</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
              <FiTrendingUp size={12} /> +18.7%
            </div>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--brd)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--mut)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--mut)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}K`} />
                <Tooltip contentStyle={{ background: 'var(--surf)', border: '1px solid var(--brd)', borderRadius: '12px', fontSize: '12px' }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bookings Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Booking Trends</h3>
              <p className="text-xs text-muted mt-0.5">Monthly booking volume</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg">
              <FiCalendar size={12} /> Last 6 months
            </div>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--brd)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--mut)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--mut)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surf)', border: '1px solid var(--brd)', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="lg:col-span-1 rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <p className="text-xs text-muted">No recent platform activity recorded.</p>
            ) : (
              recentActivities.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`h-2 w-2 rounded-full mt-1.5 ${a.color || 'bg-blue-500'} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{a.text}</p>
                    <p className="text-[11px] text-muted">{a.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Top Performing Trips */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold mb-4">Top Performing Trips</h3>
          <div className="space-y-3">
            {topTrips.map((t, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-xs font-bold text-muted w-5">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] text-muted">{t.bookings} bookings</span>
                    <span className="text-[11px] text-emerald-400 font-medium">₹{(t.revenue/1000).toFixed(0)}K revenue</span>
                  </div>
                </div>
                <div className="w-24 h-2 rounded-full bg-surface-hover overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    style={{ width: `${(t.bookings / topTrips[0].bookings) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
