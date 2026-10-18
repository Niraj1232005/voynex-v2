'use client';
import React, { useState } from 'react';
import {
  TbSearch,
  TbMapPin,
  TbClock,
  TbShieldCheck,
  TbWalk,
  TbCoffee,
  TbTree,
  TbShoppingBag,
  TbBuildingCastle,
  TbArrowRight,
  TbCheck,
  TbRefresh,
  TbAlertCircle,
  TbInfoCircle,
} from 'react-icons/tb';
import Breadcrumbs from '@/components/Breadcrumbs';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import FreetimeCard from '@/components/FreetimeCard';
import FreetimeDisclaimer from '@/components/FreetimeDisclaimer';

interface HubCandidate {
  name: string;
  formatted: string;
  lat: number;
  lon: number;
  city?: string;
  country?: string;
}

interface FreeTimeSearchResult {
  hub: {
    name: string;
    lat: number;
    lon: number;
  };
  freeTimeMinutes: number;
  dwellMinutes: number;
  bufferMinutes: number;
  category: 'food' | 'rest' | 'shopping' | 'sightseeing';
  places: any[];
  providerCostFormula: string;
  disclaimer: string;
  attribution: {
    osmText: string;
    osmUrl: string;
    geoapifyText: string;
    geoapifyUrl: string;
  };
}

const CATEGORIES = [
  { id: 'food', label: 'Food & Drinks', icon: TbCoffee, desc: 'Cafes, quick eats, restaurants' },
  { id: 'rest', label: 'Rest & Greenery', icon: TbTree, desc: 'Quiet spots, parks, gardens' },
  { id: 'shopping', label: 'Shopping & Essentials', icon: TbShoppingBag, desc: 'Malls, markets, bookshops' },
  { id: 'sightseeing', label: 'Sights & Culture', icon: TbBuildingCastle, desc: 'Attractions, galleries, museums' },
] as const;

const FREE_TIME_PRESETS = [60, 90, 120, 180, 240];
const DWELL_OPTIONS = [15, 20, 30, 45];
const BUFFER_OPTIONS = [15, 20, 30, 45, 60];

