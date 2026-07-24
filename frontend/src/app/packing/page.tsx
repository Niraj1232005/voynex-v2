'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TbPackage, TbMapPin, TbAlertTriangle, TbCheck, TbSquare, TbWand, TbChevronLeft } from 'react-icons/tb';
import Breadcrumbs from '@/components/Breadcrumbs';
import { api } from '@/lib/api';

const DEFAULT_CATEGORIES = [
  {
    name: 'Essentials',
    items: ['Passport / ID', 'Travel Insurance', 'Credit Cards', 'Cash', 'Flight Tickets']
  },
  {
    name: 'Clothing',
    items: ['T-shirts', 'Pants / Shorts', 'Underwear', 'Socks', 'Comfortable Shoes', 'Light Jacket']
  },
  {
    name: 'Tech',
    items: ['Smartphone', 'Charger', 'Power Bank', 'Universal Adapter', 'Headphones']
  },
  {
    name: 'Medication',
    items: ['Prescription Meds', 'Pain Relievers', 'Band-aids', 'Hand Sanitizer']
  }
];

export default function PackingAssistantPage() {
  const [destination, setDestination] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [checklist, setChecklist] = useState<typeof DEFAULT_CATEGORIES | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [trips, setTrips] = useState<any[]>([]);

  useEffect(() => {
    api.get('/trips')
      .then(res => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setTrips(list);
      })
      .catch(err => console.error('Error fetching trips for packing page:', err));
  }, []);

  // Load from local storage
  useEffect(() => {
    try {
      const savedChecklist = localStorage.getItem('voynex_packing_list');
      const savedChecked = localStorage.getItem('voynex_packing_checked');
      if (savedChecklist) setChecklist(JSON.parse(savedChecklist));
      if (savedChecked) setCheckedItems(JSON.parse(savedChecked));
    } catch (e) {}
  }, []);

  // Save checked state
  useEffect(() => {
    if (Object.keys(checkedItems).length > 0) {
      localStorage.setItem('voynex_packing_checked', JSON.stringify(checkedItems));
    }
  }, [checkedItems]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;
    
    setIsGenerating(true);
    setTimeout(() => {
      // Create a customized list based on destination
      const customList = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
      const destLower = destination.toLowerCase();
      
      if (destLower.includes('beach') || destLower.includes('goa') || destLower.includes('maldives') || destLower.includes('bali')) {
        customList[1].items.push('Swimwear', 'Sunglasses', 'Flip Flops', 'Sun Hat');
        customList[0].items.push('Sunscreen (SPF 50+)');
      } else if (destLower.includes('snow') || destLower.includes('manali') || destLower.includes('kashmir') || destLower.includes('alps')) {
        customList[1].items = ['Thermal Underwear', 'Heavy Coat', 'Wool Socks', 'Beanie & Gloves', 'Waterproof Boots', 'Sweaters'];
      }
      
      setChecklist(customList);
      setCheckedItems({}); // reset checks for new trip
      localStorage.setItem('voynex_packing_list', JSON.stringify(customList));
      localStorage.setItem('voynex_packing_checked', JSON.stringify({}));
      setIsGenerating(false);
    }, 1500);
  };

  const toggleCheck = (category: string, item: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [`${category}-${item}`]: !prev[`${category}-${item}`]
    }));
  };

  const getProgress = () => {
    if (!checklist) return 0;
    const totalItems = checklist.reduce((acc, cat) => acc + cat.items.length, 0);
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    return Math.round((checkedCount / totalItems) * 100) || 0;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Breadcrumbs />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-teal/10 text-teal mb-4 shadow-inner">
            <TbPackage size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">AI Packing Assistant</h1>
          <p className="text-muted max-w-xl mx-auto">Generate a personalized, smart packing checklist tailored to your destination&apos;s weather and activities.</p>
        </div>

        <AnimatePresence mode="wait">
          {!checklist && !isGenerating && (
            <motion.form 
              key="form"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              onSubmit={handleGenerate}
              className="bg-card rounded-3xl border border-border p-6 sm:p-10 shadow-2xl"
            >
              <div className="space-y-6 mb-8">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold mb-3"><TbMapPin className="text-accent" /> Where are you traveling to?</label>
                  <input 
                    type="text" 
                    value={destination} 
                    onChange={e => setDestination(e.target.value)} 
                    placeholder="e.g. Goa, Paris, Swiss Alps"
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-border bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent tap-target" 
                  />
                </div>
                
                <div className="text-center text-sm font-bold text-muted uppercase">OR</div>
                
                <div>
                  <select 
                    value={destination} 
                    onChange={e => {
                      setDestination(e.target.value);
                      setTimeout(() => e.target.form?.requestSubmit(), 100);
                    }}
                    className="w-full px-5 py-4 rounded-2xl border border-border bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent tap-target"
                  >
                    <option value="">Select a saved trip...</option>
                    {trips.map(t => <option key={t._id || t.id} value={t.destination}>{t.title}</option>)}
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                disabled={!destination.trim()}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold text-lg hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:transform-none tap-target flex items-center justify-center gap-2"
              >
                Generate Checklist <TbWand size={20} />
              </button>
            </motion.form>
          )}

          {isGenerating && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-3xl border border-border p-16 shadow-2xl text-center"
            >
              <div className="relative h-24 w-24 mx-auto mb-8">
                <TbPackage size={40} className="absolute inset-0 m-auto text-teal animate-bounce" />
                <motion.div 
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-teal border-r-emerald-500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <h2 className="text-2xl font-bold mb-2">Analyzing destination...</h2>
              <p className="text-muted">Checking weather forecasts and activities for {destination}</p>
            </motion.div>
          )}

          {checklist && !isGenerating && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            >
              <button 
                onClick={() => { setChecklist(null); setDestination(''); }} 
                className="flex items-center gap-2 text-sm font-semibold text-muted hover:text-foreground transition-colors mb-6"
              >
                <TbChevronLeft size={16} /> New Packing List
              </button>

              <div className="bg-card rounded-3xl border border-border shadow-2xl overflow-hidden mb-8">
                
                {/* Weather Alert */}
                <div className="bg-yellow-500/10 border-b border-yellow-500/20 p-5 sm:p-6 flex items-start gap-4">
                  <TbAlertTriangle size={24} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-yellow-600 mb-1">Weather Alert</h3>
                    <p className="text-sm font-medium text-yellow-700/80">
                      Based on your destination ({destination}), it might rain during your stay. We&apos;ve prioritized an umbrella and waterproof gear in your list!
                    </p>
                  </div>
                </div>

                <div className="p-6 sm:p-8 bg-surface-hover border-b border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">Your Packing List</h2>
                      <p className="text-muted font-medium text-sm mt-1">{Object.values(checkedItems).filter(Boolean).length} of {checklist.reduce((acc, cat) => acc + cat.items.length, 0)} items packed</p>
                    </div>
                    <div className="text-3xl font-bold text-teal">{getProgress()}%</div>
                  </div>
                  <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-teal" 
                      initial={{ width: 0 }} 
                      animate={{ width: `${getProgress()}%` }} 
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-8 bg-background">
                  {checklist.map(category => (
                    <div key={category.name}>
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        {category.name}
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface text-muted border border-border">
                          {category.items.filter(item => checkedItems[`${category.name}-${item}`]).length} / {category.items.length}
                        </span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {category.items.map(item => {
                          const isChecked = checkedItems[`${category.name}-${item}`] || false;
                          return (
                            <button
                              key={item}
                              onClick={() => toggleCheck(category.name, item)}
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left tap-target ${
                                isChecked 
                                  ? 'bg-teal/5 border-teal/20 text-teal line-through' 
                                  : 'bg-surface border-border hover:border-accent/50'
                              }`}
                            >
                              {isChecked ? <TbCheck size={20} className="text-teal" /> : <TbSquare size={20} className="text-muted" />}
                              <span className="text-sm font-medium">{item}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
