'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Ticket } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'creator'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      login(data.token, data.user);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="blobs">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="auth-card"
      >
        <div className="auth-header">
          <div className="logo-icon">
            <Ticket size={28} />
          </div>
          <h1 className="auth-title">Join <span className="text-indigo-400">Eventful</span></h1>
          <p className="auth-subtitle">Create an account to host or attend exclusive events</p>
        </div>

        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <div className="auth-input-wrapper">
              <User size={18} className="auth-icon" />
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="John Doe"
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-icon" />
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="name@example.com"
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-icon" />
              <input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="********"
                className="form-input"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="role-selector">
            <button
              type="button"
              onClick={() => {
                console.log('Switching to attendee');
                setFormData(prev => ({...prev, role: 'attendee'}));
              }}
              className={`role-btn ${formData.role === 'attendee' ? 'active' : ''}`}
            >
              Attendee
            </button>
            <button
              type="button"
              onClick={() => {
                console.log('Switching to creator');
                setFormData(prev => ({...prev, role: 'creator'}));
              }}
              className={`role-btn ${formData.role === 'creator' ? 'active' : ''}`}
            >
              Creator
            </button>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="auth-submit"
          >
            {isLoading ? <div className="spinner" /> : (
              <>
                <User size={20} />
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link href="/login" className="footer-link">Log in</Link></p>
        </div>
      </motion.div>

    </div>
  );
}
