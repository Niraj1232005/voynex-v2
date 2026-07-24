'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { TbMail, TbMapPin, TbPhone, TbArrowRight } from 'react-icons/tb';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(''); setTimeout(() => setSubscribed(false), 3000); }
  };

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-teal font-bold text-white text-lg">V</div>
              <span className="text-xl font-bold gradient-text">VOYNEX</span>
            </div>
            <p className="text-sm text-muted mb-4 leading-relaxed">Your complete travel companion. Discover, plan, and book unforgettable journeys with AI-powered tools.</p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold mb-4">Explore</h4>
            <div className="flex flex-col gap-2">
              {[
                { href: '/trips', label: 'Trips' },
                { href: '/destinations', label: 'Destinations' },
                { href: '/rentals', label: 'Rentals' },
                { href: '/shop', label: 'Travel Shop' },
              ].map(link => (
                <Link key={link.href} href={link.href} className="text-sm text-muted hover:text-accent transition-all">{link.label}</Link>
              ))}
            </div>
          </div>

          {/* Plan & Support */}
          <div>
            <h4 className="font-semibold mb-4">Plan & Support</h4>
            <div className="flex flex-col gap-2">
              {[
                { href: '/ai-planner', label: 'AI Trip Planner' },
                { href: '/packing-assistant', label: 'Packing Assistant' },
                { href: '/explore', label: 'Explore Hub' },
                { href: '/account', label: 'My Account' },
              ].map(link => (
                <Link key={link.href} href={link.href} className="text-sm text-muted hover:text-accent transition-all">{link.label}</Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-sm text-muted mb-4">Get travel inspiration and exclusive deals straight to your inbox.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email"
                className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
              <button type="submit"
                className="px-3 py-2.5 rounded-lg bg-accent text-white hover:bg-accent-dark transition-all tap-target">
                <TbArrowRight size={18} />
              </button>
            </form>
            {subscribed && <p className="text-xs text-accent mt-2">✓ Subscribed successfully!</p>}

            <div className="mt-6 flex flex-col gap-2 text-sm text-muted">
              <div className="flex items-center gap-2"><TbMapPin size={16} className="text-accent flex-shrink-0" /> Mumbai, India</div>
              <div className="flex items-center gap-2"><TbPhone size={16} className="text-accent flex-shrink-0" /> +91 98765 43210</div>
              <div className="flex items-center gap-2"><TbMail size={16} className="text-accent flex-shrink-0" /> hello@voynex.com</div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <p>© 2026 VOYNEX. All rights reserved. Built as a B.Tech Capstone Project.</p>
          <div className="flex gap-4">
            <span className="text-muted/50">Privacy Policy</span>
            <span className="text-muted/50">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
