'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiHeart, FiMapPin, FiStar, FiTrash2 } from 'react-icons/fi';
import Breadcrumbs from '@/components/Breadcrumbs';
import EmptyState from '@/components/EmptyState';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function SavedTripsPage() {
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      let res = await api.get('/wishlist').catch(() => []);

      const localSaved = localStorage.getItem('voynex_saved_trips');
      let localIds: string[] = [];
      try {
        if (localSaved) localIds = JSON.parse(localSaved);
      } catch {}

      // If backend returned empty but we have local saved trips, sync them
      if (Array.isArray(res) && res.length === 0 && localIds.length > 0) {
        await Promise.allSettled(
          localIds.map(id => api.post('/wishlist', { itemType: 'trip', itemId: id }))
        );
        res = await api.get('/wishlist').catch(() => []);
      }

      // If backend still returned empty, load matching trips directly so the user is never left with an empty state
      if ((!Array.isArray(res) || res.length === 0) && localIds.length > 0) {
        const allTripsRes = await api.get('/trips').catch(() => []);
        const allTrips = Array.isArray(allTripsRes) ? allTripsRes : (allTripsRes?.data || []);
        const matching = allTrips
          .filter((t: any) => localIds.includes(t.id || t._id))
          .map((t: any) => ({
            _id: t.id || t._id,
            id: t.id || t._id,
            itemType: 'trip',
            itemId: t.id || t._id,
            item: {
              ...t,
              _id: t.id || t._id,
              title: t.title,
              destination: t.destination,
              price: t.price,
              images: t.images,
            },
          }));
        if (matching.length > 0) {
          res = matching;
        }
      }

      if (Array.isArray(res)) {
        setSavedItems(res);
      } else {
        setSavedItems([]);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setSavedItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (e: React.MouseEvent, wish: any) => {
    e.preventDefault();
    e.stopPropagation();
    const wishId = wish._id || wish.id;
    const itemId = wish.itemId || wish.item?._id || wish.item?.id || wishId;

    setSavedItems(prev => prev.filter(item => (item._id || item.id) !== wishId && (item.itemId || item.item?._id) !== itemId));

    try {
      const localSaved = localStorage.getItem('voynex_saved_trips');
      if (localSaved) {
        const ids: string[] = JSON.parse(localSaved);
        const updated = ids.filter(id => id !== itemId && id !== wishId);
        localStorage.setItem('voynex_saved_trips', JSON.stringify(updated));
      }
    } catch {}

    try {
      await api.delete(`/wishlist/${wishId}`);
      showToast('Removed from wishlist', 'success');
    } catch {
      try {
        await api.post('/wishlist', { itemType: wish.itemType || 'trip', itemId });
      } catch {}
      showToast('Removed from wishlist', 'success');
    }
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
                      <button onClick={(e) => handleRemove(e, wish)}
                        className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500 transition-all z-10"
                        title="Remove from saved items"
                        aria-label="Remove from saved items">
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
