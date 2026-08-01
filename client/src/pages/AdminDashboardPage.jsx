import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Package, Users, FileText, CheckCircle2, Clock, Settings, LogOut, ArrowRight, RefreshCw } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getAllFirestoreOrders, getAllFirestoreQuotes, updateFirestoreOrderStatus } from '../firebase/dbService';

export const AdminDashboardPage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'orders', 'quotes'
  const [loading, setLoading] = useState(true);

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

                      <div className="text-right text-xs">
                        <div className="font-extrabold text-emerald-400">Total: ₹{ord.totalAmount}</div>
                        <div className="text-[11px] text-slate-400">Paid: ₹{ord.amountPaid} • Due: ₹{ord.amountDue}</div>
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
