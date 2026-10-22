'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiCpu, FiPackage, FiArrowRight } from 'react-icons/fi';
import Breadcrumbs from '@/components/Breadcrumbs';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const subFeatures = [
  {
    href: '/ai-planner',
    icon: FiCpu,
    title: 'AI Trip Planner',
    description: 'Tell us your dream trip — destination, budget, group size, interests — and our AI generates a personalized day-by-day itinerary tailored for everyone in your group.',
    color: 'from-blue-500 to-indigo-600',
    tag: 'Most Popular',
  },
  {
    href: '/packing-assistant',
    icon: FiPackage,
    title: 'Smart Packing',
    description: 'Never forget anything again. Our AI creates a customized packing checklist based on your destination, activities, duration, and weather conditions.',
    color: 'from-teal-500 to-emerald-600',
    tag: 'AI-Powered',
  },
];

export default function PlanPage() {
  return (
    <div className="min-h-screen">
      <Breadcrumbs />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-20 left-1/3 h-56 w-56 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 h-40 w-40 rounded-full bg-accent/8 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              <FiCpu size={14} /> AI-Powered Planning
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold mb-4">
              Plan Your <span className="gradient-text">Perfect Trip</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted max-w-2xl mx-auto">
              Let our AI tools handle the planning so you can focus on the adventure. Generate itineraries and packing lists in seconds.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Cards */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-24 -mt-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {subFeatures.map(feature => (
            <motion.div key={feature.href} variants={fadeUp}>
              <Link
                href={feature.href}
                className="group block rounded-2xl border border-border bg-card overflow-hidden hover-glow transition-all duration-300 h-full"
              >
                <div className={`relative h-48 bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-all" />
                  <feature.icon size={56} className="text-white/80 group-hover:scale-110 transition-transform duration-300" />
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-medium">
                    {feature.tag}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">{feature.title}</h3>
                  <p className="text-sm text-muted leading-relaxed mb-4">{feature.description}</p>
                  <div className="flex items-center gap-1 text-sm font-medium text-accent group-hover:gap-2 transition-all">
                    Get Started <FiArrowRight size={14} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
