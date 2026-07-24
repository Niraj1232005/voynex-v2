'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGrid, FiMap, FiCalendar, FiTruck, FiBarChart2, FiUsers, FiStar, FiCreditCard, FiMenu, FiX, FiChevronRight, FiLogOut } from 'react-icons/fi';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

const NAV_ITEMS = [
  { href: '/agency', label: 'Dashboard', icon: FiGrid },
  { href: '/agency/trips', label: 'Trips', icon: FiMap },
  { href: '/agency/bookings', label: 'Bookings', icon: FiCalendar },
  { href: '/agency/rentals', label: 'Rentals', icon: FiTruck },
  { href: '/agency/analytics', label: 'Analytics', icon: FiBarChart2 },
  { href: '/agency/team', label: 'Team', icon: FiUsers },
  { href: '/agency/reviews', label: 'Reviews', icon: FiStar },
  { href: '/agency/subscription', label: 'Subscription', icon: FiCreditCard },
];

function AgencyLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const [organization, setOrganization] = useState<any>(null);
  const [loadingOrg, setLoadingOrg] = useState(true);

  useEffect(() => {
    api.get('/organizations/profile')
      .then(res => {
        setOrganization(res);
      })
      .catch(err => {
        console.error('Error fetching org profile:', err);
      })
      .finally(() => {
        setLoadingOrg(false);
      });
  }, []);

  if (loadingOrg) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (organization && !organization.isApproved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] w-full px-4 text-center">
        <div className="max-w-md p-8 rounded-3xl border border-border bg-card shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 pointer-events-none" />
          <div className="h-16 w-16 bg-yellow-500/10 text-yellow-500 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto">⏳</div>
          <h2 className="text-2xl font-bold mb-3">Onboarding Pending Approval</h2>
          <p className="text-sm text-muted leading-relaxed mb-6">
            Thank you for registering <strong>{organization.name}</strong>! Your travel agency account is currently under review by our platform administrators.
          </p>
          <div className="p-4 rounded-xl bg-surface-hover border border-border/50 text-xs text-muted text-left mb-6">
            <p className="font-semibold mb-1">Status Checklist:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Account Registration: Completed</li>
              <li>Organization Provisioning: Completed</li>
              <li>Platform Admin Review: In Progress</li>
            </ul>
          </div>
          <button onClick={() => logout()} className="px-6 py-2.5 rounded-xl border border-border hover:bg-surface-hover font-semibold text-sm transition-all tap-target flex items-center justify-center gap-2 mx-auto">
            <FiLogOut /> Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-surface flex-shrink-0">
        <div className="px-5 py-6 border-b border-border">
          <h2 className="text-lg font-bold gradient-text">Agency Portal</h2>
          <p className="text-xs text-muted mt-0.5">{organization?.name || 'Himalayan Trails'}</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || (item.href !== '/agency' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted hover:bg-surface-hover hover:text-foreground'
                }`}>
                <item.icon size={18} className={isActive ? 'text-primary' : 'text-muted group-hover:text-foreground'} />
                {item.label}
                {isActive && <FiChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-border space-y-2">
          <div className="px-3 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-teal/10">
            <p className="text-xs font-medium">Pro Plan</p>
            <p className="text-[10px] text-muted mt-0.5">15 trips · 5 team members</p>
            <Link href="/agency/subscription" className="text-[10px] text-primary font-medium hover:underline mt-1 inline-block">
              Upgrade →
            </Link>
          </div>
          <div className="flex items-center justify-between px-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-teal flex items-center justify-center text-[10px] text-white font-bold">{user?.name?.charAt(0).toUpperCase() || 'A'}</div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{user?.name || 'Agency'}</p>
                <p className="text-[10px] text-muted truncate">{user?.email || 'agency@voynex.com'}</p>
              </div>
            </div>
            <button onClick={() => logout()} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors flex-shrink-0" title="Logout">
              <FiLogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between h-14 px-4 border-b border-border bg-surface sticky top-16 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-muted hover:text-foreground rounded-lg transition-colors">
              <FiMenu size={20} />
            </button>
            <span className="font-bold text-sm gradient-text">Agency Portal</span>
          </div>
          <span className="text-xs text-muted font-medium truncate max-w-[150px]">{organization?.name || 'Himalayan Trails'}</span>
        </header>

        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black/60 z-40 lg:hidden" />
              <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.2 }}
                className="fixed inset-y-0 left-0 w-64 bg-surface border-r border-border flex flex-col z-50 lg:hidden py-4">
                <div className="flex items-center justify-between px-5 pb-4 border-b border-border">
                  <span className="font-bold text-lg gradient-text">Agency Portal</span>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 text-muted hover:text-foreground rounded-lg transition-colors">
                    <FiX size={20} />
                  </button>
                </div>
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                  {NAV_ITEMS.map(item => {
                    const isActive = pathname === item.href || (item.href !== '/agency' && pathname.startsWith(item.href));
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                          isActive ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-surface-hover hover:text-foreground'
                        }`}>
                        <item.icon size={18} className={isActive ? 'text-primary' : 'text-muted group-hover:text-foreground'} />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
                <div className="px-3 pt-4 border-t border-border space-y-2">
                  <div className="flex items-center justify-between px-2 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-teal flex items-center justify-center text-[10px] text-white font-bold">{user?.name?.charAt(0).toUpperCase() || 'A'}</div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{user?.name || 'Agency'}</p>
                        <p className="text-[10px] text-muted truncate">{user?.email || 'agency@voynex.com'}</p>
                      </div>
                    </div>
                    <button onClick={() => { setSidebarOpen(false); logout(); }} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors flex-shrink-0" title="Logout">
                      <FiLogOut size={16} />
                    </button>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 p-6 overflow-y-auto bg-background/50">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['agency']}>
      <AgencyLayoutInner>{children}</AgencyLayoutInner>
    </ProtectedRoute>
  );
}
