import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Zap, Menu, X, Sparkles, Code2, Bot, Video, Smartphone, Image, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';

export const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdown, setServicesDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const getInitial = () => {
    if (!user) return 'P';
    if (user.name && user.name.trim()) return user.name.trim()[0].toUpperCase();
    if (user.email && user.email.trim()) return user.email.trim()[0].toUpperCase();
    return 'P';
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      
      {/* Top Announcement Ticker Bar - Larger & Super Clear */}
      <div className="bg-slate-950 border-b border-slate-800 text-xs sm:text-sm font-extrabold text-slate-200 py-2.5 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-cyan-300 font-extrabold">
              <Zap className="w-4 h-4 fill-cyan-400" />
              Express 24H Delivery Available
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-extrabold">
              <ShieldCheck className="w-4 h-4" />
              50% Advance Pay Guarantee
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/track" className="text-indigo-300 hover:text-white font-extrabold transition-colors flex items-center gap-1">
              <span>Track Order Live</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Professional White Navigation Header */}
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                Vibe<span className="text-gradient">Forge</span>
              </span>
            </Link>

            {/* Integrated Search Bar - Larger Font */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center flex-1 max-w-xl mx-4">
              <div className="relative w-full flex items-center">
                <select
                  onChange={(e) => navigate(`/services?group=${e.target.value}`)}
                  className="bg-slate-100 border border-slate-300 border-r-0 rounded-l-xl py-2.5 px-3.5 text-sm text-slate-900 font-extrabold focus:outline-none cursor-pointer"
                >
                  <option value="all">All Services</option>
                  <option value="website">Web Dev</option>
                  <option value="poster">Posters</option>
                  <option value="video">Reels / Video</option>
                  <option value="app">Android APK</option>
                </select>

                <input
                  type="text"
                  placeholder="Search services (e.g. Website, Poster, Reel, APK)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 py-2.5 px-4 text-sm text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />

                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-r-xl transition-all cursor-pointer shadow-sm"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Navigation Links - Larger & Bolder Font */}
            <div className="hidden md:flex items-center gap-7 text-sm font-extrabold text-slate-800">
              <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
              
              <div 
                className="relative"
                onMouseEnter={() => setServicesDropdown(true)}
                onMouseLeave={() => setServicesDropdown(false)}
              >
                <button 
                  onClick={() => navigate('/services')}
                  className="hover:text-indigo-600 flex items-center gap-1 transition-colors py-2 cursor-pointer font-extrabold"
                >
                  Catalog
                </button>

                {servicesDropdown && (
                  <div className="absolute top-full left-0 w-64 bg-white rounded-2xl p-3 shadow-xl border border-slate-200 mt-1 grid gap-1 z-50">
                    <Link to="/services?group=website" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-900 transition-all">
                      <Code2 className="w-4 h-4 text-indigo-600" />
                      <div>
                        <div className="font-extrabold text-xs">Website Development</div>
                        <div className="text-[11px] text-slate-600 font-bold">Starting ₹250</div>
                      </div>
                    </Link>
                    <Link to="/services?group=poster" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-900 transition-all">
                      <Image className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="font-extrabold text-xs">Poster & Graphic Design</div>
                        <div className="text-[11px] text-slate-600 font-bold">Starting ₹100</div>
                      </div>
                    </Link>
                    <Link to="/services?group=video" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-900 transition-all">
                      <Video className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="font-extrabold text-xs">Video Editing & Reels</div>
                        <div className="text-[11px] text-slate-600 font-bold">Starting ₹300</div>
                      </div>
                    </Link>
                    <Link to="/services?group=app" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-900 transition-all">
                      <Smartphone className="w-4 h-4 text-cyan-600" />
                      <div>
                        <div className="font-extrabold text-xs">Mobile App & Android APK</div>
                        <div className="text-[11px] text-slate-600 font-bold">Starting ₹300</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              <Link to="/portfolio" className="hover:text-indigo-600 transition-colors">Portfolio</Link>
              <Link to="/quote" className="hover:text-indigo-600 transition-colors text-indigo-600 font-black">
                Custom Quote
              </Link>
              <Link to="/about" className="hover:text-indigo-600 transition-colors">About</Link>
            </div>

            {/* Right Action Icons & Cart - Larger Font */}
            <div className="flex items-center gap-3 shrink-0">
              
              <Link
                to="/cart"
                className="relative px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 transition-all flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-extrabold hidden sm:inline">Cart</span>
                {totalCartCount > 0 && (
                  <span className="bg-indigo-600 text-white text-xs font-black px-2 py-0.5 rounded-full shadow-xs">
                    {totalCartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/dashboard"
                    className="p-1 pr-3.5 rounded-full bg-slate-100 border border-slate-300 hover:border-indigo-500 transition-all flex items-center gap-2 shadow-sm group cursor-pointer"
                    title="View Profile & Dashboard"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-black text-xs text-white uppercase">
                      {getInitial()}
                    </div>
                    <span className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors hidden sm:inline">
                      Profile
                    </span>
                  </Link>

                  <button
                    onClick={logout}
                    className="text-xs text-slate-600 hover:text-rose-600 transition-colors hidden xl:block cursor-pointer font-bold"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-extrabold border border-slate-300 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold shadow-sm transition-all hidden sm:block"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

            </div>

          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl font-extrabold text-slate-900 hover:bg-slate-50 text-sm"
            >
              Home
            </Link>
            <Link
              to="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl font-extrabold text-slate-900 hover:bg-slate-50 text-sm"
            >
              Catalog & Services
            </Link>
            <Link
              to="/portfolio"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl font-extrabold text-slate-900 hover:bg-slate-50 text-sm"
            >
              Portfolio Gallery
            </Link>
            <Link
              to="/quote"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl font-black text-indigo-600 hover:bg-indigo-50 text-sm"
            >
              Get Custom Quote
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl font-extrabold text-slate-900 hover:bg-slate-50 text-sm"
            >
              About Founders
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};
