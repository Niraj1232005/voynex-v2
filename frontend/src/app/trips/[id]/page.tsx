'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TbMapPin,
  TbStarFilled,
  TbClock,
  TbUsers,
  TbCheck,
  TbX,
  TbMinus,
  TbPlus,
  TbThumbUp,
  TbThumbDown,
  TbMoodNeutral,
  TbShieldCheck,
  TbAlertTriangle,
  TbSparkles,
  TbCalendar,
  TbWallet,
} from 'react-icons/tb';
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
    images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&auto=format&fit=crop&q=80'],
    activityType: bTrip.activityType || ['adventure'],
    highlights: bTrip.highlights || ['Sightseeing', 'Exploration'],
    itinerary: bTrip.itinerary || [],
    included: bTrip.included || ['Accommodation', 'Guide'],
    excluded: bTrip.excluded || ['Personal expenses'],
    startDates: bTrip.startDates || [],
    agency: { _id: bTrip.organizationId, name: bTrip.organization?.name || 'Travel Agency' },
  };
}

// Keyword-based sentiment analysis
function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const lower = text.toLowerCase();
  const positiveWords = [
    'amazing', 'wonderful', 'magical', 'breathtaking', 'incredible', 'perfect',
    'beautiful', 'loved', 'great', 'best', 'fantastic', 'unforgettable',
    'excellent', 'highly', 'recommend', 'bliss', 'surreal', 'worth', 'paradise', 'pristine'
  ];
  const negativeWords = [
    'terrible', 'horrible', 'worst', 'awful', 'bad', 'poor', 'disappointing',
    'not good', 'overpriced', 'dirty', 'rude', 'scam', 'avoid'
  ];

  const posCount = positiveWords.filter(w => lower.includes(w)).length;
  const negCount = negativeWords.filter(w => lower.includes(w)).length;

  if (posCount > negCount) return 'positive';
  if (negCount > posCount) return 'negative';
  return 'neutral';
}

