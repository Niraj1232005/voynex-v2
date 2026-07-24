'use client';
import React from 'react';
import Link from 'next/link';
import { TbArrowRight } from 'react-icons/tb';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <div className="h-20 w-20 rounded-2xl bg-surface-hover flex items-center justify-center mb-6 text-muted">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted max-w-md mb-8">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-teal text-white font-medium hover:shadow-lg hover:shadow-primary/25 transition-all tap-target"
        >
          {actionLabel} <TbArrowRight size={16} />
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-teal text-white font-medium hover:shadow-lg hover:shadow-primary/25 transition-all tap-target"
        >
          {actionLabel} <TbArrowRight size={16} />
        </button>
      )}
    </motion.div>
  );
}
