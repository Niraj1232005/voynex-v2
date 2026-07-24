'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCpu, FiCheck, FiDownload, FiRotateCcw } from 'react-icons/fi';
import { PackingItem } from '@/types';
import Breadcrumbs from '@/components/Breadcrumbs';

function generatePackingList(destination: string, activities: string[], duration: number): PackingItem[] {
  const items: PackingItem[] = [];
  let id = 0;
  const add = (item: string, category: string) => items.push({ id: (++id).toString(), item, category, checked: false });

  ['Passport/ID', 'Travel insurance docs', 'Cash & cards', 'Phone charger', 'Power bank', 'Medications'].forEach(i => add(i, 'Essentials'));

  const cold = ['Manali', 'Ladakh', 'Shimla', 'Kashmir'].some(c => destination.toLowerCase().includes(c.toLowerCase()));
  const beach = ['Goa', 'Andaman', 'Kerala'].some(c => destination.toLowerCase().includes(c.toLowerCase()));

  if (cold) {
    ['Thermal innerwear', 'Fleece jacket', 'Waterproof jacket', 'Woolen socks (3 pairs)', 'Gloves', 'Beanie/cap', 'Trekking boots'].forEach(i => add(i, 'Clothing'));
  } else if (beach) {
    ['Swimsuit', 'Sunglasses', 'Flip flops', 'Light cotton clothes', 'Beach cover-up', 'Cap/hat'].forEach(i => add(i, 'Clothing'));
  }
  [`T-shirts (${Math.min(duration, 5)})`, `Pants/shorts (${Math.ceil(duration / 2)})`, 'Underwear', 'Comfortable walking shoes'].forEach(i => add(i, 'Clothing'));

  ['Sunscreen SPF 50+', 'Moisturizer', 'Toothbrush & paste', 'Shampoo (travel size)', 'Wet wipes', 'Hand sanitizer', 'Lip balm'].forEach(i => add(i, 'Toiletries'));

  if (activities.includes('trekking')) ['Trekking poles', 'Day backpack', 'Rain poncho', 'Energy bars', 'Water bottle'].forEach(i => add(i, 'Trekking Gear'));
  if (activities.includes('photography')) ['Camera', 'Extra batteries', 'Memory cards', 'Tripod', 'Lens cleaning kit'].forEach(i => add(i, 'Photography'));
  if (activities.includes('water-sports')) ['Waterproof phone pouch', 'Quick-dry towel', 'Water shoes', 'Waterproof bag'].forEach(i => add(i, 'Water Sports'));

  ['First aid kit', 'Prescription medicines', 'Insect repellent', 'ORS packets', 'Altitude sickness pills'].forEach(i => add(i, 'Health & Safety'));

  return items;
}

const ACTIVITIES = ['trekking', 'photography', 'water-sports', 'camping', 'sightseeing', 'shopping'];

export default function PackingAssistantPage() {
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(5);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [packingList, setPackingList] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleActivity = (a: string) => setSelectedActivities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const generate = async () => {
    if (!destination) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setPackingList(generatePackingList(destination, selectedActivities, duration));
    setLoading(false);
  };

  const toggleItem = (id: string) => setPackingList(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  const checkedCount = packingList.filter(i => i.checked).length;
  const categories = [...new Set(packingList.map(i => i.category))];

  const downloadPDF = () => {
    let content = `VOYNEX Packing Checklist\n${'='.repeat(40)}\nDestination: ${destination}\nDuration: ${duration} days\nActivities: ${selectedActivities.join(', ')}\n\n`;
    categories.forEach(cat => {
      content += `\n${cat}\n${'-'.repeat(30)}\n`;
      packingList.filter(i => i.category === cat).forEach(i => {
        content += `${i.checked ? '[✓]' : '[ ]'} ${i.item}\n`;
      });
    });
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `voynex-packing-${destination.toLowerCase()}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      <Breadcrumbs />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-4 pb-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <FiCpu size={14} /> AI-Powered
          </div>
          <h1 className="text-4xl font-bold">Packing Assistant</h1>
          <p className="text-muted mt-2">Never forget anything — get a smart, personalized packing checklist</p>
        </div>

        {packingList.length === 0 ? (
          loading ? (
            /* Skeleton Loading */
            <div className="max-w-lg mx-auto space-y-4">
              <div className="rounded-2xl border border-border bg-card p-8 space-y-4">
                <div className="text-center mb-2">
                  <div className="inline-flex items-center gap-2 text-sm text-accent font-medium">
                    <div className="h-5 w-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                    Generating your packing list...
                  </div>
                </div>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-5 w-5 skeleton rounded" />
                    <div className={`h-4 skeleton rounded`} style={{ width: `${40 + ((i * 15) % 40)}%` }} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="max-w-lg mx-auto rounded-2xl border border-border bg-card p-8 space-y-6">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Destination</label>
                <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g., Manali, Goa, Ladakh"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 tap-target" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Duration: {duration} days</label>
                <input type="range" min={1} max={30} value={duration} onChange={e => setDuration(+e.target.value)} className="w-full accent-accent" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Activities</label>
                <div className="flex flex-wrap gap-2">
                  {ACTIVITIES.map(a => (
                    <button key={a} onClick={() => toggleActivity(a)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all tap-target ${
                        selectedActivities.includes(a) ? 'bg-accent text-white' : 'bg-surface-hover text-muted'}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={generate} disabled={loading || !destination}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal to-primary text-white font-semibold disabled:opacity-50 hover:shadow-lg transition-all tap-target">
                🎒 Generate Packing List
              </button>
            </motion.div>
          )
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Progress */}
            <div className="rounded-2xl border border-border bg-card p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Progress: {checkedCount}/{packingList.length} items packed</h3>
                <div className="flex gap-2">
                  <button onClick={downloadPDF} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-sm font-medium hover:bg-accent hover:text-white transition-all tap-target">
                    <FiDownload size={14} /> Download
                  </button>
                  <button onClick={() => setPackingList([])} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-hover text-sm font-medium hover:bg-red-500/10 hover:text-red-500 transition-all tap-target">
                    <FiRotateCcw size={14} /> Reset
                  </button>
                </div>
              </div>
              <div className="h-3 rounded-full bg-surface-hover overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-teal to-primary transition-all duration-500"
                  style={{ width: `${(checkedCount / packingList.length) * 100}%` }} />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-6">
              {categories.map(cat => (
                <div key={cat} className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="font-semibold text-lg mb-3">{cat}</h3>
                  <div className="space-y-1">
                    {packingList.filter(i => i.category === cat).map(item => (
                      <button key={item.id} onClick={() => toggleItem(item.id)}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all hover:bg-surface-hover tap-target ${
                          item.checked ? 'line-through text-muted' : ''}`}>
                        <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          item.checked ? 'bg-accent border-accent text-white' : 'border-border'}`}>
                          {item.checked && <FiCheck size={12} />}
                        </div>
                        {item.item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
