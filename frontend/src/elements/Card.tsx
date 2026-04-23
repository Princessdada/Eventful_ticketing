'use client';

import React from 'react';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    price: number;
    image?: string;
  };
}

const ClientOnlyDate = ({ date }: { date: string }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <span className="opacity-0">--</span>;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return <span>Invalid Date</span>;

  return (
    <span>
      {dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}
    </span>
  );
};

const EventCardItem = ({ event }: EventCardProps) => {
  const isFree = !event.price || event.price === 0;

  return (
    <div
      className="
        flex flex-col
        bg-[#0d1117] border border-white/[0.07]
        rounded-2xl overflow-hidden
        hover:border-indigo-500/40 hover:-translate-y-1
        transition-all duration-200
        shadow-lg hover:shadow-indigo-500/10 hover:shadow-2xl
      "
    >
      <Link
        href={`/events/${event.id}`}
        className="block relative flex-shrink-0 overflow-hidden"
        style={{ height: '200px' }}
      >
        <img
          src={
            event.image ||
            'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1000'
          }
          alt={event.title}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300 scale-100 hover:scale-105"
          style={{ transition: 'transform 0.4s ease' }}
        />

        <div
          className="
            absolute top-3 right-3
            py-1.5 px-3
            bg-black/70 backdrop-blur-md
            rounded-xl border border-white/10
            text-[11px] font-black text-white tracking-widest uppercase
          "
        >
          {isFree ? 'Free' : `N${event.price?.toLocaleString()}`}
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-6 gap-4">

        <Link href={`/events/${event.id}`}>
          <h3
            className="
              text-[15px] font-black text-white leading-snug
              hover:text-indigo-400 transition-colors duration-150
              line-clamp-2
            "
          >
            {event.title}
          </h3>
        </Link>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5 text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <Calendar size={13} className="text-indigo-500 flex-shrink-0" />
            <ClientOnlyDate date={event.date} />
          </div>
          <div className="flex items-center gap-2.5 text-xs text-indigo-400 font-semibold uppercase tracking-wider">
            <MapPin size={13} className="flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        <div className="flex-1" />

        <Link
          href={`/events/${event.id}`}
          className="
            w-full flex items-center justify-center gap-2
            py-4 px-6 mt-2
            bg-indigo-600
            rounded-xl
            text-[12px] font-black text-white uppercase tracking-[0.15em]
            hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30
            active:scale-[0.98]
            transition-all duration-200
          "
        >
          Book Ticket
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default EventCardItem;
