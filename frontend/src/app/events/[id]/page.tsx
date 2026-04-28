'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, Clock, Download, CheckCircle2, ArrowLeft } from 'lucide-react';
import Script from 'next/script';
import { QRCodeCanvas } from 'qrcode.react';

declare global {
  interface Window { PaystackPop: any; }
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
        const res = await fetch(`${API_URL}/events/${id}`);
        if (!res.ok) throw new Error('Event not found');
        const data = await res.json();
        setEvent(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEvent();
  }, [id]);

  const saveBooking = async (ref?: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api';
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId: id,
          quantity: quantity
        })
      });
      
      if (!res.ok) throw new Error('Failed to save booking');
      const data = await res.json();
      setTicketId(data.booking._id);
      setIsPaid(true);
    } catch (err: any) {
      alert("Payment successful but failed to register ticket: " + err.message);
    }
  };

  const handlePayment = () => {
    if (!event) return;

    if (isFree) {
      saveBooking();
      return;
    }

    const amount = (event.price || 0) * quantity * 100;
    
    if (amount <= 0) {
      alert("Invalid ticket amount. Please check the price.");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_c431160e713cbc149757b55f3d85246f5ab375c9',
      email: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).email : 'customer@example.com',
      amount: amount,
      currency: 'NGN',
      callback: (response: any) => {
        saveBooking(response.reference);
      },
      onClose: () => alert('Payment cancelled'),
    });
    handler.openIframe();
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#94a3b8', fontSize: '14px' }}>
      Loading...
    </div>
  );

  if (error || !event) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#94a3b8', gap: '12px' }}>
      <p>{error || 'Event not found'}</p>
      <button onClick={() => router.push('/events')} style={{ color: '#6366f1', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', fontSize: '14px' }}>
        Back to Events
      </button>
    </div>
  );

  const handleDownloadPass = () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.download = `ticket-${ticketId}.png`;
      link.href = url;
      link.click();
    }
  };

  const isFree = !event.price || event.price === 0;
  const dateObj = new Date(event.date);
  const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Dynamic URL for scanner behavior
  const qrData = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${ticketId}?event=${encodeURIComponent(event.title)}&date=${encodeURIComponent(event.date)}`;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />

      {/* Page wrapper */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', marginBottom: '32px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          <button
            onClick={() => router.back()}
            style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 800 }}
          >
            Discover
          </button>
          <span>/</span>
          <span style={{ color: '#f8fafc' }}>{event.title}</span>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 340px) 1fr', gap: '56px', alignItems: 'start' }}>

          {/* -- LEFT: Image + Booking -- */}
          <div>
            <div style={{ width: '100%', aspectRatio: '1 / 1.1', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#1e293b', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              <img
                src={event.image || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&q=80&w=800'}
                alt={event.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>

            <div style={{ marginTop: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '24px' }}>
              {!isPaid ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handlePayment();
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ticket price</span>
                      <span style={{ fontWeight: 900, fontSize: '24px', color: 'white', letterSpacing: '-0.02em' }}>{isFree ? 'FREE' : `N${event.price?.toLocaleString()}`}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        style={{ width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'white', borderRight: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        -
                      </button>
                      <span style={{ flex: 1, textAlign: 'center', fontWeight: 900, fontSize: '20px', color: 'white' }}>{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        style={{ width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'white', borderLeft: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="submit"
                      style={{ width: '100%', padding: '20px', backgroundColor: 'white', color: 'black', fontWeight: 900, fontSize: '14px', borderRadius: '16px', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      {isFree ? 'Reserve Event' : `Checkout N${((event.price || 0) * quantity).toLocaleString()}`}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '10px', color: '#475569', fontWeight: 600 }}>SECURED BY PAYSTACK · TEST MODE</p>
                  </form>
              ) : (
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                  <CheckCircle2 size={48} style={{ color: '#10b981' }} />
                  <p style={{ fontWeight: 900, color: 'white', fontSize: '18px', textTransform: 'uppercase' }}>Admission Confirmed</p>
                  <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '20px' }}>
                    <QRCodeCanvas value={qrData} size={160} level="H" />
                  </div>
                  <p style={{ fontFamily: 'monospace', fontSize: '20px', fontWeight: 900, color: '#6366f1' }}>{ticketId}</p>
                  <button
                    onClick={handleDownloadPass}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 24px', cursor: 'pointer', color: 'white', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}
                  >
                    <Download size={14} style={{ marginRight: '8px' }} /> Download Pass
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* -- RIGHT: Details -- */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>

            <span style={{ fontSize: '10px', fontWeight: 900, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '12px' }}>Event Discovery</span>
            
            <h1 style={{ fontSize: '48px', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: '32px', letterSpacing: '-0.04em', background: 'none', WebkitTextFillColor: 'white' }}>
              {event.title}
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#94a3b8', fontSize: '15px', fontWeight: 600 }}>
                <Calendar size={20} style={{ color: '#6366f1' }} />
                <span>{dateStr}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#94a3b8', fontSize: '15px', fontWeight: 600 }}>
                <Clock size={20} style={{ color: '#6366f1' }} />
                <span>{timeStr}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#6366f1', fontSize: '15px', fontWeight: 800 }}>
                <MapPin size={20} />
                <span>{event.location}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingBottom: '40px' }}></div>

            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px' }}>Narrative</h2>
              <p style={{ fontSize: '16px', color: '#94a3b8', lineHeight: 1.7, fontWeight: 500 }}>
                {event.description || 'No description provided.'}
              </p>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginBottom: '40px' }}></div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div>
                <h2 style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px' }}>Host</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'white', fontSize: '14px' }}>
                    {(event.creator?.name || 'H')[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, color: 'white', fontSize: '14px', margin: 0 }}>{event.creator?.name || 'Verified Host'}</p>
                    <p style={{ fontSize: '11px', color: '#475569', margin: 0 }}>PLATFORM PARTNER</p>
                  </div>
                </div>
              </div>
              <div>
                <h2 style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px' }}>Admission</h2>
                <p style={{ fontSize: '14px', fontWeight: 800, color: 'white', margin: 0 }}>{isFree ? 'OPEN ACCESS' : 'RESERVED ACCESS'}</p>
                <p style={{ fontSize: '11px', color: '#475569', margin: 0 }}>{event.category || 'GENERAL'}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}