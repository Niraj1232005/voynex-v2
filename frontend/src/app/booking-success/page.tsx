'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { TbCheck, TbMapPin, TbCalendarEvent, TbReceipt, TbArrowRight, TbHome, TbAlertCircle } from 'react-icons/tb';
import { useToast } from '@/contexts/ToastContext';

function BookingSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);

  const bookingId = searchParams.get('bookingId');
  const destination = searchParams.get('destination');
  const date = searchParams.get('date');

  useEffect(() => {
    setMounted(true);
    if (bookingId) {
      showToast('Booking successfully confirmed!', 'success');
    }
  }, [bookingId, showToast]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center py-20">
      
      {/* Simple Custom Confetti using Framer Motion */}
      {mounted && bookingId && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 1, 
                y: -50, 
                x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0,
                rotate: 0,
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{ 
                opacity: 0, 
                y: typeof window !== 'undefined' ? window.innerHeight : 800,
                x: typeof window !== 'undefined' ? `calc(${Math.random() * 100}vw - 50vw)` : 0,
                rotate: 360 * (Math.random() > 0.5 ? 1 : -1)
              }}
              transition={{ 
                duration: Math.random() * 2 + 3, 
                ease: "easeOut",
                delay: Math.random() * 0.5
              }}
              className={`absolute w-3 h-3 ${
                ['bg-accent', 'bg-primary', 'bg-teal', 'bg-yellow-400', 'bg-pink-500'][Math.floor(Math.random() * 5)]
              } rounded-sm`}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 w-full max-w-2xl px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-card rounded-3xl border border-border shadow-2xl p-8 sm:p-12 text-center"
        >
          {bookingId ? (
            <>
              <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                <TbCheck size={40} className="text-green-500" />
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Booking Confirmed!</h1>
              <p className="text-muted text-lg mb-10">You&apos;re all set for your next adventure.</p>

              <div className="bg-surface-hover rounded-2xl border border-border p-6 text-left mb-10 space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                  <span className="text-muted font-medium flex items-center gap-2"><TbReceipt /> Booking ID</span>
                  <span className="font-bold font-mono text-primary">{bookingId}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                  <span className="text-muted font-medium flex items-center gap-2"><TbMapPin /> Destination</span>
                  <span className="font-bold">{destination || 'Your Trip Package'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted font-medium flex items-center gap-2"><TbCalendarEvent /> Dates</span>
                  <span className="font-bold">{date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Flexible'}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => router.push('/my-trips')}
                  className="flex-1 px-6 py-4 rounded-xl bg-accent text-white font-bold hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 transition-all tap-target flex items-center justify-center gap-2"
                >
                  View Itinerary <TbArrowRight size={20} />
                </button>
                <button 
                  onClick={() => router.push('/')}
                  className="flex-1 px-6 py-4 rounded-xl bg-surface border border-border font-bold hover:bg-surface-hover hover:-translate-y-0.5 transition-all tap-target flex items-center justify-center gap-2"
                >
                  <TbHome size={20} /> Back to Home
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
                <TbAlertCircle size={40} className="text-yellow-500" />
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">No Booking Session Found</h1>
              <p className="text-muted text-sm mb-8">No recent booking confirmation parameters were found. Please check your account history.</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => router.push('/my-trips')}
                  className="flex-1 px-6 py-4 rounded-xl bg-accent text-white font-bold hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 transition-all tap-target flex items-center justify-center gap-2"
                >
                  Go to My Trips <TbArrowRight size={20} />
                </button>
                <button 
                  onClick={() => router.push('/')}
                  className="flex-1 px-6 py-4 rounded-xl bg-surface border border-border font-bold hover:bg-surface-hover hover:-translate-y-0.5 transition-all tap-target flex items-center justify-center gap-2"
                >
                  <TbHome size={20} /> Back to Home
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}
