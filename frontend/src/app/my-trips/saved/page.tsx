'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiHeart, FiMapPin, FiStar, FiTrash2 } from 'react-icons/fi';
import Breadcrumbs from '@/components/Breadcrumbs';
import EmptyState from '@/components/EmptyState';
import { api } from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function SavedTripsPage() {
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = () => {
    setLoading(true);
    api.get('/wishlist')
      .then(res => {
        if (Array.isArray(res)) setSavedItems(res);
      })
      .catch(err => console.error('Error fetching wishlist:', err))
      .finally(() => setLoading(false));
  };

  const handleRemove = (e: React.MouseEvent, wishlistId: string) => {
    e.preventDefault();
    e.stopPropagation();
    api.delete(`/wishlist/${wishlistId}`)
      .then(() => {
        setSavedItems(prev => prev.filter(item => item._id !== wishlistId));
      })
      .catch(err => console.error('Error removing wishlist item:', err));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Breadcrumbs />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.div variants={fadeUp} className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FiHeart className="text-primary fill-primary" /> Saved Wishlist
            </h1>
            <p className="text-muted mt-1">Trips and rentals you&apos;ve bookmarked for later</p>
          </motion.div>

          {savedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedItems.map((wish, idx) => {
                const item = wish.item || {};
                const isTrip = wish.itemType === 'trip';
                return (
                  <motion.div key={wish._id || idx} variants={fadeUp}>
                    <div className="group block rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all duration-300 relative">
                      <button onClick={(e) => handleRemove(e, wish._id)}
                        className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500 transition-all z-10">
                        <FiTrash2 size={16} />
                      </button>

                      <div className="h-48 bg-muted relative overflow-hidden">
                        {item.images && item.images[0] ? (
                          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-4xl">
                            {isTrip ? '🏔️' : '🎒'}
                          </div>
                        )}
                        <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-semibold capitalize">
                          {wish.itemType}
                        </span>
                      </div>

                      <div className="p-5">
                        <div className="flex items-center gap-1 text-muted text-xs mb-1">
                          <FiMapPin size={12} /> {item.destination || item.location || 'India'}
                        </div>
                        <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">{item.title}</h3>
                        <p className="text-xs text-muted line-clamp-2 mb-3">{item.description}</p>

                        <div className="flex items-center justify-between mt-4 border-t border-border/60 pt-3">
                          <span className="text-xl font-black text-foreground">₹{(item.price || item.pricePerDay || 0).toLocaleString()}</span>
                          {isTrip ? (
                            <Link href={`/trips/${item._id || item.id}`} className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90">
                              View Trip
                            </Link>
                          ) : (
                            <Link href="/rentals" className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90">
                              View Rental
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={<FiHeart size={36} className="text-primary" />} title="No saved items yet" description="Explore trips or rentals and tap the heart icon to save them here!" actionLabel="Explore Trips" actionHref="/trips" />
          )}
        </motion.div>
      </div>
    </div>
  );
}
