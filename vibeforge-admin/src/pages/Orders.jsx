import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import OrderTimeline from '../components/orders/OrderTimeline';
import OrderInvoiceModal from '../components/orders/OrderInvoiceModal';
import { Search, Filter, Eye, FileText, UserPlus, Trash2, Plus, Sparkles, MailCheck, Loader2, Send, X, AlertCircle, CheckCircle2 } from 'lucide-react';

import { getFirestoreAdminOrders, updateFirestoreOrderStatusAdmin } from '../firebase/adminDbService';
import { useSocket } from '../context/SocketContext';

export default function Orders() {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  
  // Email modal & sending state
  const [confirmModalOrder, setConfirmModalOrder] = useState(null);
  const [sendingEmailOrderId, setSendingEmailOrderId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchOrders = async () => {
    try {
      const res = await axiosClient.get('/admin/orders');
      if (res.data && res.data.length > 0) {
        setOrders(res.data);
        setLoading(false);
        return;
      }
      if (res.data) setOrders(res.data);
    } catch (err) {
      console.warn('Backend API /admin/orders fallback to Firestore:', err.message);
    }

    try {
      const fsOrders = await getFirestoreAdminOrders();
      if (fsOrders && fsOrders.length > 0) {
        setOrders(fsOrders);
      }
    } catch (fsErr) {
      console.error('Firestore Orders Error:', fsErr);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Real-time Socket.IO sync for new orders and status updates
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (newOrder) => {
      console.log('⚡ [Socket.IO] Real-time newOrder received in Admin:', newOrder);
      if (newOrder && newOrder.orderId) {
        setOrders((prev) => {
          const exists = prev.some((o) => o.orderId === newOrder.orderId);
          if (exists) {
            return prev.map((o) => (o.orderId === newOrder.orderId ? { ...o, ...newOrder } : o));
          }
          return [newOrder, ...prev];
        });
      }
    };

    const handleOrderUpdated = (updatedOrder) => {
      console.log('⚡ [Socket.IO] Real-time orderUpdated received in Admin:', updatedOrder);
      if (updatedOrder && updatedOrder.orderId) {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === updatedOrder.orderId ? { ...o, ...updatedOrder } : o))
        );
      }
    };

    const handleOrderDeleted = ({ orderId }) => {
      console.log('⚡ [Socket.IO] Order deleted event received for:', orderId);
      if (!orderId) return;
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    };

    const handleDataCleared = () => {
      console.log('⚡ [Socket.IO] Admin data cleared event received; removing all orders');
      setOrders([]);
    };

    socket.on('newOrder', handleNewOrder);
    socket.on('order:created', handleNewOrder);
    socket.on('orderUpdated', handleOrderUpdated);
    socket.on('order:status_updated', handleOrderUpdated);
    socket.on('orderDeleted', handleOrderDeleted);
    socket.on('admin:data_cleared', handleDataCleared);

    return () => {
      socket.off('newOrder', handleNewOrder);
      socket.off('order:created', handleNewOrder);
      socket.off('orderUpdated', handleOrderUpdated);
      socket.off('order:status_updated', handleOrderUpdated);
      socket.off('orderDeleted', handleOrderDeleted);
      socket.off('admin:data_cleared', handleDataCleared);
    };
  }, [socket]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    // Optimistic UI update: apply immediately
    setOrders((prev) => prev.map((o) => (o.orderId === orderId ? { ...o, statusTimeline: newStatus } : o)));
    try {
      const res = await axiosClient.put(`/admin/orders/${orderId}/status`, {
        statusTimeline: newStatus
      });
      // If server returned updated order, reconcile it
      if (res && res.data && res.data.orderId) {
        setOrders((prev) => prev.map((o) => (o.orderId === res.data.orderId ? { ...o, ...res.data } : o)));
      }
    } catch (err) {
      console.warn('Backend API update status fallback to Firestore or failed:', err?.response?.data || err.message);
      try {
        await updateFirestoreOrderStatusAdmin(orderId, newStatus);
      } catch (fsErr) {
        console.error('Firestore update failed:', fsErr);
      }
      // On failure, refetch to ensure UI reflects server state
      await fetchOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to delete order #${orderId}?`)) return;
    try {
      await axiosClient.delete(`/admin/orders/${orderId}`);
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete order');
    }
  };

  const handleOpenSendModal = (order) => {
    if (order.emailStatus === 'Sent') return;
    setConfirmModalOrder(order);
  };

  const handleExecuteSendConfirmationEmail = async () => {
    if (!confirmModalOrder) return;
    const order = confirmModalOrder;
    setConfirmModalOrder(null);
    setSendingEmailOrderId(order.orderId);
    setFeedback({ type: '', message: '' });

    let payload = null;
    try {
      const res = await axiosClient.post(`/orders/${order.orderId}/send-confirmation`, order);
      payload = res?.data || {};
    } catch (err) {
      try {
        const res2 = await axiosClient.post(`/admin/orders/${order.orderId}/send-confirmation-email`, order);
        payload = res2?.data || {};
      } catch (err2) {
        const message = err2.response?.data?.message || err.response?.data?.message || err2.message || 'Failed to send confirmation email.';
        setOrders((prev) =>
          prev.map((item) =>
            item.orderId === order.orderId
              ? {
                  ...item,
                  orderStatus: 'Pending',
                  statusTimeline: 'Pending',
                  emailStatus: 'FAILED',
                }
              : item
          )
        );
        setFeedback({ type: 'error', message });
        setSendingEmailOrderId(null);
        return;
      }
    }

    if (payload?.success || payload?.emailStatus === 'SENT' || payload?.emailStatus === 'Sent') {
      const sentAt = payload?.emailSentAt || new Date().toISOString();
      setOrders((prev) =>
        prev.map((item) =>
          item.orderId === order.orderId
            ? {
                ...item,
                orderStatus: 'Confirmed',
                statusTimeline: 'Confirmed',
                emailStatus: 'SENT',
                emailSentAt: sentAt,
              }
            : item
        )
      );
      setFeedback({ type: 'success', message: 'Confirmation email sent successfully via Brevo!' });
    } else {
      const message = payload?.message || 'Failed to send confirmation email.';
      setOrders((prev) =>
        prev.map((item) =>
          item.orderId === order.orderId
            ? {
                ...item,
                orderStatus: 'Pending',
                statusTimeline: 'Pending',
                emailStatus: 'FAILED',
              }
            : item
        )
      );
      setFeedback({ type: 'error', message });
    }

    setSendingEmailOrderId(null);
  };

  const filteredOrders = orders.filter((o) => {
    const isPaid = String(o.paymentStatus || '').toUpperCase() === 'PAID';
    const matchesSearch =
      (o.orderId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customerEmail || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.statusTimeline === statusFilter;
    return isPaid && matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 relative">
      
      {/* Confirmation Modal Popup */}
      {confirmModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#0F172A] border border-indigo-500/40 rounded-3xl p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Send className="w-5 h-5" />
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
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSendConfirmationEmail}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-glow cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Order Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track, fulfill, update 7-step timelines, assign team members & generate invoices.
          </p>
        </div>
      </div>

      {feedback.message && (
        <div className={`rounded-2xl border px-4 py-3 text-sm flex items-center gap-2 ${feedback.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/30 bg-rose-500/10 text-rose-300'}`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID, Customer Name or Email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-3">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Planning">Planning</option>
            <option value="Designing">Designing</option>
            <option value="Development">Development</option>
            <option value="Review">Review</option>
            <option value="Completed">Completed</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800">
          <p className="text-slate-400 text-sm">No orders matching search criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const currentEmailStatus = order.emailStatus || 'Not Sent';
            const isSending = sendingEmailOrderId === order.orderId;

            return (
              <div key={order._id || order.orderId} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="font-extrabold text-base text-white">#{order.orderId}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {order.paymentStatus}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        currentEmailStatus === 'Sent'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : currentEmailStatus === 'Failed'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-slate-700/50 text-slate-300 border-slate-600/30'
                      }`}>
                        Email: {currentEmailStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {order.customerName} ({order.customerEmail}) • {order.customerPhone}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Invoice Button */}
                    <button
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                      title="Generate & Download Invoice"
                    >
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span>Invoice</span>
                    </button>

                    {/* Send Confirmation Email Button */}
                    {currentEmailStatus === 'Sent' ? (
                      <button
                        disabled
                        className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1.5 cursor-not-allowed opacity-90"
                      >
                        <MailCheck className="w-4 h-4 text-emerald-400" />
                        <span>Email Sent ✓</span>
                      </button>
                    ) : currentEmailStatus === 'Failed' ? (
                      <button
                        type="button"
                        onClick={() => handleOpenSendModal(order)}
                        disabled={isSending}
                        className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md cursor-pointer disabled:opacity-50"
                      >
                        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MailCheck className="w-4 h-4" />}
                        <span>{isSending ? 'Sending...' : 'Retry Email'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenSendModal(order)}
                        disabled={isSending}
                        className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md cursor-pointer disabled:opacity-50"
                      >
                        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MailCheck className="w-4 h-4" />}
                        <span>{isSending ? 'Sending...' : 'Send Confirmation Email'}</span>
                      </button>
                    )}

                    {/* Details Button */}
                    <button
                      onClick={() => navigate(`/orders/${order.orderId}`)}
                      className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Details</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteOrder(order.orderId)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs cursor-pointer"
                      title="Delete Order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 7-Step Interactive Status Timeline */}
                <OrderTimeline
                  currentStatus={order.statusTimeline}
                  onStatusChange={(newStatus) => handleStatusChange(order.orderId, newStatus)}
                  isUpdating={updatingId === order.orderId}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <OrderInvoiceModal order={selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} />
      )}
    </div>
  );
}
