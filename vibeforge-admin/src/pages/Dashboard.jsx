import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  UserPlus,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Trash2,
  Lock,
  Mail,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Clear All Data 2-Step OTP Modal States
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeStep, setPurgeStep] = useState(1); // 1: Password, 2: OTP
  const [adminPassword, setAdminPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [purgeLoading, setPurgeLoading] = useState(false);
  const [purgeError, setPurgeError] = useState('');
  const [purgeSuccess, setPurgeSuccess] = useState('');

  const fetchStats = async () => {
    try {
      const res = await axiosClient.get('/admin/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!adminPassword) {
      setPurgeError('Please enter your Admin Password.');
      return;
    }
    setPurgeLoading(true);
    setPurgeError('');
    try {
      const res = await axiosClient.post('/admin/request-clear-otp', { password: adminPassword });
      if (res.data.success) {
        setPurgeStep(2);
        setPurgeError('');
      }
    } catch (err) {
      setPurgeError(err.response?.data?.message || 'Invalid Password or Server Error');
    } finally {
      setPurgeLoading(false);
    }
  };

  const handleConfirmPurge = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      setPurgeError('Please enter the 6-Digit OTP code sent to tsomu7036@gmail.com.');
      return;
    }
    setPurgeLoading(true);
    setPurgeError('');
    try {
      const res = await axiosClient.post('/admin/clear-all-data', { otp: otpCode });
      if (res.data.success) {
        setPurgeSuccess('All database orders and telemetry have been successfully cleared!');
        await fetchStats();
        setTimeout(() => {
          setShowPurgeModal(false);
          setPurgeStep(1);
          setAdminPassword('');
          setOtpCode('');
          setPurgeSuccess('');
        }, 1800);
      }
    } catch (err) {
      setPurgeError(err.response?.data?.message || 'Invalid OTP code.');
    } finally {
      setPurgeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { title: "Today's Revenue", value: `₹${stats?.revenueToday?.toLocaleString() || 0}`, icon: DollarSign, color: 'from-emerald-500 to-teal-600' },
    { title: 'Revenue This Month', value: `₹${stats?.revenueThisMonth?.toLocaleString() || 0}`, icon: TrendingUp, color: 'from-indigo-500 to-violet-600' },
    { title: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`, icon: CreditCard, color: 'from-violet-500 to-purple-600' },
    { title: "Today's Orders", value: stats?.todayOrdersCount || 0, icon: ShoppingBag, color: 'from-blue-500 to-cyan-600' },
    { title: 'Pending Orders', value: stats?.pendingOrdersCount || 0, icon: Clock, color: 'from-amber-500 to-orange-600' },
    { title: 'Completed Orders', value: stats?.completedOrdersCount || 0, icon: CheckCircle, color: 'from-emerald-600 to-green-600' },
    { title: 'Cancelled Orders', value: stats?.cancelledOrdersCount || 0, icon: XCircle, color: 'from-rose-500 to-red-600' },
    { title: 'New Customers', value: stats?.newCustomersCount || 0, icon: UserPlus, color: 'from-fuchsia-500 to-pink-600' },
    { title: 'Returning Customers', value: stats?.returningCustomersCount || 0, icon: Users, color: 'from-sky-500 to-indigo-600' },
    { title: 'Pending Payments', value: `₹${stats?.pendingPayments?.toLocaleString() || 0}`, icon: DollarSign, color: 'from-orange-500 to-amber-600' },
    { title: 'Avg Order Value', value: `₹${stats?.avgOrderValue?.toLocaleString() || 0}`, icon: Sparkles, color: 'from-cyan-500 to-blue-600' }
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time telemetry, revenue metrics, and order fulfillment status.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setShowPurgeModal(true);
              setPurgeStep(1);
              setPurgeError('');
              setPurgeSuccess('');
            }}
            className="px-4 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5 cursor-pointer border border-rose-500/30"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Data</span>
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            Manage Orders
          </button>
        </div>
      </div>

      {/* 11 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-indigo-500/40 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">{card.title}</span>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-extrabold text-white">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">Monthly Revenue Breakdown</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.revenueChart || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Status Bar Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">Order Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.ordersChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders & Popular Services Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Recent Orders</h3>
            <button onClick={() => navigate('/orders')} className="text-xs text-indigo-400 hover:underline flex items-center">
              View All <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
          <div className="space-y-3">
            {stats?.recentOrders?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No recent orders recorded.</p>
            ) : (
              stats?.recentOrders?.map((order) => (
                <div key={order._id || order.orderId} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">#{order.orderId}</p>
                    <p className="text-slate-400">{order.customerName} • {order.customerEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-emerald-400">₹{order.totalAmount?.toLocaleString()}</p>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-semibold text-[10px]">
                      {order.statusTimeline}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Popular Services */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Popular Agency Services</h3>
            <button onClick={() => navigate('/services')} className="text-xs text-indigo-400 hover:underline flex items-center">
              Catalog <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
          <div className="space-y-3">
            {stats?.popularServices?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No services recorded.</p>
            ) : (
              stats?.popularServices?.map((service, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">{service.title}</p>
                    <p className="text-slate-400">{service.category || 'Digital Service'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-400">₹{service.price?.toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SECURE 2-STEP PURGE DATABASE OTP MODAL */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowPurgeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold border border-rose-500/40 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Clear All Database Data</h3>
                <p className="text-xs text-rose-400 font-semibold">2-Step Security Verification Required</p>
              </div>
            </div>

            {purgeSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center space-y-2 py-6">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 animate-bounce" />
                <p className="text-sm font-extrabold">{purgeSuccess}</p>
              </div>
            ) : purgeStep === 1 ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Enter your <strong className="text-white">Admin Password</strong> to verify ownership and send a 6-Digit OTP security code to <span className="text-cyan-400 font-bold">tsomu7036@gmail.com</span>.
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                    <span>Super Admin Password</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter Admin Password (e.g. Kavi@2005)..."
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  />
                </div>

                {purgeError && <div className="text-xs text-rose-400 font-bold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{purgeError}</div>}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPurgeModal(false)}
                    className="w-1/2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={purgeLoading}
                    className="w-1/2 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {purgeLoading ? 'Verifying...' : 'Verify & Send OTP'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleConfirmPurge} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0 text-cyan-400" />
                  <span>A 6-digit security OTP code has been sent directly to <strong>tsomu7036@gmail.com</strong>.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    <span>6-Digit Verification OTP</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-Digit OTP Code..."
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center tracking-widest text-lg font-black text-cyan-400 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {purgeError && <div className="text-xs text-rose-400 font-bold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{purgeError}</div>}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPurgeStep(1)}
                    className="w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={purgeLoading}
                    className="w-2/3 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {purgeLoading ? 'Purging Database...' : 'Confirm Purge Data ⚠️'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
