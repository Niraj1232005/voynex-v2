'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TbSearch, TbMapPin, TbStarFilled, TbFilter, TbX, TbClock, TbChevronDown, TbCheck, TbArrowRight, TbCurrencyRupee, TbHeart
} from 'react-icons/tb';
import Breadcrumbs from '@/components/Breadcrumbs';
import SkeletonCard from '@/components/SkeletonCard';
import EmptyState from '@/components/EmptyState';
import { api } from '@/lib/api';

function mapBackendTripToFrontend(bTrip: any): any {
  return {
    _id: bTrip.id || bTrip._id,
    id: bTrip.id || bTrip._id,
    title: bTrip.title,
    destination: bTrip.destination,
    description: bTrip.description,
    price: Number(bTrip.price || 0),
    duration: bTrip.durationDays || bTrip.duration || 1,
    durationDays: bTrip.durationDays || bTrip.duration || 1,
    maxGroupSize: bTrip.maxTravelers || 20,
    difficulty: bTrip.difficulty || 'moderate',
    rating: bTrip.rating || 4.8,
    reviewCount: bTrip.reviewCount || 0,
    images: (bTrip.images && bTrip.images.length > 0) ? bTrip.images : ['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80'],
    activityType: bTrip.activityType || ['adventure'],
    highlights: bTrip.highlights || ['Sightseeing', 'Exploration'],
    itinerary: bTrip.itinerary || [],
    included: bTrip.included || ['Accommodation', 'Guide'],
    excluded: bTrip.excluded || ['Personal expenses'],
    startDates: bTrip.startDates || [],
    agency: { _id: bTrip.organizationId, name: bTrip.organization?.name || 'Travel Agency' },
  };
}

const CATEGORIES = ['Adventure', 'Beach', 'Culture', 'Nature', 'Honeymoon', 'Family'];
const BUDGETS = ['Under ₹10k', '₹10k–₹25k', '₹25k–₹50k', '₹50k+'];
const DURATIONS = ['1–3 days', '4–7 days', '8–14 days', '14+ days'];
const DIFFICULTIES = ['Easy', 'Moderate', 'Challenging'];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'duration-short', label: 'Shortest' },
  { value: 'newest', label: 'Newest' },
];

const ACTIVITY_COLORS: Record<string, string> = {
  adventure: 'bg-teal/10 text-teal', 
  beach: 'bg-blue-400/10 text-blue-400', 
  culture: 'bg-amber-500/10 text-amber-500', 
  nature: 'bg-green-500/10 text-green-500',
  honeymoon: 'bg-pink-500/10 text-pink-500',
  family: 'bg-purple-500/10 text-purple-500',
};

