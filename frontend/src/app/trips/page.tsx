'use client';
import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TbSearch,
  TbMapPin,
  TbStarFilled,
  TbFilter,
  TbX,
  TbClock,
  TbChevronDown,
  TbCheck,
  TbArrowRight,
  TbCurrencyRupee,
  TbHeart,
  TbRefresh,
} from 'react-icons/tb';
import Breadcrumbs from '@/components/Breadcrumbs';
import SkeletonCard from '@/components/SkeletonCard';
import EmptyState from '@/components/EmptyState';
import { api } from '@/lib/api';
import { getDestinationImage } from '@/lib/destinationImages';
import { useToast } from '@/contexts/ToastContext';
import { useSearchParams } from 'next/navigation';

function mapBackendTripToFrontend(bTrip: any): any {
  const images =
    bTrip.images && bTrip.images.length > 0 && bTrip.images[0]
      ? bTrip.images
      : [getDestinationImage(bTrip.destination)];

  return {
    _id: bTrip.id || bTrip._id,
    id: bTrip.id || bTrip._id,
    title: bTrip.title,
    destination: bTrip.destination,
    description: bTrip.description,
    price: Number(bTrip.price || 0),
    duration: Number(bTrip.durationDays || bTrip.duration || 1),
    durationDays: Number(bTrip.durationDays || bTrip.duration || 1),
    maxGroupSize: Number(bTrip.maxTravelers || 20),
    difficulty: bTrip.difficulty || 'moderate',
    rating: Number(bTrip.rating || 4.8),
    reviewCount: bTrip.reviewCount || 0,
    images,
    activityType: bTrip.activityType || ['adventure'],
    highlights: bTrip.highlights || ['Sightseeing', 'Exploration'],
    itinerary: bTrip.itinerary || [],
    included: bTrip.included || ['Accommodation', 'Guide'],
    excluded: bTrip.excluded || ['Personal expenses'],
    startDates: bTrip.startDates || [],
    agency: { _id: bTrip.organizationId, name: bTrip.organization?.name || 'Travel Agency' },
  };
}

const CATEGORIES = ['Adventure', 'Beach', 'Culture', 'Nature', 'Water Sports', 'Wellness'];
const BUDGETS = ['Under ₹15k', '₹15k–₹25k', '₹25k+'];
const DURATIONS = ['1–3 days', '4–7 days', '8+ days'];
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
  watersports: 'bg-cyan-500/10 text-cyan-500',
  wellness: 'bg-purple-500/10 text-purple-500',
};

interface FilterDropdownProps {
  title: string;
  options: string[];
  isOpen: boolean;
  onToggle: () => void;
  selectedValues: string[];
  onToggleOption: (value: string) => void;
  onClear: () => void;
}

