'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Ticket, User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthModal from './AuthModal';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const handleCreateClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-4 glass mx-4 mt-4' : 'py-6 bg-transparent'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg group-hover:rotate-12 transition-transform h-10 w-10 flex items-center justify-center">
            <Ticket className="text-white" size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Eventful<span className="text-indigo-500">.</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex gap-6 mr-4">
            <Link href="/events" className="text-slate-300 hover:text-white transition-colors font-medium">Events</Link>
            <Link 
              href="/create-event" 
              onClick={handleCreateClick}
              className="text-slate-300 hover:text-white transition-colors font-medium"
            >
              Create
            </Link>
            {user && (
              <Link href="/my-tickets" className="text-slate-300 hover:text-white transition-colors font-medium">My Tickets</Link>
            )}
          </div>
          
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 py-2 px-3 glass rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <User size={18} />
                </div>
                <span className="text-sm font-semibold truncate max-w-[100px] text-white">
                  {user.name.split(' ')[0]}
                </span>
              </div>
              <button 
                onClick={logout}
                className="p-2 rounded-xl border border-slate-700/50 hover:bg-red-500/10 hover:border-red-500/20 text-slate-400 hover:text-red-400 transition-all"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
    <AuthModal 
      isOpen={isAuthModalOpen} 
      onClose={() => setIsAuthModalOpen(false)} 
      title="Unlock Creator Tools"
      message="Sign up to start hosting your own events, managing ticket sales, and tracking your audience analytics."
    />
    </>
  );
};

export default Navbar;
