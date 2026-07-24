'use client';
import React, { useState, useEffect } from 'react';
import { FiMap, FiPlus, FiEdit, FiTrash2, FiX, FiInfo } from 'react-icons/fi';
import { api } from '@/lib/api';
import { Trip } from '@/types';

export default function AgencyTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(10000);
  const [durationDays, setDurationDays] = useState(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'moderate' | 'challenging'>('moderate');
  const [images, setImages] = useState('');
  const [activityType, setActivityType] = useState('');
  const [highlights, setHighlights] = useState('');
  const [included, setIncluded] = useState('');
  const [excluded, setExcluded] = useState('');
  const [startDates, setStartDates] = useState('');

  const fetchTrips = () => {
    setLoading(true);
    api.get('/trips')
      .then(res => {
        const dataArray = res && res.data ? res.data : Array.isArray(res) ? res : [];
        setTrips(dataArray);
      })
      .catch(err => console.error('Error fetching trips:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const openAddModal = () => {
    setEditingTrip(null);
    setTitle('');
    setDestination('');
    setDescription('');
    setPrice(10000);
    setDurationDays(5);
    setDifficulty('moderate');
    setImages('');
    setActivityType('');
    setHighlights('');
    setIncluded('');
    setExcluded('');
    setStartDates('');
    setModalOpen(true);
  };

  const openEditModal = (t: Trip) => {
    setEditingTrip(t);
    setTitle(t.title || '');
    setDestination(t.destination || '');
    setDescription(t.description || '');
    setPrice(t.price || 0);
    setDurationDays((t as any).durationDays || t.duration || 1);
    setDifficulty(t.difficulty || 'moderate');
    setImages(t.images?.join(', ') || '');
    setActivityType(t.activityType?.join(', ') || '');
    setHighlights(t.highlights?.join(', ') || '');
    setIncluded(t.included?.join(', ') || '');
    setExcluded(t.excluded?.join(', ') || '');
    setStartDates(t.startDates?.join(', ') || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawImagesList = images.split(',').map(s => s.trim()).filter(Boolean);
    for (const imgUrl of rawImagesList) {
      if (imgUrl.includes('unsplash.com/photos/')) {
        alert('Please paste a direct image URL (e.g. starting with https://images.unsplash.com/photo-), not an Unsplash webpage link.');
        return;
      }
    }

    const payload = {
      title,
      destination,
      description,
      price: Number(price),
      durationDays: Number(durationDays),
      difficulty,
      images: rawImagesList,
      activityType: activityType.split(',').map(s => s.trim()).filter(Boolean),
      highlights: highlights.split(',').map(s => s.trim()).filter(Boolean),
      included: included.split(',').map(s => s.trim()).filter(Boolean),
      excluded: excluded.split(',').map(s => s.trim()).filter(Boolean),
      startDates: startDates.split(',').map(s => s.trim()).filter(Boolean),
    };

    try {
      if (editingTrip) {
        const tripId = editingTrip._id || (editingTrip as any).id;
        await api.put(`/trips/${tripId}`, payload);
      } else {
        await api.post('/trips', payload);
      }
      setModalOpen(false);
      fetchTrips();
    } catch (err: any) {
      alert(err.message || 'Failed to save trip package');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;
    try {
      await api.delete(`/trips/${id}`);
      fetchTrips();
    } catch (err: any) {
      alert(err.message || 'Failed to delete trip');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Tour Packages</h1>
          <p className="text-sm text-muted">Create and manage your agency&apos;s active travel packages</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90 transition-all text-sm">
          <FiPlus size={16} /> List New Trip
        </button>
      </div>

      {trips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map(t => (
            <div key={t._id || (t as any).id} className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all">
              <div>
                {t.images && t.images[0] ? (
                  <img src={t.images[0]} alt={t.title} className="w-full h-44 object-cover border-b border-border" />
                ) : (
                  <div className="w-full h-44 bg-muted flex items-center justify-center text-muted text-4xl">🏔️</div>
                )}
                <div className="p-5">
                  <h3 className="font-bold truncate text-lg text-foreground" title={t.title}>{t.title}</h3>
                  <p className="text-xs text-muted mb-2">{t.destination} • {(t as any).durationDays || t.duration || 1} days</p>
                  <p className="text-xs text-muted line-clamp-2">{t.description}</p>
                </div>
              </div>

              <div className="p-5 border-t border-border/60 flex items-center justify-between mt-auto">
                <span className="font-black text-primary text-xl">₹{Number(t.price).toLocaleString()}</span>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(t)} className="p-2.5 bg-muted rounded-xl hover:text-primary transition-colors text-muted" title="Edit Trip">
                    <FiEdit size={16} />
                  </button>
                  <button onClick={() => handleDelete(t._id || (t as any).id)} className="p-2.5 bg-muted rounded-xl hover:text-red-500 transition-colors text-muted" title="Delete Trip">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-3xl border border-border border-dashed bg-card">
          <FiMap size={48} className="mx-auto text-muted mb-4 opacity-50" />
          <p className="font-bold text-lg mb-1">No trips listed yet</p>
          <p className="text-muted text-sm mb-6">Create your first tour package and reach travelers worldwide!</p>
          <button onClick={openAddModal} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-md">
            List a Trip
          </button>
        </div>
      )}

      {/* Add/Edit Modal with Sticky Header & Sticky Footer */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-2xl rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Sticky Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-card shrink-0">
              <h2 className="text-xl font-bold text-foreground">{editingTrip ? 'Edit Tour Package' : 'Add New Tour Package'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 text-muted hover:text-foreground rounded-lg hover:bg-muted transition-all">
                <FiX size={20} />
              </button>
            </div>

            {/* Scrollable Modal Form Body */}
            <form id="trip-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 max-h-[60vh]">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Trip Title</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Mystical Manali & Solang Valley"
                    className="w-full px-4 py-3 border border-border bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Destination</label>
                  <input type="text" value={destination} onChange={e => setDestination(e.target.value)} required placeholder="e.g. Manali, Himachal Pradesh"
                    className="w-full px-4 py-3 border border-border bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Difficulty</label>
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value as any)}
                    className="w-full px-4 py-3 border border-border bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="challenging">Challenging</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Price (₹)</label>
                  <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} required min={1}
                    className="w-full px-4 py-3 border border-border bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Duration (Days)</label>
                  <input type="number" value={durationDays} onChange={e => setDurationDays(Number(e.target.value))} required min={1}
                    className="w-full px-4 py-3 border border-border bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} required placeholder="Describe the trip schedule, views, experience details..." rows={3}
                  className="w-full px-4 py-3 border border-border bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-start gap-2.5 text-xs text-muted">
                <FiInfo size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <p>For comma-separated fields below, enter items separated by commas. E.g. <code>Item 1, Item 2, Item 3</code></p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Image URL(s)</label>
                <input type="text" value={images} onChange={e => setImages(e.target.value)} placeholder="https://images.unsplash.com/... , https://images..."
                  className="w-full px-4 py-3 border border-border bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Activity Types</label>
                  <input type="text" value={activityType} onChange={e => setActivityType(e.target.value)} placeholder="adventure, nature, beach"
                    className="w-full px-4 py-3 border border-border bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Trip Highlights</label>
                  <input type="text" value={highlights} onChange={e => setHighlights(e.target.value)} placeholder="Paragliding, River rafting, Local cafes"
                    className="w-full px-4 py-3 border border-border bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Inclusions</label>
                  <input type="text" value={included} onChange={e => setIncluded(e.target.value)} placeholder="Hotels, Transport, Breakfast & Dinner"
                    className="w-full px-4 py-3 border border-border bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Exclusions</label>
                  <input type="text" value={excluded} onChange={e => setExcluded(e.target.value)} placeholder="Flights, Personal shopping, Lunch"
                    className="w-full px-4 py-3 border border-border bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Departure Dates</label>
                <input type="text" value={startDates} onChange={e => setStartDates(e.target.value)} placeholder="2026-05-15, 2026-06-01"
                  className="w-full px-4 py-3 border border-border bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </form>

            {/* Sticky Modal Footer */}
            <div className="p-5 border-t border-border flex justify-end gap-3 bg-card shrink-0">
              <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-semibold transition-all">
                Cancel
              </button>
              <button type="submit" form="trip-form" className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all shadow-md">
                {editingTrip ? 'Save Changes' : 'Create Trip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}