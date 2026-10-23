'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '@/types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  getItemQuantity: (productId: string) => number;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('voynex_cart');
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('voynex_cart', JSON.stringify(items));
  }, [items]);

  const getProductId = (p: any): string => (p?._id || p?.id || '') as string;

  const addToCart = (product: any) => {
    const targetId = getProductId(product);
    if (!targetId) return;

    setItems(prev => {
      const existing = prev.find(i => getProductId(i.product) === targetId);
      if (existing) {
        return prev.map(i =>
          getProductId(i.product) === targetId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          product: {
            ...product,
            _id: targetId,
            id: targetId,
            name: product.title || product.name,
            price: Number(product.price || 0),
          },
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (productId: string) =>
    setItems(prev => prev.filter(i => getProductId(i.product) !== productId));

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      return removeFromCart(productId);
    }
    setItems(prev =>
      prev.map(i => (getProductId(i.product) === productId ? { ...i, quantity } : i))
    );
  };

  const getItemQuantity = (productId: string): number => {
    const found = items.find(i => getProductId(i.product) === productId);
    return found ? found.quantity : 0;
  };

  const clearCart = () => setItems([]);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + (Number(i.product.price) || 0) * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        getItemQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
