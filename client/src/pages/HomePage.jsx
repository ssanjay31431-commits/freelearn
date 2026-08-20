import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { DashboardCards } from '../components/home/DashboardCards';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Layers } from 'lucide-react';

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#0B0F17]">
      
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Primary Service Dashboard Cards */}
      <DashboardCards />

      {/* 3. Why Choose VibeForge Section */}
      <section className="py-20 bg-slate-950/60 relative border-t border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-indigo-400 font-bold text-xs uppercase tracking-widest">Our Engineering Promise</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Built for <span className="text-gradient">Speed, Precision & High Impact</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">50% Advance & Pay Later</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Pay only 50% upfront to initiate work. Pay the remaining half after reviewing the final preview live!
              </p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 flex items-center justify-center text-purple-400 mb-5">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Live Order Tracking</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Track your order through 7 distinct development stages from planning to final production delivery.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-cyan-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 flex items-center justify-center text-cyan-400 mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Full Source Code & Files</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Complete ownership of source code, vector PSDs, 4K video renders, and direct setup documentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-cyan-900/40 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6">
            Ready to Bring Your Digital Vision to Life?
          </h2>
          <p className="text-slate-300 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
            Choose from our starting rates (Poster ₹100, Web ₹250, Reel ₹300, App ₹300) or submit a custom project request today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/services"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base shadow-glow hover:opacity-95 transition-all flex items-center gap-2"
            >
              Start Booking Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/quote"
              className="px-8 py-4 rounded-2xl glass-panel border border-slate-700 text-white font-semibold text-base hover:bg-slate-800 transition-all"
            >
              Get Custom Quote
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
