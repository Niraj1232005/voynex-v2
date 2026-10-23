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
  TbExternalLink,
  TbPackage,
  TbHeart,
} from 'react-icons/tb';
import Breadcrumbs from '@/components/Breadcrumbs';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getDestinationImage } from '@/lib/destinationImages';

function getRentalImage(rental: any): string {
  if (rental?.images && rental.images.length > 0) {
    const first = Array.isArray(rental.images) ? rental.images[0] : rental.images;
    if (typeof first === 'string' && first.trim().length > 0) return first.trim();
  }
  const text = `${rental?.title || ''} ${rental?.name || ''} ${rental?.category || ''}`.toLowerCase();
  if (text.includes('bike') || text.includes('cycle')) {
    return 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80';
  }
  if (text.includes('camera') || text.includes('gopro')) {
    return 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80';
  }
  if (text.includes('backpack') || text.includes('bag') || text.includes('trek')) {
    return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80';
  }
  if (text.includes('tent') || text.includes('camp') || text.includes('stove')) {
    return 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80';
  }
  if (text.includes('scooty') || text.includes('scooter') || text.includes('vehicle') || text.includes('car')) {
    return 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80';
  }
  if (text.includes('jacket') || text.includes('apparel') || text.includes('shoes')) {
    return 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80';
}

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
    coordinates: bTrip.coordinates || null,
    meetingPoint: bTrip.meetingPoint || null,
    organizationId: bTrip.organizationId || bTrip.organization_id || bTrip.organization?.id,
    agency: {
      _id: bTrip.organizationId || bTrip.organization_id || bTrip.organization?.id,
      name: bTrip.organization?.name || 'Travel Agency',
    },
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
  const { showToast } = useToast();

  const [trip, setTrip] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [selectedRentals, setSelectedRentals] = useState<{ [rentalId: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const [selectedDate, setSelectedDate] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [seniors, setSeniors] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'rentals' | 'included' | 'reviews'>('overview');

  useEffect(() => {
    if (!id) return;
    try {
      const saved = localStorage.getItem('voynex_saved_trips');
      if (saved) {
        const list: string[] = JSON.parse(saved);
        if (list.includes(id as string)) setIsSaved(true);
      }
    } catch {}

    api.get('/wishlist')
      .then((res) => {
        if (Array.isArray(res)) {
          const match = res.some((w: any) => (w.itemId || w.item?._id || w.item?.id) === id);
          if (match) setIsSaved(true);
        }
      })
      .catch(() => {});
  }, [id]);

  const handleToggleWishlist = async () => {
    if (!trip) return;
    const tId = (trip._id || trip.id || id) as string;
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    try {
      const saved = localStorage.getItem('voynex_saved_trips');
      let local: string[] = saved ? JSON.parse(saved) : [];
      if (nextSaved) {
        if (!local.includes(tId)) local.push(tId);
      } else {
        local = local.filter((x) => x !== tId);
      }
      localStorage.setItem('voynex_saved_trips', JSON.stringify(local));

      const res = await api.post('/wishlist', {
        itemType: 'trip',
        itemId: tId,
      });
      showToast(res?.message || (nextSaved ? 'Saved to wishlist!' : 'Removed from wishlist'), 'success');
    } catch {
      showToast(nextSaved ? 'Saved to wishlist!' : 'Removed from wishlist', 'success');
    }
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.get(`/trips/${id}`),
      api.get(`/reviews/trip/${id}`).catch(() => ({ reviews: [] })),
    ])
      .then(async ([tripRes, reviewsRes]) => {
        if (tripRes) {
          const mapped = mapBackendTripToFrontend(tripRes);
          setTrip(mapped);

          // Fetch agency rentals if organizationId is present
          if (mapped.organizationId) {
            try {
              const rentalsRes = await api.get(`/rentals?organizationId=${mapped.organizationId}`);
              if (Array.isArray(rentalsRes)) {
                setRentals(rentalsRes.filter((r: any) => r.isAvailable !== false));
              }
            } catch (err) {
              console.warn('Could not load agency rentals:', err);
            }
          }
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
  const tripSubtotal = trip.price * totalGuests;
  const tripDurationDays = trip.durationDays || trip.duration || 1;

  // Selected Rentals calculations
  const rentalItemsList = Object.entries(selectedRentals)
    .filter(([_, qty]) => qty > 0)
    .map(([rId, qty]) => {
      const item = rentals.find((r) => (r.id || r._id) === rId);
      const pricePerDay = Number(item?.pricePerDay || 0);
      const deposit = Number(item?.deposit || 0);
      return {
        rentalId: rId,
        title: item?.title || item?.name || 'Equipment',
        quantity: qty,
        pricePerDay,
        deposit,
        rentalTotal: pricePerDay * tripDurationDays * qty,
        depositTotal: deposit * qty,
      };
    });

  const rentalSubtotal = rentalItemsList.reduce((acc, curr) => acc + curr.rentalTotal, 0);
  const depositSubtotal = rentalItemsList.reduce((acc, curr) => acc + curr.depositTotal, 0);
  const grandTotal = tripSubtotal + rentalSubtotal + depositSubtotal;

  const handleUpdateRentalQty = (rentalId: string, delta: number, maxStock = 20) => {
    setSelectedRentals((prev) => {
      const current = prev[rentalId] || 0;
      const next = Math.max(0, Math.min(maxStock, current + delta));
      return { ...prev, [rentalId]: next };
    });
  };

  const handleBookNow = () => {
    const selectedRentalPayload = rentalItemsList.map(r => ({
      rentalId: r.rentalId,
      quantity: r.quantity,
    }));

    const params = new URLSearchParams({
      tripId: trip._id,
      date: selectedDate || trip.startDates[0] || '',
      adults: adults.toString(),
      children: children.toString(),
      seniors: seniors.toString(),
    });

    if (selectedRentalPayload.length > 0) {
      params.set('rentals', JSON.stringify(selectedRentalPayload));
    }

    if (!isAuthenticated) {
      const event = new CustomEvent('openAuthModal', {
        detail: {
          redirect: `/checkout?${params.toString()}`,
        },
      });
      window.dispatchEvent(event);
      return;
    }
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F2] text-[#172B2A] pb-24 sm:pb-20 selection:bg-[#52C7B0]/20 selection:text-[#172B2A]">
      <Breadcrumbs tripTitle={trip.title} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* ================= HERO HEADER ================= */}
        <header className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#176B55] tracking-wider uppercase bg-[#176B55]/10 border border-[#176B55]/20 px-3.5 py-1 rounded-full">
              <TbMapPin size={14} className="text-[#52C7B0]" /> {trip.destination}
            </div>
            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all border shadow-xs ${
                isSaved
                  ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                  : 'bg-white border-[#E5E9E5] text-[#172B2A] hover:bg-slate-50'
              }`}
            >
              <TbHeart size={16} className={isSaved ? 'fill-rose-500 text-rose-500' : 'text-[#697773]'} />
              <span>{isSaved ? 'Saved to Wishlist' : 'Save to Wishlist'}</span>
            </button>
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
                {(['overview', 'itinerary', 'rentals', 'included', 'reviews'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 text-xs sm:text-sm font-bold capitalize transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                      activeTab === tab
                        ? 'border-[#176B55] text-[#176B55]'
                        : 'border-transparent text-[#697773] hover:text-[#172B2A]'
                    }`}
                  >
                    {tab === 'included' ? 'Inclusions' : tab === 'rentals' ? `Rentals (${rentals.length})` : tab}
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

                  {/* Optional Rental Equipment from Agency */}
                  {rentals.length > 0 && (
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#176B55]/20 shadow-sm space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#176B55]/10 text-[#176B55] text-xs font-bold mb-2">
                            <TbPackage size={14} /> Same-Agency Equipment
                          </div>
                          <h3 className="text-xl font-black text-[#172B2A]">Optional Rental Gear for This Trip</h3>
                          <p className="text-xs text-[#697773]">
                            Book gear directly with {trip.agency?.name}. Rental dates automatically align with your {tripDurationDays}-day journey ({selectedDate ? new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'start date'} to departure).
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('rentals')}
                          className="text-xs font-bold text-[#176B55] hover:underline self-start sm:self-auto"
                        >
                          View all ({rentals.length}) &rarr;
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {rentals.slice(0, 4).map((r) => {
                          const rId = r.id || r._id;
                          const currentQty = selectedRentals[rId] || 0;
                          const itemRentalTotal = Number(r.pricePerDay || 0) * tripDurationDays;
                          return (
                            <div key={rId} className={`p-3.5 rounded-2xl border transition-all ${currentQty > 0 ? 'border-[#176B55] bg-[#176B55]/5 shadow-xs' : 'border-[#E5E9E5] bg-[#F7F7F2]'}`}>
                              <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0 relative">
                                  <img
                                    src={getRentalImage(r)}
                                    alt={r.title || r.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80';
                                    }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">{r.category || 'Gear'}</span>
                                  <h4 className="font-bold text-sm text-[#172B2A] truncate">{r.title || r.name}</h4>
                                  <p className="text-xs text-[#176B55] font-extrabold mt-0.5">
                                    ₹{Number(r.pricePerDay || 0).toLocaleString()} <span className="text-[10px] font-normal text-muted">/ day</span>
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5 bg-white rounded-xl border border-[#E5E9E5] p-1 shadow-2xs">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateRentalQty(rId, -1)}
                                    disabled={currentQty === 0}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-[#172B2A] hover:bg-muted disabled:opacity-30"
                                  >
                                    -
                                  </button>
                                  <span className="w-5 text-center text-xs font-bold text-[#172B2A]">{currentQty}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateRentalQty(rId, 1, r.stock || 20)}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-[#172B2A] hover:bg-muted"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Essential Travel & Agency Notes */}
                  <div className="p-6 sm:p-8 rounded-3xl border border-[#E5E9E5] bg-white shadow-sm space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-2xl bg-[#176B55]/10 text-[#176B55] flex-shrink-0">
                        <TbShieldCheck size={24} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="text-base sm:text-lg font-bold text-[#172B2A]">Essential Travel Notes</h3>
                        <p className="text-xs text-[#697773]">
                          Provided by {trip.agency?.name || 'the organizing agency'} for this journey.
                        </p>

                        <ul className="space-y-2 pt-2">
                          <li className="flex items-center gap-2 text-xs font-semibold text-[#172B2A]">
                            <TbCheck className="text-[#176B55]" /> Valid government-issued photo ID required for all travelers
                          </li>
                          <li className="flex items-center gap-2 text-xs font-semibold text-[#172B2A]">
                            <TbCheck className="text-[#176B55]" /> Check-in point and itinerary schedule coordinated directly with agency
                          </li>
                          <li className="flex items-center gap-2 text-xs font-semibold text-[#172B2A]">
                            <TbAlertTriangle className="text-amber-500" /> Weather-appropriate footwear and clothing recommended for {trip.destination}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Usable Map View & Meeting Point */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E9E5] shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h2 className="text-xl font-black text-[#172B2A]">Destination & Meeting Location</h2>
                        <p className="text-xs text-[#697773] mt-0.5">Accurate coordinates and assembly guidance</p>
                      </div>
                      {trip.coordinates?.lat && trip.coordinates?.lng ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${trip.coordinates.lat},${trip.coordinates.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#176B55]/10 text-[#176B55] hover:bg-[#176B55]/20 text-xs font-bold transition-all self-start sm:self-auto"
                        >
                          <TbExternalLink size={15} /> Open in Google Maps
                        </a>
                      ) : (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.destination)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#176B55]/10 text-[#176B55] hover:bg-[#176B55]/20 text-xs font-bold transition-all self-start sm:self-auto"
                        >
                          <TbExternalLink size={15} /> Search on Maps
                        </a>
                      )}
                    </div>

                    {trip.meetingPoint && (trip.meetingPoint.name || trip.meetingPoint.address) && (
                      <div className="p-4 rounded-2xl bg-[#F7F7F2] border border-[#E5E9E5] flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-white border border-[#E5E9E5] text-[#176B55]">
                          <TbMapPin size={20} />
                        </div>
                        <div className="flex-1 text-xs space-y-0.5">
                          <span className="font-bold uppercase tracking-wider text-[10px] text-[#176B55]">Meeting Point</span>
                          <p className="font-bold text-sm text-[#172B2A]">{trip.meetingPoint.name || trip.destination}</p>
                          {trip.meetingPoint.address && <p className="text-[#697773]">{trip.meetingPoint.address}</p>}
                        </div>
                      </div>
                    )}

                    {trip.coordinates?.lat && trip.coordinates?.lng ? (
                      <div className="space-y-2">
                        <div className="h-[320px] rounded-2xl overflow-hidden border border-[#E5E9E5] shadow-inner bg-slate-100 relative">
                          <iframe
                            title="OpenStreetMap"
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            scrolling="no"
                            marginHeight={0}
                            marginWidth={0}
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(trip.coordinates.lng) - 0.05}%2C${Number(trip.coordinates.lat) - 0.04}%2C${Number(trip.coordinates.lng) + 0.05}%2C${Number(trip.coordinates.lat) + 0.04}&layer=mapnik&marker=${trip.coordinates.lat}%2C${trip.coordinates.lng}`}
                            className="w-full h-full"
                          />
                        </div>
                        <p className="text-[11px] text-[#697773] text-right">
                          Map data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap</a> contributors
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-[#E5E9E5] bg-[#F7F7F2] p-8 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E9E5] text-[#176B55] flex items-center justify-center mx-auto shadow-xs">
                          <TbMapPin size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-[#172B2A] text-sm">{trip.destination}</p>
                          <p className="text-xs text-[#697773] max-w-md mx-auto mt-1">
                            Exact starting coordinates are confirmed with your agency before travel. Use the map link above to inspect the general region.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB: RENTALS */}
              {activeTab === 'rentals' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E9E5] shadow-sm">
                    <h3 className="text-xl font-bold text-[#172B2A] mb-2">Equipment & Rental Gear</h3>
                    <p className="text-xs text-[#697773] mb-6">
                      Reserve optional equipment directly provided by {trip.agency?.name}. Selected items will be synchronized with your trip reservation.
                    </p>

                    {rentals.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {rentals.map((r) => {
                          const rId = r.id || r._id;
                          const currentQty = selectedRentals[rId] || 0;
                          const itemRentalTotal = Number(r.pricePerDay || 0) * tripDurationDays;
                          return (
                            <div key={rId} className={`rounded-2xl border overflow-hidden transition-all flex flex-col justify-between ${currentQty > 0 ? 'border-[#176B55] bg-[#176B55]/5 shadow-sm' : 'border-[#E5E9E5] bg-card'}`}>
                              <div>
                                <div className="h-44 w-full bg-muted relative overflow-hidden">
                                  <img
                                    src={getRentalImage(r)}
                                    alt={r.title || r.name}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80';
                                    }}
                                  />
                                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                                    {r.category || 'Gear'}
                                  </span>
                                  {currentQty > 0 && (
                                    <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-[#176B55] text-white text-[10px] font-bold">
                                      {currentQty} selected
                                    </span>
                                  )}
                                </div>
                                <div className="p-5">
                                  <h4 className="font-bold text-base text-[#172B2A]">{r.title || r.name}</h4>
                                  {r.description && <p className="text-xs text-[#697773] mt-1 line-clamp-2">{r.description}</p>}
                                </div>
                              </div>
                              <div className="p-5 pt-0">
                                <div className="flex items-center justify-between pt-3 border-t border-[#E5E9E5]/60">
                                  <div>
                                    <p className="text-sm font-black text-[#176B55]">
                                      ₹{Number(r.pricePerDay || 0).toLocaleString()} <span className="text-[10px] font-normal text-muted">/ day</span>
                                    </p>
                                    <p className="text-[10px] text-muted">
                                      ₹{itemRentalTotal.toLocaleString()} for {tripDurationDays}d trip
                                      {Number(r.deposit || 0) > 0 && ` • ₹${Number(r.deposit).toLocaleString()} deposit`}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 bg-white rounded-xl border border-[#E5E9E5] p-1.5 shadow-2xs">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateRentalQty(rId, -1)}
                                      disabled={currentQty === 0}
                                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-[#172B2A] hover:bg-muted disabled:opacity-30"
                                    >
                                      -
                                    </button>
                                    <span className="w-6 text-center text-xs font-bold text-[#172B2A]">{currentQty}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateRentalQty(rId, 1, r.stock || 20)}
                                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-[#172B2A] hover:bg-muted"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 border border-dashed border-[#E5E9E5] rounded-2xl">
                        <TbPackage size={36} className="mx-auto text-muted mb-2 opacity-50" />
                        <p className="text-sm font-bold text-[#172B2A]">No Equipment Available</p>
                        <p className="text-xs text-[#697773] mt-1">This agency does not currently have rental items listed for this trip.</p>
                      </div>
                    )}
                  </div>
                </div>
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
                  <span>Trip ({trip.price.toLocaleString()} &times; {totalGuests})</span>
                  <span className="font-semibold text-[#172B2A]">₹{tripSubtotal.toLocaleString()}</span>
                </div>
                {rentalSubtotal > 0 && (
                  <div className="flex justify-between text-[#697773]">
                    <span>Optional Gear ({rentalItemsList.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span className="font-semibold text-[#172B2A]">₹{rentalSubtotal.toLocaleString()}</span>
                  </div>
                )}
                {depositSubtotal > 0 && (
                  <div className="flex justify-between text-[#697773]">
                    <span>Security Deposit (Refundable)</span>
                    <span className="font-semibold text-[#172B2A]">₹{depositSubtotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm text-[#172B2A] pt-2 border-t border-[#E5E9E5]/60">
                  <span>Grand Total</span>
                  <span className="text-[#176B55] text-base">₹{grandTotal.toLocaleString()}</span>
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
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={handleBookNow}
                    className="flex-1 py-4 rounded-2xl bg-[#176B55] hover:bg-[#135946] text-white font-extrabold text-sm shadow-md shadow-[#176B55]/20 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    Confirm & Reserve Journey
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleWishlist}
                    className={`px-4 rounded-2xl border transition-all flex items-center justify-center ${
                      isSaved
                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                        : 'bg-white border-[#E5E9E5] text-[#697773] hover:text-[#172B2A] hover:bg-[#F7F7F2]'
                    }`}
                    title={isSaved ? 'Saved in Wishlist' : 'Save to Wishlist'}
                    aria-label="Wishlist"
                  >
                    <TbHeart size={20} className={isSaved ? 'fill-rose-500 text-rose-500' : ''} />
                  </button>
                </div>
              )}

              <p className="text-[11px] font-semibold text-[#697773] text-center flex items-center justify-center gap-1.5 pt-1">
                <TbCheck className="text-[#176B55]" size={14} /> Cancellations and refunds subject to agency booking policy
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
            <div className="font-black text-lg text-[#176B55]">₹{grandTotal.toLocaleString()}</div>
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
