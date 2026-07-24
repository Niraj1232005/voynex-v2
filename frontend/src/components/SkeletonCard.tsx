'use client';
import React from 'react';

interface SkeletonCardProps {
  variant?: 'trip' | 'product' | 'rental' | 'list';
  count?: number;
}

function SingleSkeleton({ variant = 'trip' }: { variant: string }) {
  if (variant === 'list') {
    return (
      <div className="flex gap-4 p-4 rounded-2xl border border-border bg-card animate-pulse">
        <div className="h-20 w-20 rounded-xl skeleton flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-3/4 skeleton rounded" />
          <div className="h-3 w-1/2 skeleton rounded" />
          <div className="h-3 w-1/3 skeleton rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className={`${variant === 'product' ? 'h-48' : 'h-60'} skeleton w-full`} />
      
      {/* Content skeleton */}
      <div className="p-6 flex flex-col flex-1">
        {/* Title */}
        <div className="h-5 w-3/4 skeleton rounded mb-4" />
        
        {variant === 'trip' && (
          <>
            {/* Icon + Text Badges Row */}
            <div className="flex items-center gap-3 mb-5">
              <div className="h-6 w-16 skeleton rounded-lg" />
              <div className="h-6 w-20 skeleton rounded-lg" />
              <div className="h-6 w-20 skeleton rounded-lg" />
            </div>

            {/* Colored Tag Pills */}
            <div className="flex flex-wrap gap-2 mb-6 mt-auto">
              <div className="h-5 w-16 skeleton rounded-full" />
              <div className="h-5 w-20 skeleton rounded-full" />
              <div className="h-5 w-14 skeleton rounded-full" />
            </div>

            {/* CTA */}
            <div className="pt-5 border-t border-border flex items-center justify-between">
              <div className="h-4 w-24 skeleton rounded" />
              <div className="h-10 w-28 skeleton rounded-xl" />
            </div>
          </>
        )}

        {variant !== 'trip' && (
          <div className="space-y-3 mt-4">
            <div className="h-3 w-full skeleton rounded" />
            <div className="h-3 w-2/3 skeleton rounded" />
            <div className="flex items-center justify-between pt-4">
              <div className="h-6 w-20 skeleton rounded" />
              <div className="h-8 w-24 skeleton rounded-lg" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SkeletonCard({ variant = 'trip', count = 1 }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <SingleSkeleton key={i} variant={variant} />
      ))}
    </>
  );
}
