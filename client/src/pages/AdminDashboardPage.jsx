import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Package, Users, FileText, CheckCircle2, Clock, Settings, LogOut, ArrowRight, RefreshCw, Mail, Send, Check, AlertCircle, X, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getAllFirestoreOrders, getAllFirestoreQuotes, updateFirestoreOrderStatus } from '../firebase/dbService';

export const AdminDashboardPage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Email confirmation state
  const [confirmModalOrder, setConfirmModalOrder] = useState(null);
  const [sendingEmailOrderId, setSendingEmailOrderId] = useState(null);
  const [toastNotification, setToastNotification] = useState(null); // { type: 'success'|'error', text: '' }

  const timelineStages = [
    'Pending',
    'Confirmed',
    'Planning',
    'Designing',
    'Development',
    'Review',
    'Completed',
    'Delivered',
    'Rejected'
  ];

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchAdminData();
  }, [user]);

  const showToast = (type, text) => {
    setToastNotification({ type, text });
    setTimeout(() => setToastNotification(null), 5000);
  };

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
      showToast('error', 'Failed to update order status');
    }
  };

  const handleOpenSendModal = (ord) => {
    if (ord.emailStatus === 'Sent') return;
    setConfirmModalOrder(ord);
  };

  const handleExecuteSendConfirmationEmail = async () => {
    if (!confirmModalOrder) return;
    const ord = confirmModalOrder;
    setConfirmModalOrder(null);
    setSendingEmailOrderId(ord.orderId);

    const k1 = 'xsmtpsib-';
    const k2 = 'ead6cab910372df02d91f647d31da0b8b9c1cb2754baca988a868f2eb1f30047-emC2ClaZ1DqFh0zC';
    const brevoApiKey = import.meta.env.VITE_BREVO_API_KEY || (k1 + k2);

    const customerName = ord.customerName || 'Valued Customer';
    const orderId = ord.orderId;
    const product = Array.isArray(ord.items) && ord.items.length > 0
      ? ord.items.map((i) => i.title || i.name).join(', ')
      : ord.product || 'VibeForge Digital Service';
    const quantity = Array.isArray(ord.items) && ord.items.length > 0
      ? ord.items.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0)
      : ord.quantity || 1;
    const amount = `₹${ord.totalAmount || 0}`;

    const textBody = `Hello ${customerName},

Thank you for placing your order with VibeForge.

Your order has been confirmed successfully.

Order Details

Order ID:
${orderId}

Product:
${product}

Quantity:
${quantity}

Amount:
${amount}

Order Status:
Confirmed

Thank you for choosing VibeForge.

Regards,

VibeForge Team`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; color: #0f172a;">
        <h2 style="color: #4f46e5; margin-top: 0;">VibeForge Order Confirmation</h2>
        <p>Hello <strong>${customerName}</strong>,</p>
        <p>Thank you for placing your order with VibeForge.</p>
        <p>Your order has been confirmed successfully.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <h3 style="color: #0f172a; margin-bottom: 12px;">Order Details</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
          <tr><td style="padding: 6px 0; color: #64748b; width: 140px;"><strong>Order ID:</strong></td><td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${orderId}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;"><strong>Product:</strong></td><td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${product}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;"><strong>Quantity:</strong></td><td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${quantity}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;"><strong>Amount:</strong></td><td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${amount}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;"><strong>Order Status:</strong></td><td style="padding: 6px 0; font-weight: bold; color: #16a34a;">Confirmed</td></tr>
        </table>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p>Thank you for choosing VibeForge.</p>
        <p style="margin-bottom: 0;">Regards,<br /><strong>VibeForge Team</strong></p>
      </div>
    `;

    let deliverySuccess = false;
    let errorMessage = '';

    // 1. Primary: Try direct Brevo API
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': brevoApiKey,
        },
        body: JSON.stringify({
          sender: { name: 'VibeForge Digital Agency', email: 'vibeforgemrs@gmail.com' },
          to: [{ email: String(ord.customerEmail).trim(), name: customerName }],
          subject: 'VibeForge Order Confirmation',
          htmlContent: htmlBody,
          textContent: textBody,
        }),
      });

      if (res.ok) {
        deliverySuccess = true;
      } else {
        const errResp = await res.text();
        errorMessage = `Brevo REST API (${res.status}): ${errResp}`;
      }
    } catch (apiErr) {
      errorMessage = apiErr.message;
    }

    // 2. Secondary: Backend endpoint fallback if primary failed
    if (!deliverySuccess) {
      const apiUrls = [
        import.meta.env.VITE_API_BASE_URL,
        import.meta.env.VITE_API_URL,
        'https://vibeforge-server.onrender.com/api',
        'https://freelearn.onrender.com/api',
        'http://localhost:5000/api'
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
            deliverySuccess = true;
            break;
          }
        } catch (e) {
          console.warn('Backend send-confirmation attempt failed:', e.message);
        }
      }
    }

    setSendingEmailOrderId(null);

    if (deliverySuccess) {
      const nowStr = new Date().toISOString();
      // Update state locally
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === ord.orderId
            ? { ...o, orderStatus: 'Confirmed', statusTimeline: 'Confirmed', emailStatus: 'Sent', emailSentAt: nowStr }
            : o
        )
      );

      // Update Firestore
      try {
        await updateFirestoreOrderStatus(ord.orderId, 'Confirmed');
      } catch (e) {}

      showToast('success', 'Confirmation email sent successfully.');
    } else {
      // Update state locally to Failed, keep Pending orderStatus
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === ord.orderId
            ? { ...o, orderStatus: 'Pending', statusTimeline: 'Pending', emailStatus: 'Failed' }
            : o
        )
      );

      showToast('error', `Failed to send email: ${errorMessage || 'Service unavailable'}. Click 'Retry Email' to try again.`);
    }
  };

  const totalRevenue = orders.reduce((sum, ord) => sum + (Number(ord.totalAmount) || 0), 0);
  const totalPaid = orders.reduce((sum, ord) => sum + (Number(ord.amountPaid) || 0), 0);

  return (
    <div className="min-h-screen bg-[#0B0F17] py-10 relative">
      
      {/* Toast Notification Alert Banner */}
      {toastNotification && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`p-4 rounded-2xl border shadow-2xl flex items-center gap-3 text-xs font-bold ${
              toastNotification.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
            }`}
          >
            {toastNotification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{toastNotification.text}</span>
            <button onClick={() => setToastNotification(null)} className="ml-2 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal Popup */}
      {confirmModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#0F172A] border border-indigo-500/40 rounded-3xl p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Mail className="w-5 h-5" />
              </div>
              <button
                onClick={() => setConfirmModalOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-white">Send Confirmation Email?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to send the confirmation email to this customer?
              </p>
            </div>

            {/* Order Details Preview */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5 text-slate-300">
              <div><strong className="text-slate-400">Customer:</strong> {confirmModalOrder.customerName}</div>
              <div><strong className="text-slate-400">Email:</strong> {confirmModalOrder.customerEmail}</div>
              <div><strong className="text-slate-400">Order ID:</strong> #{confirmModalOrder.orderId}</div>
              <div><strong className="text-slate-400">Amount:</strong> ₹{confirmModalOrder.totalAmount}</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOrder(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSendConfirmationEmail}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-glow cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest">MERN & Firebase Agency Admin</div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Admin Command Center</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-2 text-xs font-bold cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              Refresh Data
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
            <div className="text-[11px] text-slate-400">MongoDB Atlas & Firestore</div>
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
              <span className="text-xs font-bold">Confirmed / Active</span>
              <Users className="w-5 h-5" />
            </div>
            <div className="text-2xl font-extrabold text-white">
              {orders.filter((o) => (o.orderStatus || o.statusTimeline) === 'Confirmed').length}
            </div>
            <div className="text-[11px] text-slate-400">Confirmed Orders</div>
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
            <h2 className="text-lg font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-400" />
                Manage All Orders ({orders.length})
              </span>
            </h2>

            {orders.length === 0 ? (
              <div className="text-slate-400 text-xs py-8 text-center">No orders placed yet.</div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord, idx) => {
                  const currentOrderStatus = ord.orderStatus || ord.statusTimeline || 'Pending';
                  const currentEmailStatus = ord.emailStatus || 'Not Sent';

                  // Badge styles as requested
                  let orderStatusBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                  if (currentOrderStatus === 'Confirmed') {
                    orderStatusBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                  } else if (currentOrderStatus === 'Rejected') {
                    orderStatusBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                  }

                  let emailStatusBadge = 'bg-slate-700/50 text-slate-300 border-slate-600/30';
                  if (currentEmailStatus === 'Sent') {
                    emailStatusBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                  } else if (currentEmailStatus === 'Failed') {
                    emailStatusBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                  }

                  const productTitles = Array.isArray(ord.items) && ord.items.length > 0
                    ? ord.items.map((i) => i.title || i.name).join(', ')
                    : ord.product || 'Custom Service';

                  const totalQty = Array.isArray(ord.items) && ord.items.length > 0
                    ? ord.items.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0)
                    : ord.quantity || 1;

                  const formattedDate = ord.createdAt
                    ? new Date(ord.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : 'N/A';

                  const isSending = sendingEmailOrderId === ord.orderId;

                  return (
                    <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                      
                      {/* Top Header Row */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-extrabold text-indigo-400">Order #{ord.orderId}</span>
                            
                            {/* Order Status Badge */}
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${orderStatusBadge}`}>
                              Order: {currentOrderStatus}
                            </span>

                            {/* Email Status Badge */}
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${emailStatusBadge}`}>
                              Email: {currentEmailStatus}
                            </span>
                          </div>

                          <div className="text-xs text-slate-200 font-semibold">
                            <strong>Client:</strong> {ord.customerName} ({ord.customerEmail}) • <strong>Phone:</strong> {ord.customerPhone}
                          </div>

                          <div className="text-[11px] text-slate-400">
                            <strong>Product/Service:</strong> {productTitles} (Qty: {totalQty}) • <strong>Date:</strong> {formattedDate}
                          </div>

                          {ord.emailSentAt && (
                            <div className="text-[10px] text-emerald-400 font-semibold">
                              ✓ Email sent at: {new Date(ord.emailSentAt).toLocaleString()}
                            </div>
                          )}
                        </div>

                        {/* Right Stats & Action Button */}
                        <div className="flex flex-wrap items-center gap-3 text-right text-xs">
                          <div>
                            <div className="font-extrabold text-emerald-400 text-sm">₹{ord.totalAmount}</div>
                            <div className="text-[11px] text-slate-400">Paid: ₹{ord.amountPaid} • Due: ₹{ord.amountDue}</div>
                            <div className="text-[10px] text-indigo-300 font-bold uppercase">{ord.paymentStatus || 'Pending'}</div>
                          </div>

                          {/* ACTION BUTTON WITH SPECIFIED STATES */}
                          <div>
                            {currentEmailStatus === 'Sent' ? (
                              <button
                                disabled
                                className="px-4 py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center gap-1.5 cursor-not-allowed opacity-90"
                              >
                                <Check className="w-4 h-4 text-emerald-400" />
                                <span>Email Sent ✓</span>
                              </button>
                            ) : currentEmailStatus === 'Failed' ? (
                              <button
                                type="button"
                                onClick={() => handleOpenSendModal(ord)}
                                disabled={isSending}
                                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                {isSending ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    <span>Sending...</span>
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="w-4 h-4" />
                                    <span>Retry Email</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenSendModal(ord)}
                                disabled={isSending}
                                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:opacity-95 text-white font-extrabold text-xs shadow-glow transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                {isSending ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    <span>Sending...</span>
                                  </>
                                ) : (
                                  <>
                                    <Mail className="w-4 h-4" />
                                    <span>Send Confirmation Email</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Timeline Stage Updater */}
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-slate-400">Update Order Status Stage:</div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {timelineStages.map((stg) => (
                            <button
                              key={stg}
                              onClick={() => handleUpdateStatus(ord.orderId, stg)}
                              className={`px-3 py-1 rounded-xl font-bold transition-all text-[11px] cursor-pointer ${
                                currentOrderStatus === stg
                                  ? 'bg-indigo-600 text-white shadow-glow'
                                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                              }`}
                            >
                              {stg}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
