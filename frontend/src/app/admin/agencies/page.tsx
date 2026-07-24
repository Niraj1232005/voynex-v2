'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBriefcase, FiSearch, FiCheck, FiX, FiEye } from 'react-icons/fi';
import { api } from '@/lib/api';

export default function AdminAgenciesPage() {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = () => {
    setLoading(true);
    api.get('/admin/organizations')
      .then(res => {
        if (Array.isArray(res)) setAgencies(res);
      })
      .catch(err => console.error('Error fetching admin agencies:', err))
      .finally(() => setLoading(false));
  };

  const handleToggleApproval = (id: string, isApproved: boolean) => {
    const actionText = isApproved ? 'approve' : 'reject';
    if (!confirm(`Are you sure you want to ${actionText} this agency?`)) return;

    api.patch(`/admin/organizations/${id}/approve`, { isApproved })
      .then(() => {
        setAgencies(prev => prev.map(a => (a._id === id || a.id === id) ? { ...a, isApproved } : a));
      })
      .catch(err => alert(err.message || `Failed to ${actionText} agency`));
  };

  const filtered = agencies.filter(a =>
    (a.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.email || '').toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold">Agency Management</h1>
          <p className="text-sm text-muted mt-1">Approve and monitor travel agencies across the platform</p>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input type="text" placeholder="Search agencies..." className="pl-10 pr-4 py-2 rounded-xl border border-border bg-card text-sm outline-none" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-muted bg-card border border-border rounded-2xl">No agencies found matching your search.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(a => {
            const id = a._id || a.id;
            return (
              <div key={id} className="p-5 rounded-2xl border border-border bg-card hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {(a.name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">{a.name}</h3>
                        <p className="text-xs text-muted">{a.email}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold ${
                      a.isApproved ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-600'
                    }`}>
                      {a.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-surface-hover">
                      <p className="text-xs text-muted">Active Trips</p>
                      <p className="font-bold text-foreground">{a.tripsCount || 0}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-hover">
                      <p className="text-xs text-muted">Total Revenue</p>
                      <p className="font-bold text-emerald-400">₹{((a.revenue || 0)/1000).toFixed(0)}K</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-border/50">
                  <button 
                    onClick={() => handleToggleApproval(id, true)} 
                    disabled={a.isApproved}
                    className="flex-1 py-2 rounded-lg bg-teal/10 text-teal text-xs font-bold hover:bg-teal/20 transition-all disabled:opacity-40"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleToggleApproval(id, false)} 
                    disabled={!a.isApproved}
                    className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-all disabled:opacity-40"
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}