import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Code2, Image, Video, Smartphone, Bot, Search, Star, ShoppingBag, ArrowRight, Check, SlidersHorizontal, Zap } from 'lucide-react';
import { CartContext } from '../context/CartContext';

export const ServicesPage = () => {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedGroup = searchParams.get('group') || 'all';
  const queryFromUrl = searchParams.get('query') || '';

  const [searchQuery, setSearchQuery] = useState(queryFromUrl);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minRating, setMinRating] = useState(0);
  const [deliveryFilter, setDeliveryFilter] = useState('all');

  useEffect(() => {
    if (queryFromUrl) setSearchQuery(queryFromUrl);
  }, [queryFromUrl]);

  const allCatalogItems = [
    {
      id: 'srv_web_1',
      serviceId: 'srv_web_1',
      title: 'Full-Stack MERN & React Web Application',
      category: 'website',
      categoryName: 'Web Dev',
      price: 250,
      originalPrice: 500,
      discount: '50% OFF',
      rating: 4.9,
      reviews: 142,
      badge: 'TOP CHOICE',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      description: 'High-performance responsive website or web app with authentication and database integration.',
      deliverables: ['Responsive Web Portal', 'React/Node Source Code', 'Free 1-Month Support'],
      deliveryTime: '⚡ 24-48 Hours',
      isExpress: true,
    },
    {
      id: 'srv_poster_1',
      serviceId: 'srv_poster_1',
      title: 'Symposium & Event Poster Design',
      category: 'poster',
      categoryName: 'Poster Design',
      price: 100,
      originalPrice: 200,
      discount: '50% OFF',
      rating: 4.95,
      reviews: 210,
      badge: 'BESTSELLER',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'High-converting, HD professional poster designs for college symposiums, tech fests, and corporate branding.',
      deliverables: ['Print-ready PDF Poster', 'HD PNG/JPG Renders', 'Canva/PSD Source File'],
      deliveryTime: '⚡ 4-6 Hours',
      isExpress: true,
    },
    {
      id: 'srv_video_1',
      serviceId: 'srv_video_1',
      title: 'High-Retention Reel & Video Editing',
      category: 'video',
      categoryName: 'Video Editing',
      price: 300,
      originalPrice: 600,
      discount: '50% OFF',
      rating: 4.9,
      reviews: 185,
      badge: 'TRENDING',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      description: 'Viral short-form video reels, symposium promo edits, sound design, dynamic captions, and color grading.',
      deliverables: ['4K HD Video Export', 'Dynamic Subtitles & Motion FX', 'Royalty-Free Audio'],
      deliveryTime: '⚡ 12-24 Hours',
      isExpress: true,
    },
    {
      id: 'srv_apk_1',
      serviceId: 'srv_apk_1',
      title: 'Android APK & Mobile Application',
      category: 'app',
      categoryName: 'Mobile Apps',
      price: 300,
      originalPrice: 600,
      discount: '50% OFF',
      rating: 4.85,
      reviews: 96,
      badge: 'APK ASSURED',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Lightweight Android APK built with React Native / Flutter for academic projects, startups, and local businesses.',
      deliverables: ['Signed Android APK File', 'Complete Mobile Source Code', 'Firebase Integration'],
      deliveryTime: '⚡ 48 Hours',
      isExpress: false,
    },
    {
      id: 'srv_ai_1',
      serviceId: 'srv_ai_1',
      title: 'Custom AI Agent & Chatbot Integration',
      category: 'ai',
      categoryName: 'AI Solutions',
      price: 499,
      originalPrice: 999,
      discount: '50% OFF',
      rating: 4.98,
      reviews: 64,
      badge: 'HOT DEAL',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      description: 'Custom trained OpenAI/Gemini AI agents, automated customer support chatbots, and workflow automation.',
      deliverables: ['Custom AI Chatbot Widget', 'API Training Setup', 'Integration Code'],
      deliveryTime: '⚡ 24 Hours',
      isExpress: true,
    },
  ];

  const filteredItems = allCatalogItems.filter((item) => {
    const matchesCategory = selectedGroup === 'all' || item.category === selectedGroup;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = item.price <= maxPrice;
    const matchesRating = item.rating >= minRating;
    const matchesExpress = deliveryFilter === 'all' || (deliveryFilter === 'express' && item.isExpress);

    return matchesCategory && matchesSearch && matchesPrice && matchesRating && matchesExpress;
  });

  const handleQuickAdd = (item) => {
    addToCart({
      serviceId: item.serviceId,
      id: item.id,
      title: item.title,
      price: item.price,
      quantity: 1,
      deliverables: item.deliverables,
    });
  };

  const handleInstantBuy = (item) => {
    handleQuickAdd(item);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
              <span>Digital Service Catalog & Store</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              Explore Our <span className="text-gradient">Professional Services</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Browse products with 50% advance booking and express delivery.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Filter Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 sticky top-24">
              
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  Filters & Refine
                </h3>
                <button
                  onClick={() => {
                    setSearchParams({ group: 'all' });
                    setSearchQuery('');
                    setMaxPrice(1000);
                    setMinRating(0);
                    setDeliveryFilter('all');
                  }}
                  className="text-[11px] font-bold text-indigo-600 hover:underline"
                >
                  Clear All
                </button>
              </div>

              {/* Department */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Department</label>
                <div className="space-y-1 text-xs">
                  {[
                    { id: 'all', label: 'All Departments' },
                    { id: 'website', label: 'Websites & Portals' },
                    { id: 'poster', label: 'Poster & Graphic Design' },
                    { id: 'video', label: 'Video Reels & Edits' },
                    { id: 'app', label: 'Mobile Apps & APK' },
                    { id: 'ai', label: 'AI Agents & Chatbots' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSearchParams({ group: cat.id })}
                      className={`w-full text-left p-2 rounded-xl transition-all cursor-pointer ${
                        selectedGroup === cat.id
                          ? 'bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-200'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Price Range</span>
                  <span className="text-indigo-600">Up to ₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-9 space-y-6">
            
            <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-200">
              <span>Showing <strong>{filteredItems.length}</strong> services</span>
              <span>Sorted by: <strong>Featured & Bestselling</strong></span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center space-y-3 border border-slate-200 shadow-sm">
                <Search className="w-12 h-12 text-slate-400 mx-auto" />
                <div className="text-slate-900 text-base font-bold">No services match your search.</div>
                <button
                  onClick={() => {
                    setSearchParams({ group: 'all' });
                    setSearchQuery('');
                    setMaxPrice(1000);
                  }}
                  className="text-xs font-bold text-indigo-600 underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-indigo-400 transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors mb-1">
                        {item.title}
                      </h3>
                      <div className="text-[11px] text-indigo-600 font-bold mb-3">{item.deliveryTime}</div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 mb-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-extrabold text-indigo-600">₹{item.price}</span>
                            <span className="text-xs text-slate-400 line-through">₹{item.originalPrice}</span>
                          </div>
                          <div className="text-[10px] text-slate-600 font-semibold">
                            50% Advance: ₹{Math.round(item.price * 0.5)}
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold">
                          {item.discount}
                        </span>
                      </div>

                      <p className="text-slate-600 text-xs leading-relaxed mb-4">
                        {item.description}
                      </p>

                      <div className="space-y-1.5 mb-6">
                        {item.deliverables.map((deliv, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{deliv}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleQuickAdd(item)}
                        className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Add Cart</span>
                      </button>

                      <button
                        onClick={() => handleInstantBuy(item)}
                        className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Book Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
