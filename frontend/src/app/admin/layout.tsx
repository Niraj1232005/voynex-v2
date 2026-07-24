'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiUsers, FiBriefcase, FiMap, FiCalendar, FiStar,
  FiBarChart2, FiCreditCard, FiTruck, FiShield, FiMenu, FiX,
  FiChevronRight, FiActivity, FiSettings, FiLogOut
} from 'react-icons/fi';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: FiGrid },
  { href: '/admin/users', label: 'Users', icon: FiUsers },
  { href: '/admin/agencies', label: 'Agencies', icon: FiBriefcase },
  { href: '/admin/trips', label: 'Trips', icon: FiMap },
  { href: '/admin/bookings', label: 'Bookings', icon: FiCalendar },
  { href: '/admin/reviews', label: 'Reviews', icon: FiStar },
  { href: '/admin/analytics', label: 'Analytics', icon: FiBarChart2 },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: FiCreditCard },
  { href: '/admin/rentals', label: 'Rentals', icon: FiTruck },
  { href: '/admin/system', label: 'System', icon: FiActivity },
];

function NavLink({ item, isActive, onClick }: { item: typeof NAV_ITEMS[0]; isActive: boolean; onClick?: () => void }) {
  return (
    <Link href={item.href} onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
        isActive
          ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-indigo-400'
          : 'text-muted hover:bg-surface-hover hover:text-foreground'
      }`}>
      <div className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-indigo-500/20 text-indigo-400' : 'text-muted group-hover:text-foreground'}`}>
        <item.icon size={16} />
      </div>
      {item.label}
      {isActive && <FiChevronRight size={14} className="ml-auto text-indigo-400" />}
    </Link>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[260px] flex-col border-r border-border bg-surface flex-shrink-0">
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <FiShield size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Super Admin</h2>
              <p className="text-[10px] text-muted">VOYNEX Platform Control</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <NavLink key={item.href} item={item} isActive={isActive(item.href)} />
          ))}
        </nav>
        <div className="px-3 py-3 border-t border-border">
          <div className="px-3 py-3 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold">{user?.name?.charAt(0).toUpperCase() || 'A'}</div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{user?.name || 'Admin User'}</p>
                  <p className="text-[10px] text-muted truncate">{user?.email || 'admin@voynex.com'}</p>
                </div>
              </div>
              <button onClick={() => logout()} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors flex-shrink-0" title="Logout">
                <FiLogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-surface border-r border-border z-50 lg:hidden flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <FiShield size={14} className="text-white" />
                  </div>
                  <h2 className="text-sm font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Super Admin</h2>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-surface-hover"><FiX size={18} /></button>
              </div>
              <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
                {NAV_ITEMS.map(item => (
                  <NavLink key={item.href} item={item} isActive={isActive(item.href)} onClick={() => setSidebarOpen(false)} />
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-surface sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-surface-hover">
            <FiMenu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <FiShield size={14} className="text-indigo-400" />
            <span className="text-sm font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Super Admin</span>
          </div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'platform_admin']}>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </ProtectedRoute>
  );
}
