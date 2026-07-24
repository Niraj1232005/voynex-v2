'use client';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  TbArrowRight, TbMapPin, TbStarFilled, TbUsers, TbShieldCheck, TbCpu, TbCompass,
  TbShoppingBag, TbPackage, TbSearch, TbTrendingUp, TbGlobe, TbClock, TbCurrencyRupee
} from 'react-icons/tb';
import { api } from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

// Animated count-up component
function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <div ref={ref} className="text-4xl sm:text-5xl font-bold gradient-text tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);

  useEffect(() => {
    api.get('/trips')
      .then(res => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setTrips(list);
      })
      .catch(err => console.error('Error fetching trips for homepage:', err));

    try {
      const stored = localStorage.getItem('voynex_recent_searches');
      if (stored) setRecentSearches(JSON.parse(stored));
      
      const viewed = localStorage.getItem('voynex_recently_viewed');
      if (viewed) setRecentlyViewed(JSON.parse(viewed));
    } catch (e) {}
  }, []);

  // Global shortcut "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Save to recent searches
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('voynex_recent_searches', JSON.stringify(updated));
    
    router.push(`/trips?q=${encodeURIComponent(searchQuery)}`);
  };

  // Compute search dropdown results
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const matchedTrips = trips.filter(t => (t.title || '').toLowerCase().includes(q) || (t.destination || '').toLowerCase().includes(q)).slice(0, 3);
    
    // Extract unique destinations that match
    const destinations = Array.from(new Set(trips.map(t => (t.destination || '').split(',')[0].trim())))
      .filter(d => d.toLowerCase().includes(q))
      .slice(0, 3);

    return { trips: matchedTrips, destinations };
  }, [searchQuery, trips]);

  const featuredTrips = trips.slice(0, 4);

  const stats = [
    { value: 500, suffix: '+', label: 'Trips', icon: TbCompass, color: 'bg-blue-500/10 text-blue-500' },
    { value: 50000, suffix: '+', label: 'Travelers', icon: TbUsers, color: 'bg-accent/10 text-accent' },
    { value: 4.8, suffix: '', label: 'Rating', icon: TbStarFilled, color: 'bg-yellow-500/10 text-yellow-500' },
    { value: 200, suffix: '+', label: 'Destinations', icon: TbGlobe, color: 'bg-orange/10 text-orange' },
  ];

  const features = [
    { icon: TbCpu, title: 'AI Trip Planner', desc: 'Personalized itineraries in seconds.', color: 'from-blue-500 to-indigo-600', href: '/ai-planner' },
    { icon: TbPackage, title: 'Smart Packing', desc: 'AI checklists for your specific trip.', color: 'from-teal-500 to-emerald-600', href: '/packing' },
    { icon: TbTrendingUp, title: 'AI Budget Planner', desc: 'Optimize your travel expenses.', color: 'from-orange-500 to-amber-600', href: '/budget' },
    { icon: TbShieldCheck, title: 'Safety Alerts', desc: 'Real-time updates and requirements.', color: 'from-purple-500 to-violet-600', href: '/trips' },
  ];

  return (
    <div className="overflow-hidden">
      {/* ─── Hero Section ─────────────────────────── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-10 pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/8 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-accent/8 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center w-full z-10">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Your next adventure <span className="gradient-text">starts here</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              Plan smarter with AI — trips, packing, budget, all in one place.
            </motion.p>

            {/* Main Search Bar */}
            <motion.div variants={fadeUp} className="max-w-2xl mx-auto relative mb-12">
              <form onSubmit={handleSearchSubmit} className="relative z-20">
                <div className={`relative flex items-center bg-card border-2 rounded-full shadow-lg transition-all ${
                  isSearchFocused ? 'border-accent shadow-accent/20' : 'border-border'
                }`}>
                  <TbSearch size={24} className="absolute left-6 text-muted" />
                  <input
                    id="global-search"
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    placeholder="Where do you want to go?"
                    className="w-full pl-14 pr-32 py-5 bg-transparent text-lg font-medium focus:outline-none rounded-full"
                    autoComplete="off"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-border bg-surface px-2 font-mono text-[10px] font-medium text-muted">
                      <span className="text-xs">/</span>
                    </kbd>
                    <button type="submit" className="px-6 py-2.5 rounded-full bg-accent text-white font-bold hover:shadow-lg hover:shadow-accent/30 transition-all">
                      Search
                    </button>
                  </div>
                </div>
              </form>

              {/* Search Dropdown */}
              <AnimatePresence>
                {isSearchFocused && (searchQuery.trim() || recentSearches.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-10 text-left"
                  >
                    {!searchQuery.trim() && recentSearches.length > 0 && (
                      <div className="p-4">
                        <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Recent Searches</h4>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map(s => (
                            <button key={s} onMouseDown={() => { setSearchQuery(s); router.push(`/trips?q=${encodeURIComponent(s)}`); }}
                              className="px-3 py-1.5 rounded-lg bg-surface-hover text-sm font-medium hover:text-accent transition-colors">
                              <TbSearch size={14} className="inline mr-1 opacity-50" /> {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchResults && (
                      <div className="p-2">
                        {searchResults.destinations.length > 0 && (
                          <div className="p-2">
                            <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2 px-2">Destinations</h4>
                            {searchResults.destinations.map(d => (
                              <Link key={d} href={`/trips?q=${encodeURIComponent(d)}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-hover transition-colors">
                                <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent"><TbMapPin size={16} /></div>
                                <span className="font-medium">{d}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                        {searchResults.trips.length > 0 && (
                          <div className="p-2 border-t border-border/50 mt-1 pt-3">
                            <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2 px-2">Trips</h4>
                            {searchResults.trips.map(t => (
                              <Link key={t._id} href={`/trips/${t._id}`} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-hover transition-colors">
                                <div className="h-10 w-10 rounded-lg bg-surface flex items-center justify-center text-muted"><TbCompass size={18} /></div>
                                <div>
                                  <p className="font-bold text-sm text-foreground">{t.title}</p>
                                  <p className="text-xs text-muted">{t.destination} • ₹{t.price.toLocaleString()}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                        {searchResults.destinations.length === 0 && searchResults.trips.length === 0 && (
                          <div className="p-8 text-center">
                            <p className="text-muted font-medium mb-3">No results found for &quot;{searchQuery}&quot;</p>
                            <Link href="/chat" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 text-accent font-semibold hover:bg-accent hover:text-white transition-colors">
                              Try the AI chatbot
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Intent Split */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <Link href="/trips" className="group flex items-center p-4 rounded-2xl border border-border bg-card hover:border-accent hover:shadow-lg hover:shadow-accent/10 transition-all text-left tap-target">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mr-4 group-hover:scale-110 transition-transform">
                  <TbCompass size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg group-hover:text-accent transition-colors">I know where to go</h3>
                  <p className="text-sm text-muted">Browse all destinations and trips</p>
                </div>
                <TbArrowRight size={20} className="text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </Link>
              
              <Link href="/chat" className="group flex items-center p-4 rounded-2xl border border-border bg-card hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all text-left tap-target">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mr-4 group-hover:scale-110 transition-transform">
                  <TbCpu size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">Help me decide</h3>
                  <p className="text-sm text-muted">Plan your trip with our AI expert</p>
                </div>
                <TbArrowRight size={20} className="text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* ─── Stats Bar (Animated Count-Up) ────────── */}
      <section className="py-16 bg-surface border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className={`inline-flex p-4 rounded-2xl ${s.color} mb-4`}>
                  <s.icon size={28} />
                </div>
                {s.value === 4.8 ? (
                  <div className="text-4xl sm:text-5xl font-bold gradient-text tabular-nums">4.8</div>
                ) : (
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                )}
                <div className="text-sm text-muted mt-2 font-bold uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Recently Viewed (If exists) ───────────── */}
      {recentlyViewed.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
              <motion.div variants={fadeUp} className="mb-8">
                <h2 className="text-2xl font-bold">Continue planning</h2>
              </motion.div>

              <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-none">
                {recentlyViewed.slice(0, 3).map((trip, idx) => (
                  <motion.div key={trip._id || idx} variants={fadeUp} className="flex-shrink-0 w-72">
                    <div className="group flex items-center p-3 rounded-2xl border border-border bg-card hover:shadow-card-hover transition-all">
                      <div className="h-16 w-16 rounded-xl bg-surface mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-bold text-sm truncate group-hover:text-accent transition-colors">{trip.title}</h4>
                        <p className="text-xs text-muted mb-2 truncate">{trip.destination}</p>
                        <Link href={`/trips/${trip._id}`} className="text-xs font-bold text-accent hover:underline">Resume</Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ─── Featured Trips ──────────────────────── */}
      <section className={`py-24 ${recentlyViewed.length > 0 ? 'bg-surface border-y border-border' : ''}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={fadeUp} className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold">Featured Trips</h2>
                <p className="text-muted mt-2">Handpicked experiences loved by thousands.</p>
              </div>
              <Link href="/trips" className="hidden sm:flex items-center gap-1 text-sm font-bold text-accent hover:underline">
                View all <TbArrowRight size={16} />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredTrips.map((trip, idx) => (
                <motion.div key={trip._id} variants={fadeUp}>
                  <Link href={`/trips/${trip._id}`} className="group flex flex-col h-full rounded-2xl border border-border bg-card overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                    <div className="relative aspect-video overflow-hidden img-dark-overlay">
                      <div className={`absolute inset-0 bg-gradient-to-br ${
                        ['from-blue-400 to-purple-600', 'from-orange-400 to-pink-500', 'from-teal-400 to-emerald-600', 'from-rose-400 to-red-500'][idx % 4]
                      }`} />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500" />
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="font-bold text-xl mb-4 group-hover:text-accent transition-colors line-clamp-1">{trip.title}</h3>
                      
                      <div className="flex items-center gap-3 mb-5 overflow-x-auto pb-2 scrollbar-none">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-hover border border-border text-xs font-bold whitespace-nowrap">
                          <TbStarFilled size={14} className="text-yellow-500" /> {trip.rating}
                        </span>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-hover border border-border text-xs font-bold whitespace-nowrap">
                          <TbClock size={14} className="text-muted" /> {trip.duration} Days
                        </span>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-hover border border-border text-xs font-bold whitespace-nowrap">
                          <TbCurrencyRupee size={14} className="text-muted" /> {trip.price.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                        {(trip.activityType || []).slice(0, 3).map((a: string) => (
                          <span key={a} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            a === 'adventure' ? 'bg-orange/10 text-orange' : 
                            a === 'beach' ? 'bg-blue-400/10 text-blue-400' : 
                            'bg-surface-hover text-muted'
                          }`}>
                            {a}
                          </span>
                        ))}
                      </div>

                      <div className="pt-5 border-t border-border flex items-center justify-between">
                        <span className="text-sm font-semibold text-muted capitalize">{trip.difficulty} Difficulty</span>
                        <span className="px-5 py-2.5 rounded-xl bg-surface-hover border border-border text-foreground text-sm font-semibold group-hover:bg-accent group-hover:border-accent group-hover:text-white transition-all flex items-center gap-2 tap-target">
                          View Details <TbArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 text-center sm:hidden">
              <Link href="/trips" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border font-bold hover:bg-surface-hover transition-colors">
                View all trips <TbArrowRight />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Features Grid ───────────────────────── */}
      <section className={`py-24 ${recentlyViewed.length === 0 ? 'bg-surface border-y border-border' : ''}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
            <motion.div variants={fadeUp} className="mb-12">
              <h2 className="text-3xl font-bold">Why VOYNEX</h2>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {features.map((f, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <Link href={f.href} className="group block p-5 sm:p-6 rounded-2xl border border-border bg-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 h-full tap-target">
                    <div className="text-accent mb-4 group-hover:scale-110 transition-transform duration-300 origin-left">
                      <f.icon size={28} strokeWidth={2} />
                    </div>
                    <h3 className="font-bold text-base sm:text-lg mb-2">{f.title}</h3>
                    <p className="text-xs sm:text-sm text-muted leading-relaxed">{f.desc}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
