'use client';
import React from 'react';
import {
  TbWalk,
  TbClock,
  TbMapPin,
  TbExternalLink,
  TbCheck,
  TbX,
  TbAlertCircle,
  TbHourglass,
  TbShieldCheck,
} from 'react-icons/tb';

export interface FreeTimePlaceProps {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lon: number;
  straightLineMeters: number;
  outboundWalkMinutes: number | null;
  returnWalkMinutes: number | null;
  dwellMinutes: number;
  bufferMinutes: number;
  totalTripMinutes: number | null;
  fits: boolean;
  fitStatus: 'FITS' | 'DOES_NOT_FIT' | 'UNAVAILABLE';
  marginMinutes: number | null;
  mapDirectionsUrl: string;
}

export default function FreetimeCard({ place }: { place: FreeTimePlaceProps }) {
  const isFits = place.fitStatus === 'FITS';
  const isUnavailable = place.fitStatus === 'UNAVAILABLE';
  const isDoesNotFit = place.fitStatus === 'DOES_NOT_FIT';

  const categoryClean =
    place.category.split('.').pop()?.replace(/_/g, ' ') || place.category;

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between ${
        isFits
          ? 'bg-card border-border hover:border-primary/40 hover:shadow-lg'
          : 'bg-card/50 border-border/60 opacity-80 hover:opacity-100'
      }`}
    >
      <div>
        {/* Header: Title, Category, and Fit Badge */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface text-muted capitalize mb-1.5 border border-border/50">
              {categoryClean}
            </div>
            <h3 className="font-semibold text-lg text-foreground leading-snug">
              {place.name}
            </h3>
          </div>

          <div>
            {isFits && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <TbCheck className="w-3.5 h-3.5" /> Fits your window
              </span>
            )}
            {isDoesNotFit && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                <TbX className="w-3.5 h-3.5" /> Doesn&apos;t fit
              </span>
            )}
            {isUnavailable && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <TbAlertCircle className="w-3.5 h-3.5" /> Route unavailable
              </span>
            )}
          </div>
        </div>

        {/* Address */}
        {place.address && (
          <p className="text-xs text-muted flex items-center gap-1.5 mb-4 line-clamp-1">
            <TbMapPin className="w-3.5 h-3.5 shrink-0 text-muted" />
            <span>{place.address}</span>
          </p>
        )}

        {/* Straight-line distance note */}
        <div className="text-xs text-muted mb-4 bg-surface/60 rounded-lg p-2.5 border border-border/40">
          <span className="font-medium text-foreground">Straight-line distance:</span>{' '}
          {place.straightLineMeters >= 1000
            ? `${(place.straightLineMeters / 1000).toFixed(1)} km`
            : `${place.straightLineMeters} m`}
          <span className="text-[11px] block text-muted mt-0.5">
            (Direct map proximity; not pedestrian walking distance)
          </span>
        </div>

        {/* Walking & Time Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs">
          <div className="p-2.5 rounded-xl bg-surface border border-border/50">
            <span className="text-muted block text-[11px]">Outbound Walk</span>
            <span className="font-medium text-foreground flex items-center gap-1 mt-0.5">
              <TbWalk className="w-3.5 h-3.5 text-primary" />
              {place.outboundWalkMinutes !== null
                ? `~${place.outboundWalkMinutes} min (est.)`
                : 'N/A'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-surface border border-border/50">
            <span className="text-muted block text-[11px]">Time at Place</span>
            <span className="font-medium text-foreground flex items-center gap-1 mt-0.5">
              <TbClock className="w-3.5 h-3.5 text-primary" />
              {place.dwellMinutes} min
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-surface border border-border/50">
            <span className="text-muted block text-[11px]">Return Walk</span>
            <span className="font-medium text-foreground flex items-center gap-1 mt-0.5">
              <TbWalk className="w-3.5 h-3.5 text-primary" />
              {place.returnWalkMinutes !== null
                ? `~${place.returnWalkMinutes} min (est.)`
                : 'N/A'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-surface border border-border/50">
            <span className="text-muted block text-[11px]">Return Buffer</span>
            <span className="font-medium text-foreground flex items-center gap-1 mt-0.5">
              <TbShieldCheck className="w-3.5 h-3.5 text-accent" />
              {place.bufferMinutes} min
            </span>
          </div>
        </div>

        {/* Total & Window comparison */}
        <div className="p-3 rounded-xl bg-surface border border-border/60 mb-5 flex items-center justify-between text-xs">
          <div>
            <span className="text-muted">Total Time Required:</span>{' '}
            <strong className="text-foreground">
              {place.totalTripMinutes !== null
                ? `${place.totalTripMinutes} min`
                : 'Route not found'}
            </strong>
          </div>
          {place.marginMinutes !== null && (
            <div>
              {place.marginMinutes >= 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  +{place.marginMinutes} min extra buffer
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 font-medium">
                  {Math.abs(place.marginMinutes)} min over your window
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action: Walking Directions link */}
      <a
        href={place.mapDirectionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-hover hover:bg-primary hover:text-white border border-border text-xs sm:text-sm font-medium transition-colors"
      >
        <span>Open Walking Directions</span>
        <TbExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}
