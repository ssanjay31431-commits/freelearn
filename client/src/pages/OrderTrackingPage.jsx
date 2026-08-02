import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, CheckCircle2, Clock, Download, Package, MessageCircle, Send, XCircle, AlertTriangle, X } from 'lucide-react';
import { generateInvoicePDF } from '../utils/generateInvoicePDF';
import { getFirestoreOrderById, cancelFirestoreOrder } from '../firebase/dbService';

import { io } from 'socket.io-client';

export const OrderTrackingPage = () => {
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id') || '';
  const isNewOrder = searchParams.get('newOrder') === 'true';

  const [orderId, setOrderId] = useState(queryId);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Real-time Socket.IO status listener
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'https://vibeforge-hq68.onrender.com';
    const socket = io(socketUrl, { autoConnect: true, reconnection: true });

    if (orderId) {
      socket.emit('join_order_room', orderId);
    }

    socket.on('order:status_updated', (updatedOrder) => {
      console.log('⚡ Live Order Status Received on Customer Site:', updatedOrder);
      if (updatedOrder && (updatedOrder.orderId === orderId || updatedOrder.orderId === queryId)) {
        setOrder((prev) => (prev ? { ...prev, ...updatedOrder, statusTimeline: updatedOrder.statusTimeline || updatedOrder.orderStatus } : updatedOrder));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId, queryId]);

  // Cancellation Modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed my mind');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const timelineStages = [
    'Pending',
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
      `Your order *#${ord?.orderId}* is RECEIVED!`,
      "",
      `*Service:* ${ord?.items?.[0]?.title || 'VibeForge Service'}`,
      `*Total Package Value:* Rs.${ord?.totalAmount || 0}`,
      `*Amount Paid:* Rs.${ord?.amountPaid || 0}`,
      `*Remaining Balance:* Rs.${ord?.amountDue || 0}`,
      `*Status:* ${ord?.orderStatus || ord?.statusTimeline || 'Pending'}`,
      "",
      `*Track Live Production:* https://freelearn-seven.vercel.app/track?id=${ord?.orderId}`,
      "----------------------------------",
      "Thank you for choosing VibeForge Digital Agency!"
    ];

    return `https://api.whatsapp.com/send?phone=${phoneFormatted}&text=${encodeURIComponent(lines.join("\n"))}`;
  };

  useEffect(() => {
    if (queryId) {
      handleTrack(queryId);
    }
  }, [queryId]);

  const handleTrack = async (idToSearch = orderId) => {
    if (!idToSearch) return;
    setLoading(true);
    setError('');

    try {
      const foundOrder = await getFirestoreOrderById(idToSearch.trim());
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setError('Order not found. Please verify your Order ID and try again.');
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
    if (order) generateInvoicePDF(order);
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
    const idx = timelineStages.indexOf(stage);
    return idx === -1 ? 0 : idx;
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
            <span>Live Order Status Tracking</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Track Your Project</h1>

          <form onSubmit={(e) => { e.preventDefault(); handleTrack(); }} className="max-w-md mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter Order ID (e.g. VF-839201)"
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-4 py-3 text-slate-900 font-medium text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track Order'}
            </button>
          </form>
          {error && <div className="text-xs text-rose-600 mt-3 text-center font-bold">{error}</div>}
        </div>

        {/* Order Details Banner & Timeline */}
        {order && (
          <div className="space-y-8 animate-in fade-in">

            {/* Success Banner if New Order */}
            {isNewOrder && (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 shadow-lg space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-emerald-950">Order #{order.orderId} Placed Successfully!</h3>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Your order has been recorded. Current Status: <span className="underline">{order.orderStatus || order.statusTimeline || 'Pending'}</span>. Confirmation email will be dispatched by VibeForge Admin once verified.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href={getCustomerWhatsAppUrl(order)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                    <span>WhatsApp Receipt</span>
                  </a>

                  <button
                    onClick={handleDownloadInvoice}
                    className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-white" />
                    <span>PDF Invoice</span>
                  </button>
                </div>
              </div>
            )}

            {/* Header info card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-indigo-700 font-extrabold">Order ID: #{order.orderId}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                    (order.orderStatus || order.statusTimeline) === 'Confirmed'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : (order.orderStatus || order.statusTimeline) === 'Cancelled' || (order.orderStatus || order.statusTimeline) === 'Rejected'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    Order: {order.orderStatus || order.statusTimeline || 'Pending'}
                  </span>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                    order.emailStatus === 'Sent'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : order.emailStatus === 'Failed'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}>
                    Email: {order.emailStatus || 'Not Sent'}
                  </span>
                </div>
                
                <h2 className="text-lg font-extrabold text-slate-900 mt-1">
                  {order.items && order.items[0] ? order.items[0].title : 'VibeForge Project Service'}
                </h2>
                <div className="text-xs text-slate-600 font-semibold mt-1">
                  Customer: <span className="text-slate-900 font-extrabold">{order.customerName}</span> ({order.customerEmail})
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

                {order.statusTimeline !== 'Cancelled' && order.statusTimeline !== 'Delivered' && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-extrabold border border-rose-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Cancel Order</span>
                  </button>
                )}
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
