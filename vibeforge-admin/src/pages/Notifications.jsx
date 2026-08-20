import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Bell, Send, Mail, MessageSquare, Monitor } from 'lucide-react';

export default function Notifications() {
  const [channel, setChannel] = useState('email');
  const [targetAudience, setTargetAudience] = useState('everyone');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await axiosClient.post('/admin/notifications', {
        channel,
        targetAudience,
        subject,
        message
      });
      alert('Broadcast notification dispatched successfully!');
      setSubject('');
      setMessage('');
    } catch (err) {
      alert('Failed to send broadcast notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Notification Dispatcher</h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch Email alerts, WhatsApp broadcasts & Real-time website notifications to customer segments.
          </p>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-slate-800 max-w-2xl">
        <form onSubmit={handleSend} className="space-y-5 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-2">Notification Channel</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setChannel('email')}
                className={`py-3 rounded-2xl border flex items-center justify-center space-x-2 font-bold ${
                  channel === 'email'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('whatsapp')}
                className={`py-3 rounded-2xl border flex items-center justify-center space-x-2 font-bold ${
                  channel === 'whatsapp'
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('website')}
                className={`py-3 rounded-2xl border flex items-center justify-center space-x-2 font-bold ${
                  channel === 'website'
                    ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>In-App Web</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-2">Target Customer Tier</label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
            >
              <option value="everyone">Everyone (All Registered Users)</option>
              <option value="selected">Selected Customers Only</option>
              <option value="returning">Returning Customers</option>
              <option value="premium">Premium VIP Tier Customers</option>
            </select>
          </div>

          {channel === 'email' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-2">Subject Line</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Exclusive 25% Off Web Development Services!"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-2">Message Body</label>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type notification text..."
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs h-32"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{sending ? 'Dispatching Broadcast...' : 'Send Broadcast Now'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
