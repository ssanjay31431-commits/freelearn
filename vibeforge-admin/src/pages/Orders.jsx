import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import OrderTimeline from '../components/orders/OrderTimeline';
import OrderInvoiceModal from '../components/orders/OrderInvoiceModal';
import { Search, Filter, Eye, FileText, UserPlus, Trash2, Plus, Sparkles } from 'lucide-react';

import { getFirestoreAdminOrders, updateFirestoreOrderStatusAdmin } from '../firebase/adminDbService';

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

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

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await axiosClient.put(`/admin/orders/${orderId}/status`, {
        statusTimeline: newStatus
      });
      await fetchOrders();
    } catch (err) {
      console.warn('Backend API update status fallback to Firestore');
      await updateFirestoreOrderStatusAdmin(orderId, newStatus);
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

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.statusTimeline === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Order Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track, fulfill, update 7-step timelines, assign team members & generate invoices.
          </p>
        </div>
      </div>

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
            <option value="Order Received">Order Received</option>
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
          {filteredOrders.map((order) => (
            <div key={order._id || order.orderId} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="font-extrabold text-base text-white">#{order.orderId}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {order.paymentStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {order.customerName} ({order.customerEmail}) • {order.customerPhone}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedInvoiceOrder(order)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold flex items-center space-x-1.5"
                    title="Generate & Download Invoice"
                  >
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Invoice</span>
                  </button>

                  <button
                    onClick={() => navigate(`/orders/${order.orderId}`)}
                    className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/30"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Details</span>
                  </button>

                  <button
                    onClick={() => handleDeleteOrder(order.orderId)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs"
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
          ))}
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <OrderInvoiceModal order={selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} />
      )}
    </div>
  );
}
