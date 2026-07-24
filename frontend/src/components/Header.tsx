'use client';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import {
  TbSun, TbMoon, TbMenu2, TbX, TbShoppingCart, TbUser, TbLogout, TbChevronDown, TbChevronRight,
  TbCompass, TbMap, TbMapPin, TbCar, TbCpu, TbPackage, TbMessageCircle,
  TbShoppingBag, TbHeart, TbCalendar, TbSettings, TbUserPlus, TbGridDots, TbHome, TbCrown, TbReceipt, TbSearch
} from 'react-icons/tb';
import { motion, AnimatePresence } from 'framer-motion';

interface NavChild {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  onClick?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Dynamic Nav Structure
  const navStructure: NavItem[] = useMemo(() => {
    return [
      { label: 'Home', href: '/' },
      {
        label: 'Explore',
        href: '/explore',
        children: [
          { href: '/trips', label: 'Trips', description: 'Browse curated travel experiences', icon: TbCompass },
          { href: '/destinations', label: 'Destinations', description: 'Discover amazing places to visit', icon: TbMap },
          { href: '/rentals', label: 'Rentals', description: 'Rent bikes, cars & cameras', icon: TbCar },
        ],
      },
      {
        label: 'Plan My Trip',
        href: '/plan',
        children: [
          { href: '/ai-planner', label: 'AI Planner', description: 'Generate personalized itineraries', icon: TbCpu },
          { href: '/packing-assistant', label: 'Smart Packing', description: 'AI-powered packing checklists', icon: TbPackage },
          { href: '/chat', label: 'AI Chatbot', description: 'Chat with our AI travel expert', icon: TbMessageCircle },
        ],
      },
      {
        label: 'Marketplace',
        href: '/marketplace',
        children: [
          { href: '/shop', label: 'Shop', description: 'Premium travel gear & accessories', icon: TbShoppingBag },
          { href: '/rentals', label: 'Rentals', description: 'Rent gear at your destination', icon: TbCar },
        ],
      },
      {
        label: 'My Trips',
        href: '/my-trips',
        children: [
          { href: '/dashboard', label: 'Bookings', description: 'View & manage your bookings', icon: TbCalendar },
          { href: '/my-trips/saved', label: 'Saved Trips', description: 'Trips you\'ve saved for later', icon: TbHeart },
          { href: '/cart', label: 'Cart', description: 'Your shopping cart', icon: TbShoppingCart },
        ],
      },
      {
        label: 'Account',
        href: '/account',
        children: [
          ...(isAuthenticated
            ? [
                { href: '/profile', label: 'Profile', description: 'Manage your personal details', icon: TbUser },
                { href: '/settings', label: 'Settings', description: 'App preferences and billing', icon: TbSettings },
                { href: '/membership', label: 'Membership', description: 'View and upgrade your plan', icon: TbCrown },
                { href: '#', label: 'Logout', description: 'Sign out of your account', icon: TbLogout, onClick: logout },
              ]
            : [
                { href: '/login', label: 'Login / Signup', description: 'Access your account', icon: TbUserPlus },
                { href: '/settings', label: 'Settings', description: 'App preferences', icon: TbSettings },
                { href: '/membership', label: 'Membership', description: 'View travel plans', icon: TbCrown },
              ]),
        ],
      },
    ];
  }, [isAuthenticated, logout]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change (link click)
  const closeMobile = () => {
    setMobileOpen(false);
    setMobileAccordion(null);
  };

  const handleMenuEnter = (label: string) => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setActiveMenu(label);
  };

  const handleMenuLeave = () => {
    menuTimeoutRef.current = setTimeout(() => setActiveMenu(null), 150);
  };

  const toggleMobileAccordion = (label: string) => {
    setMobileAccordion(prev => prev === label ? null : label);
  };

