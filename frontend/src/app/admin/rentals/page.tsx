'use client';
import React, { useState, useEffect } from 'react';
import { FiPackage, FiMapPin } from 'react-icons/fi';
import { api } from '@/lib/api';

export default function AdminRentalsPage() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/rentals')
      .then(res => {
        if (Array.isArray(res)) setRentals(res);
      })
      .catch(err => console.error('Error loading admin global rentals:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Global Rentals Oversight</h1>
        <p className="text-sm text-muted">Monitor all equipment and vehicle rentals across all agencies</p>
      </div>

      {rentals.length === 0 ? (
        <div className="p-12 border border-dashed border-border rounded-2xl bg-card text-center text-muted">
          <FiPackage size={36} className="mx-auto mb-3 text-muted/60" />
          <p className="font-bold text-base">No rental items found in database</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rentals.map(r => (
            <div key={r._id || r.id} className="p-5 rounded-2xl border border-border bg-card flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase mb-2 inline-block">
                  {r.category || 'gear'}
                </span>
                <div className="flex gap-4 items-center mb-3">
                  {r.images && r.images[0] ? (
                    <img src={r.images[0]} alt={r.title || r.name} className="w-16 h-16 rounded-xl object-cover border border-border" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-2xl">🎒</div>
                  )}
                  <div>
                    <h3 className="font-bold text-base text-foreground line-clamp-1">{r.title || r.name}</h3>
                    <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                      <FiMapPin size={12} /> {r.location || 'Pan-India'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/60 pt-3 flex items-center justify-between mt-2">
                <span className="text-lg font-black text-foreground">₹{r.pricePerDay || r.price} <span className="text-[10px] text-muted font-normal">/ day</span></span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${r.isAvailable !== false ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                  {r.isAvailable !== false ? 'Available' : 'Rented Out'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}