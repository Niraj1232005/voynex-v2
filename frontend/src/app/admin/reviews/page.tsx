'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import { api } from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = () => {
    setLoading(true);
    api.get('/reviews')
      .then(res => {
        if (Array.isArray(res)) {
          setReviews(res);
        }
      })
      .catch(err => console.error('Error fetching admin reviews:', err))
      .finally(() => setLoading(false));
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    api.delete(`/reviews/${id}`)
      .then(() => {
        setReviews(prev => prev.filter(r => r._id !== id));
      })
      .catch(err => {
        console.error('Error deleting review:', err);
        alert(err.message || 'Failed to delete review');
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] w-full">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reviews Moderation</h1>
          <p className="text-sm text-muted mt-0.5">Monitor and moderate user feedback across the platform</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-2xl bg-card text-center text-muted">
          <FiMessageSquare size={36} className="mb-3 text-muted/60" />
          <p className="font-semibold text-sm">No reviews found</p>
          <p className="text-xs text-muted/60 mt-1">Travelers have not posted any feedback yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map(r => (
            <motion.div key={r._id} initial="hidden" animate="visible" variants={fadeUp}
              className="p-5 rounded-2xl border border-border bg-card hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-sm text-foreground">{r.user?.name || 'Traveler'}</p>
                    <p className="text-[10px] text-muted">{r.user?.email || ''}</p>
                    <div className="flex text-yellow-500 text-xs mt-1.5">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} fill={i < r.rating ? 'currentColor' : 'none'} size={12} />
                      ))}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(r._id)}
                    className="p-1.5 text-muted hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors">
                    <FiTrash2 size={16}/>
                  </button>
                </div>
                <p className="text-sm text-foreground italic mt-2">&quot;{r.comment}&quot;</p>
              </div>
              <div className="border-t border-border/60 pt-3 mt-4 flex items-center justify-between">
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium truncate max-w-[150px]">
                  {r.trip?.title || 'Trip Details'}
                </span>
                <span className="text-[10px] text-muted">
                  {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}