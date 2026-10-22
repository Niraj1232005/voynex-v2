'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TbMapPin, TbStarFilled, TbClock, TbUsers, TbCheck, TbX, TbMinus, TbPlus, TbThumbUp, TbThumbDown, TbMoodNeutral, TbShieldCheck, TbAlertTriangle } from 'react-icons/tb';
import Breadcrumbs from '@/components/Breadcrumbs';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { getDestinationImage } from '@/lib/destinationImages';

function mapBackendTripToFrontend(bTrip: any): any {
  let images: string[] = [];
  if (Array.isArray(bTrip.images)) {
    images = bTrip.images.filter((img: any) => typeof img === 'string' && img.trim().length > 0);
  } else if (typeof bTrip.images === 'string' && bTrip.images.trim().length > 0) {
    try {
      const parsed = JSON.parse(bTrip.images);
      if (Array.isArray(parsed)) {
        images = parsed.filter((img: any) => typeof img === 'string' && img.trim().length > 0);
      } else if (typeof parsed === 'string' && parsed.trim().length > 0) {
        images = [parsed.trim()];
      }
    } catch {
      images = bTrip.images.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  }

  if (images.length === 0 && (bTrip.image || bTrip.coverImage)) {
    const single = bTrip.image || bTrip.coverImage;
    if (typeof single === 'string' && single.trim()) {
      images = [single.trim()];
    }
  }

  if (images.length === 0) {
    const fallback = getDestinationImage(bTrip.destination);
    if (fallback) images = [fallback];
  }

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
    images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80'],
    activityType: bTrip.activityType || ['adventure'],
    highlights: bTrip.highlights || ['Sightseeing', 'Exploration'],
    itinerary: bTrip.itinerary || [],
    included: bTrip.included || ['Accommodation', 'Guide'],
    excluded: bTrip.excluded || ['Personal expenses'],
    startDates: bTrip.startDates || [],
    agency: { _id: bTrip.organizationId, name: bTrip.organization?.name || 'Travel Agency' },
  };
}


// Simple keyword-based sentiment analysis
function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const lower = text.toLowerCase();
  const positiveWords = ['amazing', 'wonderful', 'magical', 'breathtaking', 'incredible', 'perfect', 'beautiful', 'loved', 'great', 'best', 'fantastic', 'unforgettable', 'excellent', 'highly', 'recommend', 'bliss', 'surreal', 'worth', 'paradise', 'pristine'];
  const negativeWords = ['terrible', 'horrible', 'worst', 'awful', 'bad', 'poor', 'disappointing', 'not good', 'overpriced', 'dirty', 'rude', 'scam', 'avoid'];

  const posCount = positiveWords.filter(w => lower.includes(w)).length;
  const negCount = negativeWords.filter(w => lower.includes(w)).length;

  if (posCount > negCount) return 'positive';
  if (negCount > posCount) return 'negative';
  return 'neutral';
}