export default function FreeTimeFinderPage() {
  const { showToast } = useToast();

  // Hub Search State
  const [hubQuery, setHubQuery] = useState('');
  const [hubSearching, setHubSearching] = useState(false);
  const [hubCandidates, setHubCandidates] = useState<HubCandidate[]>([]);
  const [selectedHub, setSelectedHub] = useState<HubCandidate | null>(null);

  // Parameter State
  const [freeTimeMinutes, setFreeTimeMinutes] = useState(120);
  const [category, setCategory] = useState<'food' | 'rest' | 'shopping' | 'sightseeing'>('food');
  const [dwellMinutes, setDwellMinutes] = useState(30);
  const [bufferMinutes, setBufferMinutes] = useState(30);

  // Search Results State
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const [searchResult, setSearchResult] = useState<FreeTimeSearchResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Hub Autocomplete Search
  const handleHubSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!hubQuery.trim() || hubQuery.trim().length < 3) {
      showToast('Please enter at least 3 characters to search for a hub', 'info');
      return;
    }

    setHubSearching(true);
    setSearchError(null);
    try {
      const candidates = await api.get(
        `/freetime/autocomplete?text=${encodeURIComponent(hubQuery.trim())}`,
      );
      if (Array.isArray(candidates) && candidates.length > 0) {
        setHubCandidates(candidates);
      } else {
        setHubCandidates([]);
        showToast('No matching hubs found. Try searching by city or airport code.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to search hubs', 'error');
      setHubCandidates([]);
    } finally {
      setHubSearching(false);
    }
  };

  // Execute Search for Nearby Places
  const handleFindPlaces = async () => {
    if (!selectedHub) {
      showToast('Please select a starting airport or station first', 'info');
      return;
    }

    setSearchingPlaces(true);
    setSearchError(null);
    try {
      const result: FreeTimeSearchResult = await api.post('/freetime/search', {
        lat: selectedHub.lat,
        lon: selectedHub.lon,
        hubName: selectedHub.name,
        freeTimeMinutes,
        category,
        dwellMinutes,
        bufferMinutes,
      });

      setSearchResult(result);
    } catch (err: any) {
      setSearchError(err.message || 'Failed to fetch nearby places');
      showToast(err.message || 'Search failed', 'error');
    } finally {
      setSearchingPlaces(false);
    }
  };

  const fittingPlacesCount =
    searchResult?.places.filter((p) => p.fitStatus === 'FITS').length ?? 0;
  const nonFittingPlacesCount =
    (searchResult?.places.length ?? 0) - fittingPlacesCount;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 pt-6 sm:pt-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Breadcrumbs />

        {/* Page Header */}
        <div className="mt-6 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent/15 text-accent border border-accent/30 mb-3">
            <TbClock className="w-4 h-4" />
            <span>Layover & Station Gap Planner</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Nearby Free-Time Finder
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted max-w-2xl leading-relaxed">
            Have a 2–4 hour gap at an airport or railway station? Discover real spots
            nearby with practical walking estimates and a transparent time-budget breakdown.
          </p>
        </div>

        {/* Main Configuration Card */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm mb-10">
          <div className="space-y-8">
            {/* Step 1: Hub Search & Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  Starting Hub (Airport or Railway Station)
                </label>
                {selectedHub && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedHub(null);
                      setSearchResult(null);
                    }}
                    className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    <TbRefresh className="w-3.5 h-3.5" /> Change Hub
                  </button>
                )}
              </div>

              {!selectedHub ? (
                <div>
                  <form onSubmit={handleHubSearch} className="flex gap-2">
                    <div className="relative flex-1">
                      <TbMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        type="text"
                        placeholder="e.g. Heathrow Airport, Tokyo Station, JFK, Chhatrapati Shivaji..."
                        value={hubQuery}
                        onChange={(e) => setHubQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={hubSearching}
                      className="px-5 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 shrink-0"
                    >
                      <TbSearch className="w-4 h-4" />
                      <span>{hubSearching ? 'Searching...' : 'Search'}</span>
                    </button>
                  </form>

                  {/* Candidates Dropdown */}
                  {hubCandidates.length > 0 && (
                    <div className="mt-3 p-2 rounded-2xl border border-border bg-surface shadow-md space-y-1">
                      <div className="px-3 py-1.5 text-xs font-semibold text-muted">
                        Select your exact starting hub from the candidates:
                      </div>
                      {hubCandidates.map((candidate, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedHub(candidate);
                            setHubCandidates([]);
                          }}
                          className="w-full text-left p-3 rounded-xl hover:bg-surface-hover transition-colors flex items-start gap-3 border border-transparent hover:border-border"
                        >
                          <TbMapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-sm text-foreground">
                              {candidate.name}
                            </div>
                            <div className="text-xs text-muted leading-tight mt-0.5">
                              {candidate.formatted}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <TbMapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm sm:text-base text-foreground">
                        {selectedHub.name}
                      </div>
                      <div className="text-xs text-muted">
                        {selectedHub.formatted}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium shrink-0">
                    Selected Hub
                  </span>
                </div>
              )}
            </div>

            {/* Step 2: Available Free Time */}
            <div>
              <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Total Free Time Available (Gap Before Next Departure)
              </label>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                {FREE_TIME_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFreeTimeMinutes(preset)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors border ${
                      freeTimeMinutes === preset
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface hover:bg-surface-hover text-foreground border-border'
                    }`}
                  >
                    {preset / 60 >= 1 && preset % 60 === 0
                      ? `${preset / 60}h`
                      : `${preset} min`}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="30"
                  max="480"
                  step="15"
                  value={freeTimeMinutes}
                  onChange={(e) => setFreeTimeMinutes(Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="text-sm font-semibold text-foreground shrink-0 w-20 text-right">
                  {freeTimeMinutes} min ({Math.floor(freeTimeMinutes / 60)}h{' '}
                  {freeTimeMinutes % 60 > 0 ? `${freeTimeMinutes % 60}m` : ''})
                </span>
              </div>
            </div>

            {/* Step 3: Category Selection */}
            <div>
              <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                  3
                </span>
                What are you looking for?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-4 rounded-2xl text-left border transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border bg-surface hover:bg-surface-hover'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon
                          className={`w-5 h-5 ${
                            isSelected ? 'text-primary' : 'text-muted'
                          }`}
                        />
                        {isSelected && (
                          <TbCheck className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="font-semibold text-sm text-foreground">
                        {cat.label}
                      </div>
                      <div className="text-xs text-muted mt-1 leading-snug">
                        {cat.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Dwell Time & Return Buffer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-border">
              {/* Dwell Time */}
              <div>
                <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                  <TbClock className="w-4 h-4 text-primary" />
                  Time spent at the place (Dwell)
                </label>
                <p className="text-xs text-muted mb-3">
                  How long you plan to eat, shop, or relax at the venue.
                </p>
                <div className="flex flex-wrap gap-2">
                  {DWELL_OPTIONS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDwellMinutes(val)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                        dwellMinutes === val
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface hover:bg-surface-hover text-foreground border-border'
                      }`}
                    >
                      {val} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Buffer Allowance */}
              <div>
                <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                  <TbShieldCheck className="w-4 h-4 text-accent" />
                  Departure / Gate Buffer Allowance
                </label>
                <p className="text-xs text-muted mb-3">
                  Safety margin before boarding. Buffers are planning allowances, not guarantees.
                </p>
                <div className="flex flex-wrap gap-2">
                  {BUFFER_OPTIONS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setBufferMinutes(val)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                        bufferMinutes === val
                          ? 'bg-accent text-slate-900 border-accent font-semibold'
                          : 'bg-surface hover:bg-surface-hover text-foreground border-border'
                      }`}
                    >
                      {val} min
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 5: Submit Action */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-muted leading-relaxed">
                <span className="font-semibold text-foreground">Formula:</span>{' '}
                Outbound Walk (est.) + Dwell ({dwellMinutes}m) + Return Walk (est.) + Buffer ({bufferMinutes}m) ≤ Available Gap ({freeTimeMinutes}m)
              </div>

              <button
                type="button"
                onClick={handleFindPlaces}
                disabled={!selectedHub || searchingPlaces}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {searchingPlaces ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Calculating Routes...</span>
                  </>
                ) : (
                  <>
                    <span>Find Nearby Places</span>
                    <TbArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {searchError && (
          <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300 mb-8 flex items-start gap-3">
            <TbAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-semibold">Search Notice:</span> {searchError}
            </div>
          </div>
        )}

        {/* Results Section */}
        {searchResult && (
          <div className="space-y-6">
            {/* Results Summary Bar */}
            <div className="p-5 rounded-2xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs text-muted uppercase font-semibold tracking-wider">
                  Nearby Spots near {searchResult.hub.name}
                </div>
                <div className="text-lg font-bold text-foreground mt-0.5">
                  {fittingPlacesCount} places fit your {searchResult.freeTimeMinutes} min window
                  {nonFittingPlacesCount > 0 && (
                    <span className="text-xs font-normal text-muted ml-2">
                      ({nonFittingPlacesCount} exceed time limit)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20">
                  <TbCheck className="w-3.5 h-3.5" /> Fits Window
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 font-medium border border-rose-500/20">
                  Exceeds Window
                </span>
              </div>
            </div>

            {/* Places Grid */}
            {searchResult.places.length === 0 ? (
              <div className="text-center py-16 rounded-3xl border border-border bg-card">
                <TbInfoCircle className="w-10 h-10 text-muted mx-auto mb-3" />
                <h3 className="font-semibold text-base text-foreground">
                  No places found within walking distance
                </h3>
                <p className="text-xs text-muted max-w-md mx-auto mt-1">
                  Try switching categories (e.g. from rest to food) or choosing another nearby hub candidate.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {searchResult.places.map((place) => (
                  <FreetimeCard key={place.id} place={place} />
                ))}
              </div>
            )}

            {/* Travel-Time Disclaimer & Mandatory Attribution */}
            <FreetimeDisclaimer
              disclaimer={searchResult.disclaimer}
              providerCostFormula={searchResult.providerCostFormula}
              attribution={searchResult.attribution}
            />
          </div>
        )}
      </div>
    </div>
  );
}
