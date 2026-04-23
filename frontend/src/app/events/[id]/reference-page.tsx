'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, ArrowLeft, ShieldCheck, Clock, Ticket, Download, CheckCircle2, User, Share2, Plus } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import { QRCodeCanvas } from 'qrcode.react';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isPaid, setIsPaid] = useState(false);
  const [ticketId, setTicketId] = useState('');

  React.useEffect(() => {
    const fetchEvent = async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api';
      try {
        const response = await fetch(`${API_URL}/events/${id}`);
        if (!response.ok) throw new Error('Event not found');
        const data = await response.json();
        setEvent(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEvent();
  }, [id]);

  const handlePayment = () => {
    if (!event) return;
    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_c431160e713cbc149757b55f3d85246f5ab375c9',
      email: 'customer@example.com',
      amount: event.price * quantity * 100,
      currency: 'NGN',
      callback: () => {
        const newTicketId = `EF-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        setTicketId(newTicketId);
        setIsPaid(true);
      },
      onClose: () => alert('Payment cancelled'),
    });
    handler.openIframe();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white text-slate-400">Loading...</div>;
  if (error || !event) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
      <p>{error || 'Event not found'}</p>
      <Link href="/events" className="text-indigo-600 font-bold">Back to Events</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-800 font-sans">
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />

      {/* Hero Section */}
      <div className="bg-[#0D1B2E] text-white pt-8 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-12"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-8 flex flex-col md:flex-row gap-8 items-center lg:items-start">
              <div className="w-full md:w-[400px] h-[300px] rounded-xl overflow-hidden shadow-2xl bg-slate-800 flex-shrink-0">
                <img 
                   src={event.image || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&q=80&w=1200'} 
                   className="w-full h-full object-cover" 
                   alt={event.title} 
                />
              </div>
              <div className="space-y-6">
                <h1 className="text-4xl font-bold leading-tight">{event.title}</h1>
                <p className="text-slate-400 text-sm">By <span className="text-white font-medium">{event.creator?.name || 'Verified User'}</span></p>
                <div className="space-y-3 pt-4">
                   <div className="flex items-center gap-3 text-sm text-slate-300">
                     <MapPin size={18} className="text-indigo-400" />
                     {event.location}
                   </div>
                   <button className="text-indigo-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:text-indigo-300">
                     <MapPin size={14} /> View Map
                   </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 lg:sticky lg:top-8">
              <div className="bg-white rounded-2xl p-8 shadow-2xl text-slate-800 space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase text-slate-400 mb-2">Date & Time</h3>
                  <p className="text-base font-bold">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  <p className="text-slate-500 text-sm mt-1">{new Date(event.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
                  <button className="flex items-center gap-2 text-indigo-600 text-xs font-bold mt-4">
                    <Plus size={14} /> Add to Calendar
                  </button>
                </div>

                {!isPaid ? (
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <button 
                       onClick={handlePayment}
                       className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30"
                    >
                      Book Now ({event.price === 0 ? 'Free' : `N${event.price}`})
                    </button>
                    <button className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all">
                      Promoter Program
                    </button>
                    <p className="text-[10px] text-center text-slate-400 font-medium">No Refunds</p>
                  </div>
                ) : (
                  <div className="text-center pt-4 border-t border-slate-100 space-y-4">
                    <div className="bg-emerald-50 py-2 rounded-lg text-emerald-600 font-bold text-sm tracking-tight">Reserved Successfully</div>
                    <div className="bg-white p-2 border border-slate-200 rounded-xl inline-block">
                        <QRCodeCanvas value={`TICKET:${ticketId}`} size={140} />
                    </div>
                    <p className="text-indigo-600 font-mono font-bold text-lg">{ticketId}</p>
                    <button className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                       <Download size={14} /> Download PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-12">
            <div>
              <h2 className="text-xl font-bold mb-6">Description</h2>
              <div className="text-slate-500 leading-relaxed space-y-4 text-sm whitespace-pre-line">
                {event.description}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-6">Hours</h2>
              <div className="text-slate-500 text-sm space-y-1">
                 <p><span className="font-bold text-slate-800">Weekday Hours:</span> 7 PM - 10 PM</p>
                 <p><span className="font-bold text-slate-800">Sunday Hours:</span> 10 AM - 3 PM</p>
              </div>
            </div>

            <div className="space-y-4">
               <h2 className="text-xl font-bold">How can I contact the organizer with any question?</h2>
               <p className="text-slate-500 text-sm leading-relaxed">Please visit <Link href="#" className="text-indigo-600">www.eventdetails.com</Link> and refer to the FAQ section for all questions and contact information.</p>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-12">
            <div>
              <h2 className="text-xl font-bold mb-6">Event Location</h2>
              <div className="rounded-xl overflow-hidden border border-slate-200 h-48 bg-slate-100 relative">
                 <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale opacity-50" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <MapPin className="text-indigo-600" size={32} />
                 </div>
              </div>
              <p className="text-sm font-bold mt-4">{event.title}</p>
              <p className="text-xs text-slate-500 mt-1">{event.location}</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold">Tags</h2>
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-2 bg-slate-100 rounded text-xs text-slate-600 font-medium">Event</span>
                <span className="px-4 py-2 bg-slate-100 rounded text-xs text-slate-600 font-medium">Experience</span>
                <span className="px-4 py-2 bg-slate-100 rounded text-xs text-slate-600 font-medium">UI</span>
                <span className="px-4 py-2 bg-slate-100 rounded text-xs text-slate-600 font-medium">Jakarta</span>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold">Share With Friends</h2>
              <div className="flex gap-4">
                 {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer">
                       <Share2 size={16} />
                    </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
