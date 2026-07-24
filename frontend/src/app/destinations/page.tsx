'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiMapPin, FiStar, FiArrowRight } from 'react-icons/fi';
import Breadcrumbs from '@/components/Breadcrumbs';
import { api } from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const DEST_GRADIENTS = [
  'from-blue-500 to-purple-600',
  'from-orange-400 to-pink-500',
  'from-teal-400 to-emerald-600',
  'from-rose-400 to-red-500',
  'from-indigo-400 to-blue-600',
  'from-amber-400 to-orange-600',
];

export default function DestinationsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/trips')
      .then(res => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setTrips(list);
      })
      .catch(err => console.error('Error fetching trips for destinations:', err))
      .finally(() => setLoading(false));
  }, []);

  const destinations = useMemo(() => {
    const destMap = new Map<string, { trips: any[]; totalReviews: number }>();
    trips.forEach(trip => {
      const dest = trip.destination || 'India';
      if (!destMap.has(dest)) destMap.set(dest, { trips: [], totalReviews: 0 });
      const entry = destMap.get(dest)!;
      entry.trips.push(trip);
      entry.totalReviews += trip.reviewCount || 0;
    });

    return Array.from(destMap.entries()).map(([name, data]) => ({
      name,
      tripCount: data.trips.length,
      avgRating: +(data.trips.reduce((sum, t) => sum + (t.rating || 4.8), 0) / data.trips.length).toFixed(1),
      priceRange: {
        min: Math.min(...data.trips.map(t => t.price || 0)),
        max: Math.max(...data.trips.map(t => t.price || 0)),
      },
      totalReviews: data.totalReviews,
      activities: [...new Set(data.trips.flatMap(t => t.activityType || []))],
    }));
  }, [trips]);

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

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.div variants={fadeUp} className="mb-10">
            <h1 className="text-4xl font-bold">Top Destinations</h1>
            <p className="text-muted mt-2 text-lg">Explore handpicked trip packages across India</p>
          </motion.div>

          {destinations.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card text-muted">
              <p className="font-bold text-lg">No destinations found in database</p>
              <p className="text-sm mt-1 text-muted/60">Create trips to populate active destinations.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {destinations.map((dest, idx) => (
                <motion.div key={dest.name} variants={fadeUp}>
                  <Link href={`/trips?search=${encodeURIComponent(dest.name)}`}
                    className="group block rounded-3xl border border-border bg-card overflow-hidden hover:shadow-2xl transition-all duration-300">
                    <div className={`relative h-56 bg-gradient-to-br ${DEST_GRADIENTS[idx % DEST_GRADIENTS.length]}`}>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-bold">
                        <FiStar size={13} className="fill-yellow-400 text-yellow-400" /> {dest.avgRating} ({dest.totalReviews})
                      </div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <span className="flex items-center gap-1 text-xs opacity-90 mb-1"><FiMapPin size={14} /> Destination</span>
                        <h2 className="text-2xl font-bold drop-shadow-md">{dest.name}</h2>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-muted font-medium">{dest.tripCount} {dest.tripCount === 1 ? 'Trip' : 'Trips'} available</span>
                        <span className="text-lg font-bold text-primary">₹{dest.priceRange.min.toLocaleString()}+</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {dest.activities.slice(0, 4).map(act => (
                          <span key={act} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                            {act}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm font-bold text-primary group-hover:translate-x-1 transition-transform">
                        <span>Explore Packages</span>
                        <FiArrowRight size={16} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
}
