'use client';
import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TbMapPin, TbClock, TbStarFilled, TbCheck, TbArrowRight, TbChevronLeft, TbColumns } from 'react-icons/tb';
import { api } from '@/lib/api';
import EmptyState from '@/components/EmptyState';
import Breadcrumbs from '@/components/Breadcrumbs';

const ACTIVITY_COLORS: Record<string, string> = {
  adventure: 'bg-teal/10 text-teal', 
  beach: 'bg-blue-400/10 text-blue-400', 
  culture: 'bg-amber-500/10 text-amber-500', 
  nature: 'bg-green-500/10 text-green-500',
  honeymoon: 'bg-pink-500/10 text-pink-500',
  family: 'bg-purple-500/10 text-purple-500',
};

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];

  const [compareTrips, setCompareTrips] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (ids.length > 0) {
      Promise.all(ids.map(id => api.get(`/trips/${id}`).catch(() => null)))
        .then(results => setCompareTrips(results.filter(Boolean)))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (compareTrips.length < 2) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20">
        <EmptyState
          icon={<TbColumns size={40} />}
          title="Select 2 trips to compare"
          description="You need to select at least 2 trips from the Explore page to compare them side-by-side."
          actionLabel="Browse trips"
          onAction={() => router.push('/trips')}
        />
      </div>
    );
  }

  // Calculate "Best Value" based on a simple heuristic: Lowest price per day
  let bestValueId = '';
  let minPricePerDay = Infinity;
  compareTrips.forEach(t => {
    const ppd = t.price / t.duration;
    if (ppd < minPricePerDay) {
      minPricePerDay = ppd;
      bestValueId = t._id;
    }
  });

  const GRADIENTS = [
    'from-blue-400 to-purple-600', 'from-orange-400 to-pink-500', 'from-teal-400 to-emerald-600'
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-surface-hover transition-colors">
          <TbChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-4xl font-bold">Compare Trips</h1>
          <p className="text-muted mt-2">Detailed side-by-side comparison to help you choose.</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-2xl">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-border bg-surface-hover/30">
              <th className="text-left py-6 px-6 font-bold text-muted w-48 sticky left-0 bg-surface z-20 shadow-[4px_0_10px_rgba(0,0,0,0.05)] border-r border-border">Features</th>
              {compareTrips.map((trip, idx) => (
                <th key={trip._id} className={`text-center py-6 px-6 w-1/3 relative ${trip._id === bestValueId ? 'bg-green-500/5' : ''}`}>
                  {trip._id === bestValueId && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">
                      Best Value
                    </div>
                  )}
                  <div className="relative h-40 rounded-xl overflow-hidden mb-4 img-dark-overlay">
                    <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]}`} />
                    <div className="absolute inset-0 bg-black/10" />
                  </div>
                  <h3 className="font-bold text-xl mb-1">{trip.title}</h3>
                  <p className="text-muted text-xs font-medium flex items-center justify-center gap-1"><TbMapPin size={14} className="text-accent" /> {trip.destination}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Price', render: (t: any) => <span className="font-bold text-2xl text-foreground">₹{(t.price || 0).toLocaleString()}</span> },
              { label: 'Duration', render: (t: any) => <span className="font-bold flex items-center justify-center gap-1.5"><TbClock size={18} className="text-muted" />{t.durationDays || t.duration} Days</span> },
              { label: 'Difficulty', render: (t: any) => <span className="capitalize font-bold text-xs px-3 py-1.5 rounded-lg bg-surface-hover border border-border">{t.difficulty || 'Moderate'}</span> },
              { label: 'Group Size', render: (t: any) => <span className="font-bold text-muted">Max {t.maxTravelers || t.maxGroupSize || 20} people</span> },
              { label: 'Rating', render: (t: any) => <span className="flex items-center justify-center gap-1.5 font-bold text-lg"><TbStarFilled size={20} className="text-yellow-500" /> {t.rating || 4.8} <span className="text-xs text-muted font-medium ml-1">({t.reviewCount || 0})</span></span> },
              { label: 'Tags', render: (t: any) => (
                <div className="flex flex-wrap gap-2 justify-center">
                  {(t.activityType || []).map((tag: string) => (
                    <span key={tag} className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${ACTIVITY_COLORS[tag] || 'bg-surface-hover text-muted'}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              ) },
              { label: 'Inclusions', render: (t: any) => (
                <ul className="space-y-2 text-sm text-left max-w-xs mx-auto">
                  {(t.included || t.highlights || []).map((inc: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <TbCheck size={16} className="text-teal flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{inc}</span>
                    </li>
                  ))}
                </ul>
              ) },
            ].map((row, idx) => (
              <tr key={row.label} className={`border-b border-border/50 hover:bg-surface-hover/50 transition-colors`}>
                <td className="py-6 px-6 font-bold text-muted sticky left-0 bg-surface z-10 border-r border-border shadow-[4px_0_10px_rgba(0,0,0,0.05)] text-sm uppercase tracking-wider">{row.label}</td>
                {compareTrips.map(trip => (
                  <td key={trip._id} className={`py-6 px-6 text-center ${trip._id === bestValueId ? 'bg-green-500/5' : ''}`}>
                    {row.render(trip)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="py-8 px-6 sticky left-0 bg-surface z-10 border-r border-border shadow-[4px_0_10px_rgba(0,0,0,0.05)]"></td>
              {compareTrips.map(trip => (
                <td key={trip._id} className={`py-8 px-6 text-center ${trip._id === bestValueId ? 'bg-green-500/5' : ''}`}>
                  <Link href={`/trips/${trip._id}`}
                    className="inline-flex items-center justify-center gap-2 w-full max-w-[200px] px-6 py-4 rounded-xl bg-accent text-white font-bold text-sm hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 transition-all tap-target">
                    Book this trip <TbArrowRight size={18} />
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-background">
      <Breadcrumbs />
      <Suspense fallback={<div className="p-8 text-center text-muted">Loading comparison...</div>}>
        <CompareContent />
      </Suspense>
    </div>
  );
}
