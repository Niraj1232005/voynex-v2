'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TbChevronRight, TbHome } from 'react-icons/tb';

const LABEL_MAP: Record<string, string> = {
  'trips': 'Trips',
  'explore': 'Explore',
  'destinations': 'Destinations',
  'plan': 'Plan My Trip',
  'ai-planner': 'AI Planner',
  'packing-assistant': 'Smart Packing',
  'marketplace': 'Marketplace',
  'shop': 'Shop',
  'rentals': 'Rentals',
  'my-trips': 'My Trips',
  'saved': 'Saved Trips',
  'cart': 'Cart',
  'account': 'Account',
  'login': 'Login',
  'signup': 'Sign Up',
  'dashboard': 'Dashboard',
  'booking': 'Booking',
  'admin': 'Admin',
  'agency': 'Agency',
  'membership': 'Membership',
};

// Parent mapping for logical hierarchy breadcrumbs
const PARENT_MAP: Record<string, { label: string; href: string }> = {
  '/trips': { label: 'Explore', href: '/explore' },
  '/destinations': { label: 'Explore', href: '/explore' },
  '/ai-planner': { label: 'Plan My Trip', href: '/plan' },
  '/packing-assistant': { label: 'Plan My Trip', href: '/plan' },
  '/shop': { label: 'Marketplace', href: '/marketplace' },
  '/rentals': { label: 'Marketplace', href: '/marketplace' },
  '/cart': { label: 'My Trips', href: '/my-trips' },
  '/dashboard': { label: 'My Trips', href: '/my-trips' },
  '/login': { label: 'Account', href: '/account' },
  '/signup': { label: 'Account', href: '/account' },
  '/booking': { label: 'My Trips', href: '/my-trips' },
  '/membership': { label: 'Account', href: '/account' },
};

interface BreadcrumbItem {
  label: string;
  href: string;
}

export default function Breadcrumbs({ customTrail, tripTitle }: { customTrail?: BreadcrumbItem[]; tripTitle?: string }) {
  const pathname = usePathname();

  if (!pathname || pathname === '/') return null;

  // Build breadcrumb trail
  const crumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

  if (customTrail) {
    crumbs.push(...customTrail);
  } else {
    const segments = pathname.split('/').filter(Boolean);
    const basePath = '/' + segments[0];

    // Add parent if exists
    if (PARENT_MAP[basePath]) {
      crumbs.push(PARENT_MAP[basePath]);
    }

    // Build path segments
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += '/' + segment;
      const label = LABEL_MAP[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Don't add if it's the same as the parent we already added
      const parentHref = PARENT_MAP[basePath]?.href;
      if (parentHref && currentPath === parentHref) return;

      if (index === segments.length - 1 && tripTitle) {
        // Last segment with custom title (e.g., trip name)
        crumbs.push({ label: tripTitle, href: currentPath });
      } else {
        crumbs.push({ label, href: currentPath });
      }
    });
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1 py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {crumbs.map((crumb, index) => (
        <React.Fragment key={crumb.href + index}>
          {index > 0 && (
            <TbChevronRight className="breadcrumb-separator flex-shrink-0" size={14} />
          )}
          {index === crumbs.length - 1 ? (
            <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
              {crumb.label}
            </span>
          ) : (
            <Link href={crumb.href} className="breadcrumb-link flex items-center gap-1 hover:text-accent transition-colors">
              {index === 0 && <TbHome size={14} />}
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