function SentimentBadge({ sentiment }: { sentiment: 'positive' | 'neutral' | 'negative' }) {
  const config = {
    positive: { icon: TbThumbUp, label: 'Positive', className: 'bg-green-500/10 text-green-500 border border-green-500/20' },
    neutral: { icon: TbMoodNeutral, label: 'Neutral', className: 'bg-surface-hover text-muted border border-border' },
    negative: { icon: TbThumbDown, label: 'Negative', className: 'bg-red-500/10 text-red-500 border border-red-500/20' },
  };
  const { icon: Icon, label, className } = config[sentiment];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${className}`}>
      <Icon size={12} /> {label}
    </span>
  );
}

export default function TripDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  
  const [trip, setTrip] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [seniors, setSeniors] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'included' | 'reviews'>('overview');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.get(`/trips/${id}`),
      api.get(`/reviews/trip/${id}`).catch(() => ({ reviews: [] })),
    ])
      .then(([tripRes, reviewsRes]) => {
        if (tripRes) {
          setTrip(mapBackendTripToFrontend(tripRes));
        }
        if (reviewsRes && Array.isArray(reviewsRes.reviews)) {
          setReviews(reviewsRes.reviews);
        } else if (Array.isArray(reviewsRes)) {
          setReviews(reviewsRes);
        }
      })
      .catch(err => {
        console.error('Error fetching trip details:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );

  if (!trip) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <p className="text-5xl mb-4">🗺️</p>
      <p className="text-xl font-semibold">Trip not found</p>
      <p className="text-muted mt-2 mb-6">This trip may have been removed or doesn&apos;t exist.</p>
      <button onClick={() => router.push('/trips')} className="px-6 py-3 rounded-xl bg-accent text-white font-medium tap-target">
        Browse Trips
      </button>
    </div>
  );

  const totalGuests = adults + children + seniors;
  const totalPrice = trip.price * totalGuests;

  const handleBookNow = () => {
    // Phase 3 Auth Logic: If not authenticated, the actual modal will be triggered.
    // For now, if no auth context supports modal, we'll route to /checkout directly and handle auth there, 
    // or just assume we'll build the AuthModal at root level. The prompt says:
    // "If not logged in: show a modal (not a redirect)"
    // We will dispatch a custom event to open the auth modal if needed.
    if (!isAuthenticated) { 
      const event = new CustomEvent('openAuthModal', { detail: { redirect: `/checkout?tripId=${trip._id}&date=${selectedDate || trip.startDates[0]}&adults=${adults}&children=${children}&seniors=${seniors}` } });
      window.dispatchEvent(event);
      return; 
    }
    const params = new URLSearchParams({
      tripId: trip._id, date: selectedDate || trip.startDates[0],
      adults: adults.toString(), children: children.toString(), seniors: seniors.toString(),
    });
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className="min-h-screen pb-24 sm:pb-16 relative">
      <Breadcrumbs tripTitle={trip.title} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Title Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm mb-3 opacity-90 text-accent font-semibold tracking-wider uppercase">
            <TbMapPin size={16} /> {trip.destination}
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">{trip.title}</h1>
          <div className="flex flex-wrap gap-3 sm:gap-6 text-sm font-medium text-muted">
            <span className="flex items-center gap-1.5"><TbStarFilled size={18} className="text-yellow-500" /> <span className="text-foreground font-bold">{trip.rating}</span> ({trip.reviewCount} reviews)</span>
            <span className="flex items-center gap-1.5"><TbClock size={18} /> {trip.duration} Days</span>
            <span className="flex items-center gap-1.5"><TbUsers size={18} /> Max {trip.maxGroupSize} people</span>
            <span className="capitalize px-3 py-1 rounded-lg bg-surface-hover border border-border text-xs font-bold">{trip.difficulty}</span>
          </div>
        </div>

        {/* Gallery */}
        {trip.images && trip.images.length === 1 ? (
          <div className="relative rounded-2xl overflow-hidden mb-10 h-[40vh] sm:h-[50vh] bg-surface">
            <img
              src={trip.images[0]}
              alt={trip.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getDestinationImage(trip.destination);
              }}
            />
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          </div>
        ) : trip.images && trip.images.length === 2 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 h-[40vh] sm:h-[50vh]">
            <div className="relative rounded-2xl overflow-hidden bg-surface">
              <img
                src={trip.images[0]}
                alt={trip.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getDestinationImage(trip.destination);
                }}
              />
              <div className="absolute inset-0 bg-black/10 pointer-events-none" />
            </div>
            <div className="relative rounded-2xl overflow-hidden bg-surface">
              <img
                src={trip.images[1]}
                alt={`${trip.title} 2`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getDestinationImage(trip.destination);
                }}
              />
              <div className="absolute inset-0 bg-black/10 pointer-events-none" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 h-[40vh] sm:h-[50vh]">
            <div className="md:col-span-2 relative rounded-2xl overflow-hidden bg-surface">
              <img
                src={trip.images?.[0] || getDestinationImage(trip.destination)}
                alt={trip.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getDestinationImage(trip.destination);
                }}
              />
              <div className="absolute inset-0 bg-black/10 pointer-events-none" />
            </div>
            <div className="hidden md:flex flex-col gap-4">
              <div className="flex-1 relative rounded-2xl overflow-hidden bg-surface">
                <img
                  src={trip.images?.[1] || getDestinationImage(trip.destination)}
                  alt={`${trip.title} 2`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getDestinationImage(trip.destination);
                  }}
                />
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />
              </div>
              <div className="flex-1 relative rounded-2xl overflow-hidden bg-surface">
                <img
                  src={trip.images?.[2] || getDestinationImage(trip.destination)}
                  alt={`${trip.title} 3`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getDestinationImage(trip.destination);
                  }}
                />
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2">
            
            {/* Tabs */}
            <div className="sticky top-16 z-20 bg-background/90 backdrop-blur-xl pt-4 pb-2 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex overflow-x-auto border-b border-border scrollbar-none gap-2">
                {(['overview', 'itinerary', 'included', 'reviews'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-sm font-bold capitalize transition-all border-b-2 tap-target whitespace-nowrap ${
                      activeTab === tab ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-foreground'}`}>
                    {tab === 'included' ? 'Inclusions' : tab}
                    {tab === 'reviews' && reviews.length > 0 && (
                      <span className="ml-1.5 text-xs text-muted">({reviews.length})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-8 min-h-[50vh]">
              {activeTab === 'overview' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  {/* Description */}
                  <div>
                    <h2 className="text-2xl font-bold mb-4">About This Trip</h2>
                    <p className="text-muted leading-relaxed text-lg">{trip.description}</p>
                    <div className="flex flex-wrap gap-2 mt-6">
                      {trip.highlights.map((h: string) => (
                        <span key={h} className="px-3 py-1.5 rounded-lg bg-surface-hover border border-border text-sm font-semibold">{h}</span>
                      ))}
                    </div>
                  </div>

                  {/* AI Safety Alerts */}
                  <div className="p-6 rounded-2xl border border-blue-500/30 bg-blue-500/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-blue-500/20 text-blue-500">
                        <TbShieldCheck size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-blue-500 mb-1">AI Safety & Travel Advisory</h3>
                        <p className="text-sm font-medium mb-4">Destination Status: <span className="text-green-500">Safe to Travel</span></p>
                        
                        <ul className="space-y-2 mb-4">
                          <li className="flex items-center gap-2 text-sm"><TbCheck className="text-green-500" /> Visa required for entry</li>
                          <li className="flex items-center gap-2 text-sm"><TbCheck className="text-green-500" /> No special vaccines required</li>
                          <li className="flex items-center gap-2 text-sm"><TbAlertTriangle className="text-yellow-500" /> Light rain expected during December</li>
                        </ul>
                        
                        <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
                          <span className="text-sm font-bold flex items-center gap-2"><TbShieldCheck className="text-accent" /> Real-time safety notifications</span>
                          <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded font-bold uppercase">Gold Member Feature</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mock Map */}
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Location</h2>
                    <div className="h-[300px] rounded-2xl border border-border bg-surface flex flex-col items-center justify-center">
                      <TbMapPin size={48} className="text-muted/50 mb-2" />
                      <p className="text-muted font-medium">Map view of {trip.destination}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'itinerary' && (
                <div className="space-y-4">
                  {trip.itinerary.map((day: any) => (
                    <motion.div key={day.day} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: day.day * 0.05 }}
                      className="flex gap-4 group cursor-default">
                      <div className="flex flex-col items-center">
                        <div className="h-12 w-12 rounded-xl bg-surface-hover border border-border group-hover:border-accent group-hover:bg-accent/10 transition-colors flex flex-col items-center justify-center text-accent">
                          <span className="text-[10px] font-bold uppercase tracking-wider leading-none">Day</span>
                          <span className="text-lg font-bold leading-none mt-0.5">{day.day}</span>
                        </div>
                        {day.day < trip.itinerary.length && <div className="w-px flex-1 bg-border my-2" />}
                      </div>
                      <div className="flex-1 pb-8 pt-1">
                        <h4 className="font-bold text-lg">{day.title}</h4>
                        <p className="text-muted mt-2 leading-relaxed">{day.description}</p>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {day.activities.map((a: string) => (
                            <span key={a} className="px-3 py-1 rounded-lg bg-surface-hover border border-border text-xs font-semibold text-muted">{a}</span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === 'included' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="p-6 rounded-2xl border border-green-500/20 bg-green-500/5">
                    <h4 className="font-bold text-green-500 text-lg mb-4 flex items-center gap-2"><TbCheck size={24} /> What&apos;s Included</h4>
                    <ul className="space-y-3">
                      {trip.included.map((i: string) => <li key={i} className="flex items-start gap-2 text-sm font-medium"><TbCheck size={18} className="text-green-500 mt-0.5 flex-shrink-0" /> {i}</li>)}
                    </ul>
                  </div>
                  <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
                    <h4 className="font-bold text-red-500 text-lg mb-4 flex items-center gap-2"><TbX size={24} /> What&apos;s Excluded</h4>
                    <ul className="space-y-3">
                      {trip.excluded.map((i: string) => <li key={i} className="flex items-start gap-2 text-sm font-medium"><TbX size={18} className="text-red-500 mt-0.5 flex-shrink-0" /> {i}</li>)}
                    </ul>
                  </div>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {reviews.length > 0 ? reviews.map((r: any) => {
                    const sentiment = analyzeSentiment(r.comment);
                    return (
                      <motion.div key={r._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl border border-border bg-card">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-teal flex items-center justify-center text-white text-lg font-bold shadow-md">
                            {r.user.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-base">{r.user.name}</p>
                              <SentimentBadge sentiment={sentiment} />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted mt-1">
                              <div className="flex items-center">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <TbStarFilled key={i} size={14} className={i < r.rating ? 'text-yellow-500' : 'text-muted/30'} />
                                ))}
                              </div>
                              <span>•</span>
                              <span>{new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-muted leading-relaxed">{r.comment}</p>
                      </motion.div>
                    );
                  }) : (
                    <div className="text-center py-16 rounded-2xl border border-border border-dashed">
                      <p className="text-5xl mb-4">✍️</p>
                      <p className="text-lg font-bold mb-1">No reviews yet</p>
                      <p className="text-muted">Be the first to review this trip after your journey!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Booking Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="sticky top-24 rounded-3xl border border-border bg-card p-6 shadow-2xl shadow-black/10">
              <div className="mb-6 pb-6 border-b border-border">
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-4xl font-bold text-accent">₹{trip.price.toLocaleString()}</span>
                  <span className="text-muted font-medium mb-1"> / person</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 text-xs font-bold uppercase tracking-wider">
                  <TbStarFilled size={10} /> ₹{(trip.price * 0.9).toLocaleString()} for Gold Members
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <label className="text-sm font-bold mb-2 block">Select Date</label>
                <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent tap-target">
                  <option value="">Choose a starting date</option>
                  {trip.startDates.map((d: string) => <option key={d} value={d}>{new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</option>)}
                </select>
              </div>

              {/* Group Composition */}
              <div className="space-y-3 mb-6">
                <label className="text-sm font-bold mb-2 block">Travelers</label>
                {[
                  { label: 'Adults', value: adults, set: setAdults, min: 1 },
                  { label: 'Children', value: children, set: setChildren, min: 0 },
                  { label: 'Seniors', value: seniors, set: setSeniors, min: 0 },
                ].map((g: any) => (
                  <div key={g.label} className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface-hover">
                    <span className="text-sm font-medium">{g.label}</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => g.set(Math.max(g.min, g.value - 1))} className="h-8 w-8 rounded-lg bg-surface border border-border flex items-center justify-center hover:border-accent hover:text-accent transition-all tap-target"><TbMinus size={16} /></button>
                      <span className="w-6 text-center font-bold">{g.value}</span>
                      <button onClick={() => g.set(g.value + 1)} className="h-8 w-8 rounded-lg bg-surface border border-border flex items-center justify-center hover:border-accent hover:text-accent transition-all tap-target"><TbPlus size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Summary */}
              <div className="border-t border-border pt-6 mb-6 space-y-3">
                <div className="flex justify-between text-muted font-medium"><span>₹{trip.price.toLocaleString()} × {totalGuests} guests</span><span>₹{totalPrice.toLocaleString()}</span></div>
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-accent">₹{totalPrice.toLocaleString()}</span></div>
              </div>

              {((user as any)?.organizationId || (user as any)?.organization_id) && (trip?.organizationId === ((user as any)?.organizationId || (user as any)?.organization_id) || trip?.organization_id === ((user as any)?.organizationId || (user as any)?.organization_id)) ? (
                <div className="w-full py-3.5 px-4 rounded-xl bg-surface-hover border border-border text-center text-muted font-bold text-sm">
                  This is your own listing
                </div>
              ) : (
                <button onClick={handleBookNow}
                  className="w-full py-4 rounded-xl bg-accent text-white font-bold text-lg hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 transition-all tap-target">
                  Book Now
                </button>
              )}
              <p className="text-xs font-medium text-muted text-center mt-4 flex items-center justify-center gap-1">
                <TbCheck className="text-green-500" size={14} /> Free cancellation up to 48 hours before
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Booking Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-t border-border p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          <div>
            <div className="text-sm text-muted font-medium">Total price</div>
            <div className="font-bold text-xl text-accent">₹{totalPrice.toLocaleString()}</div>
          </div>
          {((user as any)?.organizationId || (user as any)?.organization_id) && (trip?.organizationId === ((user as any)?.organizationId || (user as any)?.organization_id) || trip?.organization_id === ((user as any)?.organizationId || (user as any)?.organization_id)) ? (
            <div className="flex-1 max-w-[200px] py-3 rounded-xl bg-surface-hover border border-border text-center text-xs font-bold text-muted">
              Your Listing
            </div>
          ) : (
            <button onClick={handleBookNow} className="flex-1 max-w-[200px] py-3.5 rounded-xl bg-accent text-white font-bold text-center tap-target">
              Book Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
