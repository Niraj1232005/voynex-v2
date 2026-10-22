'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TbSparkles,
  TbWand,
  TbMapPin,
  TbCalendar,
  TbUsers,
  TbCompass,
  TbMountain,
  TbBeach,
  TbBuildingCastle,
  TbToolsKitchen2,
  TbSun,
  TbCrown,
  TbWallet,
  TbCheck,
  TbPlus,
  TbMinus,
  TbDownload,
  TbShare,
  TbChevronLeft,
  TbArrowRight,
  TbShieldCheck,
  TbInfoCircle,
  TbRefresh,
} from 'react-icons/tb';
import Breadcrumbs from '@/components/Breadcrumbs';
import { api } from '@/lib/api';
import AIItineraryDisplay from '@/components/AIItineraryDisplay';
import { generateItineraryPDF } from '@/lib/pdfGenerator';
import { useToast } from '@/contexts/ToastContext';
import { getDestinationImage } from '@/lib/destinationImages';

const POPULAR_DESTINATIONS = [
  'Manali',
  'Bali',
  'Goa',
  'Paris',
  'Kyoto',
  'Ladakh',
  'Swiss Alps',
  'Dubai',
];

const PREFERENCE_OPTIONS = [
  { id: 'Adventure', label: 'Adventure', icon: TbMountain, desc: 'Trekking & thrills' },
  { id: 'Nature and mountains', label: 'Nature & Mountains', icon: TbCompass, desc: 'Scenic peaks & valleys' },
  { id: 'Beaches', label: 'Beaches', icon: TbBeach, desc: 'Sun, sand & coastal breeze' },
  { id: 'Culture and heritage', label: 'Culture & Heritage', icon: TbBuildingCastle, desc: 'Historic temples & art' },
  { id: 'Food and local experiences', label: 'Food & Local Dining', icon: TbToolsKitchen2, desc: 'Street food & dining' },
  { id: 'Relaxation', label: 'Relaxation', icon: TbSun, desc: 'Spas & peaceful stays' },
  { id: 'Luxury', label: 'Luxury Escapes', icon: TbCrown, desc: '5-star indulgence' },
  { id: 'Budget travel', label: 'Budget Travel', icon: TbWallet, desc: 'Smart & cost-effective' },
];

const BUDGET_TIERS = [
  {
    id: 'Budget',
    label: 'Budget',
    amount: 15000,
    range: '₹2,000 – ₹4,000 / day',
    desc: 'Hostels, cozy homestays, public transit & authentic street food',
  },
  {
    id: 'Moderate',
    label: 'Comfortable',
    amount: 30000,
    range: '₹4,500 – ₹9,000 / day',
    desc: '3/4-star boutique stays, private cabs, curated cafes & tickets',
  },
  {
    id: 'Luxury',
    label: 'Luxury',
    amount: 100000,
    range: '₹12,000+ / day',
    desc: '5-star resorts, private chauffeurs, VIP experiences & fine dining',
  },
];

const PROMPT_SUGGESTIONS = [
  'Plan a 4-day trip to Manali with scenic mountain views, local food, adventure activities, and a moderate budget.',
  'A relaxing 5-day romantic getaway in Bali with sunset beaches, private villas, and authentic spa wellness.',
  'A 3-day cultural heritage discovery in Kyoto covering historic shrines, matcha tea spots, and peaceful gardens.',
  'A 4-day budget-friendly coastal retreat in South Goa focusing on quiet beaches and fresh seafood.',
];

const LOADING_STEPS = [
  'Analyzing destination highlights and seasonal weather...',
  'Finding hidden gems, iconic viewpoints, and local dining...',
  'Optimizing daily routes for effortless travel time...',
  'Balancing activities against your chosen budget tier...',
  'Finalizing your bespoke day-by-day VOYNEX itinerary...',
];

type PlannerState = 'form' | 'loading' | 'results';

