import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, CheckCircle2, Clock, Download, Package, MessageCircle, Mail, AlertTriangle, X, Zap, Sparkles, ShieldCheck } from 'lucide-react';
import { generateInvoicePDF } from '../utils/generateInvoicePDF';
import { getFirestoreOrderById, cancelFirestoreOrder } from '../firebase/dbService';
import axiosClient from '../api/axiosClient';
import { io } from 'socket.io-client';

export const OrderTrackingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryId = searchParams.get('id') || '';
  const isNewOrder = searchParams.get('newOrder') === 'true';

  const [orderId, setOrderId] = useState(queryId);
  const [emailInput, setEmailInput] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState('');
  const [error, setError] = useState('');
  const [isResumingPayment, setIsResumingPayment] = useState(false);

  const paymentReturn = searchParams.get('paymentReturn') === 'true';

  // Real-time Socket.IO status listener
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'https://vibeforge-hq68.onrender.com';
    const socket = io(socketUrl, { autoConnect: true, reconnection: true });

    const activeId = order?.orderId || orderId || queryId;
    if (activeId) {
      socket.emit('join_order_room', activeId);
    }

    const handleUpdate = (updatedOrder) => {
      console.log('⚡ Live Order Status Received on Customer Site:', updatedOrder);
      if (updatedOrder && (updatedOrder.orderId === activeId || updatedOrder.orderId === orderId)) {
        setOrder((prev) => (prev ? { ...prev, ...updatedOrder, statusTimeline: updatedOrder.statusTimeline || updatedOrder.orderStatus } : updatedOrder));
      }
    };

    socket.on('orderUpdated', handleUpdate);
    socket.on('order:status_updated', handleUpdate);

    return () => {
      socket.off('orderUpdated', handleUpdate);
      socket.off('order:status_updated', handleUpdate);
      socket.disconnect();
    };
  }, [orderId, queryId, order?.orderId]);

  // Cancellation Modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed my mind');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const timelineStages = [
    'Order Received',
    'Confirmed',
    'Planning',
    'Designing',
    'Development',
    'Review',
    'Completed',
    'Delivered',
  ];

  const getCustomerWhatsAppUrl = (ord) => {
    const cleanPhone = (ord?.customerPhone || '').replace(/\D/g, '');
    const phoneFormatted = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone || '919943380320';
    
    const lines = [
      "*VIBEFORGE ORDER CONFIRMATION*",
      "----------------------------------",
      `Dear *${ord?.customerName || 'Customer'}*,`,
      "",
      `Your order *#${ord?.orderId}* is RECORDED!`,
      "",
      `*Service:* ${ord?.items?.[0]?.title || 'VibeForge Service'}`,
      `*Total Value:* Rs.${ord?.totalAmount || 0}`,
      `*Amount Paid:* Rs.${ord?.amountPaid || 0}`,
      `*Amount Due:* Rs.${ord?.amountDue || 0}`,
      `*Status:* ${ord?.orderStatus || ord?.statusTimeline || 'Order Received'}`,
      "",
      `*Track Live Production:* https://freelearn-seven.vercel.app/track?id=${ord?.orderId}`,
      "----------------------------------",
      "Thank you for choosing VibeForge Digital Agency!"
    ];

    return `https://api.whatsapp.com/send?phone=${phoneFormatted}&text=${encodeURIComponent(lines.join("\n"))}`;
  };

  useEffect(() => {
    if (queryId && !paymentReturn) {
      handleTrack(queryId, '');
    }
  }, [queryId, paymentReturn]);

  useEffect(() => {
    if (paymentReturn && queryId) {
      verifyPaymentReturn(queryId);
    }
  }, [paymentReturn, queryId]);

  const verifyPaymentReturn = async (idToVerify) => {
    setIsVerifyingPayment(true);
    setError('');
    setVerifyMessage('Verifying your payment with Cashfree. Please wait a moment...');

    const maxAttempts = 4;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const res = await axiosClient.post('/payment/verify', { orderId: idToVerify });
        if (res.data?.success && res.data.order) {
          setOrder(res.data.order);
          setVerifyMessage('Payment verified & order confirmed! Loading your project tracking...');
          setTimeout(() => {
            navigate(`/track?id=${encodeURIComponent(idToVerify)}`, { replace: true });
          }, 1000);
          setIsVerifyingPayment(false);
          return;
        }

        setVerifyMessage(res.data?.message || 'Payment verification is pending. Retrying...');
      } catch (err) {
        const status = err.response?.status;
        const message = err.response?.data?.message || err.message || 'Unable to verify payment yet.';
        if (status === 404 || status === 202 || status === 400) {
          setVerifyMessage(message || 'Payment verification is still pending. Retrying...');
        } else {
          setError(message);
          setIsVerifyingPayment(false);
          return;
        }
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    setError('Payment verification is taking longer than expected. Refresh this page in a few seconds to update.');
    setVerifyMessage('');
    setIsVerifyingPayment(false);
  };

  const handleTrack = async (idToSearch = orderId, emailToSearch = emailInput) => {
    const searchId = (idToSearch || orderId).trim();
    if (!searchId) {
      setError('Please enter a valid Order ID.');
      return;
    }

    setLoading(true);
    setError('');

    // Try Express Backend API first
    try {
      const res = await axiosClient.get(`/orders/track?orderId=${encodeURIComponent(searchId)}&email=${encodeURIComponent(emailToSearch.trim())}`);
      if (res.data && res.data.success && res.data.order) {
        setOrder(res.data.order);
        setLoading(false);
        return;
      }
    } catch (apiErr) {
      if (apiErr.response?.status === 403) {
        setError('Email address does not match this Order ID.');
        setOrder(null);
        setLoading(false);
        return;
      }
    }

    // Fallback to Firestore lookup
    try {
      const foundOrder = await getFirestoreOrderById(searchId);
      if (foundOrder) {
        if (emailToSearch && emailToSearch.trim()) {
          const cleanInputEmail = emailToSearch.trim().toLowerCase();
          const orderEmail = (foundOrder.customerEmail || '').trim().toLowerCase();
          if (orderEmail && orderEmail !== cleanInputEmail) {
            setError('Email address does not match this Order ID.');
            setOrder(null);
            setLoading(false);
            return;
          }
        }
        setOrder(foundOrder);
      } else {
        setError(`Invalid Order ID #${searchId}. No order found.`);
        setOrder(null);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch order details.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (order?.invoiceUrl) {
      window.open(order.invoiceUrl, '_blank');
    } else if (order) {
      generateInvoicePDF(order);
    }
  };

  const handleResumePayment = async () => {
    if (!order) return;
    setIsResumingPayment(true);
    try {
      const cleanPhone = (order.customerPhone || '').replace(/\D/g, '').slice(-10);
      const paymentPayload = {
        orderId: order.orderId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: cleanPhone,
        address: order.address,
        items: order.items,
        paymentType: order.paymentType,
        paymentMethod: order.paymentMethod,
        totalAmount: order.totalAmount,
      };
      const response = await axiosClient.post('/payment/create-order', paymentPayload);
      const paymentUrl = response?.data?.paymentUrl;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        alert('Unable to resume Cashfree payment. Please try again.');
      }
    } catch (err) {
      console.error('Resume payment error:', err);
      alert('Failed to resume payment. Please contact support.');
    } finally {
      setIsResumingPayment(false);
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!order) return;
    setIsSubmittingCancel(true);

    try {
      await cancelFirestoreOrder(order.orderId, cancelReason);
      setOrder((prev) => ({ ...prev, statusTimeline: 'Cancelled', cancelReason }));
      setShowCancelModal(false);
    } catch (err) {
      console.error(err);
      alert('Order cancellation failed. Please try again.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const getStageIndex = (stage) => {
    if (!stage) return 0;
    if (stage === 'Pending' || stage === 'PAYMENT_PENDING') return 0;
    const idx = timelineStages.indexOf(stage);
    return idx === -1 ? 1 : idx;
  };

  const formatLastUpdated = (ord) => {
    const rawDate = ord?.updatedAt || ord?.emailSentAt || ord?.createdAt;
    if (!rawDate) return 'N/A';
    try {
      return new Date(rawDate).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (e) {
      return String(rawDate);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 relative">

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Cancel Order #{order?.orderId}?</h3>
              <p className="text-xs text-slate-600 font-semibold">
                This will halt live production. Please select a reason for cancellation:
              </p>
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 mb-1.5">Reason for Cancellation</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-rose-600"
                >
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Found alternative solution">Found alternative solution</option>
                  <option value="Project timeline delayed">Project timeline delayed</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Keep Order Active
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCancel}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingCancel ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Search Bar Header */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-extrabold uppercase">
            <Package className="w-4 h-4 text-indigo-600" />
            <span>Live Real-Time Order Status Tracking</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Track Your Order Status</h1>

          <form onSubmit={(e) => { e.preventDefault(); handleTrack(); }} className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Order ID (e.g. VF-881262)"
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-4 py-3 text-slate-900 font-medium text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
              />
            </div>

            <div className="sm:col-span-4 relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Email Address (Optional)"
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-4 py-3 text-slate-900 font-medium text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="sm:col-span-2 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>
          {error && <div className="text-xs text-rose-600 mt-2 text-center font-extrabold">{error}</div>}
          {(paymentReturn || isVerifyingPayment) && (
            <div className="mt-4 rounded-3xl border border-indigo-200 bg-indigo-50 p-4 text-center text-xs text-slate-800 font-bold">
              {isVerifyingPayment ? verifyMessage : 'Checking payment status and confirming your order now...'}
            </div>
          )}
        </div>

        {/* Order Details Banner & Timeline */}
        {order && (
          <div className="space-y-8 animate-in fade-in">

            {/* Resume Payment Alert Banner if PENDING */}
            {String(order.paymentStatus || '').toUpperCase() === 'PENDING' && (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 shadow-lg space-y-3 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                    ⚡
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-amber-950">Payment Pending for Order #{order.orderId}</h3>
                    <p className="text-xs text-amber-900 font-semibold mt-0.5">
                      Your order has been registered in our database. Complete your Cashfree payment now to start project development immediately!
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={handleResumePayment}
                    disabled={isResumingPayment}
                    className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>{isResumingPayment ? 'Opening Cashfree Payment...' : 'Resume Payment Now'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Automated Success Status Banner when PAID */}
            {String(order.paymentStatus || '').toUpperCase() === 'PAID' && (
              <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 shadow-md flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md">
                    ✓
                  </div>
                  <div>
                    <div className="text-sm font-black text-emerald-950 flex flex-wrap items-center gap-2">
                      <span className="bg-emerald-200/80 px-2 py-0.5 rounded-lg text-emerald-900 text-xs">Payment Successful</span>
                      <span className="text-slate-400">•</span>
                      <span className="bg-emerald-200/80 px-2 py-0.5 rounded-lg text-emerald-900 text-xs">Order Confirmed</span>
                      <span className="text-slate-400">•</span>
                      <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-lg text-xs font-bold">Project Started</span>
                    </div>
                    <p className="text-xs text-emerald-800 font-semibold mt-1">
                      Cashfree Payment ID: <strong className="text-slate-900">{order.cfPaymentId || order.transactionId || order.cashfreeOrderId}</strong> • Amount Paid: <strong className="text-emerald-900">₹{order.amountPaid}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadInvoice}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-white" />
                    <span>PDF Invoice</span>
                  </button>
                </div>
              </div>
            )}

            {/* Header Info Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-indigo-700 font-black">Order ID: #{order.orderId}</span>
                    
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                      (order.orderStatus || order.statusTimeline) === 'Confirmed' || (order.orderStatus || order.statusTimeline) === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : (order.orderStatus || order.statusTimeline) === 'Cancelled' || (order.orderStatus || order.statusTimeline) === 'Rejected'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                    }`}>
                      Order Status: {order.orderStatus || order.statusTimeline || 'Order Received'}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                      (order.paymentStatus || '').toUpperCase().includes('PAID')
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      Payment: {order.paymentStatus || 'PENDING'}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                      (order.emailStatus || '').toUpperCase() === 'SENT'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : (order.emailStatus || '').toUpperCase() === 'FAILED'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}>
                      Email: {order.emailStatus || 'NOT_SENT'}
                    </span>
                  </div>
                  
                  <h2 className="text-lg font-black text-slate-900 mt-2">
                    {order.items && order.items[0] ? order.items[0].title : 'VibeForge Service Package'}
                  </h2>
                  <div className="text-xs text-slate-600 font-semibold mt-1">
                    Customer: <span className="text-slate-900 font-bold">{order.customerName}</span> ({order.customerEmail})
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleDownloadInvoice}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-white" />
                    <span>PDF Invoice</span>
                  </button>
                </div>
              </div>

              {/* Status Metadata Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Package Value</div>
                  <div className="font-black text-slate-900 mt-0.5">₹{order.totalAmount || 0}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Amount Paid</div>
                  <div className="font-black text-emerald-700 mt-0.5">₹{order.amountPaid || 0}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Remaining Balance</div>
                  <div className="font-black text-amber-700 mt-0.5">₹{order.amountDue || 0}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Last Updated</div>
                  <div className="font-extrabold text-slate-700 mt-0.5">{formatLastUpdated(order)}</div>
                </div>
              </div>
            </div>

            {/* Timeline Bar */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Live Production Progress Timeline
              </h3>

              <div className="relative">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {timelineStages.map((stageName, idx) => {
                    const currentIdx = getStageIndex(order.orderStatus || order.statusTimeline);
                    const isPassed = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div
                        key={stageName}
                        className={`p-3.5 rounded-2xl border text-center transition-all ${
                          isCurrent
                            ? 'border-2 border-indigo-600 bg-indigo-50 shadow-md'
                            : isPassed
                            ? 'border-indigo-200 bg-slate-50'
                            : 'border-slate-200 bg-slate-50 opacity-60'
                        }`}
                      >
                        <div className="flex justify-center mb-1.5">
                          {isPassed ? (
                            <CheckCircle2 className="w-5 h-5 text-indigo-600 fill-indigo-600 text-white" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-slate-400 text-[10px] flex items-center justify-center text-slate-500 font-bold">
                              {idx + 1}
                            </div>
                          )}
                        </div>
                        <div className="text-xs font-extrabold text-slate-900">{stageName}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
