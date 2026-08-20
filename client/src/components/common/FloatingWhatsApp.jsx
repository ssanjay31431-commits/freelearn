import React, { useState } from 'react';
import { MessageCircle, X, ExternalLink, Sparkles, Globe } from 'lucide-react';

export const FloatingWhatsApp = () => {
  const [isOpen, setIsOpen] = useState(false);

  const team = [
    {
      name: 'SANJAY SUNDAR S',
      phone: '+91 77084 47215',
      cleanPhone: '917708447215',
      role: 'Mobile App & APK Specialist',
      color: 'from-cyan-600 to-blue-600',
      liveLink: 'https://healthypredic.netlify.app/login',
      liveTitle: 'HealthyPredic Web App',
    },
    {
      name: 'RISHI NATHAN M',
      phone: '+91 81228 89631',
      cleanPhone: '918122889631',
      role: 'Creative, Photo & Video Director',
      color: 'from-purple-600 to-pink-600',
      liveLink: 'https://drive.google.com/drive/folders/1SVCK5E4qQdlgAuWZPy5QrZDbjyQ1KO1W?usp=sharing',
      liveTitle: 'Reels & Video Showcase Drive',
    },
    {
      name: 'MADHAVAN J S',
      phone: '+91 99433 80320',
      cleanPhone: '919943380320',
      role: 'Full-Stack Web Architect & Poster Lead',
      color: 'from-indigo-600 to-purple-600',
      liveLink: 'https://sri-balaji-hollow-and-fly-ash-brick.vercel.app/',
      liveTitle: 'Sri Balaji Hollow Bricks Website',
    },
  ];

  const handleOpenChat = (member) => {
    const text = encodeURIComponent(`Hi ${member.name}! I am reaching out from VibeForge website for a project inquiry.`);
    const url = `https://wa.me/${member.cleanPhone}?text=${text}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  const handleOpenWebsite = (e, link) => {
    e.stopPropagation();
    if (link) {
      window.open(link, '_blank');
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-40 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center group cursor-pointer border-2 border-white"
        title="Chat with Founders on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-current animate-pulse" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out font-extrabold text-xs ml-0 group-hover:ml-2">
          Chat with Team
        </span>
      </button>

      {/* 100% WHITE & HIGH CONTRAST CHAT POPUP WITH LIVE WEBSITE LINKS */}
      {isOpen && (
        <div className="fixed bottom-20 left-6 z-50 w-80 sm:w-96 bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <MessageCircle className="w-5 h-5 fill-current text-emerald-600" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">VibeForge Team WhatsApp</h4>
                <p className="text-[11px] font-bold text-slate-500">Select a founder or check live projects</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Teammates List - Clean White Cards */}
          <div className="space-y-2.5">
            {team.map((member, idx) => (
              <div
                key={idx}
                onClick={() => handleOpenChat(member)}
                className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-400 transition-all flex flex-col gap-2 group cursor-pointer shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${member.color} flex items-center justify-center font-black text-white text-xs shadow-sm`}>
                      {member.name[0]}
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors tracking-wide">
                        {member.name}
                      </div>
                      <div className="text-[11px] text-emerald-700 font-extrabold">{member.phone}</div>
                      <div className="text-[10px] text-slate-600 font-medium">{member.role}</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
                </div>

                {/* Live Project Chip */}
                {member.liveLink && (
                  <div
                    onClick={(e) => handleOpenWebsite(e, member.liveLink)}
                    className="mt-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-[10px] font-extrabold flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-1 truncate">
                      <Globe className="w-3 h-3 text-indigo-600" />
                      Live Project: {member.liveTitle}
                    </span>
                    <ExternalLink className="w-3 h-3 text-indigo-600 shrink-0" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-[10px] text-slate-500 text-center font-bold flex items-center justify-center gap-1.5 pt-1 border-t border-slate-100">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official WhatsApp Numbers • Instant 2hr Response</span>
          </div>

        </div>
      )}
    </>
  );
};
