'use client';
import React from 'react';
import { FiCreditCard } from 'react-icons/fi';

export default function AdminSubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscription Plans</h1>
        <p className="text-sm text-muted">Manage agency pricing tiers</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Free', 'Pro', 'Premium'].map(tier => (
          <div key={tier} className="p-6 rounded-2xl border border-border bg-card flex flex-col">
            <h3 className="text-xl font-bold">{tier} Plan</h3>
            <p className="text-3xl font-bold text-primary mt-4 mb-6">{tier==='Free'?'₹0':tier==='Pro'?'₹4,999':'₹9,999'}<span className="text-sm text-muted">/mo</span></p>
            <ul className="space-y-3 mb-8 flex-1 text-sm text-muted">
              <li>✓ Up to {tier==='Free'?'5':'Unlimited'} trips</li>
              <li>✓ {tier==='Free'?'Basic':'Advanced'} Analytics</li>
              <li>✓ {tier==='Premium'?'Priority':'Standard'} Support</li>
            </ul>
            <button className="w-full py-2.5 rounded-xl bg-surface-hover font-medium">Edit Plan</button>
          </div>
        ))}
      </div>
    </div>
  );
}