import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Settings as SettingsIcon, Save, Globe, Phone, Mail, QrCode, Key, Share2 } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    websiteName: 'VibeForge Digital Agency',
    logoUrl: '/logo.png',
    phone: '+91 98765 43210',
    email: 'contact@vibeforge.com',
    whatsappNumber: '+91 98765 43210',
    upiQrUrl: '',
    smtpHost: 'smtp.resend.com',
    smtpPort: 587,
    resendApiKey: '',
    cloudinaryCloudName: '',
    socialLinks: {
      instagram: 'https://instagram.com/vibeforge',
      twitter: 'https://twitter.com/vibeforge',
      linkedin: 'https://linkedin.com/company/vibeforge',
      youtube: 'https://youtube.com/vibeforge'
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axiosClient.get('/admin/settings');
        if (res.data) setSettings(res.data);
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosClient.put('/admin/settings', settings);
      alert('Global agency settings updated!');
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Agency Settings & Gateways</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure agency branding, contact phone numbers, WhatsApp, UPI QR, SMTP/Resend API keys & social links.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 max-w-4xl">
        {/* Branding & Contact */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>Branding & Contact Info</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Website Agency Name</label>
              <input
                type="text"
                value={settings.websiteName || ''}
                onChange={(e) => setSettings({ ...settings, websiteName: e.target.value })}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Agency Logo URL</label>
              <input
                type="text"
                value={settings.logoUrl || ''}
                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Official Support Email</label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Support Phone Number</label>
              <input
                type="text"
                value={settings.phone || ''}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">WhatsApp Cloud API Number</label>
              <input
                type="text"
                value={settings.whatsappNumber || ''}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">UPI Payment QR Image Link</label>
              <input
                type="text"
                value={settings.upiQrUrl || ''}
                onChange={(e) => setSettings({ ...settings, upiQrUrl: e.target.value })}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
            </div>
          </div>
        </div>

        {/* API Credentials */}
        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-2">
            <Key className="w-4 h-4 text-violet-400" />
            <span>Integrations & API Credentials</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Resend API Key</label>
              <input
                type="password"
                value={settings.resendApiKey || ''}
                onChange={(e) => setSettings({ ...settings, resendApiKey: e.target.value })}
                placeholder="re_••••••••••••••••"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Cloudinary Cloud Name</label>
              <input
                type="text"
                value={settings.cloudinaryCloudName || ''}
                onChange={(e) => setSettings({ ...settings, cloudinaryCloudName: e.target.value })}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </form>
    </div>
  );
}
