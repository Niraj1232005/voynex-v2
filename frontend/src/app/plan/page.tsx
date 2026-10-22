'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TbSparkles,
  TbWand,
  TbBriefcase,
  TbArrowRight,
  TbCompass,
  TbShieldCheck,
  TbFileDownload,
  TbClock,
  TbCheck,
} from 'react-icons/tb';
import Breadcrumbs from '@/components/Breadcrumbs';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const subFeatures = [
  {
    href: '/ai-planner',
    icon: TbWand,
    badge: 'Most Popular',
    title: 'AI Trip Planner',
    tagline: 'Custom Day-by-Day Itineraries in Seconds',
    description:
      'Describe your dream destination, budget, and travel vibe. Our AI synthesizes daily activities, realistic travel timings, and hidden gems.',
    imageUrl:
      'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=1200&auto=format&fit=crop&q=80',
    highlights: ['Bespoke day-to-evening routes', 'Budget tier calculations', 'One-click PDF download'],
    ctaText: 'Launch AI Trip Planner',
  },
  {
    href: '/packing-assistant',
    icon: TbBriefcase,
    badge: 'Smart Assistant',
    title: 'Smart Packing Assistant',
    tagline: 'Personalized Checklist for Your Voyage',
    description:
      'Never leave essentials behind. Automatically generates packing lists tailored to your destination weather, trip length, and planned activities.',
    imageUrl:
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80',
    highlights: ['Weather-aware suggestions', 'Categorized gear checklists', 'Mobile interactive ticks'],
    ctaText: 'Open Packing Assistant',
  },
];

export default function PlanPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F2] text-[#172B2A] pb-24 selection:bg-[#52C7B0]/20 selection:text-[#172B2A]">
      <Breadcrumbs />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-12">
        
        {/* Hero Section */}
        <header className="relative bg-white rounded-3xl p-8 sm:p-14 border border-[#E5E9E5] shadow-sm overflow-hidden text-center">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-bl from-[#52C7B0]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-gradient-to-tr from-[#176B55]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="relative z-10 max-w-3xl mx-auto space-y-4"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#176B55]/10 border border-[#176B55]/20 text-[#176B55] text-xs font-bold tracking-wide uppercase">
              <TbSparkles className="w-3.5 h-3.5 text-[#52C7B0]" />
              VOYNEX Intelligent Travel Hub
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-3xl sm:text-5xl font-black text-[#172B2A] tracking-tight leading-tight">
              Plan Your <span className="text-[#176B55]">Next Adventure</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-base sm:text-lg text-[#697773] max-w-2xl mx-auto leading-relaxed">
              Tell us what inspires you. We&apos;ll help you turn your travel ideas into an extraordinary, stress-free journey.
            </motion.p>
          </motion.div>
        </header>

        {/* Feature Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {subFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  href={feat.href}
                  className="group flex flex-col h-full bg-white rounded-3xl border border-[#E5E9E5] hover:border-[#176B55]/40 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  {/* Cinematic Image Banner */}
                  <div className="relative h-56 w-full overflow-hidden bg-slate-900">
                    <img
                      src={feat.imageUrl}
                      alt={feat.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    
                    <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold tracking-wide">
                      {feat.badge}
                    </span>

                    <div className="absolute bottom-4 left-5 right-5 text-white flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-[#176B55] text-white shadow-md">
                        <Icon className="w-6 h-6 text-[#52C7B0]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black">{feat.title}</h3>
                        <p className="text-xs text-white/80">{feat.tagline}</p>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                    <p className="text-sm text-[#697773] leading-relaxed">
                      {feat.description}
                    </p>

                    {/* Bullet Highlights */}
                    <div className="space-y-2 border-t border-[#E5E9E5] pt-4">
                      {feat.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-semibold text-[#172B2A]">
                          <TbCheck className="w-4 h-4 text-[#176B55] flex-shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <div className="pt-2">
                      <div className="w-full py-3.5 px-5 rounded-2xl bg-[#F7F7F2] group-hover:bg-[#176B55] text-[#172B2A] group-hover:text-white font-bold text-sm transition-all duration-300 flex items-center justify-between">
                        <span>{feat.ctaText}</span>
                        <TbArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </section>

        {/* Quality Badges */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E9E5] shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="p-2.5 rounded-2xl bg-[#176B55]/10 text-[#176B55]">
                <TbCompass className="w-6 h-6 text-[#176B55]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#172B2A]">100% Bespoke Routes</h4>
                <p className="text-xs text-[#697773]">Customized around your style & duration</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="p-2.5 rounded-2xl bg-[#176B55]/10 text-[#176B55]">
                <TbClock className="w-6 h-6 text-[#176B55]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#172B2A]">Realistic Day Pacing</h4>
                <p className="text-xs text-[#697773]">No hurried transfers or empty days</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="p-2.5 rounded-2xl bg-[#176B55]/10 text-[#176B55]">
                <TbFileDownload className="w-6 h-6 text-[#176B55]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#172B2A]">Instant PDF Export</h4>
                <p className="text-xs text-[#697773]">Offline ready with day-by-day maps</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
