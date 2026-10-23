'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiStar, FiSearch, FiPackage, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import Breadcrumbs from '@/components/Breadcrumbs';
import { api } from '@/lib/api';

const CATEGORIES = ['all', 'gear', 'clothing', 'accessories', 'electronics'];
const CATEGORY_EMOJI: Record<string, string> = { clothing: '🧥', gear: '⛺', accessories: '🕶️', electronics: '📱' };

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    api.get('/shop/products')
      .then(res => {
        if (Array.isArray(res)) {
          setProducts(res);
        }
      })
      .catch(err => {
        console.error('Error fetching shop products:', err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  };

  const filtered = useMemo(() => products.filter(p => {
    const pCategory = (p.category || 'gear').toLowerCase();
    const pTitle = (p.title || p.name || '').toLowerCase();
    const matchCat = category === 'all' || pCategory === category;
    const matchSearch = !search || pTitle.includes(search.toLowerCase());
    return matchCat && matchSearch;
  }), [products, category, search]);

  const handleAdd = (product: any) => {
    addToCart({
      ...product,
      _id: product._id || product.id,
      name: product.title || product.name,
    });
    setAddedId(product._id || product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="min-h-screen">
      <Breadcrumbs />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 pb-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Travel Gear Shop</h1>
          <p className="text-muted mt-2">Premium travel apparel, accessories, and expedition gear</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-all ${
                  category === c ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card border border-border hover:bg-muted/40'}`}>
                {c === 'all' ? '🌐 All' : `${CATEGORY_EMOJI[c] || '📦'} ${c}`}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-2xl bg-card text-center text-muted">
            <FiPackage size={40} className="mb-3 text-muted/60" />
            <p className="font-semibold text-base">No products match your search</p>
            <p className="text-sm text-muted/60 mt-1">Try clearing your filters or searching for something else.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((product, idx) => (
              <motion.div key={product._id || product.id || idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="h-48 bg-muted relative flex items-center justify-center overflow-hidden">
                    {product.images && product.images[0] ? (
                      <img src={product.images[0]} alt={product.title || product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <span className="text-5xl">{CATEGORY_EMOJI[product.category] || '🎒'}</span>
                    )}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
                      <FiStar size={12} className="fill-yellow-400 text-yellow-400" /> {product.rating || 4.8}
                    </div>
                  </div>
                  <div className="p-5">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                      {product.category || 'gear'}
                    </span>
                    <h3 className="font-bold text-base mt-2 mb-1 group-hover:text-primary transition-colors line-clamp-1">{product.title || product.name}</h3>
                    <p className="text-xs text-muted line-clamp-2 mb-3">{product.description}</p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between border-t border-border/60 mt-2">
                  <span className="text-xl font-black text-foreground">₹{(product.price || 0).toLocaleString()}</span>
                  {(() => {
                    const pId = product._id || product.id;
                    const qty = getItemQuantity(pId);
                    return qty > 0 ? (
                      <div className="flex items-center rounded-xl border border-primary/30 bg-primary/10 p-1 gap-1.5 shadow-xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(pId, qty - 1)}
                          className="h-7 w-7 rounded-lg bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted font-bold transition-all active:scale-95"
                          title="Decrease quantity (-1)"
                          aria-label="Decrease quantity"
                        >
                          <FiMinus size={13} />
                        </button>
                        <span className="font-mono font-bold text-xs text-primary min-w-[20px] text-center">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(pId, qty + 1)}
                          className="h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold hover:bg-primary/90 transition-all active:scale-95"
                          title="Increase quantity (+1)"
                          aria-label="Increase quantity"
                        >
                          <FiPlus size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAdd(product)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                          addedId === pId
                            ? 'bg-emerald-600 text-white'
                            : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        }`}
                      >
                        <FiShoppingCart size={14} />
                        {addedId === pId ? 'Added!' : 'Add to Cart'}
                      </button>
                    );
                  })()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
