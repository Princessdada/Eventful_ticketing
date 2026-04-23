'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Calendar, MapPin, Download, QrCode, Search, Filter } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MyTicketsPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [activeEventTitle, setActiveEventTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login?callback=/my-tickets');
      return;
    }
    const fetchTickets = async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';
      console.log('Fetching tickets from:', `${API_URL}/bookings`);
      try {
        const response = await fetch(`${API_URL}/bookings`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log('Fetched tickets count:', data.length);
        setTickets(data);
      } catch (err: any) {
        console.error('Ticket fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchTickets();
  }, [token, authLoading, router]);

  const handleShowQR = async (bookingId: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/qr/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch QR');
      const data = await response.json();
      if (data.qrCode) {
        setActiveEventTitle(tickets.find(t => t._id === bookingId)?.event?.title || 'Event Ticket');
        setSelectedQR(data.qrCode);
      }
    } catch (err: any) {
      console.error("Failed to load QR:", err);
      alert("Error loading QR code: " + err.message);
    }
  };

  const handleDownloadPDF = (ticketId: string) => {
    const ticket = tickets.find(t => t._id === ticketId);
    if (!ticket) return;

    const content = `
EVENT TICKET PASS
-----------------
Event: ${ticket.event?.title}
Date: ${new Date(ticket.event?.date).toLocaleDateString()}
Location: ${ticket.event?.location}
Quantity: ${ticket.quantity}
Reference: ${ticket.bookingReference}
Ticket ID: ${ticket._id}

Thank you for your booking!
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `ticket-${ticketId.slice(-8)}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f1a]">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white pt-24 pb-12 px-6 relative">
      <div className="max-w-6xl mx-auto">
        
        {/* QR Modal Overlay */}
        {selectedQR && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-3xl max-w-sm w-full text-center"
            >
              <h3 className="text-black text-2xl font-black mb-6">{activeEventTitle}</h3>
              <div className="aspect-square bg-slate-100 rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
                <img src={selectedQR} alt="Ticket QR" className="w-full h-full" />
              </div>
              <button 
                onClick={() => {
                  setSelectedQR(null);
                  setActiveEventTitle(null);
                }}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-colors"
              >
                Close Ticket
              </button>
            </motion.div>
          </div>
        )}
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold mb-2">My <span className="text-indigo-400">Tickets</span></h1>
            <p className="text-slate-400">Track and manage your upcoming event experiences.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search tickets..."
                className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                disabled
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-center mb-8">
            {error}
          </div>
        )}

        {tickets.length === 0 ? (
          <div className="text-center py-24 glass rounded-3xl border border-white/5">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-400">
              <Ticket size={40} />
            </div>
            <h3 className="text-2xl font-bold mb-3">No tickets found</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              You haven't booked any events yet. Start exploring the latest events and grab your spot!
            </p>
            <Link href="/events" className="btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tickets.map((ticket, index) => (
              <motion.div
                key={ticket._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="ticket-card glass overflow-hidden flex flex-col sm:flex-row"
              >
                {/* Visual Side */}
                <div className="sm:w-1/3 relative h-48 sm:h-auto">
                  <img 
                    src={ticket.event?.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80'} 
                    alt={ticket.event?.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-[#0b0f1a]/80" />
                </div>

                {/* Content Side */}
                <div className="flex-1 p-6 flex flex-col relative">
                  {/* Decorative Ticket Notch */}
                  <div className="hidden sm:block absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#0b0f1a] rounded-full border-r border-white/5" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider">
                      Confirmed
                    </span>
                    <span className="text-xs text-slate-500 font-mono">#{ticket._id.slice(-8).toUpperCase()}</span>
                  </div>

                  <h3 className="text-xl font-bold mb-4 line-clamp-1">{ticket.event?.title}</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-slate-400 text-sm">
                      <Calendar size={16} className="text-indigo-400" />
                      <span>{new Date(ticket.event?.date).toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 text-sm">
                      <MapPin size={16} className="text-indigo-400" />
                      <span className="line-clamp-1">{ticket.event?.location}</span>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Qty</span>
                      <span className="text-lg font-bold">{ticket.quantity}</span>
                    </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleShowQR(ticket._id)} 
                          className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white"
                          title="View QR Code"
                        >
                          <QrCode size={20} />
                        </button>
                        <button 
                          onClick={() => handleDownloadPDF(ticket._id)}
                          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                        >
                          <Download size={18} />
                          Get PDF
                        </button>
                      </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 1.5rem;
        }
        .ticket-card {
          min-height: 240px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ticket-card:hover {
          transform: translateY(-5px);
          border-color: rgba(99, 102, 241, 0.3);
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 20px 40px -20px rgba(0, 0, 0, 0.5);
        }
        .loader {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(99, 102, 241, 0.1);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
