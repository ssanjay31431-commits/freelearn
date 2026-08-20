import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Plus, Tag, Trash2, Calendar, Users, Percent } from 'lucide-react';

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discountValue, setDiscountValue] = useState('');
  const [targetCustomers, setTargetCustomers] = useState('everyone');
  const [expiryDate, setExpiryDate] = useState('');

  const fetchOffers = async () => {
    try {
      const res = await axiosClient.get('/admin/offers');
      setOffers(res.data);
    } catch (err) {
      console.error('Failed to load offers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/admin/offers', {
        title,
        couponCode,
        discountValue: Number(discountValue),
        targetCustomers,
        expiryDate
      });
      setShowModal(false);
      setTitle('');
      setCouponCode('');
      setDiscountValue('');
      fetchOffers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create offer');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete coupon offer?')) return;
    try {
      await axiosClient.delete(`/admin/offers/${id}`);
      fetchOffers();
    } catch (err) {
      alert('Failed to delete offer');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Offers & Coupons Scheduler</h1>
          <p className="text-xs text-slate-400 mt-1">
            Create promotional coupon codes, set target tier segments & schedule expiration dates.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Offer Coupon</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div key={offer._id} className="glass-card p-6 rounded-3xl border border-slate-800/80 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-violet-500/20 text-violet-300">
                    {offer.targetCustomers}
                  </span>
                  <h3 className="font-extrabold text-base text-white mt-1">{offer.title}</h3>
                </div>
                <button onClick={() => handleDelete(offer._id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Coupon Code</p>
                  <p className="font-mono font-extrabold text-indigo-400 text-sm tracking-wider">{offer.couponCode}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-emerald-400">{offer.discountValue}% OFF</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  Expires: {new Date(offer.expiryDate).toLocaleDateString()}
                </span>
                <span className="font-semibold text-slate-300">Used: {offer.usageCount || 0} times</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D1322] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-extrabold text-lg text-white">Create Promotional Offer</h3>
            <form onSubmit={handleCreateOffer} className="space-y-3 text-xs">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Offer Title (e.g. Festival Special 20% OFF)"
                className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
              <input
                type="text"
                required
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="COUPON CODE (e.g. FESTIVAL20)"
                className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono uppercase"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  required
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="Discount %"
                  className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
                <select
                  value={targetCustomers}
                  onChange={(e) => setTargetCustomers(e.target.value)}
                  className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white"
                >
                  <option value="everyone">Everyone</option>
                  <option value="selected">Selected</option>
                  <option value="returning">Returning</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
