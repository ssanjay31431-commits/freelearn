import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, MessageCircle } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#070A10] border-t border-slate-800/80 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[2px]">
                <div className="w-full h-full bg-[#0B0F17] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                Vibe<span className="text-gradient">Forge</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm text-slate-400">
              VibeForge is a premier digital freelancing agency started by three college engineers. We craft modern web apps, Android APKs, high-converting posters, photo & video edits, and custom AI agents.
            </p>
          </div>

          {/* Quick Services */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Services</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/services?group=website" className="hover:text-white transition-colors">Website Dev (₹250+)</Link></li>
              <li><Link to="/services?group=poster" className="hover:text-white transition-colors">Poster Design (₹100+)</Link></li>
              <li><Link to="/services?group=video" className="hover:text-white transition-colors">Video Editing (₹300+)</Link></li>
              <li><Link to="/services?group=app" className="hover:text-white transition-colors">Android APK (₹300+)</Link></li>
              <li><Link to="/services?group=ai" className="hover:text-white transition-colors">AI Solutions (₹499+)</Link></li>
            </ul>
          </div>

          {/* Agency */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/portfolio" className="hover:text-white transition-colors">Our Portfolio</Link></li>
              <li><Link to="/quote" className="hover:text-white transition-colors">Request Quote</Link></li>
              <li><Link to="/track" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Founders Direct WhatsApp */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Founders WhatsApp</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="https://wa.me/917708447215" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                  <MessageCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>SANJAY: +91 77084 47215</span>
                </a>
              </li>
              <li>
                <a href="https://wa.me/918122889631" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-purple-400 transition-colors">
                  <MessageCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>RISHI: +91 81228 89631</span>
                </a>
              </li>
              <li>
                <a href="https://wa.me/919943380320" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-indigo-400 transition-colors">
                  <MessageCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>MADHAVAN: +91 99433 80320</span>
                </a>
              </li>
              <li className="pt-2 flex items-center gap-2 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>vibeforgemrs@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>© {new Date().getFullYear()} VibeForge Digital Agency. Built for high performance.</div>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>50% Advance Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
