import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, X, Send, Sparkles, MessageCircle, ArrowRight, User } from 'lucide-react';
import axios from 'axios';

export const AIFloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "👋 Hi! I'm VibeAI, your assistant at VibeForge Agency. How can I help you today?",
      suggestedActions: [
        { label: '🌐 Website (₹250+)', action: '/services?group=website' },
        { label: '🎨 Poster (₹100+)', action: '/services?group=poster' },
        { label: '🎬 Video Reel (₹300+)', action: '/services?group=video' },
        { label: '📱 Android APK (₹300+)', action: '/services?group=app' },
        { label: '📝 Get Custom Quote', action: '/quote' },
      ],
    },
  ]);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, loading]);

  const handleSend = async (customMsg = null) => {
    const textToSend = customMsg || input;
    if (!textToSend.trim()) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!customMsg) setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/ai/chat', { message: textToSend });
      const { reply, suggestedActions } = res.data;
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: reply, suggestedActions: suggestedActions || [] },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "I can help you browse our services: Website Dev (₹250+), Posters (₹100+), Video Edits (₹300+), Android APK (₹300+), or AI Solutions (₹499+).",
          suggestedActions: [{ label: 'View Services', action: '/services' }],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action) => {
    if (action === 'whatsapp') {
      window.open('https://wa.me/917708447215?text=Hi%20VibeForge', '_blank');
    } else {
      navigate(action);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white p-4 rounded-full shadow-glow hover:opacity-95 transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center gap-2.5 group cursor-pointer"
        >
          <Bot className="w-6 h-6 animate-bounce text-cyan-200" />
          <span className="font-extrabold text-xs pr-1 tracking-wide">VibeAI Assistant</span>
        </button>
      )}

      {/* Floating Popup Window with Smooth Slide-In */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md h-[560px] glass-panel rounded-3xl shadow-2xl border border-slate-700/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300 ease-out">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-slate-900 border-b border-slate-700/80 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-glow">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm text-white flex items-center gap-1.5">
                  VibeAI Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </div>
                <div className="text-[11px] text-indigo-200 font-medium">Online • Digital Agency Copilot</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scroll-smooth">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${
                  msg.sender === 'user'
                    ? 'justify-end animate-in fade-in slide-in-from-right-4 duration-300'
                    : 'justify-start animate-in fade-in slide-in-from-left-4 duration-300'
                }`}
              >
                {/* AI Avatar */}
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                )}

                <div className="space-y-2 max-w-[82%]">
                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed transition-all whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none shadow-md font-medium'
                        : 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-bl-none shadow-sm font-normal'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Suggested Quick Action Chips */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedActions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleActionClick(act.action)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-200 hover:text-white text-[11px] font-semibold transition-all duration-200 flex items-center gap-1 cursor-pointer shadow-sm transform hover:-translate-y-0.5"
                        >
                          {act.label}
                          <ArrowRight className="w-3 h-3 text-cyan-400" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-purple-300" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic animate-pulse p-2">
                <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
                VibeAI is typing response...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Form */}
          <div className="p-3 bg-slate-900/95 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask about services, pricing, turnaround..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-slate-800/90 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none transition-colors"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white disabled:opacity-50 hover:opacity-90 transition-opacity cursor-pointer shadow-glow"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
