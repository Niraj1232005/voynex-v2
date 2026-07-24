'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiTruck, FiArrowRight } from 'react-icons/fi';
import Breadcrumbs from '@/components/Breadcrumbs';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const subFeatures = [
  {
    href: '/shop',
    icon: FiShoppingBag,
    title: 'Travel Shop',
    description: 'Premium travel gear, jackets, backpacks, electronics, and accessories — everything you need for your next adventure, delivered to your doorstep.',
    color: 'from-orange-500 to-pink-600',
    stats: '8 products',
  },
  {
    href: '/rentals',
    icon: FiTruck,
    title: 'Rental Services',
    description: 'Rent bikes, scooties, cars, and GoPro cameras at your destination. No need to carry heavy gear — pick up and drop off locally.',
    color: 'from-violet-500 to-purple-600',
    stats: '6 rental options',
  },
];

export default function MarketplacePage() {
  return (
    <div className="min-h-screen">
      <Breadcrumbs />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange/5 via-background to-primary/5" />
        <div className="absolute top-16 right-16 h-56 w-56 rounded-full bg-orange/8 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange/10 text-orange text-sm font-medium mb-6">
              <FiShoppingBag size={14} /> Marketplace
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold mb-4">
              Gear Up for Your <span className="gradient-text">Journey</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted max-w-2xl mx-auto">
              Shop premium travel gear or rent equipment at your destination. Everything you need, when you need it.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-24 -mt-4">
        <motion.div
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {subFeatures.map(feature => (
            <motion.div key={feature.href} variants={fadeUp}>
              <Link href={feature.href}
                className="group block rounded-2xl border border-border bg-card overflow-hidden hover-glow transition-all duration-300 h-full">
                <div className={`relative h-48 bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-all" />
                  <feature.icon size={56} className="text-white/80 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold group-hover:text-accent transition-colors">{feature.title}</h3>
                    <span className="text-xs font-medium text-accent">{feature.stats}</span>
                  </div>
                  <p className="text-sm text-muted leading-relaxed mb-4">{feature.description}</p>
                  <div className="flex items-center gap-1 text-sm font-medium text-accent group-hover:gap-2 transition-all">
                    Browse {feature.title} <FiArrowRight size={14} />
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