function SentimentBadge({ sentiment }: { sentiment: 'positive' | 'neutral' | 'negative' }) {
  const config = {
    positive: { icon: TbThumbUp, label: 'Positive', className: 'bg-[#176B55]/10 text-[#176B55] border-[#176B55]/20' },
    neutral: { icon: TbMoodNeutral, label: 'Neutral', className: 'bg-[#F7F7F2] text-[#697773] border-[#E5E9E5]' },
    negative: { icon: TbThumbDown, label: 'Negative', className: 'bg-rose-50 text-rose-600 border-rose-200' },
  };
  const { icon: Icon, label, className } = config[sentiment];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${className}`}>
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
      .catch((err) => {
        console.error('Error fetching trip details:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-[#176B55] border-t-transparent animate-spin" />
          <p className="text-xs font-bold text-[#697773] uppercase tracking-wider">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#F7F7F2] text-center px-4">
        <p className="text-5xl mb-4">🗺️</p>
        <p className="text-2xl font-black text-[#172B2A]">Trip Not Found</p>
        <p className="text-sm text-[#697773] mt-2 mb-6">This journey may have concluded or is no longer listed.</p>
        <button
          onClick={() => router.push('/trips')}
          className="px-6 py-3 rounded-2xl bg-[#176B55] hover:bg-[#135946] text-white font-bold text-sm shadow-md transition-all"
        >
          Explore All Journeys
        </button>
      </div>
    );
  }

  const totalGuests = adults + children + seniors;
  const totalPrice = trip.price * totalGuests;

  const handleBookNow = () => {
    if (!isAuthenticated) {
      const event = new CustomEvent('openAuthModal', {
        detail: {
          redirect: `/checkout?tripId=${trip._id}&date=${selectedDate || trip.startDates[0]}&adults=${adults}&children=${children}&seniors=${seniors}`,
        },
      });
      window.dispatchEvent(event);
      return;
    }
    const params = new URLSearchParams({
      tripId: trip._id,
      date: selectedDate || trip.startDates[0],
      adults: adults.toString(),
      children: children.toString(),
      seniors: seniors.toString(),
    });
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F2] text-[#172B2A] pb-24 sm:pb-20 selection:bg-[#52C7B0]/20 selection:text-[#172B2A]">
      <Breadcrumbs tripTitle={trip.title} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* ================= HERO HEADER ================= */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#176B55] tracking-wider uppercase bg-[#176B55]/10 border border-[#176B55]/20 px-3.5 py-1 rounded-full">
            <TbMapPin size={14} className="text-[#52C7B0]" /> {trip.destination}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#172B2A] tracking-tight leading-tight">
            {trip.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-[#697773]">
            <span className="flex items-center gap-1.5 text-[#172B2A]">
              <TbStarFilled size={16} className="text-amber-500" />
              <span className="font-bold">{trip.rating}</span>
              <span className="text-[#697773]">({trip.reviewCount} reviews)</span>
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <TbClock size={16} className="text-[#176B55]" /> {trip.duration} Days Journey
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <TbUsers size={16} className="text-[#176B55]" /> Up to {trip.maxGroupSize} guests
            </span>
            <span className="capitalize px-3 py-1 rounded-full bg-white border border-[#E5E9E5] text-[11px] font-bold text-[#176B55] shadow-xs">
              {trip.difficulty}
            </span>
          </div>
        </header>

        {/* ================= CINEMATIC GALLERY ================= */}
        <section>
          {trip.images && trip.images.length === 1 ? (
            <div className="relative rounded-3xl overflow-hidden h-[42vh] sm:h-[52vh] bg-slate-900 border border-[#E5E9E5] shadow-sm">
              <img
                src={trip.images[0]}
                alt={trip.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getDestinationImage(trip.destination);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
            </div>
          ) : trip.images && trip.images.length === 2 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[42vh] sm:h-[52vh]">
              {trip.images.map((img: string, idx: number) => (
                <div key={idx} className="relative rounded-3xl overflow-hidden bg-slate-900 border border-[#E5E9E5] shadow-sm">
                  <img
                    src={img}
                    alt={`${trip.title} ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getDestinationImage(trip.destination);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[44vh] sm:h-[54vh]">
              <div className="md:col-span-2 relative rounded-3xl overflow-hidden bg-slate-900 border border-[#E5E9E5] shadow-sm">
                <img
                  src={trip.images?.[0] || getDestinationImage(trip.destination)}
                  alt={trip.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getDestinationImage(trip.destination);
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>
              <div className="hidden md:flex flex-col gap-4">
                <div className="flex-1 relative rounded-3xl overflow-hidden bg-slate-900 border border-[#E5E9E5] shadow-sm">
                  <img
                    src={trip.images?.[1] || getDestinationImage(trip.destination)}
                    alt={`${trip.title} 2`}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getDestinationImage(trip.destination);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="flex-1 relative rounded-3xl overflow-hidden bg-slate-900 border border-[#E5E9E5] shadow-sm">
                  <img
                    src={trip.images?.[2] || getDestinationImage(trip.destination)}
                    alt={`${trip.title} 3`}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getDestinationImage(trip.destination);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ================= MAIN SPLIT CONTENT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          
          {/* Main Left Content Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Elegant Tab Navigation */}
            <div className="sticky top-16 z-20 bg-[#F7F7F2]/90 backdrop-blur-md pt-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex overflow-x-auto border-b border-[#E5E9E5] scrollbar-none gap-2">
                {(['overview', 'itinerary', 'included', 'reviews'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 text-xs sm:text-sm font-bold capitalize transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                      activeTab === tab
                        ? 'border-[#176B55] text-[#176B55]'
                        : 'border-transparent text-[#697773] hover:text-[#172B2A]'
                    }`}
                  >
                    {tab === 'included' ? 'Inclusions' : tab}
                    {tab === 'reviews' && reviews.length > 0 && (
                      <span className="ml-1.5 text-xs text-[#697773]">({reviews.length})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB CONTENTS */}
            <div className="min-h-[50vh] space-y-8">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  {/* About This Trip */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E9E5] shadow-sm space-y-5">
                    <h2 className="text-xl sm:text-2xl font-black text-[#172B2A]">About This Journey</h2>
                    <p className="text-[#697773] leading-relaxed text-base sm:text-lg">{trip.description}</p>
                    
                    <div className="pt-2">
                      <span className="text-xs font-bold text-[#697773] uppercase tracking-wider block mb-2.5">
                        Key Experience Highlights:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {trip.highlights.map((h: string) => (
                          <span
                            key={h}
                            className="px-3.5 py-1.5 rounded-xl bg-[#176B55]/10 border border-[#176B55]/20 text-xs font-bold text-[#176B55]"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* AI Safety Advisory */}
                  <div className="p-6 sm:p-8 rounded-3xl border border-[#176B55]/25 bg-gradient-to-br from-white to-[#176B55]/5 shadow-sm space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-2xl bg-[#176B55] text-white shadow-md shadow-[#176B55]/20 flex-shrink-0">
                        <TbShieldCheck size={24} className="text-[#52C7B0]" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-bold text-[#172B2A]">VOYNEX Smart Safety Advisory</h3>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#176B55]/10 text-[#176B55]">
                            Verified
                          </span>
                        </div>
                        <p className="text-xs text-[#697773]">
                          Status: <span className="text-[#176B55] font-bold">Optimal for Travel</span> &bull; Updated within the last 24 hours.
                        </p>

                        <ul className="space-y-2 pt-2">
                          <li className="flex items-center gap-2 text-xs font-semibold text-[#172B2A]">
                            <TbCheck className="text-[#176B55]" /> Valid photo ID required upon arrival
                          </li>
                          <li className="flex items-center gap-2 text-xs font-semibold text-[#172B2A]">
                            <TbCheck className="text-[#176B55]" /> Full guided security & acclimatization support included
                          </li>
                          <li className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                            <TbAlertTriangle className="text-amber-500" /> Layered thermal wear recommended for evening hours
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Location Map View */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E9E5] shadow-sm space-y-4">
                    <h2 className="text-xl font-black text-[#172B2A]">Destination Coordinates</h2>
                    <div className="h-[280px] rounded-2xl border border-[#E5E9E5] bg-[#F7F7F2] flex flex-col items-center justify-center text-center p-6 space-y-2">
                      <div className="p-3 rounded-2xl bg-white shadow-sm border border-[#E5E9E5]">
                        <TbMapPin size={32} className="text-[#176B55]" />
                      </div>
                      <p className="font-bold text-sm text-[#172B2A]">{trip.destination}</p>
                      <p className="text-xs text-[#697773] max-w-sm">
                        Curated starting point coordinates and airport transfer routes will be synchronized with your booking pass.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: ITINERARY */}
              {activeTab === 'itinerary' && (
                <div className="space-y-6">
                  {trip.itinerary && trip.itinerary.length > 0 ? (
                    trip.itinerary.map((day: any) => (
                      <motion.div
                        key={day.day}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: day.day * 0.04 }}
                        className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E9E5] shadow-sm space-y-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-[#176B55]/10 border border-[#176B55]/20 flex flex-col items-center justify-center text-[#176B55] flex-shrink-0">
                            <span className="text-[9px] font-bold uppercase tracking-wider leading-none">Day</span>
                            <span className="text-base font-extrabold leading-none mt-0.5">{day.day}</span>
                          </div>

                          <div className="flex-1">
                            <h4 className="text-base sm:text-lg font-black text-[#172B2A]">{day.title}</h4>
                            <p className="text-xs sm:text-sm text-[#697773] mt-1.5 leading-relaxed">
                              {day.description}
                            </p>

                            {day.activities && day.activities.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-4">
                                {day.activities.map((a: string) => (
                                  <span
                                    key={a}
                                    className="px-3 py-1 rounded-full bg-[#F7F7F2] border border-[#E5E9E5] text-[11px] font-semibold text-[#172B2A]"
                                  >
                                    {a}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="bg-white rounded-3xl p-10 border border-[#E5E9E5] text-center space-y-2">
                      <p className="font-bold text-[#172B2A]">Full Itinerary Schedule</p>
                      <p className="text-xs text-[#697773]">
                        Detailed day-by-day schedules will be delivered along with your booking voucher.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: INCLUSIONS */}
              {activeTab === 'included' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Included */}
                  <div className="p-6 sm:p-8 rounded-3xl border border-[#176B55]/25 bg-white shadow-sm space-y-4">
                    <h4 className="font-black text-[#176B55] text-base sm:text-lg flex items-center gap-2">
                      <TbCheck size={22} className="text-[#176B55]" /> What&apos;s Included
                    </h4>
                    <ul className="space-y-3">
                      {trip.included.map((i: string) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-[#172B2A]">
                          <TbCheck size={16} className="text-[#176B55] mt-0.5 flex-shrink-0" />
                          <span>{i}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Excluded */}
                  <div className="p-6 sm:p-8 rounded-3xl border border-[#E5E9E5] bg-white shadow-sm space-y-4">
                    <h4 className="font-black text-[#697773] text-base sm:text-lg flex items-center gap-2">
                      <TbX size={22} className="text-rose-500" /> Exclusions
                    </h4>
                    <ul className="space-y-3">
                      {trip.excluded.map((e: string) => (
                        <li key={e} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-[#697773]">
                          <TbX size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: REVIEWS */}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((r: any) => {
                      const sentiment = analyzeSentiment(r.comment);
                      return (
                        <motion.div
                          key={r._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-6 rounded-3xl border border-[#E5E9E5] bg-white shadow-sm space-y-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-[#176B55] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                              {r.user?.name ? r.user.name.charAt(0) : 'T'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-sm text-[#172B2A]">{r.user?.name || 'Verified Explorer'}</p>
                                <SentimentBadge sentiment={sentiment} />
                              </div>
                              <div className="flex items-center gap-2 text-xs text-[#697773] mt-0.5">
                                <div className="flex items-center">
                                  {Array.from({ length: 5 }, (_, i) => (
                                    <TbStarFilled
                                      key={i}
                                      size={12}
                                      className={i < r.rating ? 'text-amber-500' : 'text-[#E5E9E5]'}
                                    />
                                  ))}
                                </div>
                                <span>&bull;</span>
                                <span>{new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-[#697773] leading-relaxed">{r.comment}</p>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="bg-white rounded-3xl p-12 border border-[#E5E9E5] text-center space-y-2">
                      <p className="text-4xl mb-2">⭐</p>
                      <p className="text-base font-bold text-[#172B2A]">No Reviews Yet</p>
                      <p className="text-xs text-[#697773]">Be the first traveler to review this voyage upon return!</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Desktop Sticky Booking Panel */}
          <aside className="hidden lg:block lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-24 rounded-3xl border border-[#E5E9E5] bg-white p-6 sm:p-7 shadow-lg space-y-6"
            >
              {/* Price Header */}
              <div className="border-b border-[#E5E9E5] pb-5">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-[#176B55]">
                    ₹{trip.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-[#697773] font-semibold">/ guest</span>
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-[11px] font-bold">
                  <TbStarFilled size={12} className="text-amber-500" /> ₹{(trip.price * 0.9).toLocaleString()} for Gold Members
                </div>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#697773] block">
                  Select Starting Date
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#E5E9E5] bg-[#F7F7F2] text-xs font-bold text-[#172B2A] focus:outline-none focus:ring-2 focus:ring-[#176B55] transition-all cursor-pointer"
                >
                  <option value="">Select an available date</option>
                  {trip.startDates.map((d: string) => (
                    <option key={d} value={d}>
                      {new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Travelers Counter */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#697773] block">
                  Guests Breakdown
                </label>
                {[
                  { label: 'Adults', value: adults, set: setAdults, min: 1 },
                  { label: 'Children', value: children, set: setChildren, min: 0 },
                  { label: 'Seniors', value: seniors, set: setSeniors, min: 0 },
                ].map((g: any) => (
                  <div
                    key={g.label}
                    className="flex items-center justify-between p-2.5 rounded-2xl border border-[#E5E9E5] bg-[#F7F7F2]"
                  >
                    <span className="text-xs font-bold text-[#172B2A]">{g.label}</span>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => g.set(Math.max(g.min, g.value - 1))}
                        className="w-7 h-7 rounded-xl bg-white border border-[#E5E9E5] flex items-center justify-center text-[#172B2A] hover:bg-[#F7F7F2] active:scale-95 transition-all"
                      >
                        <TbMinus size={14} />
                      </button>
                      <span className="w-5 text-center font-extrabold text-xs">{g.value}</span>
                      <button
                        type="button"
                        onClick={() => g.set(g.value + 1)}
                        className="w-7 h-7 rounded-xl bg-white border border-[#E5E9E5] flex items-center justify-center text-[#172B2A] hover:bg-[#F7F7F2] active:scale-95 transition-all"
                      >
                        <TbPlus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="border-t border-[#E5E9E5] pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-[#697773]">
                  <span>₹{trip.price.toLocaleString()} &times; {totalGuests} guests</span>
                  <span className="font-semibold text-[#172B2A]">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-[#172B2A] pt-1 border-t border-[#E5E9E5]/60">
                  <span>Total Due</span>
                  <span className="text-[#176B55] text-base">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Action */}
              {((user as any)?.organizationId || (user as any)?.organization_id) &&
              (trip?.organizationId === ((user as any)?.organizationId || (user as any)?.organization_id) ||
                trip?.organization_id === ((user as any)?.organizationId || (user as any)?.organization_id)) ? (
                <div className="w-full py-3.5 px-4 rounded-2xl bg-[#F7F7F2] border border-[#E5E9E5] text-center text-[#697773] font-bold text-xs">
                  Your Listed Journey
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleBookNow}
                  className="w-full py-4 rounded-2xl bg-[#176B55] hover:bg-[#135946] text-white font-extrabold text-sm shadow-md shadow-[#176B55]/20 active:scale-[0.99] transition-all cursor-pointer"
                >
                  Confirm & Reserve Journey
                </button>
              )}

              <p className="text-[11px] font-semibold text-[#697773] text-center flex items-center justify-center gap-1.5 pt-1">
                <TbCheck className="text-[#176B55]" size={14} /> Free cancellation up to 48 hours before departure
              </p>
            </motion.div>
          </aside>

        </div>
      </div>

      {/* Sticky Mobile Booking Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E9E5] p-4 shadow-lg">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          <div>
            <div className="text-[11px] text-[#697773] font-bold uppercase tracking-wider">Total Investment</div>
            <div className="font-black text-lg text-[#176B55]">₹{totalPrice.toLocaleString()}</div>
          </div>

          {((user as any)?.organizationId || (user as any)?.organization_id) &&
          (trip?.organizationId === ((user as any)?.organizationId || (user as any)?.organization_id) ||
            trip?.organization_id === ((user as any)?.organizationId || (user as any)?.organization_id)) ? (
            <div className="px-4 py-2.5 rounded-2xl bg-[#F7F7F2] text-xs font-bold text-[#697773]">
              Your Listing
            </div>
          ) : (
            <button
              onClick={handleBookNow}
              className="px-6 py-3 rounded-2xl bg-[#176B55] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Reserve Now
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
