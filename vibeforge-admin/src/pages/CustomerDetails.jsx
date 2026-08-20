import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { ArrowLeft, Award, ShoppingBag, DollarSign, ShieldAlert, UserX, UserCheck } from 'lucide-react';

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomerData = async () => {
    try {
      const res = await axiosClient.get(`/admin/customers/${id}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load customer profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || !data.customer) {
    return (
      <div className="p-8 text-center glass-panel rounded-3xl border border-slate-800">
        <p className="text-slate-400 text-sm">Customer profile not found.</p>
        <button onClick={() => navigate('/customers')} className="mt-4 text-indigo-400 text-xs hover:underline">
          Back to Customers
        </button>
      </div>
    );
  }

  const { customer, orders } = data;
  const totalSpent = orders.reduce((sum, o) => sum + (o.amountPaid || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between glass-panel p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/customers')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-white">{customer.name}</h1>
            <p className="text-xs text-slate-400">{customer.email} • Joined {new Date(customer.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">Total Orders</p>
            <p className="text-2xl font-extrabold text-white mt-1">{orders.length}</p>
          </div>
          <ShoppingBag className="w-8 h-8 text-indigo-400" />
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">Total Amount Spent</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">₹{totalSpent.toLocaleString()}</p>
          </div>
          <DollarSign className="w-8 h-8 text-emerald-400" />
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">Reward Points</p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">{customer.rewardPoints || 0}</p>
          </div>
          <Award className="w-8 h-8 text-amber-400" />
        </div>
      </div>

      {/* Customer Info & Points History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Contact & Address Info</h3>
          <div className="space-y-2 text-xs">
            <p><span className="text-slate-500">Phone:</span> <span className="text-slate-200">{customer.phone || 'N/A'}</span></p>
            <p><span className="text-slate-500">Account Status:</span> <span className="uppercase font-bold text-emerald-400">{customer.status || 'active'}</span></p>
            <div className="pt-2 border-t border-slate-800">
              <p className="text-slate-500 font-semibold mb-1">Address Details:</p>
              <p className="text-slate-300">
                {customer.address?.street} {customer.address?.city} {customer.address?.state} {customer.address?.zip}
              </p>
            </div>
          </div>
        </div>

        {/* Reward Points History */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Reward Points Ledger</span>
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {customer.pointsHistory?.length === 0 ? (
              <p className="text-xs text-slate-500">No points ledger activity yet.</p>
            ) : (
              customer.pointsHistory?.map((p, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex justify-between">
                  <div>
                    <p className="font-semibold text-slate-200">{p.description}</p>
                    <p className="text-[10px] text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`font-extrabold ${p.type === 'earned' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {p.type === 'earned' ? '+' : '-'}{p.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Customer Order History</h3>
        <div className="space-y-3">
          {orders.length === 0 ? (
            <p className="text-xs text-slate-500">No orders placed yet.</p>
          ) : (
            orders.map((o) => (
              <div key={o._id || o.orderId} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs flex justify-between items-center">
                <div>
                  <p className="font-bold text-white">#{o.orderId}</p>
                  <p className="text-slate-400">{new Date(o.createdAt).toLocaleDateString()} • {o.items?.length || 1} Item(s)</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-emerald-400">₹{o.totalAmount?.toLocaleString()}</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 font-bold">
                    {o.statusTimeline}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
