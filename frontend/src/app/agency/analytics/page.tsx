'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBarChart2 } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '@/lib/api';

export default function AgencyAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    api.get('/organizations/stats')
      .then(res => {
        if (res) {
          setStats(res);
        }
      })
      .catch(err => console.error('Error fetching analytics stats:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex justify-center py-20 bg-background min-h-[50vh]">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Map backend stats monthly revenue
  const chartData = stats.monthlyRevenue || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Revenue Analytics</h1>
        <p className="text-sm text-muted">Track your agency earnings</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="p-6 rounded-2xl border border-border bg-card">
          <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Total Revenue</p>
          <p className="text-3xl font-extrabold text-accent">₹{Number(stats.revenue || 0).toLocaleString()}</p>
        </div>
        <div className="p-6 rounded-2xl border border-border bg-card">
          <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Average Trip Rating</p>
          <p className="text-3xl font-extrabold text-yellow-500">⭐ {stats.averageRating || '4.5'}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-bold mb-6">Revenue Growth</h3>
        <div className="h-[350px] w-full" style={{ minHeight: '350px' }}>
          {mounted && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" />
                <YAxis stroke="rgba(255,255,255,0.4)" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 30, 30, 0.9)', borderColor: 'rgba(255,255,255,0.1)' }} />
                <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted text-sm">Loading charts...</div>
          )}
        </div>
      </div>
    </div>
  );
}