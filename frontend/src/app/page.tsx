'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import EventCard from '@/elements/Card';
import Link from 'next/link';

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';
      try {
        const response = await fetch(`${API_URL}/events`);
        if (response.ok) {
          const data = await response.json();
          // Take the first 3 real events for the featured section
          setEvents(data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to fetch home events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="container mx-auto px-6 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center py-20 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6 py-2 px-4 glass inline-flex items-center gap-2 text-sm font-medium text-indigo-400"
        >
          <Sparkles size={16} />
          <span>Discover the most exclusive events</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-4xl mb-8"
        >
          Experience Life at Your <br />
          <span className="text-white">Own Pace.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-xl text-slate-400 max-w-2xl mb-10"
        >
          Eventful brings you closer to the moments that matter. From underground festivals to high-level tech summits, book your spot in seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link href="/events" className="btn-primary text-lg px-10 py-4 shadow-indigo-500/20 shadow-2xl">
            <ArrowRight size={20} />
            Explore Events
          </Link>
          <button className="btn-outline text-lg px-10 py-4">
            How it Works
          </button>
        </motion.div>
      </section>

      {/* Featured Events Section */}
      <section className="mt-32">
        <div className="flex justify-between items-end mb-12">
          <div>
            <div className="text-indigo-500 font-bold tracking-widest uppercase text-sm mb-2 flex items-center gap-2">
              <TrendingUp size={16} />
              Featured Moments
            </div>
            <h2 className="text-4xl font-extrabold text-white">Trending Near You</h2>
          </div>
          <Link href="/events" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium flex items-center gap-1">
            <ArrowRight size={16} /> View All
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-slate-500 font-bold tracking-widest text-xs uppercase">
            Syncing Events...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.length > 0 ? (
              events.map((event) => (
                <EventCard 
                  key={event._id || event.id} 
                  event={{ ...event, id: event._id || event.id }} 
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl text-slate-600 font-bold uppercase tracking-widest text-sm">
                No recent events found
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