export default function AIPlannerPage() {
  const { showToast } = useToast();
  const [state, setState] = useState<PlannerState>('form');
  const [loadingStep, setLoadingStep] = useState(0);

  // Form State
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(4);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [budgetTier, setBudgetTier] = useState('Moderate');
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([
    'Nature and mountains',
    'Food and local experiences',
  ]);
  const [customPrompt, setCustomPrompt] = useState('');

  // Results State
  const [aiPlan, setAiPlan] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Destination image preview
  const destinationPreviewUrl = getDestinationImage(destination || 'himachal');

  useEffect(() => {
    if (state === 'loading') {
      let step = 0;
      const interval = setInterval(() => {
        step += 1;
        if (step < LOADING_STEPS.length) {
          setLoadingStep(step);
        } else {
          clearInterval(interval);
        }
      }, 1400);
      return () => clearInterval(interval);
    }
  }, [state]);

  const togglePreference = (prefId: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(prefId)
        ? prev.filter((p) => p !== prefId)
        : [...prev, prefId]
    );
  };

  const handleApplySuggestion = (promptText: string) => {
    setCustomPrompt(promptText);
    // Parse destination if recognized
    for (const d of POPULAR_DESTINATIONS) {
      if (promptText.toLowerCase().includes(d.toLowerCase())) {
        setDestination(d);
        break;
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!destination.trim()) {
      setValidationError('Please enter a destination to craft your itinerary.');
      return;
    }
    setValidationError(null);
    setState('loading');
    setLoadingStep(0);

    const activeTier = BUDGET_TIERS.find((b) => b.id === budgetTier) || BUDGET_TIERS[1];
    const totalTravellers = adults + children;

    try {
      const interestsPayload = selectedPreferences.length > 0
        ? selectedPreferences
        : ['Adventurous', 'Relaxing'];

      // Send prompt context if provided
      const res = await api.post('/ai/plan-trip', {
        destination: destination.trim(),
        duration: Number(duration),
        budget: activeTier.amount * (totalTravellers > 1 ? 1 + (totalTravellers - 1) * 0.5 : 1),
        interests: customPrompt
          ? [...interestsPayload, `Special Request: ${customPrompt}`]
          : interestsPayload,
        startDate: startDate || new Date().toISOString().split('T')[0],
      });

      if (res && res.result) {
        setAiPlan(res.result);
      } else {
        setAiPlan('Unable to generate itinerary. Please try again.');
      }
      setState('results');
    } catch (err: any) {
      showToast(err.message || 'Failed to generate AI trip plan. Please retry.', 'error');
      setState('form');
    }
  };

  const handleReset = () => {
    setState('form');
    setSaved(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F2] text-[#172B2A] pb-24 selection:bg-[#52C7B0]/20 selection:text-[#172B2A]">
      <Breadcrumbs />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-8">

        {/* ----------------- 1. HEADER SECTION ----------------- */}
        <header className="relative bg-white rounded-3xl p-6 sm:p-10 border border-[#E5E9E5] shadow-sm overflow-hidden">
          {/* Subtle cinematic gradient accent */}
          <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-gradient-to-bl from-[#52C7B0]/15 via-[#176B55]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#176B55]/10 border border-[#176B55]/20 text-[#176B55] text-xs font-bold tracking-wide uppercase">
              <TbSparkles className="w-3.5 h-3.5 text-[#52C7B0]" />
              VOYNEX AI Travel Studio
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#172B2A] leading-tight">
              Let&apos;s Plan Your Next Adventure
            </h1>

            <p className="text-base sm:text-lg text-[#697773] leading-relaxed">
              Tell us what inspires you. We&apos;ll help you turn your travel ideas into a journey worth remembering.
            </p>

            {/* Stage Indicator */}
            <div className="pt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-semibold">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${state === 'form' ? 'bg-[#176B55] text-white shadow-sm' : 'bg-[#E5E9E5] text-[#172B2A]'}`}>
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
                Trip Details & Vibe
              </span>
              <span className="text-[#697773] hidden sm:inline">&rarr;</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${state === 'loading' ? 'bg-[#176B55] text-white animate-pulse' : 'bg-[#E5E9E5] text-[#697773]'}`}>
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
                AI Generation
              </span>
              <span className="text-[#697773] hidden sm:inline">&rarr;</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${state === 'results' ? 'bg-[#176B55] text-white' : 'bg-[#E5E9E5] text-[#697773]'}`}>
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
                Interactive Itinerary
              </span>
            </div>
          </div>
        </header>

        {/* ----------------- 2. CONTENT FLOW ----------------- */}
        <AnimatePresence mode="wait">
          
          {/* ================= STATE 1: FORM ================= */}
          {state === 'form' && (
            <motion.div
              key="form-view"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Main Planning Form */}
              <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
                
                {/* 2A: Destination Input */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E9E5] shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-[#E5E9E5] pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-[#176B55]/10 text-[#176B55]">
                        <TbMapPin className="w-5 h-5 text-[#176B55]" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-[#172B2A]">1. Choose Destination</h2>
                        <p className="text-xs text-[#697773]">Where do you want to explore?</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={destination}
                        onChange={(e) => {
                          setDestination(e.target.value);
                          if (validationError) setValidationError(null);
                        }}
                        placeholder="e.g. Manali, Bali, Paris, Kyoto, Swiss Alps, or Goa"
                        className="w-full pl-5 pr-12 py-4 rounded-2xl border border-[#E5E9E5] bg-[#F7F7F2]/60 text-base font-semibold text-[#172B2A] placeholder-[#697773]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176B55] focus:border-transparent transition-all shadow-inner"
                      />
                      <TbMapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-[#176B55] w-5 h-5" />
                    </div>

                    {validationError && (
                      <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5 pt-1">
                        <TbInfoCircle className="w-4 h-4" /> {validationError}
                      </p>
                    )}

                    {/* Popular Destination Quick Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-2">
                      <span className="text-[11px] font-bold text-[#697773] uppercase tracking-wider mr-1">Popular:</span>
                      {POPULAR_DESTINATIONS.map((pop) => (
                        <button
                          key={pop}
                          type="button"
                          onClick={() => {
                            setDestination(pop);
                            if (validationError) setValidationError(null);
                          }}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                            destination.toLowerCase() === pop.toLowerCase()
                              ? 'bg-[#176B55] text-white border-[#176B55] font-bold shadow-sm'
                              : 'bg-[#F7F7F2] text-[#172B2A] border-[#E5E9E5] hover:border-[#176B55]/50'
                          }`}
                        >
                          {pop}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2B: Travel Dates, Duration & Travellers */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E9E5] shadow-sm space-y-6">
                  <div className="flex items-center gap-2.5 border-b border-[#E5E9E5] pb-4">
                    <div className="p-2 rounded-xl bg-[#176B55]/10 text-[#176B55]">
                      <TbCalendar className="w-5 h-5 text-[#176B55]" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-[#172B2A]">2. Duration & Travellers</h2>
                      <p className="text-xs text-[#697773]">Set your schedule and party size</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Duration Counter */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#697773]">
                        Trip Duration
                      </label>
                      <div className="flex items-center justify-between bg-[#F7F7F2] border border-[#E5E9E5] rounded-2xl p-2 h-[52px]">
                        <button
                          type="button"
                          onClick={() => setDuration((d) => Math.max(1, d - 1))}
                          className="w-9 h-9 rounded-xl bg-white border border-[#E5E9E5] flex items-center justify-center text-[#172B2A] hover:bg-[#F7F7F2] active:scale-95 transition-all"
                        >
                          <TbMinus className="w-4 h-4" />
                        </button>
                        <span className="font-extrabold text-sm text-[#172B2A]">
                          {duration} {duration === 1 ? 'Day' : 'Days'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setDuration((d) => Math.min(14, d + 1))}
                          className="w-9 h-9 rounded-xl bg-white border border-[#E5E9E5] flex items-center justify-center text-[#172B2A] hover:bg-[#F7F7F2] active:scale-95 transition-all"
                        >
                          <TbPlus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Start Date */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#697773]">
                        Departure Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 rounded-2xl border border-[#E5E9E5] bg-[#F7F7F2] text-sm font-semibold text-[#172B2A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176B55] focus:border-transparent h-[52px] transition-all"
                      />
                    </div>

                    {/* Travellers Picker */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#697773]">
                        Travellers
                      </label>
                      <div className="flex items-center justify-between bg-[#F7F7F2] border border-[#E5E9E5] rounded-2xl px-3 h-[52px] text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#697773] font-medium">Adults:</span>
                          <span className="font-bold text-[#172B2A]">{adults}</span>
                          <div className="flex flex-col ml-1">
                            <button
                              type="button"
                              onClick={() => setAdults((a) => Math.min(10, a + 1))}
                              className="text-[#176B55] hover:opacity-80"
                            >
                              <TbPlus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setAdults((a) => Math.max(1, a - 1))}
                              className="text-[#697773] hover:text-[#172B2A]"
                            >
                              <TbMinus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="w-px h-6 bg-[#E5E9E5]" />

                        <div className="flex items-center gap-1.5">
                          <span className="text-[#697773] font-medium">Kids:</span>
                          <span className="font-bold text-[#172B2A]">{children}</span>
                          <div className="flex flex-col ml-1">
                            <button
                              type="button"
                              onClick={() => setChildren((c) => Math.min(8, c + 1))}
                              className="text-[#176B55] hover:opacity-80"
                            >
                              <TbPlus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setChildren((c) => Math.max(0, c - 1))}
                              className="text-[#697773] hover:text-[#172B2A]"
                            >
                              <TbMinus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 2C: Budget Selection */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E9E5] shadow-sm space-y-5">
                  <div className="flex items-center gap-2.5 border-b border-[#E5E9E5] pb-4">
                    <div className="p-2 rounded-xl bg-[#176B55]/10 text-[#176B55]">
                      <TbWallet className="w-5 h-5 text-[#176B55]" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-[#172B2A]">3. Budget Style</h2>
                      <p className="text-xs text-[#697773]">Select your preferred spending comfort</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {BUDGET_TIERS.map((tier) => {
                      const isSelected = budgetTier === tier.id;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => setBudgetTier(tier.id)}
                          className={`p-4 rounded-2xl border text-left transition-all relative ${
                            isSelected
                              ? 'border-[#176B55] bg-[#176B55]/5 shadow-sm'
                              : 'border-[#E5E9E5] bg-white hover:border-[#697773]/40'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm text-[#172B2A]">{tier.label}</span>
                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-[#176B55] text-white flex items-center justify-center">
                                <TbCheck className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-extrabold text-[#176B55] mt-0.5">{tier.range}</div>
                          <p className="text-[11px] text-[#697773] mt-2 leading-relaxed">{tier.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2D: Travel Preferences (Cards/Chips) */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E9E5] shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-[#E5E9E5] pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-[#176B55]/10 text-[#176B55]">
                        <TbCompass className="w-5 h-5 text-[#176B55]" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-[#172B2A]">4. Travel Preferences</h2>
                        <p className="text-xs text-[#697773]">Choose what interests you most</p>
                      </div>
                    </div>
                    <span className="text-xs text-[#697773] font-medium hidden sm:inline">Select multiple</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {PREFERENCE_OPTIONS.map((item) => {
                      const Icon = item.icon;
                      const isSelected = selectedPreferences.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => togglePreference(item.id)}
                          className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#176B55] bg-[#176B55]/5 text-[#176B55] shadow-sm ring-1 ring-[#176B55]'
                              : 'border-[#E5E9E5] bg-white text-[#697773] hover:border-[#176B55]/40'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Icon className={`w-5 h-5 ${isSelected ? 'text-[#176B55]' : 'text-[#697773]'}`} />
                            {isSelected && <TbCheck className="w-4 h-4 text-[#176B55]" />}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-[#172B2A]">{item.label}</div>
                            <div className="text-[10px] text-[#697773] mt-0.5">{item.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2E: AI Natural Language Prompt (Main Highlight) */}
                <div className="bg-gradient-to-br from-white via-white to-[#176B55]/10 rounded-3xl p-6 sm:p-8 border-2 border-[#176B55]/20 shadow-md space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-2xl bg-[#176B55] text-white shadow-md shadow-[#176B55]/20">
                      <TbSparkles className="w-6 h-6 text-[#52C7B0]" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-extrabold text-[#172B2A]">
                        Your Journey, Powered by AI
                      </h3>
                      <p className="text-xs sm:text-sm text-[#697773]">
                        Personalized travel ideas, thoughtfully organized around your preferences.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Plan a 4-day trip to Manali with scenic mountain views, local food, adventure activities, and a moderate budget."
                      className="w-full px-4 py-3.5 rounded-2xl border border-[#E5E9E5] bg-white text-sm text-[#172B2A] placeholder-[#697773]/60 focus:outline-none focus:ring-2 focus:ring-[#176B55] focus:border-transparent transition-all shadow-inner"
                    />

                    {/* Quick Prompt Ideas */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-[#697773] uppercase tracking-wider">Try an idea:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {PROMPT_SUGGESTIONS.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleApplySuggestion(s)}
                            className="text-[11px] text-left px-3 py-1 rounded-full bg-white border border-[#E5E9E5] hover:border-[#176B55] hover:text-[#176B55] transition-all truncate max-w-full"
                          >
                            &ldquo;{s.slice(0, 52)}...&rdquo;
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Primary Generation Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      className="w-full py-4 px-6 rounded-2xl bg-[#176B55] hover:bg-[#135946] text-white font-extrabold text-base transition-all shadow-lg shadow-[#176B55]/25 active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      <TbWand className="w-5 h-5 text-[#52C7B0]" />
                      Generate My Itinerary
                      <TbArrowRight className="w-5 h-5 text-white/80" />
                    </button>
                    <div className="flex items-center justify-center gap-2 text-[11px] text-[#697773] mt-2.5">
                      <TbShieldCheck className="w-3.5 h-3.5 text-[#176B55]" />
                      Synthesizes destination, duration, budget, and local timing into a day-by-day plan.
                    </div>
                  </div>
                </div>

              </form>

              {/* Right Column: Live Plan Summary & Cinematic Destination Card */}
              <aside className="lg:col-span-4 space-y-6">
                
                {/* Cinematic Destination Preview Card */}
                <div className="bg-white rounded-3xl border border-[#E5E9E5] overflow-hidden shadow-sm">
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    <img
                      src={destinationPreviewUrl}
                      alt={destination || 'Voynex travel destination'}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#176B55] inline-block mb-1">
                        Curated Escape
                      </span>
                      <h4 className="text-lg font-bold truncate">
                        {destination ? destination : 'Discover Your Next Journey'}
                      </h4>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#697773] border-b border-[#E5E9E5] pb-2">
                      Trip Overview
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between py-1">
                        <span className="text-[#697773]">Target:</span>
                        <span className="font-bold text-[#172B2A]">{destination || 'Select above'}</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-[#697773]">Duration:</span>
                        <span className="font-bold text-[#172B2A]">{duration} Days</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-[#697773]">Departure:</span>
                        <span className="font-bold text-[#172B2A]">{startDate}</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-[#697773]">Party:</span>
                        <span className="font-bold text-[#172B2A]">{adults + children} Travellers</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-[#697773]">Budget Comfort:</span>
                        <span className="font-bold text-[#176B55]">{budgetTier}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-[#697773] uppercase tracking-wider block mb-2">
                        Active Themes:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedPreferences.map((p) => (
                          <span
                            key={p}
                            className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-[#176B55]/10 text-[#176B55]"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* VOYNEX Quality Guarantee */}
                <div className="bg-[#176B55]/5 border border-[#176B55]/20 rounded-3xl p-6 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#176B55]">
                    <TbShieldCheck className="w-5 h-5 text-[#176B55]" />
                    Verified Local Accuracy
                  </div>
                  <p className="text-xs text-[#697773] leading-relaxed">
                    Every itinerary is balanced with realistic transit windows, day-to-evening pacing, and trusted local highlights.
                  </p>
                </div>

              </aside>
            </motion.div>
          )}

          {/* ================= STATE 2: LOADING SKELETON ================= */}
          {state === 'loading' && (
            <motion.div
              key="loading-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white rounded-3xl border border-[#E5E9E5] p-8 sm:p-14 shadow-sm text-center max-w-2xl mx-auto space-y-8"
            >
              <div className="relative h-24 w-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-[#E5E9E5]" />
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#176B55] border-r-[#52C7B0]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                />
                <TbWand className="w-8 h-8 text-[#176B55] absolute inset-0 m-auto animate-pulse" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-[#172B2A] mb-3">
                  Crafting Your {destination} Itinerary
                </h2>
                <div className="h-7 overflow-hidden max-w-md mx-auto relative">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadingStep}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm font-semibold text-[#176B55] absolute inset-0 w-full"
                    >
                      {LOADING_STEPS[loadingStep]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              {/* Skeleton Cards Preview */}
              <div className="space-y-4 pt-4 border-t border-[#E5E9E5]/60 opacity-40 text-left">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 items-center p-3 rounded-2xl bg-[#F7F7F2] animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-[#E5E9E5] flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-[#E5E9E5] rounded w-1/3" />
                      <div className="h-2.5 bg-[#E5E9E5] rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ================= STATE 3: RESULTS ITINERARY ================= */}
          {state === 'results' && (
            <motion.div
              key="results-view"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-6"
            >
              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-3xl p-4 sm:p-6 border border-[#E5E9E5] shadow-sm">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#176B55] hover:text-[#135946] px-4 py-2 rounded-xl bg-[#176B55]/10 hover:bg-[#176B55]/15 transition-all"
                >
                  <TbChevronLeft className="w-4 h-4" /> Edit Preferences
                </button>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {/* Download PDF */}
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        generateItineraryPDF({
                          destination,
                          duration,
                          budget: budgetTier,
                          vibe: selectedPreferences.join(', '),
                          planText: aiPlan,
                        });
                        showToast('PDF downloaded successfully!', 'success');
                      } catch {
                        showToast('Failed to generate PDF. Please try again.', 'error');
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#176B55] hover:bg-[#135946] text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <TbDownload className="w-4 h-4" /> Download PDF
                  </button>

                  {/* Save to Account */}
                  <button
                    type="button"
                    disabled={saving || saved}
                    onClick={() => {
                      setSaving(true);
                      api.post('/ai/plans', {
                        destination,
                        durationDays: Number(duration),
                        budget: budgetTier,
                        travelers: String(adults + children),
                        itinerary: { text: aiPlan },
                      })
                        .then(() => {
                          setSaved(true);
                          showToast('Itinerary saved to your account!', 'success');
                        })
                        .catch((err) => {
                          showToast(err.message || 'Please log in to save your trip.', 'error');
                        })
                        .finally(() => setSaving(false));
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#176B55] text-[#176B55] hover:bg-[#176B55]/5 text-xs font-bold transition-all disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : saved ? '✓ Saved to Account' : 'Save Itinerary'}
                  </button>

                  {/* Share Link */}
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                        showToast('Link copied to clipboard!', 'info');
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#E5E9E5] hover:bg-[#F7F7F2] text-xs font-semibold text-[#172B2A] transition-all"
                  >
                    <TbShare className="w-4 h-4 text-[#697773]" /> Share
                  </button>
                </div>
              </div>

              {/* Destination Header Banner */}
              <div className="relative rounded-3xl overflow-hidden h-56 sm:h-72 border border-[#E5E9E5] shadow-sm">
                <img
                  src={destinationPreviewUrl}
                  alt={destination}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#52C7B0]">
                    Personalized AI Itinerary
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black">{destination}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-white/80 pt-1">
                    <span>{duration} Days Trip</span>
                    <span>&bull;</span>
                    <span>{budgetTier} Comfort</span>
                    <span>&bull;</span>
                    <span>{adults + children} Travellers</span>
                  </div>
                </div>
              </div>

              {/* Structured Itinerary Renderer */}
              <AIItineraryDisplay
                itineraryText={aiPlan}
                destination={destination}
                duration={duration}
                budget={budgetTier}
                vibe={selectedPreferences.join(', ')}
              />
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}
