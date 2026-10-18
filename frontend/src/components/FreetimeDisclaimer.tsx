'use client';
import React from 'react';
import { TbAlertTriangle, TbInfoCircle } from 'react-icons/tb';

interface FreetimeDisclaimerProps {
  disclaimer: string;
  providerCostFormula?: string;
  attribution: {
    osmText: string;
    osmUrl: string;
    geoapifyText: string;
    geoapifyUrl: string;
  };
}

export default function FreetimeDisclaimer({
  disclaimer,
  providerCostFormula,
  attribution,
}: FreetimeDisclaimerProps) {
  return (
    <div className="space-y-4 my-8">
      {/* Travel Time Disclaimer Box */}
      <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10 text-amber-900 dark:text-amber-200">
        <div className="flex items-start gap-3">
          <TbAlertTriangle className="shrink-0 w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed space-y-2">
            <div className="font-semibold text-amber-800 dark:text-amber-300">
              Important Travel-Time & Layover Disclaimer
            </div>
            <p className="text-muted-foreground dark:text-amber-200/90">
              {disclaimer}
            </p>
          </div>
        </div>
      </div>

      {/* Provider Cost Transparency & Attribution */}
      <div className="p-4 rounded-xl border border-border bg-card/60 backdrop-blur-sm text-xs text-muted flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {providerCostFormula && (
          <div className="flex items-center gap-1.5 text-muted">
            <TbInfoCircle className="w-4 h-4 text-primary shrink-0" />
            <span>Provider query breakdown: {providerCostFormula}</span>
          </div>
        )}
        <div className="flex items-center gap-3 text-xs">
          <span>Map & Place Data:</span>
          <a
            href={attribution.osmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            {attribution.osmText}
          </a>
          <span className="text-border">|</span>
          <a
            href={attribution.geoapifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            {attribution.geoapifyText}
          </a>
        </div>
      </div>
    </div>
  );
}
