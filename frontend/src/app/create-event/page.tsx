'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ImagePlus, MapPin, Calendar, DollarSign, Type, AlignLeft, Send, X, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useAuth } from '@/context/AuthContext';

declare global {
  interface Window {
    google: any;
  }
}

export default function CreateEventPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    price: '',
    category: 'Music'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const locationInputRef = React.useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  React.useEffect(() => {
    if (!authLoading && !token) {
      setShowAuthModal(true);
    }
  }, [token, authLoading]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-[#0b0f1a]"><div className="loader" /></div>;

  /*
  const initAutocomplete = () => {
    if (!locationInputRef.current || !window.google) return;
    
    const autocomplete = new window.google.maps.places.Autocomplete(locationInputRef.current, {
      types: ['address', 'establishment'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        setFormData(prev => ({ ...prev, location: place.formatted_address || '' }));
      }
    });
  };
  */

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('You must be logged in to create an event.');
      setTimeout(() => router.push('/login'), 2000);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';

    try {
      const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          image: previewImage // Assuming backend can handle base64 or you have another way
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create event');

      router.push('/events');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 relative min-h-screen">
      {/* 
      <Script 
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        onLoad={initAutocomplete}
      />
      */}

      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="modal-card p-10 max-w-md w-full text-center border border-white/10 shadow-3xl bg-[#0f172a]"
          >
            <div className="flex justify-center mb-6">
              <div className="modal-icon-shine">
                <ShieldCheck size={40} />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-4">Sign In Required</h2>
            <p className="modal-text mb-10 leading-relaxed text-slate-400">
              Join our community to host events and manage your tickets. It only takes a minute!
            </p>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => router.push('/login?callback=/create-event')}
                className="modal-btn-primary py-4 text-lg"
              >
                Sign In Now
              </button>
              <Link
                href="/signup"
                className="text-slate-400 hover:text-white transition-colors font-medium"
              >
                Don't have an account? Sign up
              </Link>
            </div>
          </motion.div>
        </div>
      )}

      {token ? (
        <div className="max-w-4xl mx-auto transition-all duration-700">
          <div className="mb-12">
            <h1 className="text-4xl font-extrabold mb-4">Create New <span className="text-white">Event</span></h1>
            <p className="text-slate-400">Fill in the details below to launch your event on our platform.</p>
          </div>

          {error && (
            <div className="error-alert mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-grid">
          
          {/* Left Side: General Info */}
          <div className="form-section">
            <div className="glass p-8">
              <h3 className="section-title">General Information</h3>
              
              <div className="input-group">
                <label className="label">
                  <Type size={14} /> Event Title
                </label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Summer Jazz Knight"
                  className="input-field"
                  required
                />
              </div>

              <div className="input-group">
                <label className="label">
                  <AlignLeft size={14} /> Description
                </label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Tell your attendees what to expect..."
                  className="input-field"
                  required
                />
              </div>

              <div className="grid-2">
                <div className="input-group">
                  <label className="label">
                    <DollarSign size={14} /> Price ($)
                  </label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="0.00"
                    className="input-field"
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="label">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="input-field"
                  >
                    <option>Music</option>
                    <option>Tech</option>
                    <option>Food</option>
                    <option>Business</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Media & Logistics */}
          <div className="form-section">
            <div className="glass p-8">
              <h3 className="section-title">Media & Logistics</h3>
              
              <div className="input-group">
                <label className="label">Cover Image</label>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <div className="upload-box" onClick={handleUploadClick}>
                  {previewImage ? (
                    <div className="preview-container">
                      <img src={previewImage} alt="Preview" className="image-preview" />
                      <div className="change-overlay">
                        <ImagePlus size={24} />
                        <span>Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="upload-icon">
                        <ImagePlus className="text-indigo-400" size={28} />
                      </div>
                      <span className="upload-text">Drag and drop or click to upload</span>
                    </>
                  )}
                </div>
              </div>

              <div className="input-group">
                <label className="label">
                  <Calendar size={14} /> Date & Time
                </label>
                <input 
                  type="datetime-local" 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="input-field date-picker"
                  required
                />
              </div>

              <div className="input-group">
                <label className="label">
                  <MapPin size={14} /> Venue Location
                </label>
                <input 
                  type="text" 
                  ref={locationInputRef}
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Where is the magic happening?"
                  className="input-field"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn-primary publish-btn"
            >
              {isSubmitting ? (
                <div className="loader" />
              ) : (
                <>
                  <Send size={20} />
                  Publish Event
                </>
              )}
            </button>
          </div>
        </form>

        <style jsx>{`
          .form-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
          }
          @media (max-width: 768px) {
            .form-grid { grid-template-columns: 1fr; }
          }
          .glass {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1.5rem;
            padding: 2rem;
          }
          .section-title {
            font-size: 1.25rem;
            font-weight: 700;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding-bottom: 1rem;
            margin-bottom: 2rem;
            color: white;
          }
          .input-group {
            margin-bottom: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .label {
            font-size: 0.75rem;
            font-weight: 700;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .input-field {
            width: 100%;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.75rem;
            padding: 0.75rem 1rem;
            color: white;
            outline: none;
            transition: all 0.2s;
          }
          .input-field:focus {
            border-color: #6366f1;
            background: rgba(15, 23, 42, 0.8);
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
          .upload-box {
            border: 2px dashed rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
            height: 12rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            background: rgba(15, 23, 42, 0.3);
            cursor: pointer;
            transition: all 0.2s;
          }
          .upload-box:hover {
            border-color: #6366f1;
            background: rgba(15, 23, 42, 0.4);
          }
          .upload-icon {
            padding: 0.75rem;
            background: rgba(99, 102, 241, 0.1);
            border-radius: 9999px;
            transition: transform 0.2s;
          }
          .upload-box:hover .upload-icon {
            transform: scale(1.1);
          }
          .upload-text {
            font-size: 0.875rem;
            color: #64748b;
          }
          .publish-btn {
            width: 100%;
            margin-top: 2rem;
            padding: 1.25rem;
            font-size: 1.25rem;
            border-radius: 1rem;
          }
          .loader {
            width: 1.5rem;
            height: 1.5rem;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          .preview-container {
            width: 100%;
            height: 100%;
            position: relative;
            overflow: hidden;
            border-radius: 0.8rem;
          }
          .image-preview {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .change-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.4);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            opacity: 0;
            transition: opacity 0.2s;
            color: white;
            font-weight: 600;
          }
          .preview-container:hover .change-overlay {
            opacity: 1;
          }
          .date-picker::-webkit-calendar-picker-indicator {
            filter: invert(1);
            cursor: pointer;
            opacity: 0.6;
            transition: opacity 0.2s;
          }
          .date-picker::-webkit-calendar-picker-indicator:hover {
            opacity: 1;
          }
          .modal-card {
            background: #0f172a;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 2rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.1);
          }
          .modal-icon-shine {
            width: 80px;
            height: 80px;
            background: rgba(99, 102, 241, 0.15);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #818cf8;
            border: 1px solid rgba(129, 140, 248, 0.2);
          }
          .modal-text {
            color: #94a3b8;
          }
          .modal-btn-primary {
            width: 100%;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white !important;
            border: none;
            border-radius: 1rem;
            padding: 1.125rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
          }
          .modal-btn-primary:hover {
            transform: translateY(-2px);
            filter: brightness(1.1);
            box-shadow: 0 15px 30px -5px rgba(99, 102, 241, 0.5);
          }
          .modal-btn-secondary {
            background: transparent;
            color: #94a3b8;
            border: none;
            padding: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            transition: color 0.2s;
          }
          .modal-btn-secondary:hover {
            color: white;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        </div>
      ) : null}
    </div>
  );
}
