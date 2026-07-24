'use client';
import React, { useState, useEffect } from 'react';
import { FiSearch, FiTrash2, FiMapPin } from 'react-icons/fi';
import { api } from '@/lib/api';

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = () => {
    setLoading(true);
    api.get('/trips')
      .then(res => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setTrips(list);
      })
      .catch(err => console.error('Error fetching platform trips:', err))
      .finally(() => setLoading(false));
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this trip from the platform?')) return;
    api.delete(`/trips/${id}`)
      .then(() => setTrips(prev => prev.filter(t => (t._id || t.id) !== id)))
      .catch(err => alert(err.message || 'Failed to delete trip'));
  };

  const filteredTrips = trips.filter(t => {
    const title = (t.title || '').toLowerCase();
    const dest = (t.destination || '').toLowerCase();
    const s = search.toLowerCase();
    return title.includes(s) || dest.includes(s);
  });

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
          <h1 className="text-2xl font-bold">Platform Trips Management</h1>
          <p className="text-sm text-muted">Monitor and manage all active trips created across travel agencies</p>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input type="text" placeholder="Search trips..." className="pl-10 pr-4 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {filteredTrips.length === 0 ? (
          <div className="p-8 text-center text-muted">No platform trips found matching your search.</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="p-4 font-bold text-muted">Trip Details</th>
                <th className="p-4 font-bold text-muted">Agency Organization</th>
                <th className="p-4 font-bold text-muted">Price</th>
                <th className="p-4 font-bold text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.map(t => (
                <tr key={t._id || t.id} className="border-b border-border hover:bg-muted/20">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {t.images && t.images[0] ? (
                        <img src={t.images[0]} alt={t.title} className="w-12 h-12 rounded-xl object-cover border border-border" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-xl">🏔️</div>
                      )}
                      <div>
                        <p className="font-bold text-foreground">{t.title}</p>
                        <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                          <FiMapPin size={12} /> {t.destination} · {t.durationDays || t.duration} days
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted font-medium">
                    {t.organization?.name || t.agency?.name || 'Himalayan Trails'}
                  </td>
                  <td className="p-4 font-bold text-primary">₹{(t.price || 0).toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(t._id || t.id)} className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}