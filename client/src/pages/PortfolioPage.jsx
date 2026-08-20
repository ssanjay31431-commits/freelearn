import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Star, ShoppingBag, ArrowRight, Check, Eye, X, Filter, Sparkles, Palette, Layers, Code2, Play, Pause } from 'lucide-react';
import { CartContext } from '../context/CartContext';

export const PortfolioPage = () => {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [colorFilter, setColorFilter] = useState('all');
  const [selectedPreviewItem, setSelectedPreviewItem] = useState(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  // 5 USER-PROVIDED REAL WEBSITE SHOWCASE SAMPLES
  // NOTE: poster image files have been moved to backup. Use placeholder until new images are uploaded.
  const COLOR_VARIANTS_DATABASE = {
    Websites: [
      { id: 'w1', name: '01 VibeForge Digital Agency Website', bgTag: 'bg-indigo-50 text-indigo-700 border-indigo-200', accent: '#4F46E5', image: '/web_sample_1.png', desc: 'VibeForge dark digital sample' },
      { id: 'w2', name: '02 ShopEase E-Commerce Website', bgTag: 'bg-purple-50 text-purple-900 border-purple-200', accent: '#8B5CF6', image: '/web_sample_2.png', desc: 'ShopEase modern e-commerce sample' },
      { id: 'w3', name: '03 Flavoria Gourmet Restaurant Website', bgTag: 'bg-amber-50 text-amber-900 border-amber-200', accent: '#F59E0B', image: '/web_sample_3.png', desc: 'Flavoria restaurant sample' },
      { id: 'w4', name: '04 Arun Kumar Developer Portfolio Website', bgTag: 'bg-indigo-50 text-indigo-900 border-indigo-200', accent: '#6366F1', image: '/web_sample_4.png', desc: 'Developer portfolio sample' },
      { id: 'w5', name: '05 BizPro Corporate Business Website', bgTag: 'bg-blue-50 text-blue-900 border-blue-200', accent: '#2563EB', image: '/web_sample_5.png', desc: 'BizPro corporate sample' },
    ],
    // 5 Real Poster & Infographic Showcase Samples
    Posters: [
      { id: 'p1', name: '01 Software Development Service Poster', bgTag: 'bg-blue-50 text-blue-700 border-blue-200', accent: '#2563EB', image: '/poster_sample_1.png', desc: 'Modern dark tech service poster with hexagon photo frames, IT consulting, and custom software development bullet points.' },
      { id: 'p2', name: '02 Software Project Summary One-Pager', bgTag: 'bg-sky-50 text-sky-700 border-sky-200', accent: '#0EA5E9', image: '/poster_sample_2.png', desc: 'Corporate infographic poster with detailed project workflow Gantt chart, budget allocation, team headshots, and documentation flowchart.' },
      { id: 'p3', name: '03 VibeForge Digital Agency Flyer', bgTag: 'bg-indigo-50 text-indigo-700 border-indigo-200', accent: '#6366F1', image: '/poster_sample_3.png', desc: 'High-impact 3D agency flyer showcasing 8 digital services, floating laptop and mobile mockup, and scan-to-connect QR code.' },
      { id: 'p4', name: '04 Academic & Scientific Research Poster', bgTag: 'bg-teal-50 text-teal-700 border-teal-200', accent: '#0D9488', image: '/poster_sample_4.png', desc: 'Professional academic research poster template with multi-column layout, pie chart, graphs, tables, and conclusion references.' },
      { id: 'p5', name: '05 Global Tech Summit Luxury Event Poster', bgTag: 'bg-amber-50 text-amber-700 border-amber-200', accent: '#D97706', image: '/poster_sample_5.png', desc: 'Luxury gold and navy tech conference poster with keynote speaker cards, 2-day event schedule timeline, and sponsor logo section.' },
    ],
    Videos: [
      { id: 'v1', name: 'Cyberpunk Robotic Animation Reel', bgTag: 'bg-pink-50 text-pink-900 border-pink-200', accent: '#EC4899', isVideo: true, videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-robotic-face-41489-large.mp4', desc: 'Futuristic robotic neon animation edit' },
      { id: 'v2', name: 'Mobile App Demo Reel Edit', bgTag: 'bg-cyan-50 text-cyan-900 border-cyan-200', accent: '#06B6D4', isVideo: true, videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hand-holding-a-smartphone-with-green-screen-42704-large.mp4', desc: 'Sleek smartphone demo reel' },
      { id: 'v3', name: 'Video Editing Suite Workflow Reel', bgTag: 'bg-slate-100 text-slate-900 border-slate-300', accent: '#1E293B', isVideo: true, videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-42866-large.mp4', desc: 'Fast-paced productivity and tech workflow reel' },
      { id: 'v4', name: 'Cyberpunk Coding & Neon Reel', bgTag: 'bg-amber-50 text-amber-900 border-amber-200', accent: '#F59E0B', isVideo: true, videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-computer-code-running-on-screen-42867-large.mp4', desc: 'Neon cyber terminal code reel' },
      { id: 'v5', name: 'DJ Night & Festival Promo Reel', bgTag: 'bg-emerald-50 text-emerald-900 border-emerald-200', accent: '#10B981', isVideo: true, videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-crowd-at-a-music-concert-with-stage-lights-42868-large.mp4', desc: 'Energetic festival and club promo reel' },
    ],
    APK: [
      { id: 'a1', name: '01 Developer Portfolio Mobile App', bgTag: 'bg-indigo-50 text-indigo-700 border-indigo-200', accent: '#4F46E5', image: '/apk_sample_1.png', desc: 'VibeForge developer port sample' },
      { id: 'a2', name: '03 Food Delivery Mobile App', bgTag: 'bg-slate-100 text-slate-900 border-slate-300', accent: '#0F172A', image: '/apk_sample_2.png', desc: 'Food delivery app sample' },
      { id: 'a3', name: '06 Workout & Fitness Tracker App', bgTag: 'bg-emerald-50 text-emerald-900 border-emerald-200', accent: '#10B981', image: '/apk_sample_3.png', desc: 'Fitness tracker sample' },
      { id: 'a4', name: '07 VibeForge Learn Education App', bgTag: 'bg-purple-50 text-purple-900 border-purple-200', accent: '#8B5CF6', image: '/apk_sample_4.png', desc: 'Education app sample' },
      { id: 'a5', name: '10 Notes & Task Management App', bgTag: 'bg-cyan-50 text-cyan-900 border-cyan-200', accent: '#06B6D4', image: '/apk_sample_5.png', desc: 'Notes app sample' },
    ],
  };

  const portfolioItems = [
    {
      id: 'port_1',
      serviceId: 'srv_web_1',
      title: 'VibeForge Custom Web Development & Apps',
      category: 'Websites',
      colorTheme: 'Agency, E-Commerce & Portfolios',
      colorBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      price: 250,
      image: '/web_sample_1.png',
      description: 'High-converting custom web applications, e-commerce stores, developer portfolios, and corporate business sites built in React & MERN stack.',
      tech: ['React', 'Node.js', 'MongoDB', 'Tailwind'],
      clientReview: 'Outstanding web design! Order throughput increased by 40% for our agency.',
      rating: 4.98,
    },
    {
      id: 'port_2',
      serviceId: 'srv_poster_1',
      title: 'VibeForge Professional Posters, Flyers & Infographics',
      category: 'Posters',
      colorTheme: '5 Professional Poster Samples',
      colorBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      price: 100,
      image: '/poster_sample_1.png',
      description: 'Print-ready corporate one-pagers, tech service flyers, scientific research posters, and luxury summit banners crafted in high resolution.',
      tech: ['Photoshop', 'Illustrator', 'Figma', 'InDesign'],
      clientReview: 'Printed perfectly for our final project expo and received top marks!',
      rating: 4.98,
    },
    {
      id: 'port_3',
      serviceId: 'srv_video_1',
      title: 'TechTalk Podcast & Playable Reel Series',
      category: 'Videos',
      colorTheme: 'Playable Video Reels',
      colorBadge: 'bg-rose-50 text-rose-700 border-rose-200',
      price: 300,
      isVideo: true,
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-robotic-face-41489-large.mp4',
      image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
      description: 'Playable Instagram Reels with dynamic captions, sound FX, and color grading.',
      tech: ['Premiere Pro', 'After Effects'],
      clientReview: 'Gained over 250k views on Instagram Reels within 5 days!',
      rating: 4.92,
    },
    {
      id: 'port_4',
      serviceId: 'srv_apk_1',
      title: 'VibeForge Android & iOS APK Applications',
      category: 'APK',
      colorTheme: 'Flutter Dark & White UI',
      colorBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      price: 300,
      image: '/apk_sample_1.png',
      description: 'Native Flutter & React Native mobile applications with custom UI screens, SQLite offline sync, and Firebase authentication.',
      tech: ['Flutter', 'React Native', 'Firebase', 'SQLite'],
      clientReview: 'Source code was super clean and app UI looks 100% professional!',
      rating: 4.95,
    },
  ];

  const categories = ['all', 'Websites', 'Posters', 'Videos', 'APK'];

  const filteredItems = portfolioItems.filter((item) => {
    return filter === 'all' || item.category === filter;
  });

  const handleAddToCart = (item, colorVariantName = null) => {
    const variantTitle = colorVariantName ? `${item.title} (${colorVariantName})` : item.title;
    addToCart({
      serviceId: item.serviceId,
      id: item.id + '_' + Date.now(),
      title: variantTitle,
      price: item.price,
      quantity: 1,
      deliverables: ['Custom design matching ' + variantTitle, 'Source code & design files', 'Fast delivery'],
    });
  };

  const handleInstantBook = (item, colorVariantName = null) => {
    handleAddToCart(item, colorVariantName);
    navigate('/checkout');
  };

  const openPreviewModal = (item) => {
    setSelectedPreviewItem(item);
    setSelectedVariantIndex(0);
  };

  const activeVariants = selectedPreviewItem ? COLOR_VARIANTS_DATABASE[selectedPreviewItem.category] || [] : [];
  const currentVariant = activeVariants[selectedVariantIndex] || activeVariants[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-extrabold uppercase">
            <Code2 className="w-4 h-4 text-indigo-600" />
            <span>Official VibeForge Real Website & Mobile Showcase</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Real Websites, Mobile Apps & <span className="text-gradient">5 Unique Samples</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Click <strong>Preview 5 Samples</strong> to browse authentic website screenshots, mobile app UIs, poster samples, and playable videos.
          </p>
        </div>

        {/* Category Filter Bar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Department Filter:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filter === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-indigo-400 transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-xl [...]"
            >
              <div>
                {/* Image or Video Banner */}
                <div className="relative h-72 overflow-hidden cursor-pointer bg-slate-900 flex items-center justify-center" onClick={() => openPreviewModal(item)}>
                  {item.isVideo ? (
                    <div className="relative w-full h-full">
                      <video
                        src={item.videoUrl}
                        controls
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-extrabold shadow-md flex items-center gap-1">
                        <Play className="w-3 h-3 fill-current" /> Playable Video
                      </span>
                    </div>
                  ) : (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  
                  {!item.isVideo && (
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-extrabold text-xs flex items-center gap-2 shadow-2xl border border-indigo-200">
                        <Eye className="w-4 h-4 text-indigo-600 animate-pulse" />
                        Preview 5 Real Website & Mobile Samples
                      </span>
                    </div>
                  )}

                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-900 text-xs font-extrabold shadow-md border border-slate-200">
                    {item.category}
                  </span>

                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-extrabold shadow-md">
                    Starting ₹{item.price}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase ${item.colorBadge}`}>
                      🎨 {item.colorTheme}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-extrabold text-slate-900">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{item.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 mb-2 leading-snug group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-slate-600 text-xs leading-relaxed mb-4">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {item.tech.map((t, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 italic">
                    "{item.clientReview}"
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 space-y-2">
                <button
                  onClick={() => openPreviewModal(item)}
                  className="w-full py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs border border-indigo-200 transition-all flex items-center justify-cente[...]"
                >
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Preview 5 Real {item.category} Samples</span>
                </button>

                <div className="grid grid-cols-2 gap-2.5 border-t border-slate-100 pt-3">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cur[...]"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Add Cart</span>
                  </button>

                  <button
                    onClick={() => handleInstantBook(item)}
                    className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Book Order</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* 5 Multi-Color Sample Gallery Preview Modal */}
      {selectedPreviewItem && currentVariant && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-extrabold uppercase">
                    5 REAL {selectedPreviewItem.category.toUpperCase()} SAMPLES
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Sample {selectedVariantIndex + 1} of {activeVariants.length}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                  {selectedPreviewItem.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedPreviewItem(null)}
                className="p-2 rounded-2xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 5 Variant Tabs Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-extrabold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-indigo-600" />
                  Select Sample Variant (5 Real Available):
                </span>
                <span className="text-indigo-600 font-extrabold">{currentVariant.name}</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {activeVariants.map((varItem, idx) => (
                  <button
                    key={varItem.id}
                    onClick={() => setSelectedVariantIndex(idx)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                      selectedVariantIndex === idx
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>#{idx + 1} {varItem.name.split('(')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Sample Display (Video Player or Image) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-slate-50 p-6 rounded-3xl border border-slate-200">
              <div className="lg:col-span-7 h-72 sm:h-96 rounded-2xl overflow-hidden border border-slate-300 shadow-md relative bg-slate-900 flex items-center justify-center">
                {currentVariant.isVideo ? (
                  <video
                    key={currentVariant.videoUrl}
                    src={currentVariant.videoUrl}
                    poster={currentVariant.posterImg}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={currentVariant.image}
                    alt={currentVariant.name}
                    className="w-full h-full object-contain"
                  />
                )}
                <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-extrabold border shadow-md ${currentVariant.bgTag}`}>
                  {currentVariant.name}
                </span>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">SELECTED SAMPLE VARIANT</div>
                  <h4 className="text-lg font-extrabold text-slate-900">{currentVariant.name}</h4>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {currentVariant.desc}
                </p>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1">
                  <div className="text-[11px] font-bold text-slate-500">PACKAGE PRICE</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-indigo-600">₹{selectedPreviewItem.price}</span>
                    <span className="text-xs text-emerald-600 font-bold">50% Advance Booking Available</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      handleInstantBook(selectedPreviewItem, currentVariant.name);
                      setSelectedPreviewItem(null);
                    }}
                    className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all cursor[...]"
                  >
                    <span>Book Order In {currentVariant.name.split('(')[0]}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      handleAddToCart(selectedPreviewItem, currentVariant.name);
                      setSelectedPreviewItem(null);
                    }}
                    className="w-full py-3 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-indigo-600" />
                    <span>Add {currentVariant.name.split('(')[0]} to Cart</span>
                  </button>

                  {selectedPreviewItem.category === 'Videos' && (
                    <a
                      href="https://drive.google.com/drive/folders/1SVCK5E4qQdlgAuWZPy5QrZDbjyQ1KO1W?usp=sharing"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4 text-purple-600" />
                      <span>Open Rishi Nathan's Google Drive Video Portfolio</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom 5 Thumbnails */}
            <div>
              <div className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3">
                All 5 Real Sample Previews in {selectedPreviewItem.category}:
              </div>
              <div className="grid grid-cols-5 gap-3">
                {activeVariants.map((varItem, idx) => (
                  <button
                    key={varItem.id}
                    onClick={() => setSelectedVariantIndex(idx)}
                    className={`h-24 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer relative bg-slate-900 ${
                      selectedVariantIndex === idx ? 'border-indigo-600 scale-105 shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {varItem.isVideo ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-950 text-indigo-300 font-bold text-[9px] p-1">
                        <Play className="w-5 h-5 fill-current text-indigo-400 mb-1" />
                        <span>Video #{idx + 1}</span>
                      </div>
                    ) : (
                      <img src={varItem.image} alt={varItem.name} className="w-full h-full object-contain" />
                    )}
                    <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white text-[10px] font-bold text-center py-0.5">
                      #{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
