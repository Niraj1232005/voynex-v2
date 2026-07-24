'use client';
import React, { useState, useEffect } from 'react';
import { FiUserPlus, FiUser } from 'react-icons/fi';
import { api } from '@/lib/api';

export default function AgencyTeamPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/profile')
      .then(res => setCurrentUser(res))
      .catch(err => console.error('Error fetching user profile:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-sm text-muted">Manage agency staff and administrator access</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-md hover:bg-primary/90 transition-all">
          <FiUserPlus size={16} /> Add Staff Member
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="p-4 font-bold text-muted">Name</th>
              <th className="p-4 font-bold text-muted">Email</th>
              <th className="p-4 font-bold text-muted">Role</th>
              <th className="p-4 font-bold text-muted">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border hover:bg-muted/20">
              <td className="p-4 font-bold flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <FiUser size={16} />
                </div>
                {currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}` : 'Agency Administrator'}
              </td>
              <td className="p-4 text-muted">{currentUser?.email}</td>
              <td className="p-4 text-muted capitalize font-semibold">{currentUser?.role || 'admin'}</td>
              <td className="p-4">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase">
                  Active
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}