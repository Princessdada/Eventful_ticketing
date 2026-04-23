'use client';

import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Calendar as CalendarIcon,
  DollarSign,
  Check,
  Trash2,
} from 'lucide-react';
import EventCardItem from '@/elements/Card';

type SortKey = '' | 'date-asc' | 'date-desc' | 'price-asc' | 'price-desc' | 'name';
type Menu = 'none' | 'sort' | 'filter';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [activeMenu, setActiveMenu] = useState<Menu>('none');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';
      console.log('Fetching from:', API_URL);
      try {
        const response = await fetch(`${API_URL}/events`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log('Fetched events count:', data.length);
        setEvents(data);
        setFilteredEvents(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Could not load events. Check your backend status.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    console.log('Filtering logic triggered. Total events in state:', events.length);
    let result = [...events];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q)
      );
    }
    if (maxPrice) result = result.filter((e) => (e.price || 0) <= parseInt(maxPrice));
    if (selectedDate) {
      result = result.filter((e) => {
        const eventDate = new Date(e.date).toISOString().split('T')[0];
        return eventDate === selectedDate;
      });
    }
    if (sortBy === 'date-asc') result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (sortBy === 'date-desc') result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (sortBy === 'price-asc') result.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sortBy === 'price-desc') result.sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sortBy === 'name') result.sort((a, b) => a.title.localeCompare(b.title));
    setFilteredEvents(result);
  }, [searchQuery, maxPrice, selectedDate, sortBy, events]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
        setActiveMenu('none');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const sortOptions: { value: SortKey; label: string }[] = [
    { value: 'date-asc', label: 'Date — Soonest First' },
    { value: 'date-desc', label: 'Date — Latest First' },
    { value: 'price-asc', label: 'Price — Low to High' },
    { value: 'price-desc', label: 'Price — High to Low' },
    { value: 'name', label: 'Name — A to Z' },
  ];

  const hasFilters = !!(maxPrice || selectedDate);

  return (
    <div className="bg-[#050810] min-h-screen text-slate-300 pb-40">
      <div className="max-w-[1400px] mx-auto px-6">
        <header className="pt-32 mb-16">
          <h1 className="text-6xl font-black text-white tracking-tighter leading-tight mb-12">
            Explore <br />
            <span className="text-slate-700 italic">Experiences</span>
          </h1>

          {/* ── BOLD TAILWIND SEARCH HEADER ── */}
          <div className="flex flex-col md:flex-row items-stretch gap-8 w-full">
            
            {/* Search Pill */}
            <div className={`flex items-center md:w-[600px] h-[100px] bg-[#0d1117]/80 backdrop-blur-xl border rounded-full px-10 gap-5 transition-all duration-300 shadow-2xl group
              ${isFocused ? 'border-indigo-500/50 shadow-[0_0_60px_-15px_rgba(99,102,241,0.35)]' : 'border-white/[0.08] shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)]'}`}>
              <Search
                size={26}
                className={`transition-colors duration-200 flex-shrink-0 ${isFocused || searchQuery ? 'text-indigo-400' : 'text-slate-500'}`}
              />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search events, vibes…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="flex-1 bg-transparent outline-none font-bold text-white placeholder:text-slate-600 text-lg min-w-0"
              />
              {searchQuery ? (
                <button
                  onClick={() => { setSearchQuery(''); inputRef.current?.focus(); }}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 hover:text-white transition-colors flex-shrink-0"
                >
                  <X size={18} />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] font-black text-slate-500 tracking-widest flex-shrink-0">
                  ⌘K
                </kbd>
              )}
            </div>

            {/* Action Group */}
            <div className="flex flex-row items-stretch gap-4">
              {/* Sort */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === 'sort' ? 'none' : 'sort')}
                  className={`flex items-center gap-4 h-[100px] px-14 rounded-full border text-[13px] font-black uppercase tracking-[0.25em] whitespace-nowrap transition-all duration-300 shadow-2xl backdrop-blur-xl
                    ${activeMenu === 'sort' || sortBy
                      ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300'
                      : 'bg-[#0d1117]/80 border-white/[0.08] text-slate-400 hover:border-white/20 hover:text-white'}`}
                >
                  <ArrowUpDown size={20} />
                  Sort
                </button>
                
                {activeMenu === 'sort' && (
                  <div className="absolute top-[calc(100%+16px)] right-0 w-72 bg-[#0d111a]/95 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] z-50 overflow-hidden">
                    {sortOptions.map((opt) => {
                      const active = sortBy === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => { setSortBy(active ? '' : opt.value); setActiveMenu('none'); }}
                          className={`w-full flex items-center justify-between px-5 py-5 rounded-[2rem] text-[15px] font-bold transition-all duration-150
                            ${active ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                        >
                          {opt.label}
                          {active && <Check size={18} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Filter */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === 'filter' ? 'none' : 'filter')}
                  className={`flex items-center gap-4 h-[100px] px-14 rounded-full border text-[13px] font-black uppercase tracking-[0.25em] whitespace-nowrap transition-all duration-300 shadow-2xl backdrop-blur-xl
                    ${activeMenu === 'filter' || hasFilters
                      ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300'
                      : 'bg-[#0d1117]/80 border-white/[0.08] text-slate-400 hover:border-white/20 hover:text-white'}`}
                >
                  <SlidersHorizontal size={20} />
                  Filter
                  {hasFilters && <span className="w-4 h-4 rounded-full bg-indigo-500 ml-1 animate-pulse" />}
                </button>

                {activeMenu === 'filter' && (
                  <div className="absolute top-[calc(100%+16px)] right-0 w-80 bg-[#0d111a]/95 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] z-50 space-y-7">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <DollarSign size={13} className="text-indigo-400" /> Max Price
                      </div>
                      <input
                        type="number"
                        placeholder="e.g. 5000"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-indigo-500 transition-colors"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        {[500, 2000, 10000].map((p) => {
                          const active = maxPrice === p.toString();
                          return (
                            <button
                              key={p}
                              onClick={() => setMaxPrice(active ? '' : p.toString())}
                              className={`py-2 rounded-xl text-[11px] font-black transition-colors border
                                ${active ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-white/5 text-slate-400 border-transparent hover:bg-white/10'}`}
                            >
                              N{p >= 1000 ? `${p / 1000}k` : p}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="h-px bg-white/10" />

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <CalendarIcon size={13} className="text-indigo-400" /> Date
                      </div>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-indigo-500 transition-colors"
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>

                    {hasFilters && (
                      <button
                        onClick={() => { setMaxPrice(''); setSelectedDate(''); }}
                        className="w-full py-4 flex items-center justify-center gap-3 text-red-400 hover:text-red-300 text-[11px] font-black uppercase tracking-[0.2em] transition-colors border-t border-white/10"
                      >
                        <Trash2 size={14} /> Clear Filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {searchQuery && !loading && (
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-500 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              {filteredEvents.length} {filteredEvents.length === 1 ? 'result' : 'results'} for &ldquo;{searchQuery}&rdquo;
            </div>
          )}
        </header>

        {loading ? (
          <div className="py-40 text-center text-slate-800 font-extrabold uppercase tracking-[0.4em] text-xs animate-pulse font-mono">
            Syncing_Data...
          </div>
        ) : error ? (
          <div className="py-40 text-center text-red-500/80 font-black text-sm uppercase tracking-widest">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {filteredEvents.map((event) => (
              <EventCardItem
                key={event._id || event.id}
                event={{ ...event, id: event._id || event.id }}
              />
            ))}
            {filteredEvents.length === 0 && (
              <div className="col-span-full py-60 text-center border-2 border-white/5 border-dashed rounded-[4rem] text-slate-800 font-black uppercase tracking-[0.6em] text-[10px]">
                No_matches_found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Close menus on click-outside */}
      {activeMenu !== 'none' && (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setActiveMenu('none')} />
      )}
    </div>
  );
}
