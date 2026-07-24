'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TbCheck, TbMinus, TbChevronDown, TbRobot, TbCoin, TbBackpack, TbShieldCheck, TbCalendarEvent
} from 'react-icons/tb';
import { useAuth } from '@/contexts/AuthContext';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function MembershipPage() {
  const [isYearly, setIsYearly] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const pricing = {
    bronze: isYearly ? Math.floor(299 * 12 * 0.8) : 299,
    silver: isYearly ? Math.floor(599 * 12 * 0.8) : 599,
    gold: isYearly ? Math.floor(999 * 12 * 0.8) : 999,
  };

  // Faq list
  const faqs = [
    { q: 'Can I upgrade or downgrade my plan anytime?', a: 'Yes, you can change your plan at any time. Changes will be pro-rated for your current billing cycle.' },
    { q: 'What happens when my travel days run out?', a: 'You can still use the app to plan and book, but you won\'t be able to use the AI features until your cycle renews.' },
    { q: 'Is travel insurance valid internationally?', a: 'Standard and Premium insurance plans cover international travel, while Basic is limited to domestic.' },
    { q: 'How do reward points work?', a: 'You earn points on every booking which can be redeemed for discounts on future trips.' },
    { q: 'Can I use airport lounge access for a companion?', a: 'Gold members can bring one companion to the lounge at no extra cost. Silver members must use their limited passes.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs />
      </div>

      {/* Hero Section */}
      <section className="py-12 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Choose Your Travel Plan</h1>
          <p className="text-lg text-muted mb-8">Unlock AI-powered itineraries, exclusive deals, and premium lifestyle benefits.</p>
          
          <div className="flex items-center justify-center gap-4 mb-16">
            <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted'}`}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-14 h-8 rounded-full bg-surface-hover border border-border p-1 transition-colors hover:bg-border tap-target"
            >
              <motion.div 
                className="w-6 h-6 rounded-full bg-accent"
                animate={{ x: isYearly ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm font-medium flex items-center gap-2 ${isYearly ? 'text-foreground' : 'text-muted'}`}>
              Yearly 
              <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-bold">Save 20%</span>
            </span>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
            {/* Bronze */}
            <div className="flex flex-col p-6 rounded-2xl border border-border bg-card shadow-card relative transition-all hover:-translate-y-1 hover:shadow-card-hover">
              <div className="inline-flex items-center self-start px-3 py-1 rounded-full bg-[#f0e6da] text-[#7a4a1e] text-xs font-bold mb-4">
                Bronze
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">₹{pricing.bronze}</span>
                <span className="text-muted">/{isYearly ? 'yr' : 'mo'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium mb-6">
                <TbCalendarEvent size={18} className="text-muted" /> 7 Travel Days
              </div>
              
              <hr className="border-border mb-6" />
              
              <div className="space-y-4 mb-6 flex-1">
                <div className="flex items-center gap-3"><TbRobot className="text-accent" size={18} /> <span className="text-sm">AI Itinerary</span></div>
                <div className="flex items-center gap-3"><TbCoin className="text-accent" size={18} /> <span className="text-sm">AI Budget Planner</span></div>
                <div className="flex items-center gap-3"><TbBackpack className="text-accent" size={18} /> <span className="text-sm">AI Packing Assistant</span></div>
                <div className="flex items-center gap-3"><TbShieldCheck className="text-accent" size={18} /> <span className="text-sm">AI Safety Alerts</span></div>
              </div>
              
              <hr className="border-border mb-6" />
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm"><span className="text-muted">Movie Tickets</span> <span>2/month</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-muted">Travel Insurance</span> <span>Basic</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-muted">Reward Points</span> <span>Standard</span></div>
              </div>

              <Link href={isAuthenticated ? "/checkout" : "/login"} className="w-full py-3 rounded-xl border-2 border-border text-center font-semibold hover:border-foreground hover:bg-surface-hover transition-all tap-target mt-auto">
                {isAuthenticated ? 'Upgrade to Bronze' : 'Get Started'}
              </Link>
            </div>

            {/* Silver */}
            <div className="flex flex-col p-6 rounded-2xl border border-border bg-card shadow-card relative transition-all hover:-translate-y-1 hover:shadow-card-hover">
              <div className="inline-flex items-center self-start px-3 py-1 rounded-full bg-surface-hover text-muted text-xs font-bold mb-4">
                Silver
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">₹{pricing.silver}</span>
                <span className="text-muted">/{isYearly ? 'yr' : 'mo'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium mb-6">
                <TbCalendarEvent size={18} className="text-muted" /> 14 Travel Days
              </div>
              
              <hr className="border-border mb-6" />
              
              <div className="space-y-4 mb-6 flex-1">
                <div className="flex items-center gap-3"><TbRobot className="text-accent" size={18} /> <span className="text-sm">AI Itinerary</span></div>
                <div className="flex items-center gap-3"><TbCoin className="text-accent" size={18} /> <span className="text-sm">AI Budget Planner</span></div>
                <div className="flex items-center gap-3"><TbBackpack className="text-accent" size={18} /> <span className="text-sm">AI Packing Assistant</span></div>
                <div className="flex items-center gap-3"><TbShieldCheck className="text-accent" size={18} /> <span className="text-sm">AI Safety Alerts</span></div>
              </div>
              
              <hr className="border-border mb-6" />
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm"><span className="text-muted">Movie Tickets</span> <span>2/month</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-muted">Travel Insurance</span> <span>Standard</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-muted">Reward Points</span> <span>1.5×</span></div>
              </div>

              <Link href={isAuthenticated ? "/checkout" : "/login"} className="w-full py-3 rounded-xl border-2 border-border text-center font-semibold hover:border-foreground hover:bg-surface-hover transition-all tap-target mt-auto">
                {isAuthenticated ? 'Upgrade to Silver' : 'Get Started'}
              </Link>
            </div>

            {/* Gold */}
            <div className="flex flex-col p-6 rounded-2xl border-2 border-accent bg-card shadow-mega hover-glow relative scale-105 z-10 transition-transform hover:scale-110">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-white text-[10px] font-bold uppercase tracking-widest shadow-sm">
                Most Popular
              </div>
              <div className="inline-flex items-center self-start px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold mb-4">
                Gold
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">₹{pricing.gold}</span>
                <span className="text-muted">/{isYearly ? 'yr' : 'mo'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium mb-6">
                <TbCalendarEvent size={18} className="text-accent" /> 21 Travel Days
              </div>
              
              <hr className="border-border mb-6" />
              
              <div className="space-y-4 mb-6 flex-1">
                <div className="flex items-center gap-3"><TbRobot className="text-accent" size={18} /> <span className="text-sm">AI Itinerary</span></div>
                <div className="flex items-center gap-3"><TbCoin className="text-accent" size={18} /> <span className="text-sm">AI Budget Planner</span></div>
                <div className="flex items-center gap-3"><TbBackpack className="text-accent" size={18} /> <span className="text-sm">AI Packing Assistant</span></div>
                <div className="flex items-center gap-3"><TbShieldCheck className="text-accent" size={18} /> <span className="text-sm">AI Safety Alerts</span></div>
              </div>
              
              <hr className="border-border mb-6" />
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm"><span className="text-muted">Movie Tickets</span> <span>2/month</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-muted">Travel Insurance</span> <span className="text-accent font-medium">Premium</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-muted">Reward Points</span> <span className="text-accent font-medium">2×</span></div>
              </div>

              <Link href={isAuthenticated ? "/checkout" : "/login"} className="w-full py-3 rounded-xl bg-accent text-white text-center font-semibold hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 transition-all tap-target mt-auto">
                {isAuthenticated ? 'Current Plan' : 'Get Started'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-surface border-y border-border overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Compare all features</h2>
          </div>
          
          <div className="overflow-x-auto pb-6">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="p-4 border-b border-border bg-surface sticky left-0 z-10 w-1/3">Features</th>
                  <th className="p-4 border-b border-border text-center"><span className="px-3 py-1 rounded-full bg-[#f0e6da] text-[#7a4a1e] text-xs font-bold">Bronze</span></th>
                  <th className="p-4 border-b border-border text-center"><span className="px-3 py-1 rounded-full bg-surface-hover text-muted text-xs font-bold">Silver</span></th>
                  <th className="p-4 border-b border-border text-center"><span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold">Gold</span></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="bg-surface-hover/50"><td colSpan={4} className="p-3 font-semibold text-xs uppercase tracking-wider text-muted">AI Features</td></tr>
                <tr className="border-b border-border"><td className="p-4 sticky left-0 bg-surface">AI Itinerary</td><td className="p-4 text-center text-green-500"><TbCheck className="mx-auto" size={20} /></td><td className="p-4 text-center text-green-500"><TbCheck className="mx-auto" size={20} /></td><td className="p-4 text-center text-green-500"><TbCheck className="mx-auto" size={20} /></td></tr>
                <tr className="border-b border-border bg-surface/50"><td className="p-4 sticky left-0 bg-surface/50">AI Budget Planner</td><td className="p-4 text-center text-green-500"><TbCheck className="mx-auto" size={20} /></td><td className="p-4 text-center text-green-500"><TbCheck className="mx-auto" size={20} /></td><td className="p-4 text-center text-green-500"><TbCheck className="mx-auto" size={20} /></td></tr>
                <tr className="border-b border-border"><td className="p-4 sticky left-0 bg-surface">AI Packing Assistant</td><td className="p-4 text-center text-green-500"><TbCheck className="mx-auto" size={20} /></td><td className="p-4 text-center text-green-500"><TbCheck className="mx-auto" size={20} /></td><td className="p-4 text-center text-green-500"><TbCheck className="mx-auto" size={20} /></td></tr>
                <tr className="border-b border-border bg-surface/50"><td className="p-4 sticky left-0 bg-surface/50">AI Safety Alerts</td><td className="p-4 text-center text-green-500"><TbCheck className="mx-auto" size={20} /></td><td className="p-4 text-center text-green-500"><TbCheck className="mx-auto" size={20} /></td><td className="p-4 text-center text-green-500"><TbCheck className="mx-auto" size={20} /></td></tr>
                
                <tr className="bg-surface-hover/50"><td colSpan={4} className="p-3 font-semibold text-xs uppercase tracking-wider text-muted">Lifestyle Benefits</td></tr>
                <tr className="border-b border-border"><td className="p-4 sticky left-0 bg-surface">Movie Tickets</td><td className="p-4 text-center font-medium">2/month</td><td className="p-4 text-center font-medium">2/month</td><td className="p-4 text-center font-medium">2/month</td></tr>
                <tr className="border-b border-border bg-surface/50"><td className="p-4 sticky left-0 bg-surface/50">Hall Booking Benefit</td><td className="p-4 text-center font-medium">1/year</td><td className="p-4 text-center font-medium">2/year</td><td className="p-4 text-center font-medium">4/year</td></tr>
                <tr className="border-b border-border"><td className="p-4 sticky left-0 bg-surface">Travel Insurance</td><td className="p-4 text-center font-medium">Basic</td><td className="p-4 text-center font-medium">Standard</td><td className="p-4 text-center font-medium">Premium</td></tr>
                <tr className="border-b border-border bg-surface/50"><td className="p-4 sticky left-0 bg-surface/50">Airport Lounge</td><td className="p-4 text-center text-muted"><TbMinus className="mx-auto" size={20} /></td><td className="p-4 text-center font-medium">Limited</td><td className="p-4 text-center font-medium">Included</td></tr>
                <tr className="border-b border-border"><td className="p-4 sticky left-0 bg-surface">Hotel Upgrade</td><td className="p-4 text-center text-muted"><TbMinus className="mx-auto" size={20} /></td><td className="p-4 text-center text-green-500"><TbCheck className="mx-auto" size={20} /></td><td className="p-4 text-center font-medium">Priority</td></tr>
                <tr className="border-b border-border bg-surface/50"><td className="p-4 sticky left-0 bg-surface/50">Cab Coupons</td><td className="p-4 text-center font-medium">Limited</td><td className="p-4 text-center font-medium">More</td><td className="p-4 text-center font-medium">Highest</td></tr>
                <tr className="border-b border-border"><td className="p-4 sticky left-0 bg-surface">Reward Points</td><td className="p-4 text-center font-medium">Standard</td><td className="p-4 text-center font-medium">1.5×</td><td className="p-4 text-center font-medium">2×</td></tr>
                <tr className="border-b border-border bg-surface/50"><td className="p-4 sticky left-0 bg-surface/50">Priority Support</td><td className="p-4 text-center text-muted"><TbMinus className="mx-auto" size={20} /></td><td className="p-4 text-center text-green-500"><TbCheck className="mx-auto" size={20} /></td><td className="p-4 text-center font-medium">VIP</td></tr>
                <tr className="border-b border-border"><td className="p-4 sticky left-0 bg-surface">Birthday Gift</td><td className="p-4 text-center text-green-500"><TbCheck className="mx-auto" size={20} /></td><td className="p-4 text-center text-green-500"><TbCheck className="mx-auto" size={20} /></td><td className="p-4 text-center font-medium">Premium</td></tr>
                <tr className="border-b border-border bg-surface/50"><td className="p-4 sticky left-0 bg-surface/50">Anniversary Gift</td><td className="p-4 text-center text-muted"><TbMinus className="mx-auto" size={20} /></td><td className="p-4 text-center text-green-500"><TbCheck className="mx-auto" size={20} /></td><td className="p-4 text-center text-green-500"><TbCheck className="mx-auto" size={20} /></td></tr>
                <tr className="border-b border-border"><td className="p-4 sticky left-0 bg-surface">Exclusive Deals</td><td className="p-4 text-center text-green-500"><TbCheck className="mx-auto" size={20} /></td><td className="p-4 text-center text-green-500"><TbCheck className="mx-auto" size={20} /></td><td className="p-4 text-center text-green-500"><TbCheck className="mx-auto" size={20} /></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-border rounded-xl bg-card overflow-hidden">
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-left tap-target hover:bg-surface-hover transition-colors"
                >
                  <span className="font-semibold">{faq.q}</span>
                  <TbChevronDown 
                    size={20} 
                    className={`text-muted transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} 
                  />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 text-muted text-sm leading-relaxed border-t border-border mt-2 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
