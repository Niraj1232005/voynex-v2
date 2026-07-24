'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiSave, FiCheckCircle } from 'react-icons/fi';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';

function ProfileContent() {
  const [profile, setProfile] = useState<any>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    api.get('/users/profile')
      .then(res => {
        setProfile(res);
        setFirstName(res.firstName || '');
        setLastName(res.lastName || '');
        setPhoneNumber(res.phoneNumber || '');
      })
      .catch(err => console.error('Error loading profile:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    api.patch('/users/profile', { firstName, lastName, phoneNumber })
      .then(res => {
        setProfile(res);
        setSuccessMsg('Profile updated successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      })
      .catch(err => alert(err.message || 'Failed to update profile'))
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <Breadcrumbs />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FiUser className="text-primary" /> My Profile
            </h1>
            <p className="text-muted text-sm mt-1">Manage your account details and contact preferences</p>
          </div>

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-sm font-semibold flex items-center gap-2">
              <FiCheckCircle size={18} /> {successMsg}
            </div>
          )}

          <div className="p-6 rounded-3xl border border-border bg-card shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-4 border-b border-border pb-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 text-primary font-bold text-2xl flex items-center justify-center border border-primary/20">
                  {profile?.firstName ? profile.firstName[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}` : profile?.email}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                    {profile?.role || 'User'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted mb-2">First Name</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted mb-2">Last Name</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted mb-2">Email Address (Read-only)</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <input type="email" value={profile?.email || ''} disabled
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-muted/40 text-muted text-sm cursor-not-allowed" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted mb-2">Phone Number</label>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>

              <button type="submit" disabled={saving}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-md disabled:opacity-50">
                <FiSave size={18} /> {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
