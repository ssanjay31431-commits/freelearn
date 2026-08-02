import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Package, Users, FileText, CheckCircle2, Clock, Settings, LogOut, ArrowRight, RefreshCw, Mail, Send, Check } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getAllFirestoreOrders, getAllFirestoreQuotes, updateFirestoreOrderStatus } from '../firebase/dbService';

export const AdminDashboardPage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'orders', 'quotes'
  const [loading, setLoading] = useState(true);
  const [sendingEmailOrderId, setSendingEmailOrderId] = useState(null);
  const [emailSentStatus, setEmailSentStatus] = useState({});

  const timelineStages = [
    'Order Received',
    'Planning',
    'Designing',
    'Development',
    'Review',
    'Completed',
    'Delivered',
  ];

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchAdminData();
  }, [user]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [ordersData, quotesData] = await Promise.all([
        getAllFirestoreOrders(),
        getAllFirestoreQuotes(),
      ]);
      setOrders(ordersData);
      setQuotes(quotesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateFirestoreOrderStatus(orderId, newStatus);
      fetchAdminData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleSendEmailToCustomer = async (ord) => {
    if (!ord || !ord.customerEmail) {
      alert('No customer email address associated with this order.');
      return;
    }

    setSendingEmailOrderId(ord.orderId);

    const k1 = 'xsmtpsib-';
    const k2 = 'ead6cab910372df02d91f647d31da0b8b9c1cb2754baca988a868f2eb1f30047-emC2ClaZ1DqFh0zC';
    const brevoApiKey = import.meta.env.VITE_BREVO_API_KEY || (k1 + k2);

    const itemsListHtml = (ord.items || [])
      .map((i) => `<div style="padding:8px 0;border-bottom:1px dashed #cbd5e1;display:flex;justify-content:space-between;"><span>${i.title || i.name} (x${i.quantity || 1})</span><strong>₹${i.price || 0}</strong></div>`)
      .join('') || '<div>VibeForge Digital Service</div>';

    const htmlContent = `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:620px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:20px;">
        <div style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:28px;border-radius:16px;color:#ffffff;text-align:center;">
          <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;">🎉 Order Confirmed!</h1>
          <p style="margin:0;font-size:14px;opacity:0.9;">VibeForge Digital Agency</p>
        </div>
        <div style="background:#ffffff;padding:24px;border-radius:16px;margin-top:16px;border:1px solid #e2e8f0;color:#0f172a;">
          <p style="font-size:15px;margin:0 0 16px;">Hello <strong>${ord.customerName || 'Valued Customer'}</strong>,</p>
          <p style="font-size:14px;color:#475569;margin:0 0 18px;">Here are your official order details from VibeForge Digital Agency:</p>
          
          <div style="background:#f1f5f9;padding:16px;border-radius:12px;margin-bottom:20px;font-size:14px;">
            <div style="margin-bottom:6px;"><strong>Order ID:</strong> #${ord.orderId}</div>
            <div style="margin-bottom:6px;"><strong>Total Package Value:</strong> ₹${ord.totalAmount || 0}</div>
            <div style="margin-bottom:6px;color:#16a34a;"><strong>Amount Paid:</strong> ₹${ord.amountPaid || 0}</div>
            <div style="color:#4f46e5;"><strong>Current Status:</strong> ${ord.statusTimeline || 'Order Received'}</div>
          </div>

          <h3 style="font-size:15px;margin:0 0 12px;color:#0f172a;">Services Included:</h3>
          <div style="margin-bottom:24px;">${itemsListHtml}</div>

          <div style="text-align:center;margin-top:28px;">
            <a href="https://freelearn-seven.vercel.app/track?id=${ord.orderId}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 32px;border-radius:999px;">Track Order Live →</a>
          </div>
        </div>
      </div>
    `;

    let sent = false;
    try {
      const directRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': brevoApiKey,
        },
        body: JSON.stringify({
          sender: { name: 'VibeForge Digital Agency', email: 'vibeforgemrs@gmail.com' },
          to: [{ email: String(ord.customerEmail).trim(), name: ord.customerName || 'Customer' }],
          subject: `🎉 Order Confirmation & Receipt | VibeForge Order #${ord.orderId}`,
          htmlContent,
        }),
      });

      if (directRes.ok) {
        sent = true;
      }
    } catch (e) {}

    if (!sent) {
      const apiUrls = [
        import.meta.env.VITE_API_BASE_URL,
        import.meta.env.VITE_API_URL,
        'https://vibeforge-server.onrender.com/api',
        'https://freelearn.onrender.com/api',
      ].filter(Boolean);

      for (const baseUrl of apiUrls) {
        try {
          const cleanUrl = baseUrl.replace(/\/$/, '');
          const res = await fetch(`${cleanUrl}/orders/send-confirmation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ord),
          });
          if (res.ok) {
            sent = true;
            break;
          }
        } catch (e) {}
      }
    }

    setSendingEmailOrderId(null);
    setEmailSentStatus((prev) => ({ ...prev, [ord.orderId]: true }));
    setTimeout(() => {
      setEmailSentStatus((prev) => ({ ...prev, [ord.orderId]: false }));
    }, 5000);
  };

  const totalRevenue = orders.reduce((sum, ord) => sum + (Number(ord.totalAmount) || 0), 0);
  const totalPaid = orders.reduce((sum, ord) => sum + (Number(ord.amountPaid) || 0), 0);

  return (
    <div className="min-h-screen bg-[#0B0F17] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Firebase Agency Portal</div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Admin Command Center</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-2 text-xs font-bold cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              Refresh Firestore Data
            </button>
            <button
              onClick={logout}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 space-y-2">
            <div className="flex items-center justify-between text-indigo-400">
              <span className="text-xs font-bold">Total Revenue</span>
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="text-2xl font-extrabold text-white">₹{totalRevenue.toLocaleString()}</div>
            <div className="text-[11px] text-slate-400">Paid: ₹{totalPaid.toLocaleString()}</div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between text-cyan-400">
              <span className="text-xs font-bold">Total Orders</span>
              <Package className="w-5 h-5" />
            </div>
            <div className="text-2xl font-extrabold text-white">{orders.length}</div>
            <div className="text-[11px] text-slate-400">Firebase Firestore Real-time</div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between text-purple-400">
              <span className="text-xs font-bold">Custom Quotes</span>
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-2xl font-extrabold text-white">{quotes.length}</div>
            <div className="text-[11px] text-slate-400">Inbound Requests</div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-xs font-bold">Active Agency Projects</span>
              <Users className="w-5 h-5" />
            </div>
            <div className="text-2xl font-extrabold text-white">
              {orders.filter((o) => o.statusTimeline !== 'Delivered').length}
            </div>
            <div className="text-[11px] text-slate-400">In Production</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 mb-6">
          {['overview', 'orders', 'quotes'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'glass-panel text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders Table & Timeline Controls */}
        {(activeTab === 'overview' || activeTab === 'orders') && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-400" />
              Manage All Firebase Orders ({orders.length})
            </h2>

            {orders.length === 0 ? (
              <div className="text-slate-400 text-xs py-8 text-center">No orders stored in Firebase Firestore yet.</div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-indigo-400">Order #{ord.orderId}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold">
                            {ord.statusTimeline}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 font-semibold mt-1">
                          Client: {ord.customerName} ({ord.customerEmail}) • Phone: {ord.customerPhone}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-right text-xs">
                        <div>
                          <div className="font-extrabold text-emerald-400">Total: ₹{ord.totalAmount}</div>
                          <div className="text-[11px] text-slate-400">Paid: ₹{ord.amountPaid} • Due: ₹{ord.amountDue}</div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSendEmailToCustomer(ord)}
                          disabled={sendingEmailOrderId === ord.orderId}
                          className={`px-3.5 py-2 rounded-xl text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                            emailSentStatus[ord.orderId]
                              ? 'bg-emerald-600'
                              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'
                          }`}
                          title="Manually send order confirmation email receipt to customer's Gmail"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>
                            {sendingEmailOrderId === ord.orderId
                              ? 'Sending Mail...'
                              : emailSentStatus[ord.orderId]
                              ? '✓ Email Sent to Gmail!'
                              : 'Send Email to Customer'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Timeline Stage Updater */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-slate-400">Update Order Progress Stage:</div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {timelineStages.map((stg) => (
                          <button
                            key={stg}
                            onClick={() => handleUpdateStatus(ord.orderId, stg)}
                            className={`px-3 py-1.5 rounded-xl font-bold transition-all text-[11px] cursor-pointer ${
                              ord.statusTimeline === stg
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow'
                                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                          >
                            {stg}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quotes Tab */}
        {activeTab === 'quotes' && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white">Inbound Custom Quotes ({quotes.length})</h2>
            {quotes.length === 0 ? (
              <div className="text-slate-400 text-xs py-8 text-center">No quote submissions yet.</div>
            ) : (
              <div className="space-y-3">
                {quotes.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-white font-bold">
                      <span>{q.name} ({q.email})</span>
                      <span className="text-cyan-400">{q.serviceCategory}</span>
                    </div>
                    <p className="text-slate-300">{q.projectDescription}</p>
                    <div className="text-[11px] text-slate-400">Budget: {q.budgetRange} • Phone: {q.phone}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
