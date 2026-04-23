'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Globe, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-6 py-20">
      <div className="max-w-3xl mx-auto text-center mb-20">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl font-extrabold mb-8"
        >
          Reimagining the <br />
          <span className="text-white">Ticket Experience.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-400 leading-relaxed"
        >
          Eventful was born from a simple idea: booking tickets should be as exciting as the event itself. We\\'ve built a platform that combines cutting-edge design with mission-critical reliability.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
        <div className="glass p-10 space-y-4">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 mb-6">
            <Shield size={24} />
          </div>
          <h3 className="text-2xl font-bold">Secure by Design</h3>
          <p className="text-slate-400">Our platform uses industry-standard encryption and secure payment gateways like Paystack to ensure your transactions are always safe.</p>
        </div>
        <div className="glass p-10 space-y-4">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-6">
            <Zap size={24} />
          </div>
          <h3 className="text-2xl font-bold">Lightning Fast</h3>
          <p className="text-slate-400">Don\\'t miss out on high-demand tickets. Our high-performance stack ensures you can book your spot in under 30 seconds.</p>
        </div>
        <div className="glass p-10 space-y-4">
          <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 mb-6">
            <Globe size={24} />
          </div>
          <h3 className="text-2xl font-bold">Global Events</h3>
          <p className="text-slate-400">From local jazz clubs to international tech summits, we bring the best of the world\\'s events directly to your screen.</p>
        </div>
        <div className="glass p-10 space-y-4">
          <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-400 mb-6">
            <Heart size={24} />
          </div>
          <h3 className="text-2xl font-bold">Driven by Passion</h3>
          <p className="text-slate-400">We are a team of event enthusiasts, designers, and engineers dedicated to making every moment count.</p>
        </div>
      </div>

      <style jsx>{`
        .container { max-width: 1240px; margin: 0 auto; }
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        @media (min-width: 768px) {
          .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        .gap-8 { gap: 2rem; }
        .p-10 { padding: 2.5rem; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .mb-20 { margin-bottom: 5rem; }
        .mb-32 { margin-bottom: 8rem; }
        .w-12 { width: 3rem; }
        .h-12 { height: 3rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .text-center { text-align: center; }
        .max-w-3xl { max-width: 48rem; }
      `}</style>
    </div>
  );
}
