'use client';
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TbCalendar,
  TbCoin,
  TbCompass,
  TbSun,
  TbSunset,
  TbMoon,
  TbCheck,
  TbBulb,
  TbLuggage,
  TbMapPin,
  TbSparkles,
  TbCurrencyRupee,
} from 'react-icons/tb';

interface AIItineraryDisplayProps {
  itineraryText: string;
  destination: string;
  duration?: string | number;
  budget?: string | number;
  vibe?: string;
}

interface DayPlan {
  dayNumber: number;
  title: string;
  morning?: string[];
  afternoon?: string[];
  evening?: string[];
  generalNotes?: string[];
}

interface ParsedItinerary {
  overviewTitle: string;
  overviewSummary: string[];
  days: DayPlan[];
  budgetItems: { label: string; amount: string }[];
  packingItems: string[];
  travelTips: string[];
  rawUnparsedSections: { title: string; lines: string[] }[];
}

export default function AIItineraryDisplay({
  itineraryText,
  destination,
  duration,
  budget,
  vibe,
}: AIItineraryDisplayProps) {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Parse markdown into structured data
  const parsed = useMemo<ParsedItinerary>(() => {
    const result: ParsedItinerary = {
      overviewTitle: '',
      overviewSummary: [],
      days: [],
      budgetItems: [],
      packingItems: [],
      travelTips: [],
      rawUnparsedSections: [],
    };

    if (!itineraryText) return result;

    const lines = itineraryText.split('\n');
    let currentSection = 'start';
    let currentDay: DayPlan | null = null;
    let currentDayPeriod: 'morning' | 'afternoon' | 'evening' | 'general' = 'general';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Section Headings (## or #)
      if (line.startsWith('# ') || line.startsWith('## ')) {
        const lower = line.toLowerCase();

        // Save current day before switching section
        if (currentDay) {
          result.days.push(currentDay);
          currentDay = null;
        }

        if (lower.includes('overview') || lower.includes('highlights') || lower.includes('summary')) {
          currentSection = 'overview';
          result.overviewTitle = line.replace(/^[#\s🌟✨]+/, '').trim();
        } else if (lower.includes('day') || lower.includes('plan') || lower.includes('itinerary')) {
          currentSection = 'days';
        } else if (lower.includes('budget') || lower.includes('cost') || lower.includes('expense')) {
          currentSection = 'budget';
        } else if (lower.includes('pack') || lower.includes('gear')) {
          currentSection = 'packing';
        } else if (lower.includes('tip') || lower.includes('etiquette') || lower.includes('note')) {
          currentSection = 'tips';
        } else {
          currentSection = 'custom';
          result.rawUnparsedSections.push({
            title: line.replace(/^#+\s*/, ''),
            lines: [],
          });
        }
        continue;
      }

      // Day Sub-Headings (### Day 1...)
      if (line.startsWith('### ') && (line.toLowerCase().includes('day') || currentSection === 'days')) {
        if (currentDay) {
          result.days.push(currentDay);
        }

        const matchDayNum = line.match(/day\s*(\d+)/i);
        const dayNumber = matchDayNum ? parseInt(matchDayNum[1], 10) : result.days.length + 1;
        const title = line.replace(/^###\s*/, '').replace(/day\s*\d+[:\s-]*/i, '').trim() || `Day ${dayNumber}`;

        currentDay = {
          dayNumber,
          title,
          morning: [],
          afternoon: [],
          evening: [],
          generalNotes: [],
        };
        currentDayPeriod = 'general';
        continue;
      }

      const cleanLine = line.replace(/^[-*•]\s+/, '').replace(/\*\*(.*?)\*\*/g, '$1').trim();

      // Section Dispatch
      if (currentSection === 'overview') {
        result.overviewSummary.push(cleanLine);
      } else if (currentSection === 'days' || currentDay) {
        if (!currentDay) {
          // Fallback if no ### Day header was encountered yet
          currentDay = {
            dayNumber: result.days.length + 1,
            title: `Day ${result.days.length + 1}`,
            morning: [],
            afternoon: [],
            evening: [],
            generalNotes: [],
          };
        }

        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('morning')) currentDayPeriod = 'morning';
        else if (lowerLine.includes('afternoon')) currentDayPeriod = 'afternoon';
        else if (lowerLine.includes('evening') || lowerLine.includes('night')) currentDayPeriod = 'evening';

        if (currentDayPeriod === 'morning') currentDay.morning?.push(cleanLine);
        else if (currentDayPeriod === 'afternoon') currentDay.afternoon?.push(cleanLine);
        else if (currentDayPeriod === 'evening') currentDay.evening?.push(cleanLine);
        else currentDay.generalNotes?.push(cleanLine);
      } else if (currentSection === 'budget') {
        const parts = cleanLine.split(/[:–—]/);
        if (parts.length >= 2) {
          result.budgetItems.push({
            label: parts[0].trim(),
            amount: parts.slice(1).join(':').trim(),
          });
        } else {
          result.budgetItems.push({
            label: cleanLine,
            amount: '',
          });
        }
      } else if (currentSection === 'packing') {
        result.packingItems.push(cleanLine);
      } else if (currentSection === 'tips') {
        result.travelTips.push(cleanLine);
      } else if (currentSection === 'custom' && result.rawUnparsedSections.length > 0) {
        result.rawUnparsedSections[result.rawUnparsedSections.length - 1].lines.push(cleanLine);
      }
    }

    if (currentDay) {
      result.days.push(currentDay);
    }

    return result;
  }, [itineraryText]);

  const hasStructuredDays = parsed.days.length > 0;

  return (
    <div className="space-y-10">
      {/* 1. Header Banner */}
      <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-accent/10 p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <TbMapPin size={14} /> {destination}
          </span>
          {duration && (
            <span className="px-3 py-1 rounded-full bg-surface border border-border text-foreground text-xs font-bold flex items-center gap-1.5">
              <TbCalendar size={14} className="text-accent" /> {duration} Days
            </span>
          )}
          {budget && (
            <span className="px-3 py-1 rounded-full bg-surface border border-border text-foreground text-xs font-bold flex items-center gap-1.5">
              <TbCoin size={14} className="text-amber-500" /> {typeof budget === 'number' ? `₹${budget.toLocaleString()}` : budget}
            </span>
          )}
          {vibe && (
            <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center gap-1.5">
              <TbSparkles size={14} /> {vibe}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-3">
          Your Customized Itinerary for <span className="gradient-text">{destination}</span>
        </h1>
        <p className="text-muted text-sm sm:text-base max-w-2xl">
          Crafted by VOYNEX AI based on your travel vibe, time horizon, and realistic budgets.
        </p>
      </div>

      {/* 2. Overview & Highlights */}
      {parsed.overviewSummary.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-md"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
              <TbCompass size={22} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {parsed.overviewTitle || 'Trip Overview & Highlights'}
            </h2>
          </div>
          <div className="space-y-2 text-muted leading-relaxed text-sm sm:text-base">
            {parsed.overviewSummary.map((line, idx) => (
              <p key={idx} className="flex items-start gap-2">
                <span className="text-accent mt-1">•</span>
                <span>{line}</span>
              </p>
            ))}
          </div>
        </motion.div>
      )}

      {/* 3. Day-by-Day Timeline */}
      {hasStructuredDays ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2.5">
              <TbCalendar className="text-primary" size={26} /> Day-by-Day Experience
            </h2>
            <span className="text-xs font-bold text-muted bg-surface px-3 py-1.5 rounded-full border border-border">
              {parsed.days.length} Total Days
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {parsed.days.map((day, idx) => (
              <motion.div
                key={day.dayNumber}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="rounded-3xl border border-border bg-card overflow-hidden shadow-md hover:border-accent/40 transition-colors"
              >
                {/* Day Header Banner */}
                <div className="bg-surface/80 border-b border-border px-6 py-4 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-teal text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      D{day.dayNumber}
                    </span>
                    <h3 className="font-bold text-lg sm:text-xl text-foreground">{day.title}</h3>
                  </div>
                  <span className="text-xs font-semibold text-accent px-3 py-1 rounded-full bg-accent/10">
                    Day {day.dayNumber} of {parsed.days.length}
                  </span>
                </div>

                {/* Day Periods Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Morning */}
                  <div className="rounded-2xl border border-border/60 bg-background/50 p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                      <TbSun size={18} />
                      <span>Morning</span>
                    </div>
                    <div className="space-y-1.5 text-xs sm:text-sm text-muted">
                      {day.morning && day.morning.length > 0 ? (
                        day.morning.map((m, i) => <p key={i}>• {m.replace(/morning[:\s]*/i, '')}</p>)
                      ) : (
                        <p className="italic text-muted/60">Breakfast & morning sights</p>
                      )}
                    </div>
                  </div>

                  {/* Afternoon */}
                  <div className="rounded-2xl border border-border/60 bg-background/50 p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-orange-500 font-bold text-sm">
                      <TbSunset size={18} />
                      <span>Afternoon</span>
                    </div>
                    <div className="space-y-1.5 text-xs sm:text-sm text-muted">
                      {day.afternoon && day.afternoon.length > 0 ? (
                        day.afternoon.map((a, i) => <p key={i}>• {a.replace(/afternoon[:\s]*/i, '')}</p>)
                      ) : (
                        <p className="italic text-muted/60">Lunch, exploration & activities</p>
                      )}
                    </div>
                  </div>

                  {/* Evening */}
                  <div className="rounded-2xl border border-border/60 bg-background/50 p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                      <TbMoon size={18} />
                      <span>Evening & Night</span>
                    </div>
                    <div className="space-y-1.5 text-xs sm:text-sm text-muted">
                      {day.evening && day.evening.length > 0 ? (
                        day.evening.map((e, i) => <p key={i}>• {e.replace(/evening[:\s]*/i, '')}</p>)
                      ) : (
                        <p className="italic text-muted/60">Sunset spots, dinner & leisure</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional notes if any */}
                {day.generalNotes && day.generalNotes.length > 0 && (
                  <div className="px-6 pb-4 pt-1 text-xs text-muted/80 border-t border-border/40">
                    {day.generalNotes.map((note, nIdx) => (
                      <p key={nIdx} className="mt-1">
                        ℹ️ {note}
                      </p>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        /* Fallback if format is unstructured text */
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TbCalendar className="text-accent" size={20} /> Itinerary Details
          </h2>
          <div className="space-y-3 leading-relaxed text-muted text-sm sm:text-base">
            {itineraryText.split('\n\n').map((para, idx) => (
              <p key={idx} className="bg-background/40 p-4 rounded-xl border border-border/40">
                {para.replace(/[#*]/g, '').trim()}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* 4. Budget Breakdown Grid */}
      {parsed.budgetItems.length > 0 && (
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <TbCurrencyRupee size={22} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Estimated Budget Breakdown</h2>
              <p className="text-xs sm:text-sm text-muted">Realistic estimates for accommodation, dining & travel</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {parsed.budgetItems.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-border/80 bg-background flex flex-col justify-between"
              >
                <span className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  {item.label}
                </span>
                <span className="text-lg font-bold text-accent">
                  {item.amount || 'Included in plan'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Packing Essentials & Travel Tips Two-Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Packing Checklist */}
        {parsed.packingItems.length > 0 && (
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-teal/10 text-teal">
                  <TbLuggage size={22} />
                </div>
                <h2 className="text-xl font-bold text-foreground">Essential Packing Checklist</h2>
              </div>
              <p className="text-xs text-muted mb-4">Check off items as you pack for {destination}:</p>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {parsed.packingItems.map((item, idx) => {
                  const isChecked = !!checkedItems[idx];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleCheck(idx)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-sm transition-all ${
                        isChecked
                          ? 'bg-primary/10 border-primary/40 text-primary line-through'
                          : 'bg-background hover:bg-surface-hover border-border text-foreground'
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-md flex items-center justify-center border transition-all ${
                          isChecked ? 'bg-primary border-primary text-white' : 'border-muted'
                        }`}
                      >
                        {isChecked && <TbCheck size={14} />}
                      </div>
                      <span className="flex-1">{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Pro Travel Tips */}
        {parsed.travelTips.length > 0 && (
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                  <TbBulb size={22} />
                </div>
                <h2 className="text-xl font-bold text-foreground">Local Travel Tips & Etiquette</h2>
              </div>
              <p className="text-xs text-muted mb-4">Practical recommendations from seasoned travelers:</p>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {parsed.travelTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-border/80 bg-background text-xs sm:text-sm text-muted leading-relaxed flex items-start gap-2.5"
                  >
                    <span className="text-accent font-bold mt-0.5">•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
