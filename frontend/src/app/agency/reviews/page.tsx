'use client';
import React, { useState, useEffect } from 'react';
import { FiStar, FiMessageSquare } from 'react-icons/fi';
import { api } from '@/lib/api';

export default function AgencyReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reviews/agency')
      .then(res => {
        if (Array.isArray(res)) setReviews(res);
      })
      .catch(err => console.error('Error loading agency reviews:', err))
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
      <div>
        <h1 className="text-2xl font-bold">Agency Reviews</h1>
        <p className="text-sm text-muted">Read feedback submitted by verified travelers on your trips</p>
      </div>

      {reviews.length === 0 ? (
        <div className="p-12 border border-dashed border-border rounded-2xl bg-card text-center text-muted">
          <FiMessageSquare size={36} className="mx-auto mb-3 text-muted/60" />
          <p className="font-bold text-base">No reviews submitted yet</p>
          <p className="text-sm text-muted/60 mt-1">Reviews will appear here when travelers complete their bookings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map(r => (
            <div key={r._id || r.id} className="p-5 rounded-2xl border border-border bg-card flex flex-col justify-between hover:shadow-lg transition-all">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-foreground">{r.user ? `${r.user.firstName || ''} ${r.user.lastName || ''}`.trim() || r.user.email : 'Traveler'}</p>
                    <p className="text-xs text-primary font-bold mt-0.5">{r.trip?.title || 'Trip Package'}</p>
                    <div className="flex text-yellow-500 text-xs mt-1">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} fill={i < r.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  </div>
                </div>
                {r.title && <p className="font-bold text-sm mb-1 text-foreground">{r.title}</p>}
                <p className="text-xs text-muted italic">&quot;{r.comment}&quot;</p>
              </div>
              <p className="text-[10px] text-muted mt-4 text-right">
                {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}