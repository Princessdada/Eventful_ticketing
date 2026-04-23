'use client';

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { CheckCircle2, ShieldCheck, Calendar, Ticket } from 'lucide-react';

export default function VerifyTicketPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const eventTitle = searchParams.get('event') || 'Eventful Experience';
  const eventDate = searchParams.get('date');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ 
        maxWidth: '440px', 
        width: '100%', 
        backgroundColor: 'white', 
        borderRadius: '32px', 
        padding: '48px 32px', 
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          backgroundColor: '#f0fdf4', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 24px',
          color: '#10b981'
        }}>
          <CheckCircle2 size={48} />
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          Ticket Verified
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>
          This pass is valid for entry.
        </p>

        <div style={{ backgroundColor: '#f8fafc', borderRadius: '20px', padding: '24px', textAlign: 'left', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Ticket ID</p>
            <p style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>{id}</p>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Event</p>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{eventTitle}</p>
          </div>

          {eventDate && mounted && (
            <div>
              <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Date</p>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{new Date(eventDate).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#6366f1', fontSize: '12px', fontWeight: 800 }}>
          <ShieldCheck size={16} />
          SECURE VERIFICATION SYSTEM
        </div>
      </div>
    </div>
  );
}
