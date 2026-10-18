'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TbWand, TbArrowRight, TbMapPin, TbCalendar, TbCoin, TbMoodSmile, TbCheck, TbInfoCircle, TbDownload, TbShare, TbChevronLeft } from 'react-icons/tb';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import AIItineraryDisplay from '@/components/AIItineraryDisplay';
import { generateItineraryPDF } from '@/lib/pdfGenerator';
import { useToast } from '@/contexts/ToastContext';

const VIBES = ['Relaxing', 'Adventurous', 'Cultural', 'Party', 'Romantic', 'Family Friendly'];
const LOADING_STEPS = [
  "Analyzing destination options...",
  "Finding hidden gems and local favorites...",
  "Optimizing routes for minimal travel time...",
  "Checking budget constraints...",
  "Finalizing your personalized itinerary..."
];

type PlannerState = 'form' | 'loading' | 'results';

export default function AIPlannerPage() {
  const { showToast } = useToast();
  const [state, setState] = useState<PlannerState>('form');
  const [loadingStep, setLoadingStep] = useState(0);
  
  // Form State
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('3');
  const [budget, setBudget] = useState('Moderate');
  const [vibe, setVibe] = useState('Adventurous');
  const [aiPlan, setAiPlan] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;
    setState('loading');
    setLoadingStep(0);

    let budgetNum = 30000;
    if (budget === 'Budget') budgetNum = 15000;
    else if (budget === 'Luxury') budgetNum = 100000;

    try {
      const res = await api.post('/ai/plan-trip', {
        budget: budgetNum,
        duration: parseInt(days) || 3,
        interests: [vibe],
        startDate: new Date().toISOString().split('T')[0],
        destination,
      });

      if (res && res.result) {
        setAiPlan(res.result);
      } else {
        setAiPlan('No response from AI planner. Please try again.');
      }
      setState('results');
    } catch (err: any) {
      showToast(err.message || 'Failed to generate AI trip plan', 'error');
      setState('form');
    }
  };

  const handleReset = () => {
    setState('form');
    setDestination('');
    setDays('3');
    setBudget('Moderate');
    setVibe('Adventurous');
    setAiPlan('');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Breadcrumbs />
      
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 shadow-inner">
            <TbWand size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">AI Trip Planner</h1>
          <p className="text-muted max-w-xl mx-auto">Tell us what you want, and our AI will generate a personalized day-by-day itinerary in seconds.</p>
        </div>

        <AnimatePresence mode="wait">
          {/* FORM STATE */}
          {state === 'form' && (
            <motion.form 
              key="form"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSubmit}
              className="bg-card rounded-3xl border border-border p-6 sm:p-10 shadow-2xl"
            >
              <div className="space-y-8">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold mb-3"><TbMapPin className="text-accent" /> Destination</label>
                  <input 
                    type="text" 
                    value={destination} 
                    onChange={e => setDestination(e.target.value)} 
                    placeholder="e.g. Bali, Paris, Tokyo or 'Anywhere'"
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-border bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent tap-target" 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold mb-3"><TbCalendar className="text-accent" /> How many days?</label>
                    <select 
                      value={days} 
                      onChange={e => setDays(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl border border-border bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent tap-target"
                    >
                      {[1,2,3,4,5,6,7,10,14].map(d => <option key={d} value={d}>{d} Days</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold mb-3"><TbCoin className="text-accent" /> Budget Level</label>
                    <select 
                      value={budget} 
                      onChange={e => setBudget(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl border border-border bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent tap-target"
                    >
                      {['Budget', 'Moderate', 'Luxury'].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold mb-3"><TbMoodSmile className="text-accent" /> Travel Vibe</label>
                  <div className="flex flex-wrap gap-3">
                    {VIBES.map(v => (
                      <button 
                        key={v} 
                        type="button"
                        onClick={() => setVibe(v)}
                        className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all tap-target border ${
                          vibe === v ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30' : 'bg-surface-hover border-border hover:border-muted text-foreground'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <button 
                  type="submit"
                  disabled={!destination.trim()}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-teal text-white font-bold text-lg hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:transform-none tap-target flex items-center justify-center gap-2"
                >
                  Generate My Itinerary <TbWand size={20} />
                </button>
              </div>
            </motion.form>
          )}

          {/* LOADING STATE */}
          {state === 'loading' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-3xl border border-border p-10 sm:p-16 shadow-2xl text-center"
            >
              <div className="relative h-24 w-24 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-surface-hover" />
                <motion.div 
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-teal"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                <TbWand size={32} className="absolute inset-0 m-auto text-primary animate-pulse" />
              </div>
              
              <h2 className="text-2xl font-bold mb-6">AI is thinking...</h2>
              
              <div className="h-6 overflow-hidden max-w-sm mx-auto relative">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingStep}
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-muted font-medium absolute inset-0 w-full"
                  >
                    {LOADING_STEPS[loadingStep]}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Skeleton Preview */}
              <div className="mt-12 opacity-30 pointer-events-none">
                <div className="h-6 w-1/3 bg-surface-hover rounded mx-auto mb-8 animate-pulse" />
                <div className="space-y-4 max-w-md mx-auto text-left">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex gap-4">
                      <div className="h-10 w-10 bg-surface-hover rounded-full flex-shrink-0 animate-pulse" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 w-3/4 bg-surface-hover rounded animate-pulse" />
                        <div className="h-3 w-1/2 bg-surface-hover rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* RESULTS STATE */}
          {state === 'results' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <button 
                  type="button"
                  onClick={handleReset} 
                  className="flex items-center gap-2 text-sm font-semibold text-muted hover:text-foreground transition-colors tap-target"
                >
                  <TbChevronLeft size={16} /> Edit Preferences
                </button>
                <div className="flex flex-wrap items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => {
                      try {
                        generateItineraryPDF({
                          destination,
                          duration: days,
                          budget,
                          vibe,
                          planText: aiPlan,
                        });
                        showToast('PDF downloaded successfully!', 'success');
                      } catch (err: any) {
                        showToast('Failed to generate PDF. Please try again.', 'error');
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-bold shadow-md hover:bg-accent/90 transition-all tap-target"
                  >
                    <TbDownload size={17} /> Download PDF
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      setSaving(true);
                      api.post('/ai/plans', {
                        destination,
                        durationDays: Number(days),
                        budget,
                        travelers: '1',
                        itinerary: { text: aiPlan },
                      })
                        .then(() => {
                          setSaved(true);
                          showToast('Itinerary saved to your account!', 'success');
                        })
                        .catch(err => {
                          showToast(err.message || 'Failed to save itinerary. Please log in first.', 'error');
                        })
                        .finally(() => setSaving(false));
                    }} 
                    disabled={saving || saved}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-md hover:bg-primary/90 transition-all disabled:opacity-60 tap-target"
                  >
                    {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Itinerary'}
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                        showToast('Link copied to clipboard!', 'info');
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-border text-sm font-semibold transition-colors tap-target"
                  >
                    <TbShare size={16} /> Share
                  </button>
                </div>
              </div>

              {/* Structured Itinerary Display */}
              <AIItineraryDisplay 
                itineraryText={aiPlan}
                destination={destination}
                duration={days}
                budget={budget}
                vibe={vibe}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
