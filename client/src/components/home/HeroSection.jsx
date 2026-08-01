import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Code2, Users, Star, Clock } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-white bg-grid-pattern pt-16 pb-20 lg:pt-24 lg:pb-32 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
          <span>VibeForge Digital Agency • Built by College Tech Founders</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
          Crafting Digital Experiences <br />
          <span className="text-gradient">That Inspire & Convert</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-600 font-normal mb-10 leading-relaxed">
          Web Development • Mobile Apps • Android APK • Poster Design • Video Editing • AI Solutions
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/services"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            Explore Services
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            to="/quote"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-slate-300 text-slate-800 font-bold text-base hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            Book Custom Project
          </Link>
        </div>

        {/* Animated Statistics Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 transition-colors">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center justify-center gap-1">
              <Code2 className="w-5 h-5 text-indigo-600" />
              <span>180+</span>
            </div>
            <div className="text-xs text-slate-600 font-semibold mt-1">Projects Completed</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 transition-colors">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center justify-center gap-1">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>140+</span>
            </div>
            <div className="text-xs text-slate-600 font-semibold mt-1">Happy Clients</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 transition-colors">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center justify-center gap-1">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span>&lt; 2 Hrs</span>
            </div>
            <div className="text-xs text-slate-600 font-semibold mt-1">Response Time</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 transition-colors">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center justify-center gap-1">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>4.9 / 5</span>
            </div>
            <div className="text-xs text-slate-600 font-semibold mt-1">Customer Satisfaction</div>
          </div>
        </div>

      </div>
    </section>
  );
};
