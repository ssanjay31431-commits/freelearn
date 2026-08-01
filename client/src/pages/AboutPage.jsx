import React from 'react';
import { Users, Target, Rocket, Award, ShieldCheck, MessageCircle, ExternalLink, Globe } from 'lucide-react';

export const AboutPage = () => {
  const founders = [
    {
      name: 'SANJAY SUNDAR S',
      role: 'Mobile App & APK Specialist',
      subtext: 'Android & App Dev',
      desc: 'Building lightweight Flutter/React Native APKs for academic projects, mobile apps, and local businesses.',
      phone: '+91 77084 47215',
      cleanPhone: '917708447215',
      image: '/sanjay_badge.png',
      badgeColor: 'text-cyan-800 border-cyan-300 bg-cyan-50 font-extrabold',
      gradient: 'from-cyan-500 to-indigo-600',
      liveLink: 'https://healthypredic.netlify.app/login',
      liveTitle: 'HealthyPredic Web App',
    },
    {
      name: 'RISHI NATHAN M',
      role: 'Creative, Photo & Video Director',
      subtext: 'Posters, Photo & Reels Editing',
      desc: 'Crafting award-winning symposium posters, professional photo editing, and viral high-retention video reels.',
      phone: '+91 81228 89631',
      cleanPhone: '918122889631',
      image: '/rishi_badge.png',
      badgeColor: 'text-purple-800 border-purple-300 bg-purple-50 font-extrabold',
      gradient: 'from-purple-500 to-pink-600',
      liveLink: null,
      liveTitle: 'Reels & Video Editing Portfolio',
    },
    {
      name: 'MADHAVAN J S',
      role: 'Full-Stack Web Architect & Poster Lead',
      subtext: 'Web Dev & Poster Solutions',
      desc: 'Architecting scalable MERN Stack web portals, high-impact poster design, and custom AI agents.',
      phone: '+91 99433 80320',
      cleanPhone: '919943380320',
      image: '/madhavan_badge.png',
      badgeColor: 'text-indigo-800 border-indigo-300 bg-indigo-50 font-extrabold',
      gradient: 'from-indigo-500 to-cyan-500',
      liveLink: 'https://sri-balaji-hollow-and-fly-ash-brick.vercel.app/',
      liveTitle: 'Sri Balaji Hollow Bricks Website',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Story Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-extrabold uppercase">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>OUR AGENCY LEADERSHIP & FOUNDERS</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Engineered by <span className="text-gradient">3 College Founders</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            VibeForge was born in a college hostel room with a mission to deliver high-impact digital engineering. We empower college students, symposium leads, founders, and local businesses by delivering Web Apps, Posters, Photo & Video Edits, Android APKs, and AI Agents with lightning turnaround.
          </p>
        </div>

        {/* 3 Founder Cards with Live Website Project Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {founders.map((member, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-5 hover:scale-105 transition-all shadow-md hover:shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className={`w-28 h-28 rounded-full bg-gradient-to-tr ${member.gradient} p-[2px] mx-auto shadow-md overflow-hidden`}>
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                
                <div>
                  {/* Founder Name */}
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-1.5">
                    {member.name}
                  </h3>
                  
                  <div className={`inline-block px-3 py-1 rounded-full text-[11px] border shadow-xs ${member.badgeColor}`}>
                    {member.role}
                  </div>
                </div>

                <div className="text-xs text-indigo-700 font-extrabold uppercase tracking-wide">
                  {member.subtext}
                </div>

                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {member.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                {/* Live Project Website Link */}
                {member.liveLink ? (
                  <a
                    href={member.liveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="truncate">{member.liveTitle}</span>
                    <ExternalLink className="w-3 h-3 text-indigo-500 shrink-0" />
                  </a>
                ) : (
                  <div className="w-full py-2.5 rounded-2xl bg-slate-100 text-slate-500 border border-slate-200 text-[11px] font-bold text-center">
                    📁 Video Reel Drive (Coming Soon)
                  </div>
                )}

                {/* Direct WhatsApp Button */}
                <a
                  href={`https://wa.me/${member.cleanPhone}?text=Hi%20${encodeURIComponent(member.name)}!%20I%20am%20reaching%20out%20from%20VibeForge%20About%20page.`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-white fill-current group-hover:animate-bounce" />
                  <span>WhatsApp: {member.phone}</span>
                </a>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
