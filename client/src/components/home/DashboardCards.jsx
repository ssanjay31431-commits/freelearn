import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Image, Video, Smartphone, Bot, Layout, ArrowRight, Star, ShoppingBag, Zap, ShieldCheck, Check } from 'lucide-react';
import { CartContext } from '../../context/CartContext';

export const DashboardCards = () => {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const cards = [
    {
      id: 'srv_web_1',
      serviceId: 'srv_web_1',
      icon: Code2,
      title: 'Full-Stack MERN & React Web Application',
      group: 'website',
      slug: 'portfolio-website',
      originalPrice: 500,
      price: 250,
      discount: '50% OFF',
      rating: 4.9,
      reviews: 142,
      badge: 'TOP CHOICE',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      deliverables: ['Responsive Web Portal', 'React/Node Source Code', 'Free 1-Month Support'],
      description: 'Personal Portfolios, E-Commerce, Restaurant, College Projects & Enterprise Business websites.',
      deliveryTime: '⚡ 24-48 Hours',
    },
    {
      id: 'srv_poster_1',
      serviceId: 'srv_poster_1',
      icon: Image,
      title: 'Symposium & Event Poster Graphic Design',
      group: 'poster',
      slug: 'symposium-hackathon-poster',
      originalPrice: 200,
      price: 100,
      discount: '50% OFF',
      rating: 4.95,
      reviews: 210,
      badge: 'BESTSELLER',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      deliverables: ['Print-ready PDF Poster', 'HD PNG/JPG Renders', 'Canva/PSD Source File'],
      description: 'College Symposiums, Hackathons, Event Banners, Instagram Flyers & Corporate Cards.',
      deliveryTime: '⚡ 4-6 Hours',
    },
    {
      id: 'srv_video_1',
      serviceId: 'srv_video_1',
      icon: Video,
      title: 'High-Retention Reel & Video Editing',
      group: 'video',
      slug: 'instagram-reels-youtube-shorts',
      originalPrice: 600,
      price: 300,
      discount: '50% OFF',
      rating: 4.9,
      reviews: 185,
      badge: 'TRENDING REEL',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      iconColor: 'text-purple-600 bg-purple-50 border-purple-100',
      deliverables: ['4K HD Video Export', 'Dynamic Captions & Motion FX', 'Royalty-Free Audio'],
      description: 'Instagram Reels, YouTube Shorts, Cinematic Edits, Color Grading & Podcast Editing.',
      deliveryTime: '⚡ 12-24 Hours',
    },
    {
      id: 'srv_apk_1',
      serviceId: 'srv_apk_1',
      icon: Smartphone,
      title: 'Android APK & Mobile App Development',
      group: 'app',
      slug: 'android-apk-college-app',
      originalPrice: 600,
      price: 300,
      discount: '50% OFF',
      rating: 4.85,
      reviews: 96,
      badge: 'APK ASSURED',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      iconColor: 'text-cyan-600 bg-cyan-50 border-cyan-100',
      deliverables: ['Signed Android APK File', 'Complete Mobile Source Code', 'Firebase Integration'],
      description: 'Ready-to-install APK files with full source code for college projects & custom utilities.',
      deliveryTime: '⚡ 48 Hours',
    },
    {
      id: 'srv_mobile_1',
      serviceId: 'srv_mobile_1',
      icon: Layout,
      title: 'Cross-Platform iOS & Android Business App',
      group: 'app',
      slug: 'custom-business-mobile-app',
      originalPrice: 600,
      price: 300,
      discount: '50% OFF',
      rating: 4.9,
      reviews: 78,
      badge: 'FEATURED APP',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      iconColor: 'text-blue-600 bg-blue-50 border-blue-100',
      deliverables: ['iOS & Android Builds', 'Inventory & Chat Features', 'Full App Source Code'],
      description: 'Cross-platform iOS & Android business apps, inventory systems, and chat applications.',
      deliveryTime: '⚡ 48 Hours',
    },
    {
      id: 'srv_ai_1',
      serviceId: 'srv_ai_1',
      icon: Bot,
      title: 'Custom AI Agent & Chatbot Integration',
      group: 'ai',
      slug: 'custom-ai-chatbots-automation',
      originalPrice: 999,
      price: 499,
      discount: '50% OFF',
      rating: 4.98,
      reviews: 64,
      badge: 'FEATURED AI',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      iconColor: 'text-amber-600 bg-amber-50 border-amber-100',
      deliverables: ['Custom AI Chatbot Widget', 'API Training Setup', 'Integration Code'],
      description: 'Custom AI chatbots, OpenAI/Gemini automation, AI Resume tools, and image generators.',
      deliveryTime: '⚡ 24 Hours',
    },
  ];

  const handleQuickAddToCart = (card) => {
    addToCart({
      serviceId: card.serviceId,
      id: card.id,
      title: card.title,
      price: card.price,
      quantity: 1,
      deliverables: card.deliverables,
    });
  };

  const handleInstantBuy = (card) => {
    handleQuickAddToCart(card);
    navigate('/checkout');
  };

  return (
    <section className="py-16 bg-[#F8FAFC] relative z-10 border-t border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Professional Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-slate-200 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-extrabold uppercase mb-2">
              <Zap className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
              FEATURED DIGITAL CATALOG & SERVICES
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Our Core <span className="text-gradient">Service Store</span>
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Select a service, view transparent pricing, apply instant coupons, or book with 50% advance.
            </p>
          </div>

          <Link
            to="/services"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-indigo-600 text-xs font-extrabold transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>View All Services</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Clean Corporate Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-indigo-400 transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badge & Rating */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="font-extrabold text-slate-900">{card.rating}</span>
                      <span className="text-[11px] text-slate-500">({card.reviews})</span>
                    </div>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${card.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                        {card.title}
                      </h3>
                      <div className="text-[11px] text-indigo-600 font-bold mt-0.5">{card.deliveryTime}</div>
                    </div>
                  </div>

                  {/* Clean Price Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 mb-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-extrabold text-indigo-600">₹{card.price}</span>
                        <span className="text-xs text-slate-400 line-through">₹{card.originalPrice}</span>
                      </div>
                      <div className="text-[10px] text-slate-600 font-semibold">
                        50% Advance: ₹{Math.round(card.price * 0.5)}
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold">
                      {card.discount}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 text-xs leading-relaxed mb-4 font-normal">
                    {card.description}
                  </p>

                  {/* Deliverables */}
                  <div className="space-y-1.5 mb-6">
                    {card.deliverables.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Corporate Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleQuickAddToCart(card)}
                    className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Add Cart</span>
                  </button>

                  <button
                    onClick={() => handleInstantBuy(card)}
                    className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