export default function TripsPage() {
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<{type: string, value: string}[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [showSort, setShowSort] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [savedTrips, setSavedTrips] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/trips')
      .then(res => {
        const dataArray = res && res.data ? res.data : Array.isArray(res) ? res : [];
        const mapped = dataArray.map(mapBackendTripToFrontend);
        setTrips(mapped);
      })
      .catch(err => {
        console.error('Error loading trips:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('voynex_saved_trips');
      if (saved) setSavedTrips(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const toggleSaved = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = savedTrips.includes(id) ? savedTrips.filter(t => t !== id) : [...savedTrips, id];
    setSavedTrips(updated);
    localStorage.setItem('voynex_saved_trips', JSON.stringify(updated));
  };

  const toggleFilter = (type: string, value: string) => {
    setActiveFilters(prev => {
      const exists = prev.some(f => f.type === type && f.value === value);
      if (exists) return prev.filter(f => !(f.type === type && f.value === value));
      return [...prev, { type, value }];
    });
  };

  const removeFilter = (type: string, value: string) => {
    setActiveFilters(prev => prev.filter(f => !(f.type === type && f.value === value)));
  };

  const clearAllFilters = () => setActiveFilters([]);

  const filteredTrips = useMemo(() => {
    let result = trips.filter(trip => {
      const matchSearch = !search || trip.title.toLowerCase().includes(search.toLowerCase()) || trip.destination.toLowerCase().includes(search.toLowerCase());
      
      const typeFilters = activeFilters.filter(f => f.type === 'Type').map(f => f.value.toLowerCase());
      const budgetFilters = activeFilters.filter(f => f.type === 'Budget').map(f => f.value);
      const durationFilters = activeFilters.filter(f => f.type === 'Duration').map(f => f.value);
      const difficultyFilters = activeFilters.filter(f => f.type === 'Difficulty').map(f => f.value.toLowerCase());

      const matchType = typeFilters.length === 0 || typeFilters.some(t => trip.activityType.includes(t));
      const matchDifficulty = difficultyFilters.length === 0 || difficultyFilters.includes(trip.difficulty.toLowerCase());
      
      const matchBudget = budgetFilters.length === 0 || budgetFilters.some(b => {
        if (b === 'Under ₹10k') return trip.price < 10000;
        if (b === '₹10k–₹25k') return trip.price >= 10000 && trip.price <= 25000;
        if (b === '₹25k–₹50k') return trip.price > 25000 && trip.price <= 50000;
        if (b === '₹50k+') return trip.price > 50000;
        return true;
      });

      const matchDuration = durationFilters.length === 0 || durationFilters.some(d => {
        if (d === '1–3 days') return trip.duration >= 1 && trip.duration <= 3;
        if (d === '4–7 days') return trip.duration >= 4 && trip.duration <= 7;
        if (d === '8–14 days') return trip.duration >= 8 && trip.duration <= 14;
        if (d === '14+ days') return trip.duration > 14;
        return true;
      });

      return matchSearch && matchType && matchBudget && matchDuration && matchDifficulty;
    });

    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'duration-short': result.sort((a, b) => a.duration - b.duration); break;
      case 'newest': result.sort((a, b) => b._id.localeCompare(a._id)); break;
    }
    return result;
  }, [search, activeFilters, sortBy]);

  const toggleCompare = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    e.stopPropagation();
    setCompareList(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return [...prev.slice(1), id]; // Max 3, replace oldest
      return [...prev, id];
    });
  };

  const compareTrips = trips.filter(t => compareList.includes(t._id));

  const FilterDropdown = ({ title, options }: { title: string, options: string[] }) => {
    const isActive = activeDropdown === title;
    const selectedCount = activeFilters.filter(f => f.type === title).length;
    
    return (
      <div className="relative flex-shrink-0">
        <button 
          onClick={() => setActiveDropdown(isActive ? null : title)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all tap-target ${
            selectedCount > 0 || isActive ? 'border-accent text-accent bg-accent/10' : 'border-border bg-card hover:bg-surface-hover text-foreground'
          }`}
        >
          {title} {selectedCount > 0 && `(${selectedCount})`}
          <TbChevronDown size={16} className={`transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isActive && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setActiveDropdown(null)} />
              <motion.div 
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="absolute top-full left-0 mt-2 w-56 p-2 rounded-xl border border-border bg-surface shadow-xl z-30 flex flex-col gap-1"
              >
                {options.map(opt => {
                  const isSelected = activeFilters.some(f => f.type === title && f.value === opt);
                  return (
                    <button 
                      key={opt} 
                      onClick={() => toggleFilter(title, opt)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-left ${
                        isSelected ? 'bg-accent/10 text-accent font-semibold' : 'hover:bg-surface-hover'
                      }`}
                    >
                      {opt}
                      {isSelected && <TbCheck size={16} />}
                    </button>
                  );
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-24">
      <Breadcrumbs />

      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold">Explore Trips</h1>
            <p className="text-muted mt-2">Showing {filteredTrips.length} trips</p>
          </div>
          <div className="flex items-center gap-2 bg-surface p-1 rounded-xl border border-border">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted hover:text-foreground'}`}
            >
              Grid view
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'map' ? 'bg-background shadow-sm text-foreground' : 'text-muted hover:text-foreground'}`}
            >
              Map view
            </button>
          </div>
        </div>

        {/* Sticky Filter Bar */}
        <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-xl border-b border-border py-4 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center justify-between gap-4">
            {/* Filter Dropdowns Scrollable Row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none flex-1">
              <TbFilter size={20} className="text-muted mr-2 flex-shrink-0 hidden sm:block" />
              <FilterDropdown title="Type" options={CATEGORIES} />
              <FilterDropdown title="Budget" options={BUDGETS} />
              <FilterDropdown title="Duration" options={DURATIONS} />
              <FilterDropdown title="Difficulty" options={DIFFICULTIES} />
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex-shrink-0 pb-2">
              <button 
                onClick={() => setShowSort(!showSort)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-sm font-medium hover:bg-surface-hover transition-all tap-target"
              >
                Sort: {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                <TbChevronDown size={16} className={`transition-transform duration-200 ${showSort ? 'rotate-180 text-accent' : ''}`} />
              </button>
              <AnimatePresence>
                {showSort && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowSort(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-full mt-2 w-48 p-2 rounded-xl border border-border bg-surface shadow-xl z-30 flex flex-col gap-1"
                    >
                      {SORT_OPTIONS.map(opt => (
                        <button 
                          key={opt.value} 
                          onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-left ${
                            sortBy === opt.value ? 'bg-accent/10 text-accent font-semibold' : 'hover:bg-surface-hover'
                          }`}
                        >
                          {opt.label}
                          {sortBy === opt.value && <TbCheck size={16} />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Active Filters Row */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {activeFilters.map(f => (
                <span key={`${f.type}-${f.value}`} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-hover border border-border text-xs font-medium">
                  <span className="text-muted">{f.type}:</span> {f.value}
                  <button onClick={() => removeFilter(f.type, f.value)} className="hover:text-accent transition-colors ml-1 p-0.5"><TbX size={14} /></button>
                </span>
              ))}
              <button onClick={clearAllFilters} className="text-xs font-semibold text-accent hover:underline ml-2">Clear all filters</button>
            </div>
          )}
        </div>

        {/* View Content */}
        {viewMode === 'map' ? (
          <div className="h-[600px] w-full rounded-2xl border border-border bg-surface flex items-center justify-center">
            <div className="text-center">
              <TbMapPin size={48} className="mx-auto text-muted mb-4 opacity-50" />
              <h3 className="text-xl font-bold">Map View Unavailable</h3>
              <p className="text-muted mt-2">Google Maps integration requires an API key.</p>
              <p className="text-muted text-sm mt-1">Showing {filteredTrips.length} pins logically.</p>
            </div>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <SkeletonCard variant="trip" count={8} />
              </div>
            ) : filteredTrips.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredTrips.map((trip, idx) => (
                  <motion.div key={trip._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.05, 0.5) }}>
                    <div className="relative rounded-[12px] border border-border bg-card overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
                      
                      {/* Compare Checkbox (top-left, visible on hover) */}
                      <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <label className="flex items-center gap-2 cursor-pointer tap-target">
                          <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={compareList.includes(trip._id)} 
                            onChange={(e) => toggleCompare(e, trip._id)} 
                          />
                          <div className={`h-6 w-6 rounded-md flex items-center justify-center border transition-all ${
                            compareList.includes(trip._id)
                              ? 'bg-accent border-accent text-white shadow-lg shadow-accent/40'
                              : 'bg-black/40 border-white/30 backdrop-blur-md text-transparent hover:bg-black/60'
                          }`}>
                            <TbCheck size={14} strokeWidth={3} className={compareList.includes(trip._id) ? 'opacity-100' : 'opacity-0'} />
                          </div>
                        </label>
                      </div>

                      {/* Wishlist Heart (top-right) */}
                      <button 
                        onClick={(e) => toggleSaved(e, trip._id)}
                        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-black/60 hover:scale-110 transition-all tap-target"
                      >
                        <TbHeart size={18} className={savedTrips.includes(trip._id) ? 'fill-accent text-accent' : ''} />
                      </button>

                      <Link href={`/trips/${trip._id}`} className="flex flex-col flex-1">
                        {/* 16:9 Image */}
                        <div className="relative aspect-video overflow-hidden img-dark-overlay bg-muted">
                          <div className={`absolute inset-0 bg-gradient-to-br ${['from-blue-400 to-purple-600', 'from-orange-400 to-pink-500', 'from-teal-400 to-emerald-600', 'from-rose-400 to-red-500', 'from-indigo-400 to-blue-600', 'from-amber-400 to-orange-600'][idx % 6]}`} />
                          {trip.images && trip.images[0] && (
                            <img
                              src={trip.images[0]}
                              alt={trip.title}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 z-0"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          )}
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-500 z-10 pointer-events-none" />
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col flex-1">
                          {/* Title */}
                          <h3 className="font-medium text-base mb-3 group-hover:text-accent transition-colors line-clamp-1">{trip.title}</h3>
                          
                          {/* Badges Row */}
                          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-hover border border-border text-[11px] font-bold whitespace-nowrap">
                              <TbStarFilled size={12} className="text-yellow-500" /> {trip.rating}
                            </span>
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-hover border border-border text-[11px] font-bold whitespace-nowrap">
                              <TbClock size={12} className="text-muted" /> {trip.duration}d
                            </span>
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-hover border border-border text-[11px] font-bold whitespace-nowrap">
                              <TbCurrencyRupee size={12} className="text-muted" /> {trip.price.toLocaleString()}
                            </span>
                          </div>

                          {/* Tag Pills */}
                          <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
                            {trip.activityType.slice(0, 3).map((a: string) => {
                              const normalized = a.toLowerCase();
                              return (
                                <span key={a} className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${ACTIVITY_COLORS[normalized] || 'bg-surface-hover text-muted'}`}>
                                  {a}
                                </span>
                              );
                            })}
                          </div>

                          {/* CTA */}
                          <div className="pt-4 border-t border-border flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted capitalize">{trip.difficulty}</span>
                            <span className="text-sm font-bold text-accent group-hover:underline">
                              View Details
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<TbSearch size={40} />}
                title="No trips found"
                description="Try adjusting your filters or search terms to find what you're looking for."
                actionLabel="Clear Filters"
                onAction={clearAllFilters}
              />
            )}
          </>
        )}
      </div>

      {/* Sticky Compare Bar */}
      <AnimatePresence>
        {compareList.length >= 2 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-4"
          >
            <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg">{compareList.length} trips selected — Compare now</h3>
                <p className="text-sm text-muted">Select up to 3 trips to compare side-by-side.</p>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button onClick={() => setCompareList([])} className="text-sm font-semibold text-muted hover:text-foreground transition-colors">
                  Clear
                </button>
                <Link href={`/compare?ids=${compareList.join(',')}`}
                  className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-accent text-white font-bold text-center hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 transition-all tap-target">
                  Compare
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
