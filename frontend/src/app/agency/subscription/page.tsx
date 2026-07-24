'use client';
import React, { useState, useEffect } from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import { api } from '@/lib/api';

export default function AgencySubscriptionPage() {
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/organizations/profile')
      .then(res => setOrg(res))
      .catch(err => console.error('Error fetching org profile:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const planName = (org?.subscriptionPlan || 'free').toUpperCase();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Organization Subscription</h1>
        <p className="text-muted mt-2">Organization: <span className="font-bold text-foreground">{org?.name || 'Travel Agency'}</span></p>
        <p className="text-sm mt-1">Current Plan: <span className="text-primary font-bold">{planName}</span></p>
      </div>

      <div className="p-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-teal/5 relative overflow-hidden shadow-lg">
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase">
            {org?.isApproved ? 'Approved Agency' : 'Pending Approval'}
          </span>
        </div>

        <h2 className="text-2xl font-bold mb-6">{planName} Plan Features</h2>
        <ul className="space-y-4 mb-8 text-sm">
          <li className="flex items-center gap-3"><FiCheckCircle className="text-emerald-500" /> Active Trips & Inventory Management</li>
          <li className="flex items-center gap-3"><FiCheckCircle className="text-emerald-500" /> Organization Bookings Overview</li>
          <li className="flex items-center gap-3"><FiCheckCircle className="text-emerald-500" /> Agency Performance Analytics</li>
          <li className="flex items-center gap-3"><FiCheckCircle className="text-emerald-500" /> Scoped Agency Reviews Visibility</li>
        </ul>

        <div className="flex gap-4">
          <button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-md">
            Manage Subscription
          </button>
        </div>
      </div>
    </div>
  );
}