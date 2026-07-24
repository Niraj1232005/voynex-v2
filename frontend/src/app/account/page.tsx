'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiUser, FiUserPlus, FiSettings, FiArrowRight } from 'react-icons/fi';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useAuth } from '@/contexts/AuthContext';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

export default function AccountPage() {
  const { isAuthenticated, user } = useAuth();

  const subFeatures = isAuthenticated ? [
    {
      href: '/dashboard',
      icon: FiUser,
      title: 'Profile',
      description: 'View your profile, preferences, and travel history.',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      href: '/dashboard',
      icon: FiSettings,
      title: 'Settings',
      description: 'Manage account settings, notifications, and privacy.',
      color: 'from-slate-500 to-gray-600',
    },
  ] : [
    {
      href: '/login',
      icon: FiUser,
      title: 'Log In',
      description: 'Sign in to your VOYNEX account to access bookings, saved trips, and personalized recommendations.',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      href: '/signup',
      icon: FiUserPlus,
      title: 'Sign Up',
      description: 'Create a new account and start planning your dream trips with AI-powered tools.',
      color: 'from-accent to-teal-600',
    },
  ];

  return (
    <div className="min-h-screen">
      <Breadcrumbs />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              <FiUser size={14} /> Account
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold mb-4">
              {isAuthenticated ? (
                <>Welcome, <span className="gradient-text">{user?.name?.split(' ')[0]}</span></>
              ) : (
                <>Your <span className="gradient-text">Account</span></>
              )}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted max-w-2xl mx-auto">
              {isAuthenticated
                ? 'Manage your profile, settings, and preferences.'
                : 'Log in or create an account to unlock personalized trip planning and booking features.'}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-24 -mt-4">
        <motion.div
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {subFeatures.map(feature => (
            <motion.div key={feature.href + feature.title} variants={fadeUp}>
              <Link href={feature.href}
                className="group block rounded-2xl border border-border bg-card overflow-hidden hover-glow transition-all duration-300 h-full">
                <div className={`relative h-36 bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-all" />
                  <feature.icon size={44} className="text-white/80 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold group-hover:text-accent transition-colors">{feature.title}</h3>
                    <FiArrowRight className="text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
