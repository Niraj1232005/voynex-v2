'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TbMessageCircle, TbSend, TbStarFilled, TbMapPin, TbClock, TbArrowRight, TbCpu } from 'react-icons/tb';
import { ChatMessage, Trip } from '@/types';
import Breadcrumbs from '@/components/Breadcrumbs';
import EmptyState from '@/components/EmptyState';
import { api } from '@/lib/api';

const INITIAL_MESSAGE: ChatMessage = {
  id: '0', role: 'assistant',
  content: "Tell me your dream trip — budget, days, vibe, group size",
  timestamp: new Date()
};

function findMatchingTrips(msg: string, trips: Trip[]): Trip[] {
  const lower = msg.toLowerCase();
  let matches: Trip[] = [];

  trips.forEach(trip => {
    const destLower = (trip.destination || '').toLowerCase();
    const titleLower = (trip.title || '').toLowerCase();
    if (lower.includes(destLower.split(',')[0].toLowerCase()) || lower.includes(titleLower.split(' ')[0].toLowerCase())) {
      matches.push(trip);
    }
  });

  if (matches.length === 0) {
    const activityKeywords: Record<string, string[]> = {
      'adventure': ['adventure', 'trek', 'trekking', 'hiking', 'extreme', 'thrill'],
      'beach': ['beach', 'sea', 'ocean', 'coast', 'sun', 'swim', 'sand'],
      'culture': ['culture', 'heritage', 'history', 'temple', 'fort', 'palace', 'museum'],
      'nature': ['nature', 'mountain', 'hill', 'forest', 'wildlife', 'scenic', 'green'],
      'wellness': ['wellness', 'spa', 'relax', 'peaceful', 'calm', 'ayurved'],
      'water-sports': ['water sport', 'diving', 'scuba', 'snorkel', 'surf', 'kayak'],
    };

    for (const [activity, keywords] of Object.entries(activityKeywords)) {
      if (keywords.some(k => lower.includes(k))) {
        matches.push(...trips.filter(t => (t.activityType || []).includes(activity)));
      }
    }
  }

  const budgetMatch = lower.match(/(?:budget|under|below|max|within|around)\s*(?:₹|rs\.?|inr)?\s*(\d+[,\d]*)/i);
  if (budgetMatch) {
    const budget = parseInt(budgetMatch[1].replace(/,/g, ''));
    const budgetTrips = trips.filter(t => t.price <= budget);
    if (budgetTrips.length > 0) {
      matches = matches.length > 0 ? matches.filter(t => t.price <= budget) : budgetTrips;
    }
  }

  const unique = [...new Map(matches.map(t => [t._id || (t as any).id, t])).values()];
  return unique.slice(0, 3);
}

function generateResponse(msg: string, trips: Trip[]): { text: string; trips: Trip[] } {
  const matched = findMatchingTrips(msg, trips);
  const lower = msg.toLowerCase();

  if (matched.length > 0) {
    return {
      text: `Based on your request, here are top recommended packages matching "${msg}":`,
      trips: matched
    };
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return {
      text: "Hello! I am your AI travel advisor. Tell me where you'd like to travel, your budget, or desired duration!",
      trips: trips.slice(0, 2)
    };
  }

  return {
    text: "I explored our active packages database, and here are top available travel options for your upcoming journey:",
    trips: trips.slice(0, 3)
  };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/trips')
      .then(res => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setTrips(list);
      })
      .catch(err => console.error('Error fetching trips for AI assistant:', err));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(text, trips);
      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: response.text,
        trips: response.trips,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen">
      <Breadcrumbs />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-4 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <TbCpu className="text-primary" /> AI Travel Assistant
            </h1>
            <p className="text-muted mt-1 text-sm">Ask anything about trips, destinations, budgets, or custom itineraries</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[650px]">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 text-sm font-medium ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-muted/40 border border-border text-foreground rounded-bl-none'
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>

                {msg.trips && msg.trips.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                    {msg.trips.map(trip => (
                      <Link key={trip._id || (trip as any).id} href={`/trips/${trip._id || (trip as any).id}`}
                        className="group p-3.5 rounded-2xl border border-border bg-card hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-primary flex items-center gap-1">
                            <TbMapPin size={12} /> {trip.destination}
                          </span>
                          <span className="text-xs font-bold text-foreground">₹{(trip.price || 0).toLocaleString()}</span>
                        </div>
                        <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">{trip.title}</h4>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-xl w-fit text-muted text-xs font-medium animate-pulse">
                <TbCpu size={14} className="animate-spin text-primary" /> AI Advisor is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-border bg-background">
            <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <input type="text" value={input} onChange={e => setInput(e.target.value)}
                placeholder="Ask about trips in Manali, beach packages under ₹15,000..."
                className="flex-1 px-4 py-3 rounded-2xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <button type="submit" disabled={!input.trim()}
                className="px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all disabled:opacity-50">
                <TbSend size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
