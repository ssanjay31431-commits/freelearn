import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export const TestimonialsSlider = () => {
  const reviews = [
    {
      name: 'Aditya Verma',
      role: 'Hackathon Lead & CSE Student',
      comment: 'VibeForge created our symposium poster and hackathon portal in less than 24 hours. The poster won top design awards at our college expo!',
      rating: 5,
      service: 'Symposium Poster & Portal (₹100 + ₹250)',
    },
    {
      name: 'Priya Sharma',
      role: 'Founder, UrbanBites Cafe',
      comment: 'The 50% advance payment option made it so easy for us to trust them. Our restaurant website with QR menu looks insanely premium!',
      rating: 5,
      service: 'Restaurant Website (₹999)',
    },
    {
      name: 'Karthik Raja',
      role: 'Content Creator (120k Followers)',
      comment: 'Their Instagram reel editing and color grading increased our reach by 3x. Smooth captions and viral hooks included.',
      rating: 5,
      service: 'Reel Video Editing (₹300)',
    },
  ];

  return (
    <section className="py-20 bg-[#0B0F17] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Trusted By <span className="text-gradient">Students & Businesses</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">See what our clients say about our handcrafted digital solutions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between hover:border-indigo-500/30 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-indigo-500/40" />
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <div className="font-bold text-white text-sm">{rev.name}</div>
                <div className="text-xs text-slate-400 mb-2">{rev.role}</div>
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-[10px] text-indigo-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{rev.service}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
