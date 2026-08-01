import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Check, ShieldCheck, Clock, Upload, ShoppingBag, ArrowRight, Zap, Play } from 'lucide-react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { AuthRequiredModal } from '../components/common/AuthRequiredModal';

export const ServiceDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { user, loginWithGoogle } = useContext(AuthContext);

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [priority, setPriority] = useState('standard');
  const [requirements, setRequirements] = useState('');
  const [fileName, setFileName] = useState('');
  const [addedNotice, setAddedNotice] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'cart' or 'buy'

  useEffect(() => {
    fetchServiceDetail();
  }, [slug]);

  const fetchServiceDetail = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/services/${slug}`);
      setService(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !service) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  let extraPriorityCost = 0;
  if (priority === 'fast') extraPriorityCost = 100;
  if (priority === 'express') extraPriorityCost = 200;
  const calculatedPrice = service.startingPrice + extraPriorityCost;

  const handleFileUploadMock = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const buildCartItem = () => ({
    serviceId: service._id || service.slug,
    title: service.title,
    categoryName: service.categoryName,
    price: calculatedPrice,
    basePrice: service.startingPrice,
    priority,
    requirements,
    referenceFile: fileName || 'No file attached',
    quantity: 1,
  });

  const executeAction = () => {
    if (pendingAction === 'cart') {
      addToCart(buildCartItem());
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 3000);
    } else if (pendingAction === 'buy') {
      addToCart(buildCartItem());
      navigate('/checkout');
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      setPendingAction('cart');
      setIsAuthModalOpen(true);
      return;
    }
    addToCart(buildCartItem());
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  const handleBuyNow = () => {
    if (!user) {
      setPendingAction('buy');
      setIsAuthModalOpen(true);
      return;
    }
    addToCart(buildCartItem());
    navigate('/checkout');
  };

  const handleGoogleSuccessOnAuthModal = async (googleAccountObj) => {
    await loginWithGoogle(googleAccountObj);
    executeAction();
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] py-12">
      
      {/* Auth Prompt Modal */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onGoogleSuccess={handleGoogleSuccessOnAuthModal}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Added to cart toast alert */}
        {addedNotice && (
          <div className="fixed top-24 right-6 z-50 bg-emerald-600 text-white px-6 py-3.5 rounded-2xl shadow-glow flex items-center gap-3 text-sm font-semibold animate-in fade-in slide-in-from-top-4">
            <Check className="w-5 h-5" />
            <span>Service added to your Shopping Cart!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Visual Showcase & Details */}
          <div className="lg:col-span-7 space-y-8">
            <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 p-2">
              <img
                src={service.portfolioImages[0] || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f'}
                alt={service.title}
                className="w-full h-80 sm:h-96 object-cover rounded-2xl"
              />
            </div>

            {/* Video preview if available */}
            {service.sampleVideoUrl && (
              <div className="glass-panel p-4 rounded-3xl border border-slate-800 space-y-3">
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-purple-400" />
                  Video Reel Preview Showcase
                </div>
                <video controls className="w-full rounded-2xl h-56 object-cover">
                  <source src={service.sampleVideoUrl} type="video/mp4" />
                  Your browser does not support video preview.
                </video>
              </div>
            )}

            <div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                <span className="px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 font-bold uppercase">
                  {service.categoryName}
                </span>
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {service.rating} ({service.reviewCount} Client Reviews)
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                {service.title}
              </h1>

              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                {service.description}
              </p>

              <h3 className="text-lg font-bold text-white mb-3">Included Features & Scope</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {service.features.map((feat, idx) => (
                  <div key={idx} className="glass-panel p-3.5 rounded-2xl border border-slate-800/80 flex items-center gap-3 text-xs text-slate-200">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Booking Wizard & Price Calculator */}
          <div className="lg:col-span-5">
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl sticky top-28 space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div>
                  <div className="text-xs text-slate-400">Total Calculated Cost</div>
                  <div className="text-3xl font-extrabold text-white flex items-baseline gap-1">
                    ₹{calculatedPrice}
                    <span className="text-xs text-slate-400 font-normal">+ 18% GST</span>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  50% Advance Choice Available
                </div>
              </div>

              {/* Priority & Turnaround Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Select Turnaround Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPriority('standard')}
                    className={`p-3 rounded-2xl text-center border text-xs transition-all ${
                      priority === 'standard'
                        ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>Standard</div>
                    <div className="text-[10px] text-slate-400 font-normal">3 Days</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriority('fast')}
                    className={`p-3 rounded-2xl text-center border text-xs transition-all ${
                      priority === 'fast'
                        ? 'bg-purple-600/30 border-purple-500 text-white font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>Fast (+₹100)</div>
                    <div className="text-[10px] text-slate-400 font-normal">24-48 Hours</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriority('express')}
                    className={`p-3 rounded-2xl text-center border text-xs transition-all ${
                      priority === 'express'
                        ? 'bg-cyan-600/30 border-cyan-500 text-white font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>Express (+₹200)</div>
                    <div className="text-[10px] text-slate-400 font-normal">12 Hours</div>
                  </button>
                </div>
              </div>

              {/* Requirements text input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Project Requirements / Color Preferences
                </label>
                <textarea
                  rows={3}
                  placeholder="Specify titles, color theme, reference links, text details..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Reference File Upload Mock */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Attach Reference File / Image (Optional)
                </label>
                <label className="flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 border-dashed border-slate-800 hover:border-indigo-500/60 cursor-pointer bg-slate-900/50 text-slate-400 hover:text-white text-xs transition-colors">
                  <Upload className="w-4 h-4 text-indigo-400" />
                  <span>{fileName ? fileName : 'Click to Upload Mockup/Doc (PDF, PNG, ZIP)'}</span>
                  <input type="file" onChange={handleFileUploadMock} className="hidden" />
                </label>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-indigo-400" />
                  Add To Cart
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-bold text-sm shadow-glow hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Buy Now & Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Guarantee */}
              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Satisfaction
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" /> On-Time Guarantee
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
