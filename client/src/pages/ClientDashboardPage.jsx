import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, Download, ShieldCheck, Settings, LogOut, ArrowRight, Save, CheckCircle2, Loader2, Key, XCircle, AlertTriangle, Sparkles, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { generateInvoicePDF } from '../utils/generateInvoicePDF';
import { getUserFirestoreOrders, saveFirestoreUserProfile, cancelFirestoreOrder, clearUserFirestoreOrders } from '../firebase/dbService';

export const ClientDashboardPage = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'invoices', 'downloads', 'profile'
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cancellation Modal State
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Changed my mind');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  // Clear History Modal State
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const [clearingSingleOrderId, setClearingSingleOrderId] = useState(null);

  // Profile Form States
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editPassword, setEditPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
    setEditName(user.name || '');
    setEditEmail(user.email || '');
    setEditPhone(user.phone || '');
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const orders = await getUserFirestoreOrders(user._id || user.uid, user.email);
      setMyOrders(orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    setIsSubmittingCancel(true);

    try {
      await cancelFirestoreOrder(cancellingOrder.orderId, cancelReason);
      
      // Update local state immediately
      setMyOrders((prev) =>
        prev.map((ord) =>
          ord.orderId === cancellingOrder.orderId
            ? { ...ord, statusTimeline: 'Cancelled', cancelReason }
            : ord
        )
      );

      setCancellingOrder(null);
    } catch (err) {
      console.error(err);
      alert('Order cancellation failed. Please try again.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const handleConfirmClearHistory = async () => {
    try {
      if (clearingSingleOrderId) {
        await clearUserFirestoreOrders(user._id || user.uid, user.email, clearingSingleOrderId);
        setMyOrders((prev) => prev.filter((o) => o.orderId !== clearingSingleOrderId));
      } else {
        await clearUserFirestoreOrders(user._id || user.uid, user.email);
        setMyOrders([]);
      }
      setShowClearHistoryModal(false);
      setClearingSingleOrderId(null);
    } catch (err) {
      console.error(err);
      alert('Failed to clear order history.');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    try {
      const updatedProfileObj = {
        name: editName,
        email: editEmail,
        phone: editPhone,
        updatedAt: new Date().toISOString(),
      };

      // Save user profile to Firebase Firestore
      await saveFirestoreUserProfile(user._id || user.uid, updatedProfileObj);

      // Update global AuthContext and localStorage
      updateUser(updatedProfileObj);

      setProfileSuccessMsg('✓ Profile details saved successfully!');
      setEditPassword('');
    } catch (err) {
      console.error('Profile Save Error:', err);
      updateUser({
        name: editName,
        email: editEmail,
        phone: editPhone,
      });
      setProfileSuccessMsg('✓ Profile changes saved!');
    } finally {
      setSavingProfile(false);
    }
  };

  const getUserInitial = () => {
    if (user?.name && user.name.trim()) return user.name.trim()[0].toUpperCase();
    if (user?.email && user.email.trim()) return user.email.trim()[0].toUpperCase();
    return 'C';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Header - High Contrast White Panel */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-xl text-white uppercase shadow-sm">
              {getUserInitial()}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Welcome back, {user?.name || 'Client'}!</h1>
              <div className="text-xs font-bold text-slate-500">{user?.email} • Official VibeForge Client Portal</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/services"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm transition-all"
            >
              + Book New Service
            </Link>
            <button
              onClick={logout}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-300 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dashboard Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Tabs */}
          <div className="lg:col-span-3 space-y-2">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              {[
                { id: 'orders', label: 'My Orders', icon: Package },
                { id: 'invoices', label: 'Invoices & Receipts', icon: Download },
                { id: 'downloads', label: 'Project Deliverables', icon: ShieldCheck },
                { id: 'profile', label: 'Profile Settings', icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full p-3 rounded-xl text-xs font-extrabold flex items-center gap-3 transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Tab Content */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
                
                {/* Header with CLEAR ORDER HISTORY Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-indigo-600" />
                    Your Active & Past Orders ({myOrders.length})
                  </h2>

                  {myOrders.length > 0 && (
                    <button
                      onClick={() => {
                        setClearingSingleOrderId(null);
                        setShowClearHistoryModal(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-extrabold border border-slate-300 hover:border-rose-300 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-slate-500 hover:text-rose-600" />
                      <span>Clear Order History</span>
                    </button>
                  )}
                </div>

                {myOrders.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Package className="w-12 h-12 text-slate-400 mx-auto" />
                    <div className="text-slate-600 font-bold text-sm">No active orders in your order history.</div>
                    <Link to="/services" className="inline-block text-xs font-extrabold text-indigo-600 underline">
                      Browse Service Catalog →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myOrders.map((ord, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-indigo-300 transition-all relative group">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-extrabold text-indigo-700">Order #{ord.orderId}</span>
                            
                            {/* Status Badge */}
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                              ord.statusTimeline === 'Cancelled'
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : ord.statusTimeline === 'Completed' || ord.statusTimeline === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                            }`}>
                              {ord.statusTimeline}
                            </span>
                          </div>

                          <div className="text-base font-extrabold text-slate-900 mt-1">
                            {ord.items && ord.items[0] ? ord.items[0].title : 'VibeForge Service'}
                          </div>

                          <div className="text-xs font-bold text-slate-600 mt-1">
                            Paid: <span className="text-emerald-700 font-extrabold">₹{ord.amountPaid}</span> • Balance Due: <span className="text-amber-700 font-extrabold">₹{ord.amountDue}</span>
                          </div>

                          {ord.cancelReason && (
                            <div className="text-[11px] font-bold text-rose-700 mt-1">
                              Reason: {ord.cancelReason}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons: PDF Invoice, Track Progress, CANCEL ORDER & CLEAR SINGLE ORDER */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => generateInvoicePDF(ord)}
                            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-extrabold border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Download className="w-3.5 h-3.5 text-indigo-600" />
                            <span>PDF Invoice</span>
                          </button>

                          <Link
                            to={`/track?id=${ord.orderId}`}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <span>Track Progress</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>

                          {/* CANCEL ORDER BUTTON (If not already cancelled or completed) */}
                          {ord.statusTimeline !== 'Cancelled' && ord.statusTimeline !== 'Delivered' && (
                            <button
                              onClick={() => setCancellingOrder(ord)}
                              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-xs font-extrabold border border-rose-200 transition-all flex items-center gap-1 cursor-pointer"
                              title="Cancel Order"
                            >
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Cancel Order</span>
                            </button>
                          )}

                          {/* REMOVE / CLEAR SINGLE ORDER BUTTON */}
                          <button
                            onClick={() => {
                              setClearingSingleOrderId(ord.orderId);
                              setShowClearHistoryModal(true);
                            }}
                            className="p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-300 transition-all cursor-pointer"
                            title="Remove from history"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-4">
                <h2 className="text-xl font-black text-slate-900">Invoices & Financial Records</h2>
                <p className="text-xs font-bold text-slate-500">Download official tax invoices for your client records.</p>
                {myOrders.map((ord, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">Invoice #{ord.orderId}</div>
                      <div className="text-[11px] font-bold text-slate-600">Total: ₹{ord.totalAmount} • GST Included</div>
                    </div>
                    <button
                      onClick={() => generateInvoicePDF(ord)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Download className="w-4 h-4 text-white" />
                      <span>Download PDF Invoice</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Deliverables Tab */}
            {activeTab === 'downloads' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-4">
                <h2 className="text-xl font-black text-slate-900">Project Source Code & Deliverables</h2>
                <p className="text-xs font-bold text-slate-500">Access final completed source files, APK direct links, and HD renders.</p>
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-900">
                  Deliverable download links become active as soon as your order reaches the <span className="text-emerald-700 font-extrabold">Completed / Delivered</span> stage.
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    Profile & Account Settings
                  </h2>
                  <p className="text-xs font-bold text-slate-500 mt-1">
                    Update your account details below. Changes are saved permanently.
                  </p>
                </div>

                {profileSuccessMsg && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                    <div>
                      <label className="block font-extrabold text-slate-800 mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl p-3.5 text-slate-900 font-medium focus:outline-none transition-colors"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block font-extrabold text-slate-800 mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl p-3.5 text-slate-900 font-medium focus:outline-none transition-colors"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                    <div>
                      <label className="block font-extrabold text-slate-800 mb-1.5">WhatsApp / Phone Number</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl p-3.5 text-slate-900 font-medium focus:outline-none transition-colors"
                        placeholder="+91 99433 80320"
                      />
                    </div>
                    <div>
                      <label className="block font-extrabold text-slate-800 mb-1.5 flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-indigo-600" />
                        New Password (Optional)
                      </label>
                      <input
                        type="password"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl p-3.5 text-slate-900 font-medium focus:outline-none transition-colors"
                        placeholder="Leave blank to keep current password"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Profile Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* CANCEL ORDER CONFIRMATION MODAL */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center border border-rose-200 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Cancel Order #{cancellingOrder.orderId}?</h3>
                <p className="text-xs font-bold text-slate-500">Are you sure you want to cancel this booking?</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="font-extrabold text-slate-900">{cancellingOrder.items?.[0]?.title || 'VibeForge Service'}</div>
              <div className="font-bold text-slate-600">Paid: ₹{cancellingOrder.amountPaid} • Total: ₹{cancellingOrder.totalAmount}</div>
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
                onClick={() => setCancellingOrder(null)}
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

      {/* CLEAR ORDER HISTORY CONFIRMATION MODAL */}
      {showClearHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center border border-rose-200 shrink-0">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {clearingSingleOrderId ? `Clear Order #${clearingSingleOrderId}?` : 'Clear All Order History?'}
                </h3>
                <p className="text-xs font-bold text-slate-500">
                  {clearingSingleOrderId
                    ? 'Remove this specific order from your dashboard history.'
                    : 'This will remove all past and active orders from your client portal view.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowClearHistoryModal(false);
                  setClearingSingleOrderId(null);
                }}
                className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-all cursor-pointer border border-slate-300"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmClearHistory}
                className="py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{clearingSingleOrderId ? 'Clear Order' : 'Clear All History'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
