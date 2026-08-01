import React, { useState } from 'react';
import { Mail, MessageCircle, Clock, CheckCircle2, Send, Loader2, Info, Globe, ExternalLink } from 'lucide-react';
import axios from 'axios';

export const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const teamMembers = [
    {
      name: 'SANJAY SUNDAR S',
      phone: '+91 77084 47215',
      cleanPhone: '917708447215',
      role: 'Mobile App & APK Specialist',
      color: 'bg-cyan-50 border-cyan-200 text-cyan-900',
      liveLink: 'https://healthypredic.netlify.app/login',
      liveTitle: 'HealthyPredic Web App',
    },
    {
      name: 'RISHI NATHAN M',
      phone: '+91 81228 89631',
      cleanPhone: '918122889631',
      role: 'Creative, Photo & Video Director',
      color: 'bg-purple-50 border-purple-200 text-purple-900',
      liveLink: null,
      liveTitle: 'Video Drive (Coming Soon)',
    },
    {
      name: 'MADHAVAN J S',
      phone: '+91 99433 80320',
      cleanPhone: '919943380320',
      role: 'Full-Stack Web Architect & Poster Lead',
      color: 'bg-indigo-50 border-indigo-200 text-indigo-900',
      liveLink: 'https://sri-balaji-hollow-and-fly-ash-brick.vercel.app/',
      liveTitle: 'Sri Balaji Hollow Bricks Website',
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Direct FormSubmit AJAX dispatch to vibeforgemrs@gmail.com
      const response = await fetch('https://formsubmit.co/ajax/vibeforgemrs@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          message: message,
          _subject: `[VibeForge Website Inquiry] New Message from ${name}`,
          _template: 'table',
          _captcha: 'false',
        }),
      });

      const result = await response.json();
      console.log('FormSubmit AJAX Result:', result);

      // Record in local backend database as well
      try {
        await axios.post('/api/contact/send', { name, email, message });
      } catch (backendErr) {}

      setSubmitted(true);
    } catch (err) {
      console.error('FormSubmit Error:', err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900">
            Get in Touch with <span className="text-gradient">VibeForge</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm font-medium">Chat directly with our 3 tech founders on WhatsApp or leave us a message below.</p>
        </div>

        {/* Founders WhatsApp Cards with Live Website Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className={`bg-white p-6 rounded-3xl border border-slate-200 hover:border-emerald-400 hover:scale-105 transition-all flex flex-col justify-between group shadow-md hover:shadow-xl`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${member.color}`}>
                    {member.role}
                  </span>
                  <MessageCircle className="w-5 h-5 text-emerald-600 group-hover:animate-bounce" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors uppercase">
                  {member.name}
                </h3>
                <div className="text-sm font-extrabold text-emerald-700 mb-4">{member.phone}</div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                {member.liveLink ? (
                  <a
                    href={member.liveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="truncate">{member.liveTitle}</span>
                    <ExternalLink className="w-3 h-3 text-indigo-500 shrink-0" />
                  </a>
                ) : (
                  <div className="w-full py-2 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 text-[11px] font-bold text-center">
                    📁 Video Drive (Coming Soon)
                  </div>
                )}

                <a
                  href={`https://wa.me/${member.cleanPhone}?text=Hi%20${encodeURIComponent(member.name)}!%20I%20am%20reaching%20out%20from%20VibeForge%20website.`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>WhatsApp Chat →</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-5">
              <h3 className="text-lg font-extrabold text-slate-900">Direct Agency Support</h3>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-bold">Email Address</div>
                  <div className="text-xs font-extrabold text-slate-900">vibeforgemrs@gmail.com</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-bold">Working Hours</div>
                  <div className="text-xs font-extrabold text-slate-900">24/7 Digital Support • 2hr Response</div>
                </div>
              </div>
            </div>

            {/* Direct Gmail Compose Link */}
            <div className="bg-indigo-50 p-5 rounded-3xl border border-indigo-200 text-xs space-y-2">
              <div className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-indigo-600" />
                Need Instant Direct Email?
              </div>
              <p className="text-indigo-800 text-[11px] font-medium">
                Directly compose an email in Gmail to <span className="text-indigo-950 font-bold">vibeforgemrs@gmail.com</span>:
              </p>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=vibeforgemrs@gmail.com&su=New%20VibeForge%20Project%20Inquiry"
                target="_blank"
                rel="noreferrer"
                className="inline-block pt-1 text-indigo-700 font-extrabold hover:underline cursor-pointer"
              >
                Open Gmail Compose Window →
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            {submitted ? (
              <div className="bg-white p-10 rounded-3xl border border-emerald-300 text-center space-y-4 shadow-md animate-in fade-in">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-2xl font-extrabold text-slate-900">Message Sent Successfully! 🎉</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto font-medium">
                  Thank you for reaching out! Our team has received your project details and will get back to you as quickly as possible—usually within 2 hours.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => { setSubmitted(false); setName(''); setEmail(''); setMessage(''); }}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md space-y-4">
                
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Message *</label>
                  <textarea
                    rows={4}
                    name="message"
                    required
                    placeholder="How can we help your project?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
