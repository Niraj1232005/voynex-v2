'use client';
import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiPackage, FiMapPin } from 'react-icons/fi';
import { api } from '@/lib/api';

export default function AgencyRentalsPage() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRental, setEditingRental] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'gear',
    description: '',
    pricePerDay: '',
    deposit: '',
    location: '',
    image: '',
  });

  useEffect(() => {
    fetchAgencyRentals();
  }, []);

  const fetchAgencyRentals = () => {
    setLoading(true);
    api.get('/rentals/agency')
      .then(res => {
        if (Array.isArray(res)) setRentals(res);
      })
      .catch(err => console.error('Error fetching agency rentals:', err))
      .finally(() => setLoading(false));
  };

  const openCreateModal = () => {
    setEditingRental(null);
    setFormData({
      title: '',
      category: 'gear',
      description: '',
      pricePerDay: '',
      deposit: '',
      location: '',
      image: '',
    });
    setShowModal(true);
  };

  const openEditModal = (rental: any) => {
    setEditingRental(rental);
    setFormData({
      title: rental.title || rental.name || '',
      category: rental.category || rental.type || 'gear',
      description: rental.description || '',
      pricePerDay: String(rental.pricePerDay || rental.price || ''),
      deposit: String(rental.deposit || ''),
      location: rental.location || '',
      image: rental.images && rental.images[0] ? rental.images[0] : '',
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      category: formData.category,
      description: formData.description,
      pricePerDay: Number(formData.pricePerDay),
      deposit: Number(formData.deposit || 0),
      location: formData.location,
      images: formData.image ? [formData.image] : [],
    };

    if (editingRental) {
      api.put(`/rentals/${editingRental._id || editingRental.id}`, payload)
        .then(() => {
          setShowModal(false);
          fetchAgencyRentals();
        })
        .catch(err => alert(err.message || 'Failed to update rental item'));
    } else {
      api.post('/rentals', payload)
        .then(() => {
          setShowModal(false);
          fetchAgencyRentals();
        })
        .catch(err => alert(err.message || 'Failed to create rental item'));
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this rental item?')) return;
    api.delete(`/rentals/${id}`)
      .then(() => setRentals(prev => prev.filter(r => (r._id || r.id) !== id)))
      .catch(err => alert(err.message || 'Failed to delete rental item'));
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
          <h1 className="text-2xl font-bold">Rental Management</h1>
          <p className="text-sm text-muted">Manage equipment, vehicles, and items available for traveler rental</p>
        </div>
        <button onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-md hover:bg-primary/90 transition-all">
          <FiPlus size={18} /> Add Rental Item
        </button>
      </div>

      {rentals.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-2xl bg-card text-center text-muted">
          <FiPackage size={40} className="mb-3 text-muted/60" />
          <p className="font-semibold text-base">No rental items found</p>
          <p className="text-sm text-muted/60 mt-1">Click &quot;Add Rental Item&quot; to list your first equipment or vehicle.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rentals.map(r => (
            <div key={r._id || r.id} className="p-5 rounded-2xl border border-border bg-card flex flex-col justify-between hover:shadow-lg transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold capitalize">
                    {r.category || r.type || 'gear'}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => openEditModal(r)} className="p-1.5 text-muted hover:text-primary rounded-lg hover:bg-muted transition-colors">
                      <FiEdit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(r._id || r.id)} className="p-1.5 text-muted hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 items-start mb-3">
                  {r.images && r.images[0] ? (
                    <img src={r.images[0]} alt={r.title || r.name} className="w-16 h-16 rounded-xl object-cover border border-border" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-2xl">🎒</div>
                  )}
                  <div>
                    <h3 className="font-bold text-base text-foreground line-clamp-1">{r.title || r.name}</h3>
                    <p className="text-xs text-muted flex items-center gap-1 mt-1">
                      <FiMapPin size={12} /> {r.location || 'Pan-India'}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-muted line-clamp-2 mb-4">{r.description}</p>
              </div>

              <div className="border-t border-border/60 pt-3 flex items-center justify-between">
                <div>
                  <span className="text-lg font-black text-foreground">₹{r.pricePerDay || r.price}</span>
                  <span className="text-[10px] text-muted"> / day</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${r.isAvailable !== false ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                  {r.isAvailable !== false ? 'Available' : 'Rented Out'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold">{editingRental ? 'Edit Rental Item' : 'Add New Rental Item'}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted block mb-1">Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Trekking Backpack 65L" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm">
                    <option value="gear">Gear</option>
                    <option value="vehicle">Vehicle</option>
                    <option value="electronics">Electronics</option>
                    <option value="apparel">Apparel</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Price Per Day (₹)</label>
                  <input required type="number" value={formData.pricePerDay} onChange={e => setFormData({ ...formData, pricePerDay: e.target.value })}
                    placeholder="350" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Security Deposit (₹)</label>
                  <input type="number" value={formData.deposit} onChange={e => setFormData({ ...formData, deposit: e.target.value })}
                    placeholder="1000" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Location</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Manali, HP" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted block mb-1">Image URL</label>
                <input type="url" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..." className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm" />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted block mb-1">Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Item details, condition, specs..." className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-semibold text-muted hover:bg-muted rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90">
                  {editingRental ? 'Update Item' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}