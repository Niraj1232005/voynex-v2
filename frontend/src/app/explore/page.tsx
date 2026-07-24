'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiCompass, FiMap, FiTruck, FiArrowRight } from 'react-icons/fi';
import Breadcrumbs from '@/components/Breadcrumbs';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const subFeatures = [
  {
    href: '/trips',
    icon: FiCompass,
    title: 'Trips',
    description: 'Browse curated travel experiences across India — from Himalayan treks to coastal getaways.',
    color: 'from-blue-500 to-indigo-600',
    stats: '6 trips available',
  },
  {
    href: '/destinations',
    icon: FiMap,
    title: 'Destinations',
    description: 'Discover breathtaking destinations with travel insights, ratings, and price ranges.',
    color: 'from-emerald-500 to-teal-600',
    stats: '6 destinations',
  },
  {
    href: '/rentals',
    icon: FiTruck,
    title: 'Rentals',
    description: 'Rent bikes, cars, and cameras at your destination for the ultimate travel freedom.',
    color: 'from-amber-500 to-orange-600',
    stats: '6 rental options',
  },
];

export default function ExplorePage() {
  return (
    <div className="min-h-screen">
      <Breadcrumbs />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-teal/5" />
        <div className="absolute top-10 right-20 h-64 w-64 rounded-full bg-accent/8 blur-3xl" />
        <div className="absolute bottom-10 left-20 h-48 w-48 rounded-full bg-primary/8 blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            className="text-center"
          >
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              <FiCompass size={14} /> Explore
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold mb-4">
              Discover Your Next <span className="gradient-text">Adventure</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted max-w-2xl mx-auto">
              Browse handpicked trips, explore stunning destinations, and rent gear for your journey — all in one place.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Sub-features Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 -mt-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {subFeatures.map(feature => (
            <motion.div key={feature.href} variants={fadeUp}>
              <Link
                href={feature.href}
                className="group block rounded-2xl border border-border bg-card overflow-hidden hover-glow transition-all duration-300"
              >
                {/* Gradient Header */}
                <div className={`relative h-40 bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-all" />
                  <feature.icon size={48} className="text-white/80 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold group-hover:text-accent transition-colors">{feature.title}</h3>
                    <FiArrowRight className="text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sm text-muted leading-relaxed mb-3">{feature.description}</p>
                  <span className="text-xs font-medium text-accent">{feature.stats}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
