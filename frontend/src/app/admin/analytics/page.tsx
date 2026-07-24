'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '@/lib/api';

export default function AdminAnalyticsPage() {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [bookingData, setBookingData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then(res => {
        if (res) {
          setMetrics(res);
          if (res.revenueByDate) {
            const mappedRev = res.revenueByDate.map((item: any) => ({
              date: new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
              revenue: Number(item.revenue),
            }));
            setRevenueData(mappedRev);
          }
          if (res.bookings) {
            setBookingData([
              { name: 'Pending', count: res.bookings.pending || 0 },
              { name: 'Confirmed', count: res.bookings.confirmed || 0 },
              { name: 'Cancelled', count: res.bookings.cancelled || 0 },
            ]);
          }
        }
      })
      .catch(err => console.error('Error loading admin analytics:', err))
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Analytics</h1>
        <p className="text-sm text-muted mt-1">Real-time revenue growth, booking breakdown, and marketplace trends</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <FiDollarSign size={20} />
            </div>
            <span className="text-xs font-bold text-muted uppercase">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold">₹{((metrics?.totalRevenue || 0) / 100000).toFixed(1)}L</p>
        </div>
        <div className="p-5 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <FiCalendar size={20} />
            </div>
            <span className="text-xs font-bold text-muted uppercase">Total Bookings</span>
          </div>
          <p className="text-2xl font-bold">{metrics?.bookings?.total || 0}</p>
        </div>
        <div className="p-5 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <FiTrendingUp size={20} />
            </div>
            <span className="text-xs font-bold text-muted uppercase">Paid Transactions</span>
          </div>
          <p className="text-2xl font-bold">{metrics?.payments?.paid || 0}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Growth Chart */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold mb-4">Live Revenue Growth</h3>
          {revenueData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted text-sm">No revenue transactions recorded yet.</div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--brd)" />
                  <XAxis dataKey="date" stroke="var(--mut)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="var(--mut)" tick={{ fontSize: 11 }} tickFormatter={v => `₹${v/1000}K`} />
                  <Tooltip contentStyle={{ background: 'var(--surf)', border: '1px solid var(--brd)', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Booking Status Breakdown Chart */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold mb-4">Booking Status Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--brd)" />
                <XAxis dataKey="name" stroke="var(--mut)" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--mut)" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--surf)', border: '1px solid var(--brd)', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}