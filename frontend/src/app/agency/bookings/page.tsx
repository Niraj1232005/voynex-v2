'use client';
import React, { useState, useEffect } from 'react';
import { FiCalendar, FiUsers, FiMail, FiCheck, FiX, FiInfo } from 'react-icons/fi';
import { api } from '@/lib/api';

export default function AgencyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    setLoading(true);
    api.get('/bookings')
      .then(res => {
        if (Array.isArray(res)) {
          setBookings(res);
        }
      })
      .catch(err => console.error('Error loading agency bookings:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getGuestsString = (b: any): string => {
    const parts: string[] = [];
    if (b.groupComposition?.adults) parts.push(`${b.groupComposition.adults} Adults`);
    else if (b.guests) parts.push(`${b.guests} Guests`);
    if (b.groupComposition?.children) parts.push(`${b.groupComposition.children} Children`);
    if (b.groupComposition?.seniors) parts.push(`${b.groupComposition.seniors} Seniors`);
    return parts.join(', ') || '1 Guest';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="text-sm text-muted">Track all customer reservations</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : bookings.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-hover/50 border-b border-border">
                <tr>
                  <th className="p-4 font-medium text-muted">Customer</th>
                  <th className="p-4 font-medium text-muted">Trip details</th>
                  <th className="p-4 font-medium text-muted">Guests</th>
                  <th className="p-4 font-medium text-muted">Amount</th>
                  <th className="p-4 font-medium text-muted">Payment</th>
                  <th className="p-4 font-medium text-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b: any) => (
                  <tr key={b._id} className="border-b border-border hover:bg-surface-hover/30 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-foreground">Customer #{b.user?.slice(0, 8) || 'User'}</p>
                      <p className="text-xs text-muted font-mono">{b.userId || 'N/A'}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-foreground">{b.trip?.title || 'Trip Details'}</p>
                      <p className="text-xs text-muted">Date: {b.startDate || b.travelDate}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-foreground">{getGuestsString(b)}</p>
                    </td>
                    <td className="p-4 font-bold text-foreground">
                      ₹{Number(b.totalPrice || b.totalAmount).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        b.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${b.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        b.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 rounded-3xl border border-border border-dashed bg-surface/50">
          <FiCalendar size={48} className="mx-auto text-muted mb-4 opacity-50" />
          <p className="font-bold text-lg mb-1">No bookings recorded yet</p>
          <p className="text-muted">Reservations will automatically populate here when customers book your trips.</p>
        </div>
      )}
    </div>
  );
}