import React from 'react';
import { Sparkles, MessageCircle, ExternalLink, ShieldCheck, Zap, Users, Code2, Video, Smartphone } from 'lucide-react';

export const CustomQuotePage = () => {
  const team = [
    {
      name: 'MADHAVAN J S',
      role: 'Full-Stack Web Architect & Lead',
      specialty: 'Websites, Web Apps & Symposium Posters',
      phone: '+91 99433 80320',
      cleanPhone: '919943380320',
      badge: 'Web & Posters',
      icon: Code2,
      gradient: 'from-indigo-600 to-purple-600',
    },
    {
      name: 'SANJAY SUNDAR S',
      role: 'Mobile App & APK Specialist',
      specialty: 'Android APKs, Mobile Apps & Web Portals',
      phone: '+91 77084 47215',
      cleanPhone: '917708447215',
      badge: 'Mobile & APK',
      icon: Smartphone,
      gradient: 'from-cyan-600 to-blue-600',
    },
    {
      name: 'RISHI NATHAN M',
      role: 'Creative, Photo & Video Director',
      specialty: 'Reels, Promo Edits & Visual Design',
      phone: '+91 81228 89631',
      cleanPhone: '918122889631',
      badge: 'Photo & Video',
      icon: Video,
      gradient: 'from-purple-600 to-pink-600',
    },
  ];

  const handleOpenWhatsApp = (cleanPhone, founderName) => {
    const messageText = `Hi ${founderName}! I am on VibeForge Custom Quote page and would like to get a fast custom quote for my project.`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Banner */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-extrabold uppercase">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Custom Engineering & Design Quote</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Request a <span className="text-gradient">Custom Quote</span>
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-600">
            Have custom requirements or a large project? Reach our 3 college founders directly on WhatsApp for 2-minute instant custom quotes!
          </p>
        </div>

        {/* ⚡ TEAM FAST-REACH WHATSAPP BANNER */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white p-6 sm:p-8 rounded-3xl shadow-xl border-2 border-emerald-400 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-100">INSTANT DIRECT REACH</span>
              </div>
              <h3 className="text-xl font-black tracking-tight">Need Urgent Response? Contact Our Team & Founders</h3>
              <p className="text-xs font-medium text-emerald-100">
                Skip waiting! Reach our 3 college founders directly on WhatsApp for instant 2-minute project discussions.
              </p>
            </div>

            <button
              onClick={() => handleOpenWhatsApp('919943380320', 'Madhavan')}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer border border-emerald-200 hover:scale-105"
            >
              <MessageCircle className="w-4 h-4 fill-current text-emerald-600 animate-bounce" />
              <span>Chat with Our Team</span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
            </button>
          </div>
        </div>

        {/* Founder Direct Cards for Custom Quotes */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Select Founder to Discuss Your Custom Project:
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {team.map((founder, idx) => {
              const Icon = founder.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md hover:border-indigo-400 hover:shadow-xl transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-extrabold">
                        {founder.badge}
                      </span>
                      <Icon className="w-5 h-5 text-indigo-600" />
                    </div>

                    <div>
                      <h3 className="text-base font-black text-slate-900">{founder.name}</h3>
                      <div className="text-xs font-bold text-indigo-700 mt-0.5">{founder.role}</div>
                      <div className="text-xs text-slate-600 font-medium mt-1">{founder.specialty}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenWhatsApp(founder.cleanPhone, founder.name)}
                    className={`w-full py-3 rounded-2xl bg-gradient-to-r ${founder.gradient} text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-95`}
                  >
                    <MessageCircle className="w-4 h-4 fill-current text-white" />
                    <span>WhatsApp ({founder.phone})</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Guarantee Footer Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-extrabold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Direct Founders Guarantee • Fast 24-48 Hours Delivery</span>
          </div>
          <p className="text-xs text-slate-500 font-semibold">
            We provide custom student & business discounts for all symposium, academic, and startup orders.
          </p>
        </div>

      </div>
    </div>
  );
};
