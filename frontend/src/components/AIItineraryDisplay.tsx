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
  TbDownload,
  TbPlus,
  TbBed,
  TbToolsKitchen2,
  TbCar,
  TbShieldCheck,
  TbTicket,
} from 'react-icons/tb';
import { generatePackingListPDF } from '@/lib/pdfGenerator';
import { useToast } from '@/contexts/ToastContext';

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

interface BudgetSubItem {
  name: string;
  amount: string;
}

interface BudgetCategory {
  category: string;
  totalAmount?: string;
  items: BudgetSubItem[];
  notes: string[];
}

interface ParsedItinerary {
  overviewTitle: string;
  overviewSummary: string[];
  days: DayPlan[];
  budgetCategories: BudgetCategory[];
  overallBudgetTotal?: string;
  budgetNotes: string[];
  rawPackingItems: string[];
  travelTips: string[];
}

function cleanMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/^[-*•+]\s+/, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_{1,2}(.*?)_{1,2}/g, '$1')
    .replace(/\*+/g, '')
    .replace(/^[:\s-]+/, '')
    .replace(/[:\s-]+$/, '')
    .trim();
}

function isDividerOrEmpty(text: string): boolean {
  const t = text.trim();
  return !t || t === '---' || t === '***' || t === '___' || t === '•' || t === '-';
}

function getBudgetCategoryIcon(cat: string) {
  const c = cat.toLowerCase();
  if (c.includes('hotel') || c.includes('stay') || c.includes('accommodat') || c.includes('resort') || c.includes('villa')) {
    return <TbBed size={20} className="text-blue-500" />;
  }
  if (c.includes('food') || c.includes('dine') || c.includes('dining') || c.includes('meal') || c.includes('restaurant')) {
    return <TbToolsKitchen2 size={20} className="text-amber-500" />;
  }
  if (c.includes('transport') || c.includes('travel') || c.includes('cab') || c.includes('flight') || c.includes('transfer') || c.includes('ride')) {
    return <TbCar size={20} className="text-emerald-500" />;
  }
  if (c.includes('activit') || c.includes('experience') || c.includes('tour') || c.includes('ticket') || c.includes('sight')) {
    return <TbTicket size={20} className="text-teal" />;
  }
  if (c.includes('buffer') || c.includes('emergency') || c.includes('contingenc')) {
    return <TbShieldCheck size={20} className="text-purple-500" />;
  }
  return <TbCoin size={20} className="text-teal" />;
}

