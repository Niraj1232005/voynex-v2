'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { TbMessageCircle, TbX, TbSend, TbStarFilled, TbMapPin, TbClock, TbArrowRight } from 'react-icons/tb';
import { ChatMessage, Trip } from '@/types';
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
      text: `Here are top database trip packages matching "${msg}":`,
      trips: matched
    };
  }

  if (lower.includes('hello') || lower.includes('hi')) {
    return {
      text: "Hello! I am your AI travel advisor. Where would you like to travel?",
      trips: trips.slice(0, 2)
    };
  }

  return {
    text: "Here are some of our top rated active travel packages:",
    trips: trips.slice(0, 3)
  };
}

export default function GPTChatbot() {
  const [isOpen, setIsOpen] = useState(false);
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
      .catch(err => console.error('Error fetching trips for chatbot:', err));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isTyping, isOpen]);

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
    }, 800);
  };

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center hover:scale-105 transition-all z-50">
        {isOpen ? <TbX size={24} /> : <TbMessageCircle size={26} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col z-50">
            <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Voynex AI Advisor</h3>
                <p className="text-[10px] opacity-80">Instant trip recommendations</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg">
                <TbX size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-foreground border border-border'}`}>
                    {msg.content}
                  </div>
                  {msg.trips && msg.trips.length > 0 && (
                    <div className="mt-2 space-y-2 w-full">
                      {msg.trips.map(trip => (
                        <Link key={trip._id || (trip as any).id} href={`/trips/${trip._id || (trip as any).id}`} onClick={() => setIsOpen(false)}
                          className="block p-2.5 rounded-xl border border-border bg-background hover:border-primary transition-all">
                          <p className="font-bold text-foreground truncate">{trip.title}</p>
                          <div className="flex justify-between items-center mt-1 text-[10px] text-muted">
                            <span>{trip.destination}</span>
                            <span className="font-bold text-primary">₹{(trip.price || 0).toLocaleString()}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isTyping && <div className="text-muted text-[10px]">Typing...</div>}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="p-3 border-t border-border flex gap-2">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
              <button type="submit" className="p-2 bg-primary text-primary-foreground rounded-xl">
                <TbSend size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
