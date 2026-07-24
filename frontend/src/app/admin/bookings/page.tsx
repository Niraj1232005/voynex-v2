'use client';
import React, { useState, useEffect } from 'react';
import { FiSearch, FiCalendar } from 'react-icons/fi';
import { api } from '@/lib/api';

export default function AdminBookingsPage() {
  const [search, setSearch] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/bookings')
      .then(res => {
        const dataArray = res && res.data ? res.data : Array.isArray(res) ? res : [];
        const mapped = dataArray.map((b: any) => ({
          _id: b.id,
          trip: b.trip || { title: 'Trip Package', destination: 'India' },
          userName: b.user ? `${b.user.firstName || ''} ${b.user.lastName || ''}`.trim() : `Traveler (${b.userId?.slice(0, 6) || ''})`,
          userEmail: b.user?.email || 'traveler@voynex.com',
          totalPrice: Number(b.totalAmount || 0),
          status: b.status || 'pending',
          paymentStatus: b.paymentStatus || 'pending',
          createdAt: new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        }));
        setBookings(mapped);
      })
      .catch(err => {
        console.error('Error fetching global admin bookings:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredBookings = bookings.filter(b => 
    b._id.toLowerCase().includes(search.toLowerCase()) ||
    (b.trip?.title || '').toLowerCase().includes(search.toLowerCase()) ||
    b.userName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Global Bookings Oversight</h1>
          <p className="text-sm text-muted mt-1">Monitor all traveler bookings across the platform</p>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input 
            type="text" 
            placeholder="Search by Booking ID, Trip, Traveler..." 
            className="pl-10 pr-4 py-2 rounded-xl border border-border bg-card text-sm focus:ring-2 focus:ring-primary/50 outline-none" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="p-8 text-center text-muted">No global bookings found matching your search.</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="p-4 font-bold text-muted">Booking ID & Date</th>
                <th className="p-4 font-bold text-muted">Trip</th>
                <th className="p-4 font-bold text-muted">Traveler</th>
                <th className="p-4 font-bold text-muted">Total Amount</th>
                <th className="p-4 font-bold text-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(b => (
                <tr key={b._id} className="border-b border-border hover:bg-muted/20">
                  <td className="p-4">
                    <p className="font-mono text-xs text-primary font-bold">{b._id}</p>
                    <p className="text-[10px] text-muted flex items-center gap-1 mt-0.5"><FiCalendar size={10} /> {b.createdAt}</p>
                  </td>
                  <td className="p-4 font-bold text-foreground">{b.trip?.title || 'Trip Package'}</td>
                  <td className="p-4">
                    <p className="font-semibold text-foreground">{b.userName}</p>
                    <p className="text-xs text-muted">{b.userEmail}</p>
                  </td>
                  <td className="p-4 font-bold text-primary">₹{b.totalPrice.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                      b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-600'
                    }`}>
                      {b.status}
                    </span>
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