function FilterDropdown({
  title,
  options,
  isOpen,
  onToggle,
  selectedValues,
  onToggleOption,
  onClear,
}: FilterDropdownProps) {
  const selectedCount = selectedValues.length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-semibold transition-all tap-target whitespace-nowrap ${
          selectedCount > 0
            ? 'border-accent text-accent bg-accent/10 shadow-sm'
            : isOpen
            ? 'border-foreground/40 bg-surface-hover text-foreground'
            : 'border-border bg-card hover:bg-surface-hover text-foreground/90'
        }`}
      >
        <span>{title}</span>
        {selectedCount > 0 && (
          <span className="h-5 w-5 rounded-full bg-accent text-white text-xs flex items-center justify-center font-bold">
            {selectedCount}
          </span>
        )}
        <TbChevronDown
          size={15}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-accent' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute top-full left-0 mt-2 w-52 p-2 rounded-2xl border border-border bg-card shadow-2xl z-50 flex flex-col gap-1"
          >
            {options.map((opt) => {
              const isSelected = selectedValues.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onToggleOption(opt)}
                  className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                    isSelected
                      ? 'bg-accent/10 text-accent font-bold'
                      : 'hover:bg-surface-hover text-foreground'
                  }`}
                >
                  <span>{opt}</span>
                  {isSelected && <TbCheck size={16} className="text-accent" />}
                </button>
              );
            })}

            {selectedCount > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="mt-1 pt-1.5 border-t border-border text-center text-xs font-bold text-muted hover:text-accent transition-colors py-1"
              >
                Reset {title}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TripsContent() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<{ type: string; value: string }[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [showSort, setShowSort] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [savedTrips, setSavedTrips] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const filterBarRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterBarRef.current && !filterBarRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setShowSort(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sync initial query params from URL (e.g. ?q=Goa or ?category=Beach)
  useEffect(() => {
    const q = searchParams.get('q') || searchParams.get('search') || searchParams.get('destination');
    if (q) {
      setSearch(q);
    }
    const typeParam = searchParams.get('type') || searchParams.get('category');
    if (typeParam) {
      const matched = CATEGORIES.find(
        (c) => c.toLowerCase() === typeParam.toLowerCase()
      );
      if (matched) {
        setActiveFilters([{ type: 'Type', value: matched }]);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    api.get('/trips')
      .then((res) => {
        const dataArray = res && res.data ? res.data : Array.isArray(res) ? res : [];
        const mapped = dataArray.map(mapBackendTripToFrontend);
        setTrips(mapped);
      })
      .catch((err) => {
        console.error('Error loading trips:', err);
        showToast('Could not load trips. Please check server.', 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let localSaved: string[] = [];
    try {
      const saved = localStorage.getItem('voynex_saved_trips');
      if (saved) localSaved = JSON.parse(saved);
      if (Array.isArray(localSaved)) setSavedTrips(localSaved);
    } catch (e) {}

    api.get('/wishlist')
      .then(async (res) => {
        if (Array.isArray(res)) {
          const remoteIds = res.map((w: any) => w.itemId || w.item?._id || w.item?.id).filter(Boolean);
          const missing = localSaved.filter(id => !remoteIds.includes(id));
          if (missing.length > 0) {
            await Promise.allSettled(missing.map(id => api.post('/wishlist', { itemType: 'trip', itemId: id })));
            const reRes = await api.get('/wishlist').catch(() => []);
            if (Array.isArray(reRes)) {
              const allIds = reRes.map((w: any) => w.itemId || w.item?._id || w.item?.id).filter(Boolean);
              setSavedTrips(allIds);
              localStorage.setItem('voynex_saved_trips', JSON.stringify(allIds));
              return;
            }
          }
          const merged = Array.from(new Set([...localSaved, ...remoteIds]));
          setSavedTrips(merged);
          localStorage.setItem('voynex_saved_trips', JSON.stringify(merged));
        }
      })
      .catch(() => {});
  }, []);

  const toggleSaved = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const isSaved = savedTrips.includes(id);
    const updated = isSaved ? savedTrips.filter((t) => t !== id) : [...savedTrips, id];
    setSavedTrips(updated);
    localStorage.setItem('voynex_saved_trips', JSON.stringify(updated));

    try {
      const res = await api.post('/wishlist', {
        itemType: 'trip',
        itemId: id,
      });
      showToast(res?.message || (isSaved ? 'Removed from wishlist' : 'Saved to wishlist!'), 'success');
    } catch {
      showToast(isSaved ? 'Removed from saved trips' : 'Saved to wishlist!', 'success');
    }
  };

  const toggleFilter = (type: string, value: string) => {
    setActiveFilters((prev) => {
      const exists = prev.some((f) => f.type === type && f.value === value);
      if (exists) return prev.filter((f) => !(f.type === type && f.value === value));
      return [...prev, { type, value }];
    });
  };

  const removeFilter = (type: string, value: string) => {
    setActiveFilters((prev) => prev.filter((f) => !(f.type === type && f.value === value)));
  };

  const clearFilterType = (type: string) => {
    setActiveFilters((prev) => prev.filter((f) => f.type !== type));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setSearch('');
  };

  // Filtered trips memo with TRIPS included in dependencies
  const filteredTrips = useMemo(() => {
    let result = trips.filter((trip) => {
      const query = search.trim().toLowerCase();
      const matchSearch =
        !query ||
        (trip.title && trip.title.toLowerCase().includes(query)) ||
        (trip.destination && trip.destination.toLowerCase().includes(query)) ||
        (trip.description && trip.description.toLowerCase().includes(query)) ||
        (Array.isArray(trip.highlights) &&
          trip.highlights.some((h: string) => String(h).toLowerCase().includes(query))) ||
        (Array.isArray(trip.activityType) &&
          trip.activityType.some((a: string) => String(a).toLowerCase().includes(query)));

      const typeFilters = activeFilters
        .filter((f) => f.type === 'Type')
        .map((f) => f.value.toLowerCase().replace(/[-_\s]+/g, ''));
      const budgetFilters = activeFilters
        .filter((f) => f.type === 'Budget')
        .map((f) => f.value);
      const durationFilters = activeFilters
        .filter((f) => f.type === 'Duration')
        .map((f) => f.value);
      const difficultyFilters = activeFilters
        .filter((f) => f.type === 'Difficulty')
        .map((f) => f.value.toLowerCase());

      const tripActivities = (Array.isArray(trip.activityType) ? trip.activityType : []).map(
        (a: string) => String(a).toLowerCase().replace(/[-_\s]+/g, '')
      );

      const matchType =
        typeFilters.length === 0 ||
        typeFilters.some((t) =>
          tripActivities.some((a: string) => a.includes(t) || t.includes(a))
        );

      const tripDiff = String(trip.difficulty || '').toLowerCase().trim();
      const matchDifficulty =
        difficultyFilters.length === 0 || difficultyFilters.includes(tripDiff);

      const tripPrice = Number(trip.price) || 0;
      const matchBudget =
        budgetFilters.length === 0 ||
        budgetFilters.some((b) => {
          const cleanB = b.replace(/–/g, '-');
          if (cleanB.includes('Under') || (cleanB.includes('15k') && !cleanB.includes('25k'))) {
            return tripPrice < 15000;
          }
          if (cleanB.includes('15k') && cleanB.includes('25k')) {
            return tripPrice >= 15000 && tripPrice <= 25000;
          }
          if (cleanB.includes('25k+')) {
            return tripPrice > 25000;
          }
          return true;
        });

      const tripDuration = Number(trip.durationDays || trip.duration) || 1;
      const matchDuration =
        durationFilters.length === 0 ||
        durationFilters.some((d) => {
          const cleanD = d.replace(/–/g, '-');
          if (cleanD.includes('1') && cleanD.includes('3')) return tripDuration >= 1 && tripDuration <= 3;
          if (cleanD.includes('4') && cleanD.includes('7')) return tripDuration >= 4 && tripDuration <= 7;
          if (cleanD.includes('8')) return tripDuration >= 8;
          return true;
        });

      return matchSearch && matchType && matchBudget && matchDuration && matchDifficulty;
    });

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      case 'rating':
        result.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
        break;
      case 'duration-short':
        result.sort(
          (a, b) =>
            (Number(a.durationDays || a.duration) || 0) -
            (Number(b.durationDays || b.duration) || 0)
        );
        break;
      case 'newest':
        result.sort((a, b) => (b._id || '').localeCompare(a._id || ''));
        break;
    }
    return result;
  }, [trips, search, activeFilters, sortBy]);

  const toggleCompare = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    e.stopPropagation();
    setCompareList((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const hasActiveFilters = activeFilters.length > 0 || search.trim().length > 0;

  return (
    <div className="min-h-screen pb-24">
      <Breadcrumbs />

      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Explore Trips
            </h1>
            <p className="text-muted mt-1 text-sm sm:text-base">
              {loading
                ? 'Loading curated experiences...'
                : `Showing ${filteredTrips.length} curated ${filteredTrips.length === 1 ? 'trip' : 'trips'}`}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-surface p-1 rounded-2xl border border-border">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Grid view
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                viewMode === 'map'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Map view
            </button>
          </div>
        </div>

        {/* Sticky Filter & Search Bar */}
        <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-xl border-b border-border py-4 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div ref={filterBarRef} className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <TbSearch
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search destination, trip name, activity..."
                className="w-full pl-10 pr-9 py-2 rounded-full border border-border bg-card text-sm font-medium focus:outline-none focus:border-accent text-foreground transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-0.5"
                >
                  <TbX size={15} />
                </button>
              )}
            </div>

            {/* Filter Dropdowns Row & Sort */}
            <div className="flex items-center flex-wrap gap-2.5">
              <div className="flex items-center flex-wrap gap-2">
                <TbFilter size={18} className="text-muted hidden md:block" />
                <FilterDropdown
                  title="Type"
                  options={CATEGORIES}
                  isOpen={activeDropdown === 'Type'}
                  onToggle={() => {
                    setShowSort(false);
                    setActiveDropdown(activeDropdown === 'Type' ? null : 'Type');
                  }}
                  selectedValues={activeFilters.filter((f) => f.type === 'Type').map((f) => f.value)}
                  onToggleOption={(opt) => toggleFilter('Type', opt)}
                  onClear={() => {
                    clearFilterType('Type');
                    setActiveDropdown(null);
                  }}
                />
                <FilterDropdown
                  title="Budget"
                  options={BUDGETS}
                  isOpen={activeDropdown === 'Budget'}
                  onToggle={() => {
                    setShowSort(false);
                    setActiveDropdown(activeDropdown === 'Budget' ? null : 'Budget');
                  }}
                  selectedValues={activeFilters.filter((f) => f.type === 'Budget').map((f) => f.value)}
                  onToggleOption={(opt) => toggleFilter('Budget', opt)}
                  onClear={() => {
                    clearFilterType('Budget');
                    setActiveDropdown(null);
                  }}
                />
                <FilterDropdown
                  title="Duration"
                  options={DURATIONS}
                  isOpen={activeDropdown === 'Duration'}
                  onToggle={() => {
                    setShowSort(false);
                    setActiveDropdown(activeDropdown === 'Duration' ? null : 'Duration');
                  }}
                  selectedValues={activeFilters.filter((f) => f.type === 'Duration').map((f) => f.value)}
                  onToggleOption={(opt) => toggleFilter('Duration', opt)}
                  onClear={() => {
                    clearFilterType('Duration');
                    setActiveDropdown(null);
                  }}
                />
                <FilterDropdown
                  title="Difficulty"
                  options={DIFFICULTIES}
                  isOpen={activeDropdown === 'Difficulty'}
                  onToggle={() => {
                    setShowSort(false);
                    setActiveDropdown(activeDropdown === 'Difficulty' ? null : 'Difficulty');
                  }}
                  selectedValues={activeFilters.filter((f) => f.type === 'Difficulty').map((f) => f.value)}
                  onToggleOption={(opt) => toggleFilter('Difficulty', opt)}
                  onClear={() => {
                    clearFilterType('Difficulty');
                    setActiveDropdown(null);
                  }}
                />
              </div>

              {/* Sort Dropdown */}
              <div className="relative flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveDropdown(null);
                    setShowSort(!showSort);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-card text-sm font-semibold hover:bg-surface-hover transition-all tap-target text-foreground whitespace-nowrap"
                >
                  <span>Sort: {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}</span>
                  <TbChevronDown
                    size={15}
                    className={`transition-transform duration-200 ${showSort ? 'rotate-180 text-accent' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {showSort && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="absolute right-0 top-full mt-2 w-48 p-2 rounded-2xl border border-border bg-card shadow-2xl z-50 flex flex-col gap-1"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSortBy(opt.value);
                            setShowSort(false);
                          }}
                          className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                            sortBy === opt.value
                              ? 'bg-accent/10 text-accent font-bold'
                              : 'hover:bg-surface-hover text-foreground'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {sortBy === opt.value && <TbCheck size={16} className="text-accent" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Active Filters Pill Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-border/50">
              <span className="text-xs font-bold text-muted uppercase tracking-wider mr-1">
                Active filters:
              </span>
              {search && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-xs font-semibold text-accent">
                  <span>Search: &quot;{search}&quot;</span>
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="hover:opacity-75 transition-opacity ml-0.5"
                  >
                    <TbX size={13} />
                  </button>
                </span>
              )}
              {activeFilters.map((f) => (
                <span
                  key={`${f.type}-${f.value}`}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-hover border border-border text-xs font-medium text-foreground"
                >
                  <span className="text-muted font-normal">{f.type}:</span> {f.value}
                  <button
                    type="button"
                    onClick={() => removeFilter(f.type, f.value)}
                    className="hover:text-accent transition-colors ml-0.5"
                  >
                    <TbX size={13} />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-xs font-bold text-accent hover:underline ml-2 tap-target"
              >
                <TbRefresh size={13} /> Reset all
              </button>
            </div>
          )}
        </div>

        {/* View Content */}
        {viewMode === 'map' ? (
          <div className="h-[600px] w-full rounded-3xl border border-border bg-card flex items-center justify-center p-6 text-center">
            <div>
              <TbMapPin size={48} className="mx-auto text-muted mb-4 opacity-40" />
              <h3 className="text-xl font-bold">Interactive Map View</h3>
              <p className="text-muted mt-2 text-sm max-w-md">
                Showing {filteredTrips.length} curated destinations across India. Switch to Grid view to browse full itineraries.
              </p>
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
                  <motion.div
                    key={trip._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.4) }}
                  >
                    <div className="relative rounded-3xl border border-border bg-card overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
                      {/* Compare Checkbox */}
                      <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <label className="flex items-center gap-2 cursor-pointer tap-target">
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={compareList.includes(trip._id)}
                            onChange={(e) => toggleCompare(e, trip._id)}
                          />
                          <div
                            className={`h-6 w-6 rounded-md flex items-center justify-center border transition-all ${
                              compareList.includes(trip._id)
                                ? 'bg-accent border-accent text-white shadow-lg shadow-accent/40'
                                : 'bg-black/40 border-white/30 backdrop-blur-md text-transparent hover:bg-black/60'
                            }`}
                          >
                            <TbCheck
                              size={14}
                              strokeWidth={3}
                              className={compareList.includes(trip._id) ? 'opacity-100' : 'opacity-0'}
                            />
                          </div>
                        </label>
                      </div>

                      {/* Wishlist Heart */}
                      <button
                        type="button"
                        onClick={(e) => toggleSaved(e, trip._id)}
                        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-black/60 hover:scale-110 transition-all tap-target"
                        aria-label="Save to wishlist"
                      >
                        <TbHeart
                          size={18}
                          className={savedTrips.includes(trip._id) ? 'fill-accent text-accent' : ''}
                        />
                      </button>

                      <Link href={`/trips/${trip._id}`} className="flex flex-col flex-1">
                        {/* 16:9 Image with safe fallback */}
                        <div className="relative aspect-video overflow-hidden bg-muted">
                          <img
                            src={trip.images?.[0] || getDestinationImage(trip.destination)}
                            alt={trip.title}
                            loading="lazy"
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = getDestinationImage(trip.destination);
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                          {/* Destination pill overlay */}
                          <div className="absolute bottom-2.5 left-3 text-white flex items-center gap-1 text-xs font-bold drop-shadow-md">
                            <TbMapPin size={13} className="text-accent" />
                            <span>{trip.destination}</span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col flex-1">
                          <h3 className="font-bold text-base text-foreground group-hover:text-accent transition-colors line-clamp-1 mb-1">
                            {trip.title}
                          </h3>

                          {/* Meta items */}
                          <div className="flex items-center gap-3 text-xs text-muted font-medium mb-3">
                            <span className="flex items-center gap-1">
                              <TbClock size={13} /> {trip.duration} {trip.duration === 1 ? 'day' : 'days'}
                            </span>
                            <span className="flex items-center gap-1 text-amber-500 font-bold">
                              <TbStarFilled size={12} /> {trip.rating} ({trip.reviewCount})
                            </span>
                          </div>

                          {/* Activity Tag Chips */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {(trip.activityType || []).slice(0, 2).map((act: string) => {
                              const normalized = act.toLowerCase().replace(/[-_\s]+/g, '');
                              const colorClass =
                                ACTIVITY_COLORS[normalized] || 'bg-surface-hover text-muted';
                              return (
                                <span
                                  key={act}
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colorClass}`}
                                >
                                  {act}
                                </span>
                              );
                            })}
                          </div>

                          {/* Price & CTA */}
                          <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-muted uppercase font-bold block">
                                Starting from
                              </span>
                              <span className="text-lg font-black text-foreground">
                                ₹{trip.price.toLocaleString()}
                              </span>
                            </div>

                            <span className="text-xs font-bold text-accent group-hover:underline flex items-center gap-1">
                              Details <TbArrowRight size={13} />
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
                title={hasActiveFilters ? 'No trips found' : 'No trips available'}
                description={
                  hasActiveFilters
                    ? "Try adjusting your search criteria or resetting filters to see more results."
                    : 'We are currently adding more exciting packages. Please check back shortly!'
                }
                actionLabel={hasActiveFilters ? 'Clear Filters' : undefined}
                onAction={hasActiveFilters ? clearAllFilters : undefined}
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
            className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-border shadow-2xl p-4"
          >
            <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base sm:text-lg">
                  {compareList.length} trips selected for comparison
                </h3>
                <p className="text-xs text-muted">Compare prices, itinerary, highlights side-by-side.</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setCompareList([])}
                  className="text-xs font-semibold text-muted hover:text-foreground transition-colors px-3 py-2"
                >
                  Clear Selection
                </button>
                <Link
                  href={`/compare?ids=${compareList.join(',')}`}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-bold text-center hover:shadow-lg hover:shadow-accent/30 transition-all tap-target"
                >
                  Compare Now
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TripsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-24 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-4 border-accent border-t-transparent animate-spin" />
        </div>
      }
    >
      <TripsContent />
    </Suspense>
  );
}
