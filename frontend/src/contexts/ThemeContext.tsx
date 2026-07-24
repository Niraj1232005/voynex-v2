/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const saved = localStorage.getItem('voynex_theme') as 'light' | 'dark' | null;
    if (saved) {
      setTheme(saved);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light');
    }
    // Default is already dark — best for capstone demo
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    
    // Add transition class for smooth theme switch
    root.style.setProperty('transition', 'background-color 0.4s ease, color 0.3s ease');
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('voynex_theme', theme);
  }, [theme, mounted]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