  return (
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-teal font-bold text-white text-lg">
              V
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">VOYNEX</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5 justify-center flex-1 ml-8">
            {navStructure.map(item => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && handleMenuEnter(item.label)}
                onMouseLeave={() => item.children && handleMenuLeave()}
              >
                {item.children ? (
                  <button
                    onClick={() => setActiveMenu(prev => prev === item.label ? null : item.label)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all tap-target ${
                      activeMenu === item.label
                        ? 'text-accent bg-accent/5'
                        : 'text-muted hover:text-foreground hover:bg-surface-hover'
                    }`}
                  >
                    {item.label}
                    <TbChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${activeMenu === item.label ? 'rotate-180' : ''}`}
                    />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface-hover transition-all tap-target"
                  >
                    {item.label}
                  </Link>
                )}

                {/* Mega Menu Dropdown */}
                <AnimatePresence>
                  {item.children && activeMenu === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[340px] mega-menu p-2 z-50"
                      onMouseEnter={() => handleMenuEnter(item.label)}
                      onMouseLeave={handleMenuLeave}
                    >
                      <div className="px-3 pt-2 pb-1 mb-1 border-b border-border/50">
                        <Link
                          href={item.href}
                          onClick={() => setActiveMenu(null)}
                          className="text-[10px] font-bold uppercase tracking-wider text-accent hover:underline flex items-center gap-1"
                        >
                          Explore {item.label} <TbChevronRight size={12} />
                        </Link>
                      </div>
                      {item.children.map(child => {
                        const ChildComponent = child.onClick ? 'button' : Link;
                        const childProps = child.onClick ? { onClick: () => { child.onClick!(); setActiveMenu(null); } } : { href: child.href, onClick: () => setActiveMenu(null) };
                        return (
                          <ChildComponent
                            key={child.label}
                            {...childProps as any}
                            className="mega-menu-item group w-full text-left"
                          >
                            <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all">
                              <child.icon size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                                {child.label}
                              </p>
                              <p className="text-xs text-muted line-clamp-1">{child.description}</p>
                            </div>
                          </ChildComponent>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Search Icon */}
            <button
              aria-label="Search"
              onClick={() => {
                const searchInput = document.getElementById('global-search');
                if (searchInput) searchInput.focus();
              }}
              className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-all tap-target hidden sm:block"
            >
              <TbSearch size={20} />
            </button>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="relative p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-all tap-target overflow-hidden"
            >
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {theme === 'dark' ? <TbSun size={20} /> : <TbMoon size={20} />}
              </motion.div>
            </button>

            {/* Cart Icon in Nav with Badge */}
            <Link href="/cart" className="relative p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-all tap-target">
              <TbShoppingCart size={20} />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white shadow-sm"
                >
                  {totalItems > 9 ? '9+' : totalItems}
                </motion.span>
              )}
            </Link>

            {/* Profile Avatar (if authenticated) */}
            {isAuthenticated && user && (
              <Link href="/profile" className="hidden sm:flex h-8 w-8 ml-2 items-center justify-center rounded-full bg-gradient-to-br from-primary to-teal text-white text-xs font-bold shadow-sm hover:shadow-md transition-all tap-target">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-all tap-target">
              {mobileOpen ? <TbX size={24} /> : <TbMenu2 size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav — Accordion Style */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden overflow-hidden border-t border-border"
            >
              <div className="py-4 space-y-1">
                {navStructure.map(item => (
                  <div key={item.label}>
                    {item.children ? (
                      <>
                        {/* Accordion Toggle */}
                        <button
                          onClick={() => toggleMobileAccordion(item.label)}
                          className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium hover:bg-surface-hover transition-all tap-target text-left"
                        >
                          <span className="text-foreground">{item.label}</span>
                          <TbChevronDown
                            size={18}
                            className={`text-muted transition-transform duration-200 ${
                              mobileAccordion === item.label ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {/* Accordion Content */}
                        <AnimatePresence>
                          {mobileAccordion === item.label && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-4 pr-2 pb-2 space-y-1">
                                {/* Hub link */}
                                <Link
                                  href={item.href}
                                  onClick={closeMobile}
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-accent hover:bg-accent/5 transition-all"
                                >
                                  <TbGridDots size={16} />
                                  View All {item.label}
                                </Link>
                                {item.children.map(child => {
                                  const ChildComponent = child.onClick ? 'button' : Link;
                                  const childProps = child.onClick ? { onClick: () => { child.onClick!(); closeMobile(); } } : { href: child.href, onClick: closeMobile };
                                  return (
                                    <ChildComponent
                                      key={child.label}
                                      {...childProps as any}
                                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-surface-hover transition-all w-full text-left"
                                    >
                                      <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                                        <child.icon size={16} />
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm text-foreground">{child.label}</p>
                                        <p className="text-xs text-muted">{child.description}</p>
                                      </div>
                                    </ChildComponent>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={closeMobile}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-surface-hover transition-all tap-target text-foreground"
                      >
                        <TbHome size={18} className="text-accent" />
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
