'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TbX, TbCalendar, TbMinus, TbPlus, TbClock, TbCurrencyRupee, TbShieldCheck } from 'react-icons/tb';

interface RentalDurationModalProps {
  isOpen: boolean;
  rental: any;
  onClose: () => void;
  onConfirm: (daysCount: number) => void;
  isSubmitting?: boolean;
}

export default function RentalDurationModal({
  isOpen,
  rental,
  onClose,
  onConfirm,
  isSubmitting = false,
}: RentalDurationModalProps) {
  const [days, setDays] = useState<number>(3);

  // Reset days when modal opens with a new rental
  useEffect(() => {
    if (isOpen) {
      setDays(3);
    }
  }, [isOpen, rental]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen || !rental) return null;

  const pricePerDay = Number(rental.pricePerDay || rental.price || 0);
  const totalPrice = days * pricePerDay;
  const title = rental.title || rental.name || 'Rental Item';
  const image = rental.images?.[0] || rental.image;

  const handleDecrement = () => {
    if (days > 1) setDays(days - 1);
  };

  const handleIncrement = () => {
    if (days < 30) setDays(days + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      setDays(1);
    } else {
      setDays(Math.min(Math.max(val, 1), 30));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (days >= 1 && days <= 30 && !isSubmitting) {
      onConfirm(days);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!isSubmitting) onClose();
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl z-10 overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute top-5 right-5 p-2 rounded-full text-muted hover:text-foreground hover:bg-surface-hover transition-colors tap-target"
            aria-label="Close modal"
          >
            <TbX size={20} />
          </button>

          {/* Header */}
          <div className="flex items-start gap-4 mb-6 pr-8">
            {image && (
              <img
                src={image}
                alt={title}
                className="h-16 w-16 rounded-2xl object-cover border border-border flex-shrink-0 bg-muted"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            )}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                {rental.category || 'Gear Rental'}
              </span>
              <h3 className="text-xl font-bold text-foreground leading-tight mt-0.5">{title}</h3>
              <p className="text-sm text-muted mt-1">
                ₹{pricePerDay.toLocaleString()} <span className="text-xs font-normal">/ day</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Duration Selector */}
            <div className="rounded-2xl border border-border bg-background p-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
                <TbCalendar size={15} className="text-accent" /> Rental Duration
              </label>

              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={days <= 1 || isSubmitting}
                  className="h-11 w-11 rounded-xl border border-border bg-surface flex items-center justify-center text-foreground hover:bg-surface-hover disabled:opacity-40 transition-all tap-target"
                >
                  <TbMinus size={18} />
                </button>

                <div className="flex items-center justify-center gap-1.5 flex-1">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={days}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-16 text-center text-2xl font-bold bg-transparent border-b border-accent focus:outline-none focus:border-primary text-foreground"
                  />
                  <span className="text-base font-semibold text-muted">
                    {days === 1 ? 'day' : 'days'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={days >= 30 || isSubmitting}
                  className="h-11 w-11 rounded-xl border border-border bg-surface flex items-center justify-center text-foreground hover:bg-surface-hover disabled:opacity-40 transition-all tap-target"
                >
                  <TbPlus size={18} />
                </button>
              </div>

              <div className="flex justify-between items-center text-[11px] text-muted mt-3 pt-2 border-t border-border/40">
                <span>Min: 1 day</span>
                <span>Max: 30 days</span>
              </div>
            </div>

            {/* Price Summary Breakdown */}
            <div className="space-y-2 rounded-2xl bg-surface/80 p-4 border border-border/60 text-sm">
              <div className="flex justify-between items-center text-muted">
                <span>Daily rate:</span>
                <span>₹{pricePerDay.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-muted">
                <span>Duration:</span>
                <span>{days} {days === 1 ? 'day' : 'days'}</span>
              </div>
              <div className="border-t border-border/60 pt-2 flex justify-between items-center font-bold text-base text-foreground">
                <span>Total Amount:</span>
                <span className="text-accent text-lg">₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Safety / Policy notice */}
            <div className="flex items-center gap-2 text-xs text-muted/80">
              <TbShieldCheck size={16} className="text-emerald-500 flex-shrink-0" />
              <span>Instant booking confirmation • Secure Razorpay checkout</span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-3.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-sm font-semibold text-foreground transition-all tap-target"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-primary to-teal text-white text-sm font-bold shadow-lg hover:shadow-accent/25 hover:opacity-95 transition-all disabled:opacity-50 tap-target flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Continue to Pay</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