export default function AIItineraryDisplay({
  itineraryText,
  destination,
  duration,
  budget,
  vibe,
}: AIItineraryDisplayProps) {
  const { showToast } = useToast();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [customItems, setCustomItems] = useState<{ id: string; item: string; category: string; checked: boolean }[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [activePackingCategory, setActivePackingCategory] = useState<string>('All');

  // Parse markdown into structured data with clean formatting
  const parsed = useMemo<ParsedItinerary>(() => {
    const result: ParsedItinerary = {
      overviewTitle: '',
      overviewSummary: [],
      days: [],
      budgetCategories: [],
      overallBudgetTotal: undefined,
      budgetNotes: [],
      rawPackingItems: [],
      travelTips: [],
    };

    if (!itineraryText) return result;

    const lines = itineraryText.split('\n');
    let currentSection = 'start';
    let currentDay: DayPlan | null = null;
    let currentDayPeriod: 'morning' | 'afternoon' | 'evening' | 'general' = 'general';

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i].trim();
      if (!rawLine || isDividerOrEmpty(rawLine)) continue;

      // Section Headings (## or #)
      if (rawLine.startsWith('# ') || rawLine.startsWith('## ')) {
        const lower = rawLine.toLowerCase();

        if (currentDay) {
          result.days.push(currentDay);
          currentDay = null;
        }

        if (lower.includes('overview') || lower.includes('highlights') || lower.includes('summary')) {
          currentSection = 'overview';
          result.overviewTitle = cleanMarkdown(rawLine.replace(/^[#\s🌟✨]+/, ''));
        } else if (lower.includes('day') || lower.includes('plan') || lower.includes('itinerary')) {
          currentSection = 'days';
        } else if (lower.includes('budget') || lower.includes('cost') || lower.includes('expense')) {
          currentSection = 'budget';
        } else if (lower.includes('pack') || lower.includes('gear') || lower.includes('checklist')) {
          currentSection = 'packing';
        } else if (lower.includes('tip') || lower.includes('etiquette') || lower.includes('note')) {
          currentSection = 'tips';
        }
        continue;
      }

      // Day Sub-Headings (### Day 1...)
      if (rawLine.startsWith('### ') && (rawLine.toLowerCase().includes('day') || currentSection === 'days')) {
        if (currentDay) {
          result.days.push(currentDay);
        }

        const matchDayNum = rawLine.match(/day\s*(\d+)/i);
        const dayNumber = matchDayNum ? parseInt(matchDayNum[1], 10) : result.days.length + 1;
        const cleanedTitle = cleanMarkdown(
          rawLine.replace(/^###\s*/, '').replace(/day\s*\d+[:\s-]*/i, '')
        ) || `Day ${dayNumber}`;

        currentDay = {
          dayNumber,
          title: cleanedTitle,
          morning: [],
          afternoon: [],
          evening: [],
          generalNotes: [],
        };
        currentDayPeriod = 'general';
        continue;
      }

      const cleanLine = cleanMarkdown(rawLine);
      if (isDividerOrEmpty(cleanLine)) continue;

      // Section Dispatch
      if (currentSection === 'overview') {
        result.overviewSummary.push(cleanLine);
      } else if (currentSection === 'days' || currentDay) {
        if (!currentDay) {
          currentDay = {
            dayNumber: result.days.length + 1,
            title: `Day ${result.days.length + 1}`,
            morning: [],
            afternoon: [],
            evening: [],
            generalNotes: [],
          };
        }

        const lowerLine = rawLine.toLowerCase();
        if (lowerLine.includes('morning')) currentDayPeriod = 'morning';
        else if (lowerLine.includes('afternoon')) currentDayPeriod = 'afternoon';
        else if (lowerLine.includes('evening') || lowerLine.includes('night')) currentDayPeriod = 'evening';

        const slotText = cleanLine
          .replace(/^morning[:\s-]*/i, '')
          .replace(/^afternoon[:\s-]*/i, '')
          .replace(/^evening[:\s-]*/i, '')
          .replace(/^night[:\s-]*/i, '')
          .trim();

        if (slotText && !isDividerOrEmpty(slotText)) {
          if (currentDayPeriod === 'morning') currentDay.morning?.push(slotText);
          else if (currentDayPeriod === 'afternoon') currentDay.afternoon?.push(slotText);
          else if (currentDayPeriod === 'evening') currentDay.evening?.push(slotText);
          else currentDay.generalNotes?.push(slotText);
        }
      } else if (currentSection === 'budget') {
        const lower = rawLine.toLowerCase();

        // 1. Advisory note
        if (lower.startsWith('*note') || lower.startsWith('note:') || lower.startsWith('tip:')) {
          result.budgetNotes.push(cleanMarkdown(rawLine));
          continue;
        }

        // 2. Overall total estimate line
        if (
          lower.includes('total estimated') ||
          lower.includes('estimated total') ||
          lower.includes('grand total') ||
          (cleanLine.toLowerCase().startsWith('total:') && result.budgetCategories.length >= 2)
        ) {
          const colonIdx = rawLine.indexOf(':');
          if (colonIdx !== -1) {
            result.overallBudgetTotal = cleanMarkdown(rawLine.substring(colonIdx + 1));
          } else {
            result.overallBudgetTotal = cleanLine;
          }
          continue;
        }

        // 3. Category Header Detection
        const isIndented = rawLine.startsWith('  ') || rawLine.startsWith('\t');
        const isMainCategoryMarker =
          !isIndented &&
          (rawLine.startsWith('- **') ||
            rawLine.startsWith('* **') ||
            lower.includes('accommodation') ||
            lower.includes('food & dining') ||
            lower.includes('transport') ||
            lower.includes('activities') ||
            lower.includes('experiences') ||
            lower.includes('buffer') ||
            lower.includes('emergency'));

        if (isMainCategoryMarker) {
          const colonIdx = rawLine.indexOf(':');
          let catName = '';
          let catAmount = '';
          let catNote = '';

          if (colonIdx !== -1) {
            catName = cleanMarkdown(rawLine.substring(0, colonIdx));
            const afterColon = rawLine.substring(colonIdx + 1).trim();
            const cleanedAfter = cleanMarkdown(afterColon);

            if (cleanedAfter && /[\d₹]/.test(cleanedAfter)) {
              const parenMatch = cleanedAfter.match(/\((.*?)\)/);
              if (parenMatch) {
                catNote = parenMatch[1];
                catAmount = cleanMarkdown(cleanedAfter.replace(/\(.*?\)/, ''));
              } else {
                catAmount = cleanedAfter;
              }
            }
          } else {
            catName = cleanMarkdown(rawLine);
          }

          const newCategory: BudgetCategory = {
            category: catName,
            totalAmount: catAmount,
            items: [],
            notes: catNote ? [catNote] : [],
          };
          result.budgetCategories.push(newCategory);
          continue;
        }

        // 4. Line within the active category
        const currentCat = result.budgetCategories[result.budgetCategories.length - 1];
        if (!currentCat) {
          result.budgetNotes.push(cleanLine);
          continue;
        }

        // If line is a category Total
        if (cleanLine.toLowerCase().startsWith('total:') || cleanLine.toLowerCase().startsWith('total ')) {
          const amt = cleanMarkdown(cleanLine.replace(/^total[:\s-]*/i, ''));
          if (amt) {
            currentCat.totalAmount = amt;
          }
          continue;
        }

        // If line is an explanatory parenthetical note
        if (rawLine.trim().startsWith('*(') || rawLine.trim().startsWith('(')) {
          const noteText = cleanMarkdown(rawLine).replace(/^\(/, '').replace(/\)$/, '').trim();
          if (noteText) currentCat.notes.push(noteText);
          continue;
        }

        // If line has a colon (sub-item: amount)
        const colonIdx = rawLine.indexOf(':');
        const dashIdx = rawLine.indexOf('—') !== -1 ? rawLine.indexOf('—') : rawLine.indexOf('–');

        if (colonIdx !== -1) {
          const subName = cleanMarkdown(rawLine.substring(0, colonIdx));
          const subAmt = cleanMarkdown(rawLine.substring(colonIdx + 1));
          if (subName.toLowerCase() === 'total') {
            currentCat.totalAmount = subAmt;
          } else if (subName && subAmt) {
            currentCat.items.push({ name: subName, amount: subAmt });
          } else if (subName) {
            currentCat.notes.push(subName);
          }
        } else if (dashIdx !== -1) {
          const subName = cleanMarkdown(rawLine.substring(0, dashIdx));
          const subAmt = cleanMarkdown(rawLine.substring(dashIdx + 1));
          if (subName && subAmt) {
            currentCat.items.push({ name: subName, amount: subAmt });
          }
        } else {
          currentCat.notes.push(cleanLine);
        }
      } else if (currentSection === 'packing') {
        result.rawPackingItems.push(cleanLine);
      } else if (currentSection === 'tips') {
        result.travelTips.push(cleanLine);
      }
    }

    if (currentDay) {
      result.days.push(currentDay);
    }

    // Clean up budget categories
    for (const cat of result.budgetCategories) {
      cat.category = cleanMarkdown(cat.category);
      cat.items = cat.items.filter((i) => {
        if (i.name.toLowerCase() === 'total') {
          if (!cat.totalAmount) cat.totalAmount = i.amount;
          return false;
        }
        return true;
      });
      if (!cat.totalAmount && cat.items.length === 1) {
        cat.totalAmount = cat.items[0].amount;
      }
    }
    result.budgetCategories = result.budgetCategories.filter((cat) => {
      const lower = cat.category.toLowerCase();
      if (lower === 'total' || lower.includes('total estimated') || lower.includes('grand total')) {
        if (!result.overallBudgetTotal && cat.totalAmount) {
          result.overallBudgetTotal = cat.totalAmount;
        }
        return false;
      }
      return cat.category.length > 0;
    });

    return result;
  }, [itineraryText]);

  // Integrated Smart Packing: Combine smart destination defaults + AI output items
  const fullPackingList = useMemo(() => {
    const items: { id: string; item: string; category: string; checked: boolean }[] = [];
    let idCounter = 0;
    const add = (item: string, category: string) => {
      items.push({ id: `item-${++idCounter}`, item, category, checked: !!checkedItems[`item-${idCounter}`] });
    };

    // 1. Universal Essentials
    ['Passport / Government ID', 'Travel Booking Tickets & Docs', 'Credit/Debit Cards & Cash', 'Phone Charger & Multi-plug Adapter', 'High-capacity Power Bank'].forEach((i) =>
      add(i, 'Essentials')
    );

    // 2. Weather & Destination Clothing
    const destLower = (destination || '').toLowerCase();
    const isCold = ['manali', 'ladakh', 'leh', 'kashmir', 'shimla', 'switzerland', 'alps', 'spiti'].some((c) => destLower.includes(c));
    const isBeach = ['goa', 'bali', 'andaman', 'kerala', 'phuket', 'maldives', 'havelock'].some((c) => destLower.includes(c));

    if (isCold) {
      ['Thermal base layers (top & bottom)', 'Fleece jacket / Down parka', 'Windproof / Waterproof jacket', 'Woolen socks (3+ pairs)', 'Warm insulated gloves', 'Beanie / Thermal cap', 'Waterproof hiking boots'].forEach((i) =>
        add(i, 'Clothing')
      );
    } else if (isBeach) {
      ['Swimwear / Rash guards', 'UV-protection Sunglasses', 'Lightweight linen / Cotton outfits', 'Quick-dry beach towel', 'Comfortable flip-flops / Sandals', 'Sun hat / Cap'].forEach((i) =>
        add(i, 'Clothing')
      );
    } else {
      ['Breathable cotton shirts / T-shirts', 'Comfortable walking pants / Jeans', 'Light cardigan or jacket', 'Cushioned walking sneakers'].forEach((i) =>
        add(i, 'Clothing')
      );
    }

    // 3. Toiletries & Skincare
    ['Broad-spectrum Sunscreen (SPF 50+)', 'Moisturizer / Lip balm', 'Toothbrush, paste & dental floss', 'Personal toiletries kit (travel size)', 'Refreshing wet wipes & sanitizer'].forEach((i) =>
      add(i, 'Toiletries')
    );

    // 4. Activity & Travel Gear
    if (vibe?.toLowerCase().includes('adventure') || isCold) {
      ['Trekking backpack with rain cover', 'Trekking poles', 'UV Sunglasses', 'Reusable insulated water bottle'].forEach((i) =>
        add(i, 'Gear')
      );
    } else {
      ['Daypack for sightseeing', 'Compact travel umbrella', 'Reusable water bottle'].forEach((i) =>
        add(i, 'Gear')
      );
    }

    // 5. Health & First Aid
    ['Personal prescription medicines', 'Basic first-aid kit & pain relievers', 'Antiseptic wipes & band-aids', 'ORS hydration salts', 'Motion sickness / altitude tablets'].forEach((i) =>
      add(i, 'Health')
    );

    // 6. Merge any specific AI-suggested items that aren't already included
    if (parsed.rawPackingItems && parsed.rawPackingItems.length > 0) {
      parsed.rawPackingItems.forEach((raw) => {
        const cleaned = raw.replace(/^[-*•]\s+/, '').trim();
        if (cleaned && !items.some((existing) => existing.item.toLowerCase().includes(cleaned.toLowerCase()))) {
          add(cleaned, 'Recommended');
        }
      });
    }

    return [...items, ...customItems];
  }, [destination, vibe, parsed.rawPackingItems, customItems, checkedItems]);

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const newItem = {
      id: `custom-${Date.now()}`,
      item: newItemText.trim(),
      category: activePackingCategory === 'All' ? 'Personal' : activePackingCategory,
      checked: false,
    };
    setCustomItems((prev) => [...prev, newItem]);
    setNewItemText('');
    showToast(`Added "${newItem.item}" to your packing checklist!`, 'success');
  };

  const handleDownloadPackingPDF = () => {
    try {
      generatePackingListPDF({
        destination,
        duration: duration || '5',
        activities: vibe ? [vibe] : ['Sightseeing'],
        items: fullPackingList.map((i) => ({
          id: i.id,
          item: i.item,
          category: i.category,
          checked: !!checkedItems[i.id],
        })),
      });
      showToast('Packing checklist PDF downloaded!', 'success');
    } catch {
      showToast('Failed to download packing PDF. Please try again.', 'error');
    }
  };

  const packingCategories = ['All', ...Array.from(new Set(fullPackingList.map((i) => i.category)))];
  const filteredPackingList = activePackingCategory === 'All'
    ? fullPackingList
    : fullPackingList.filter((i) => i.category === activePackingCategory);

  const totalPacked = fullPackingList.filter((i) => checkedItems[i.id]).length;
  const packedPercentage = fullPackingList.length > 0
    ? Math.round((totalPacked / fullPackingList.length) * 100)
    : 0;

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
          Crafted by VOYNEX AI based on your travel vibe, time horizon, realistic budgets, and essential packing guidance.
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
                        day.morning.map((m, i) => <p key={i}>• {cleanMarkdown(m)}</p>)
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
                        day.afternoon.map((a, i) => <p key={i}>• {cleanMarkdown(a)}</p>)
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
                        day.evening.map((e, i) => <p key={i}>• {cleanMarkdown(e)}</p>)
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
                        ℹ️ {cleanMarkdown(note)}
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
                {cleanMarkdown(para)}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* 4. Estimated Budget Breakdown */}
      {parsed.budgetCategories.length > 0 && (
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                <TbCurrencyRupee size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Estimated Budget Breakdown</h2>
                <p className="text-xs sm:text-sm text-muted">Realistic estimates categorized for your stay and experiences</p>
              </div>
            </div>

            {(parsed.overallBudgetTotal || budget) && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs sm:text-sm w-fit">
                <TbCoin size={17} />
                <span>
                  {parsed.overallBudgetTotal
                    ? `Estimated Total: ${parsed.overallBudgetTotal}`
                    : `Target Budget: ${typeof budget === 'number' ? `₹${budget.toLocaleString('en-IN')}` : budget}`}
                </span>
              </div>
            )}
          </div>

          {/* Clean 2-column Grid of Structured Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {parsed.budgetCategories.map((cat, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border/80 bg-background/60 hover:border-emerald-500/40 hover:bg-background/90 transition-all p-5 flex flex-col justify-between shadow-2xs space-y-3"
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-surface border border-border/60">
                        {getBudgetCategoryIcon(cat.category)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-foreground capitalize">
                          {cat.category}
                        </h3>
                        <span className="text-[10px] uppercase tracking-wider text-muted font-semibold">
                          Budget Category
                        </span>
                      </div>
                    </div>

                    {cat.totalAmount && (
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-sm whitespace-nowrap">
                        {cat.totalAmount}
                      </div>
                    )}
                  </div>

                  {/* Sub-items / Line items list */}
                  {cat.items.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-border/40">
                      {cat.items.map((sub, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center justify-between gap-3 text-xs py-1.5 px-3 rounded-lg bg-surface/60 border border-border/40"
                        >
                          <span className="text-foreground/90 font-medium truncate">
                            {sub.name}
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap flex-shrink-0">
                            {sub.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Category Notes */}
                  {cat.notes.length > 0 && (
                    <div className="space-y-1 pt-2">
                      {cat.notes.map((note, nIdx) => (
                        <p
                          key={nIdx}
                          className="text-[11px] text-muted leading-relaxed italic bg-surface/30 p-2 rounded-lg border border-border/20"
                        >
                          ℹ️ {note}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Budget Notes callout banner */}
          {parsed.budgetNotes.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <span className="font-bold flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-amber-600 dark:text-amber-400">
                <TbBulb size={14} /> Travel Budget Advisory:
              </span>
              {parsed.budgetNotes.map((note, nIdx) => (
                <p key={nIdx} className="leading-relaxed text-muted dark:text-amber-200/90">• {note}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Integrated Smart Packing Assistant */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal/10 text-teal">
              <TbLuggage size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Smart Packing Assistant</h2>
              <p className="text-xs sm:text-sm text-muted">
                Tailored checklist for {destination}&apos;s climate & activities
              </p>
            </div>
          </div>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={handleDownloadPackingPDF}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal/10 hover:bg-teal/20 text-teal border border-teal/20 text-xs font-bold transition-all w-fit"
          >
            <TbDownload size={15} /> Download Packing PDF
          </button>
        </div>

        {/* Packing Progress Meter */}
        <div className="p-4 rounded-2xl bg-surface border border-border space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-muted">Packing Readiness</span>
            <span className="text-teal">{totalPacked} of {fullPackingList.length} packed ({packedPercentage}%)</span>
          </div>
          <div className="w-full bg-border rounded-full h-2 overflow-hidden">
            <div
              className="bg-teal h-full transition-all duration-300 rounded-full"
              style={{ width: `${packedPercentage}%` }}
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {packingCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActivePackingCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activePackingCategory === cat
                  ? 'bg-teal text-white shadow-xs'
                  : 'bg-background hover:bg-surface border border-border text-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Packing Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
          {filteredPackingList.map((item) => {
            const isChecked = !!checkedItems[item.id];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleCheck(item.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs transition-all ${
                  isChecked
                    ? 'bg-teal/10 border-teal/40 text-teal line-through'
                    : 'bg-background hover:bg-surface border-border text-foreground'
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-md flex items-center justify-center border transition-all flex-shrink-0 ${
                    isChecked ? 'bg-teal border-teal text-white' : 'border-muted'
                  }`}
                >
                  {isChecked && <TbCheck size={13} />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="truncate block font-medium">{item.item}</span>
                  <span className="text-[10px] text-muted capitalize">{item.category}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Add Custom Item Input */}
        <form onSubmit={handleAddCustomItem} className="flex gap-2 pt-2 border-t border-border/60">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Add custom item (e.g. GoPro charger, earplugs)..."
            className="flex-1 px-4 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-teal"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-teal text-white text-xs font-bold hover:bg-teal/90 transition-all flex items-center gap-1"
          >
            <TbPlus size={14} /> Add Item
          </button>
        </form>
      </div>

      {/* 6. Pro Travel Tips & Etiquette */}
      {parsed.travelTips.length > 0 && (
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <TbBulb size={22} />
            </div>
            <h2 className="text-xl font-bold text-foreground">Local Travel Tips & Etiquette</h2>
          </div>
          <p className="text-xs text-muted mb-4">Practical recommendations from seasoned travelers:</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {parsed.travelTips.map((tip, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-border/80 bg-background text-xs sm:text-sm text-muted leading-relaxed flex items-start gap-2.5"
              >
                <span className="text-accent font-bold mt-0.5">•</span>
                <span>{cleanMarkdown(tip)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
