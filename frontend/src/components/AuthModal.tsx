'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, LogIn, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  title = "Unlock Creator Tools",
  message = "Join our community to start hosting your own events, managing ticket sales, and tracking your audience analytics." 
}: AuthModalProps) {
  const router = useRouter();

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleAction = (path: string) => {
    onClose();
    router.push(`${path}?callback=/create-event`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-portal">
          {/* Deep Dimmed & Blurred Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="modal-overlay"
          />

          {/* Centered Modal Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="modal-container"
          >
            <div className="modal-card">
              <button onClick={onClose} className="close-btn" aria-label="Close">
                <X size={24} />
              </button>

              <h2 className="modal-title">Sign up and become a creator to create events</h2>
              <p className="modal-description">Join our community to start hosting your own exclusive events and managing your ticket sales in one place.</p>

              <div className="button-group">
                <button onClick={() => handleAction('/signup')} className="btn-primary-auth">
                  <Mail size={22} />
                  Get Started for Free
                </button>
                
                <button onClick={() => handleAction('/login')} className="btn-secondary-auth">
                  <LogIn size={20} />
                  Log In to Your Account
                </button>
              </div>

              <div className="modal-footer">
                By continuing, you agree to our <span className="link-text">Terms of Service</span>
              </div>
            </div>
          </motion.div>

          <style jsx>{`
            .modal-portal {
              position: fixed;
              top: 0;
              left: 0;
              width: 100vw;
              height: 100vh;
              z-index: 99999;
              display: flex;
              align-items: center;
              justify-content: center;
              pointer-events: auto;
            }
            .modal-overlay {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(2, 6, 23, 0.92);
              backdrop-filter: blur(24px) grayscale(50%);
              z-index: 1;
            }
            .modal-container {
              position: relative;
              z-index: 10;
              width: 100%;
              max-width: 440px;
              padding: 0 1.5rem;
            }
            .modal-card {
              background: #0f172a;
              border: 1px solid rgba(255, 255, 255, 0.1);
              padding: 3.5rem 2.5rem 2.5rem;
              border-radius: 2.5rem;
              box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.8), 0 0 50px rgba(99, 102, 241, 0.15);
              text-align: center;
              position: relative;
            }
            .close-btn {
              position: absolute;
              top: 1.5rem;
              right: 1.5rem;
              background: rgba(255, 255, 255, 0.05);
              border: none;
              color: #94a3b8;
              width: 38px;
              height: 38px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.2s;
            }
            .modal-title {
              color: white;
              font-size: 2.5rem;
              font-weight: 900;
              margin-bottom: 1rem;
              letter-spacing: -0.03em;
              line-height: 1.1;
            }
            .modal-description {
              color: #94a3b8;
              font-size: 1.125rem;
              line-height: 1.6;
              margin-bottom: 3rem;
              font-medium;
            }
            .button-group {
              display: flex;
              flex-direction: column;
              gap: 1.25rem;
            }
            .btn-primary-auth {
              background: linear-gradient(135deg, #6366f1, #8b5cf6);
              color: white;
              border: none;
              border-radius: 1.5rem;
              padding: 1.5rem;
              font-size: 1.3rem;
              font-weight: 800;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 1rem;
              cursor: pointer;
              transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
              box-shadow: 0 20px 40px -10px rgba(99, 102, 241, 0.5);
            }
            .btn-primary-auth:hover {
              transform: translateY(-4px) scale(1.02);
              filter: brightness(1.1);
              box-shadow: 0 25px 50px -10px rgba(99, 102, 241, 0.6);
            }
            .btn-secondary-auth {
              background: rgba(255, 255, 255, 0.03);
              color: white;
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 1.5rem;
              padding: 1.25rem;
              font-size: 1.125rem;
              font-weight: 600;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0.75rem;
              cursor: pointer;
              transition: all 0.2s;
            }
            .btn-secondary-auth:hover {
              background: rgba(255, 255, 255, 0.08);
              border-color: rgba(255, 255, 255, 0.2);
            }
            .modal-footer {
              margin-top: 2.5rem;
              color: #64748b;
              font-size: 0.9rem;
              font-weight: 500;
            }
            .link-text {
              color: #94a3b8;
              text-decoration: underline;
              cursor: pointer;
              transition: color 0.2s;
            }
            .link-text:hover { color: white; }
          `}</style>
        </div>
      )}
    </AnimatePresence>
  );
}
