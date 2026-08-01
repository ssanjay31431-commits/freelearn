import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, CheckCircle2, Clock, Download, Package, ArrowRight, ShieldCheck, QrCode, Copy, Check, XCircle, AlertTriangle, MessageCircle, Send, Sparkles } from 'lucide-react';
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
  const [copiedField, setCopiedField] = useState(null);

  // Real-time Socket.IO status listener
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl, { autoConnect: true, reconnection: true });

    if (orderId) {
      socket.emit('join_order_room', orderId);
    }

    socket.on('order:status_updated', (updatedOrder) => {
      console.log('⚡ Live Order Status Received on Customer Site:', updatedOrder);
      if (updatedOrder && (updatedOrder.orderId === orderId || updatedOrder.orderId === queryId)) {
        setOrder((prev) => (prev ? { ...prev, ...updatedOrder, statusTimeline: updatedOrder.statusTimeline } : updatedOrder));
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

  const upiId = 'ssanjay31431@oksbi';
  const upiPhone = '7708447215';

  const timelineStages = [
    'Order Received',
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
      `Your order *#${ord?.orderId}* is CONFIRMED!`,
      "",
      `*Service:* ${ord?.items?.[0]?.title || 'VibeForge Service'}`,
      `*Total Package Value:* Rs.${ord?.totalAmount || 0}`,
      `*Amount Paid:* Rs.${ord?.amountPaid || 0}`,
      `*Remaining Balance:* Rs.${ord?.amountDue || 0}`,
      `*Status:* ${ord?.statusTimeline || 'Order Received'}`,
      "",
      `*Track Live Production:* https://vibeforge.netlify.app/track?id=${ord?.orderId}`,
      "----------------------------------",
      "Thank you for choosing VibeForge Digital Agency!"
    ];

    return `https://api.whatsapp.com/send?phone=${phoneFormatted}&text=${encodeURIComponent(lines.join("\n"))}`;
  };

  const getAdminWhatsAppUrl = (ord) => {
    const lines = [
      "*NEW VIBEFORGE ORDER ALERT!*",
      "----------------------------------",
      `*Order ID:* #${ord?.orderId}`,
      `*Customer:* ${ord?.customerName} (${ord?.customerPhone})`,
      `*Customer Email:* ${ord?.customerEmail}`,
      `*Service:* ${ord?.items?.[0]?.title || 'VibeForge Project'}`,
      `*Total Package Value:* Rs.${ord?.totalAmount || 0}`,
      `*Amount Paid:* Rs.${ord?.amountPaid || 0}`,
      `*Remaining Balance:* Rs.${ord?.amountDue || 0}`,
      `*Payment Status:* ${ord?.paymentStatus || 'Paid'}`,
      "----------------------------------",
      "Check Firebase Admin Panel!"
    ];

    return `https://api.whatsapp.com/send?phone=919943380320&text=${encodeURIComponent(lines.join("\n"))}`;
  };

  useEffect(() => {
    if (queryId) {
      handleTrack(queryId);
    }
  }, [queryId]);

  useEffect(() => {
    if (order && isNewOrder) {
      // Auto-trigger customer WhatsApp confirmation window cleanly
      const custUrl = getCustomerWhatsAppUrl(order);
      const timer = setTimeout(() => {
        window.open(custUrl, '_blank');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [order, isNewOrder]);

  const handleTrack = async (idToSearch = orderId) => {
    if (!idToSearch.trim()) return;
    setLoading(true);
    setError('');
    try {
      const foundOrder = await getFirestoreOrderById(idToSearch);
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setError('Order not found in Firebase database. Please check your Order ID (e.g., VF-792720).');
        setOrder(null);
      }
    } catch (err) {
      setError('Order lookup failed. Please verify your Order ID.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!order) return;
    setIsSubmittingCancel(true);

    try {
      await cancelFirestoreOrder(order.orderId, cancelReason);
      setOrder((prev) => ({
        ...prev,
        statusTimeline: 'Cancelled',
        cancelReason,
      }));
      setShowCancelModal(false);
    } catch (err) {
      console.error(err);
      alert('Order cancellation failed. Please try again.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const getStageIndex = (currentStage) => {
    const idx = timelineStages.indexOf(currentStage);
    return idx !== -1 ? idx : 0;
  };

  const handleDownloadInvoice = () => {
    if (!order) return;
    generateInvoicePDF(order);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Real-Time Order <span className="text-gradient">Progress Tracker</span>
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-600">
            Track live production stages, cancel orders, or download official invoices powered by Firebase Firestore.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 max-w-xl mx-auto mb-10 shadow-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTrack();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter Order ID (e.g. VF-792720)..."
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 pl-10 pr-4 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
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
                    <h3 className="text-lg font-black text-emerald-950">Order #{order.orderId} Confirmed Successfully!</h3>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Your booking has been saved. WhatsApp & email receipts are ready below.
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
                    <span>Send Order Confirmation to Customer WhatsApp</span>
                  </a>

                  <a
                    href={getAdminWhatsAppUrl(order)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-md flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-emerald-400" />
                    <span>Send Alert to Admin WhatsApp (+91 99433 80320)</span>
                  </a>
                </div>
              </div>
            )}

            {/* Header info card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-indigo-700 font-extrabold">Order ID: #{order.orderId}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                    order.statusTimeline === 'Cancelled'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                  }`}>
                    {order.statusTimeline}
                  </span>
                </div>
                
                <h2 className="text-lg font-extrabold text-slate-900 mt-1">
                  {order.items && order.items[0] ? order.items[0].title : 'VibeForge Project Service'}
                </h2>
                <div className="text-xs text-slate-600 font-semibold mt-1">
                  Customer: <span className="text-slate-900 font-extrabold">{order.customerName}</span> ({order.customerEmail})
                </div>

                {order.cancelReason && (
                  <div className="text-xs font-bold text-rose-700 mt-1">
                    Cancellation Reason: {order.cancelReason}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={getCustomerWhatsAppUrl(order)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span>WhatsApp Receipt</span>
                </a>

                <button
                  onClick={handleDownloadInvoice}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>PDF Invoice</span>
                </button>

                {/* CANCEL ORDER BUTTON */}
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
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {timelineStages.map((stageName, idx) => {
                    const currentIdx = getStageIndex(order.statusTimeline);
                    const isPassed = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;
                    const isCancelled = order.statusTimeline === 'Cancelled';

                    return (
                      <div
                        key={stageName}
                        className={`p-3.5 rounded-2xl border text-center transition-all ${
                          isCancelled
                            ? 'border-rose-200 bg-rose-50/50'
                            : isCurrent
                            ? 'border-2 border-indigo-600 bg-indigo-50 shadow-md'
                            : isPassed
                            ? 'border-indigo-200 bg-slate-50'
                            : 'border-slate-200 bg-slate-50 opacity-60'
                        }`}
                      >
                        <div className="flex justify-center mb-1.5">
                          {isCancelled ? (
                            <XCircle className="w-5 h-5 text-rose-600" />
                          ) : isPassed ? (
                            <CheckCircle2 className="w-5 h-5 text-indigo-600 fill-indigo-600 text-white" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-slate-400 text-[10px] flex items-center justify-center text-slate-500 font-bold">
                              {idx + 1}
                            </div>
                          )}
                        </div>
                        <div className="text-xs font-extrabold text-slate-900">{stageName}</div>
                        {isCurrent && !isCancelled && <div className="text-[10px] text-indigo-700 font-extrabold mt-1 animate-pulse">In Progress</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-slate-500 font-bold">Total Agreed Budget</div>
                <div className="text-lg font-extrabold text-slate-900 mt-1">₹{order.totalAmount}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-emerald-300 bg-emerald-50/50 shadow-sm">
                <div className="text-emerald-800 font-bold">Advance Paid</div>
                <div className="text-lg font-extrabold text-emerald-700 mt-1">₹{order.amountPaid}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-amber-300 bg-amber-50/50 shadow-sm">
                <div className="text-amber-800 font-bold">Balance Payment Due</div>
                <div className="text-lg font-extrabold text-amber-700 mt-1">₹{order.amountDue}</div>
              </div>
            </div>

            {/* GPay QR Payment Card if Balance Due and not cancelled */}
            {order.amountDue > 0 && order.statusTimeline !== 'Cancelled' && (
              <div className="bg-white p-6 rounded-3xl border-2 border-indigo-200 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-indigo-600" />
                    Pay Balance Due (₹{order.amountDue}) via GPay QR Code
                  </h3>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <img src="/gpay_qr.jpg" alt="S Sanjay GPay QR Code" className="w-44 h-auto rounded-xl" />
                  </div>
                  <div className="space-y-3 text-left">
                    <div className="text-sm font-black text-slate-900">Account Holder: S Sanjay</div>
                    <div className="text-xs text-slate-600 font-semibold">Scan with GPay, PhonePe, Paytm or BHIM</div>
                    <div className="text-xs font-extrabold text-indigo-700">UPI ID: {upiId}</div>
                    <div className="text-xs font-extrabold text-emerald-700">GPay Phone: {upiPhone}</div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* CANCEL ORDER CONFIRMATION MODAL */}
      {showCancelModal && order && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center border border-rose-200 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Cancel Order #{order.orderId}?</h3>
                <p className="text-xs font-bold text-slate-500">Are you sure you want to cancel this booking?</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="font-extrabold text-slate-900">{order.items?.[0]?.title || 'VibeForge Service'}</div>
              <div className="font-bold text-slate-600">Paid: ₹{order.amountPaid} • Total: ₹{order.totalAmount}</div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-2">
                Reason for Cancellation:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-extrabold focus:outline-none focus:border-rose-500"
              >
                <option value="Changed my mind">Changed my mind</option>
                <option value="Booked by mistake">Booked by mistake</option>
                <option value="Project requirements updated">Project requirements updated</option>
                <option value="Found alternative solution">Found alternative solution</option>
                <option value="Other reason">Other reason</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={isSubmittingCancel}
                className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-all cursor-pointer border border-slate-300"
              >
                Keep Order
              </button>

              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isSubmittingCancel}
                className="py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingCancel ? (
                  <span>Cancelling...</span>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Yes, Cancel Order</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
