'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TbCoin, TbMapPin, TbWand, TbChevronLeft, TbCheck, TbTrendingDown, TbPlane, TbBuilding, TbGlass, TbTicket, TbDots, TbStarFilled } from 'react-icons/tb';
import Breadcrumbs from '@/components/Breadcrumbs';
import { api } from '@/lib/api';

type BudgetState = 'form' | 'loading' | 'results';

export default function BudgetPlannerPage() {
  const [state, setState] = useState<BudgetState>('form');
  const [selectedTrip, setSelectedTrip] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [isDrawing, setIsDrawing] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);

  useEffect(() => {
    api.get('/trips')
      .then(res => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setTrips(list);
      })
      .catch(err => console.error('Error fetching trips for budget planner:', err));
  }, []);

  useEffect(() => {
    if (state === 'loading') {
      setIsDrawing(true);
      const t = setTimeout(() => setState('results'), 2500);
      return () => clearTimeout(t);
    }
  }, [state]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip || !budgetAmount) return;
    setState('loading');
  };

  const handleReset = () => {
    setState('form');
  };

  // Mock calculation
  const totalBudget = parseInt(budgetAmount) || 50000;
  const estimatedCost = totalBudget * 0.85; // Example: estimated cost is 85% of budget
  
  const categories = [
    { name: 'Flights & Transit', percent: 30, icon: TbPlane, color: 'bg-blue-500' },
    { name: 'Accommodation', percent: 40, icon: TbBuilding, color: 'bg-teal-500' },
    { name: 'Food & Dining', percent: 15, icon: TbGlass, color: 'bg-orange-500' },
    { name: 'Activities', percent: 10, icon: TbTicket, color: 'bg-purple-500' },
    { name: 'Misc & Souvenirs', percent: 5, icon: TbDots, color: 'bg-gray-400' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <Breadcrumbs />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange/10 text-orange mb-4 shadow-inner">
            <TbCoin size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">AI Budget Planner</h1>
          <p className="text-muted max-w-xl mx-auto">Optimize your travel expenses with AI-driven insights and category breakdowns.</p>
        </div>

        <AnimatePresence mode="wait">
          {/* FORM STATE */}
          {state === 'form' && (
            <motion.form 
              key="form"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSubmit}
              className="bg-card rounded-3xl border border-border p-6 sm:p-10 shadow-2xl max-w-2xl mx-auto"
            >
              <div className="space-y-8">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold mb-3"><TbMapPin className="text-accent" /> Select Destination or Trip</label>
                  <select 
                    value={selectedTrip} 
                    onChange={e => setSelectedTrip(e.target.value)} 
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-border bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent tap-target" 
                  >
                    <option value="">Choose a destination...</option>
                    <option value="custom">Enter custom destination...</option>
                    {trips.map(t => <option key={t._id || t.id} value={t._id || t.id}>{t.title} ({t.destination})</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="flex items-center gap-2 text-sm font-bold mb-3">Currency</label>
                    <select 
                      value={currency} 
                      onChange={e => setCurrency(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl border border-border bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent tap-target font-bold"
                    >
                      <option value="INR">₹ INR</option>
                      <option value="USD">$ USD</option>
                      <option value="EUR">€ EUR</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 text-sm font-bold mb-3">Total Budget</label>
                    <input 
                      type="number" 
                      value={budgetAmount} 
                      onChange={e => setBudgetAmount(e.target.value)}
                      placeholder="e.g. 50000"
                      min="1000"
                      required
                      className="w-full px-5 py-4 rounded-2xl border border-border bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent tap-target"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <button 
                  type="submit"
                  disabled={!selectedTrip || !budgetAmount}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange to-pink-500 text-white font-bold text-lg hover:shadow-xl hover:shadow-orange/30 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:transform-none tap-target flex items-center justify-center gap-2"
                >
                  Analyze My Budget <TbWand size={20} />
                </button>
              </div>
            </motion.form>
          )}

          {/* LOADING STATE */}
          {state === 'loading' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-3xl border border-border p-10 sm:p-16 shadow-2xl text-center max-w-2xl mx-auto"
            >
              <h2 className="text-2xl font-bold mb-10">AI is crunching the numbers...</h2>
              
              {/* Animated Pie Chart drawing itself */}
              <div className="relative h-48 w-48 mx-auto mb-10">
                <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                  <motion.circle 
                    cx="50" cy="50" r="40" 
                    fill="transparent" 
                    stroke="var(--border)" 
                    strokeWidth="20" 
                  />
                  <motion.circle 
                    cx="50" cy="50" r="40" 
                    fill="transparent" 
                    stroke="var(--accent)" 
                    strokeWidth="20"
                    strokeDasharray="251.2"
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                </svg>
                <TbCoin size={40} className="absolute inset-0 m-auto text-accent animate-pulse" />
              </div>

              <div className="space-y-4 max-w-sm mx-auto text-left opacity-30">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-surface-hover animate-pulse" />
                    <div className="flex-1 h-3 rounded bg-surface-hover animate-pulse" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* RESULTS STATE */}
          {state === 'results' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            >
              <button onClick={handleReset} className="flex items-center gap-2 text-sm font-semibold text-muted hover:text-foreground transition-colors mb-8">
                <TbChevronLeft size={16} /> New Calculation
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Column: Breakdown */}
                <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-2xl p-6 sm:p-10">
                  <h2 className="text-2xl font-bold mb-6">Spend Breakdown</h2>
                  
                  <div className="flex items-center justify-between mb-8 p-6 rounded-2xl bg-surface-hover border border-border">
                    <div>
                      <p className="text-sm font-bold text-muted mb-1">Your Budget</p>
                      <p className="text-xl font-bold">{currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '€'}{totalBudget.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-muted mb-1">Estimated Cost</p>
                      <p className="text-2xl font-bold text-accent">{currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '€'}{estimatedCost.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {categories.map((cat, i) => {
                      const cost = estimatedCost * (cat.percent / 100);
                      return (
                        <div key={cat.name}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-md text-white ${cat.color}`}><cat.icon size={16} /></div>
                              <span className="font-bold text-sm">{cat.name} <span className="text-muted ml-1 font-medium">({cat.percent}%)</span></span>
                            </div>
                            <span className="font-bold text-sm">{currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '€'}{cost.toLocaleString()}</span>
                          </div>
                          <div className="h-2.5 w-full bg-surface rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${cat.percent}%` }}
                              transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                              className={`h-full ${cat.color}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: AI Insights */}
                <div className="space-y-6">
                  <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-2xl p-6 sm:p-10">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><TbWand className="text-accent" /> AI Cost-Saving Tips</h2>
                    <div className="space-y-4">
                      <div className="p-5 rounded-2xl bg-green-500/10 border border-green-500/20 flex gap-4">
                        <TbTrendingDown size={24} className="text-green-500 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-green-500 mb-1">Switch to a boutique hotel</h4>
                          <p className="text-sm font-medium">Instead of a 5-star chain, choose local boutique stays to save {currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '€'}{(totalBudget * 0.15).toLocaleString()} without compromising on quality.</p>
                        </div>
                      </div>
                      <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex gap-4">
                        <TbTrendingDown size={24} className="text-blue-500 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-blue-500 mb-1">Book flights on Tuesday</h4>
                          <p className="text-sm font-medium">Historical data shows flights to this destination are cheapest on Tuesdays, potentially saving you {currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '€'}{(totalBudget * 0.08).toLocaleString()}.</p>
                        </div>
                      </div>
                      <div className="p-5 rounded-2xl bg-orange/10 border border-orange/20 flex gap-4">
                        <TbTrendingDown size={24} className="text-orange flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-orange mb-1">Opt for public transit pass</h4>
                          <p className="text-sm font-medium">Getting a 3-day tourist travel pass is significantly cheaper than point-to-point taxis.</p>
                        </div>
                      </div>
                      <div className="p-5 rounded-2xl bg-surface border border-border relative overflow-hidden flex gap-4 opacity-75 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
                        <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px]" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 px-4 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/50 text-yellow-600 font-bold text-sm flex items-center gap-2 shadow-xl whitespace-nowrap">
                          <TbStarFilled size={16} /> Unlock with Gold
                        </div>
                        <TbTrendingDown size={24} className="text-muted flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-muted mb-1 flex items-center gap-2">Premium Hotel Partner Discount</h4>
                          <p className="text-sm font-medium blur-sm">Hidden tip text about saving 25% on luxury hotels by using partner codes available only to Gold members.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-accent/10 rounded-3xl border border-accent/20 p-6 sm:p-10 text-center flex flex-col items-center justify-center h-48">
                    <h3 className="font-bold text-xl mb-3 text-accent">Good News!</h3>
                    <p className="font-medium text-muted">Your estimated costs are well within your budget limit.</p>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
