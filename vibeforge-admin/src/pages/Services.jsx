import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Plus, Trash2, Edit, Briefcase, Tag, Clock, Image as ImageIcon } from 'lucide-react';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('3-5 Days');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const fetchServices = async () => {
    try {
      const res = await axiosClient.get('/services');
      setServices(res.data);
    } catch (err) {
      console.error('Failed to load services', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/services', {
        title,
        category,
        price: Number(price),
        offerPrice: offerPrice ? Number(offerPrice) : null,
        deliveryTime,
        description,
        features: features.split('\n').filter(Boolean),
        image: imageUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500'
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
      setPrice('');
      fetchServices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create service');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete service from catalog?')) return;
    try {
      await axiosClient.delete(`/services/${id}`);
      fetchServices();
    } catch (err) {
      alert('Failed to delete service');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Services Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage agency service offerings, pricing tiers, offer discounts, delivery times & features.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div key={s._id} className="glass-card rounded-3xl border border-slate-800/80 overflow-hidden flex flex-col justify-between">
              <div>
                <img src={s.image || s.icon} alt={s.title} className="w-full h-44 object-cover" />
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300">
                        {s.category || 'Service'}
                      </span>
                      <h3 className="font-extrabold text-base text-white mt-1">{s.title}</h3>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-emerald-400 text-base">₹{s.price?.toLocaleString()}</p>
                      {s.offerPrice && <p className="text-[10px] text-slate-400 line-through">₹{s.offerPrice}</p>}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">{s.description}</p>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-800/60 mt-2">
                <span className="text-xs text-slate-400 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                  {s.deliveryTime || '3-5 Days'}
                </span>
                <button
                  onClick={() => handleDelete(s._id)}
                  className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Service Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D1322] border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4">
            <h3 className="font-extrabold text-lg text-white">Create Agency Service</h3>
            <form onSubmit={handleCreateService} className="space-y-3 text-xs">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Service Title"
                className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Price (₹)"
                  className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
                <input
                  type="text"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  placeholder="Delivery Time"
                  className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Image Banner URL"
                className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed Service Description"
                className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white h-20"
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
