import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Bookmark, Tag, Check, ArrowLeft } from 'lucide-react';
import { CartContext } from '../context/CartContext';

export const CartPage = () => {
  const {
    cartItems,
    savedForLater,
    coupon,
    removeFromCart,
    updateQuantity,
    saveForLaterItem,
    moveToCart,
    applyCoupon,
    removeCoupon,
    subtotal,
    discountAmount,
    gstAmount,
    grandTotal,
  } = useContext(CartContext);

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const navigate = useNavigate();

  const handleApply = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponMsg(res.message);
    if (res.success) setCouponInput('');
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-indigo-400" />
              Shopping Cart ({cartItems.length} items)
            </h1>
            <p className="text-slate-400 text-xs mt-1">Review your agency services before proceeding to secure checkout.</p>
          </div>
          <Link to="/services" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Continue Browsing
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center max-w-xl mx-auto space-y-4">
            <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Your Shopping Cart is Empty</h2>
            <p className="text-slate-400 text-xs">
              Explore our services ranging from Poster Designs (₹100), Website Portfolios (₹250), Video Edits (₹300), to APKs (₹300).
            </p>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs uppercase shadow-glow"
            >
              Explore Services
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Col: Cart Items */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Cart Items List */}
              <div className="bg-[#0F172A] rounded-3xl p-6 border border-slate-800/90 shadow-2xl space-y-6">
                {cartItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider">
                        {item.categoryName}
                      </span>
                      <h3 className="text-lg font-black text-white">{item.title}</h3>
                      <div className="text-xs text-slate-300 space-y-0.5 font-medium">
                        <div>Priority: <span className="text-slate-100 uppercase font-bold">{item.priority}</span></div>
                        {item.requirements && <div>Reqs: <span className="text-slate-200 italic">"{item.requirements}"</span></div>}
                        {item.referenceFile && <div>File: <span className="text-cyan-400 font-semibold">{item.referenceFile}</span></div>}
                      </div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.serviceId, -1)}
                          className="p-1 hover:text-indigo-400 text-slate-300 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-black text-white w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.serviceId, 1)}
                          className="p-1 hover:text-indigo-400 text-slate-300 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-black text-white">₹{item.price * item.quantity}</div>
                        <div className="text-[10px] text-slate-300 font-bold">₹{item.price} each</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveForLaterItem(item.serviceId)}
                          className="p-2 rounded-xl bg-slate-800/90 text-slate-300 hover:text-amber-400 transition-colors border border-slate-700/50"
                          title="Save For Later"
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.serviceId)}
                          className="p-2 rounded-xl bg-slate-800/90 text-slate-300 hover:text-rose-400 transition-colors border border-slate-700/50"
                          title="Remove Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Save For Later Section */}
              {savedForLater.length > 0 && (
                <div className="bg-[#0F172A] rounded-3xl p-6 border border-slate-800/90 shadow-2xl space-y-4">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-amber-400" />
                    Saved For Later ({savedForLater.length})
                  </h3>
                  <div className="space-y-3">
                    {savedForLater.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                        <div>
                          <div className="text-sm font-bold text-white">{item.title}</div>
                          <div className="text-xs text-slate-300 font-semibold">₹{item.price}</div>
                        </div>
                        <button
                          onClick={() => moveToCart(item.serviceId)}
                          className="px-4 py-2 rounded-xl bg-indigo-600/40 border border-indigo-500 text-indigo-200 text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all"
                        >
                          Move to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Col: Order Summary & Coupon */}
            <div className="lg:col-span-4">
              <div className="bg-[#0F172A] rounded-3xl p-6 border border-slate-800/90 shadow-2xl sticky top-28 space-y-6">
                <h3 className="text-lg font-black text-white border-b border-slate-800 pb-4">Order Summary</h3>

                {/* Coupon Code Input */}
                <div>
                  <form onSubmit={handleApply} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Coupon (VIBE10 / FIRST20)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white uppercase placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-bold"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>

                  {couponMsg && <div className="text-xs text-indigo-400 mt-2 font-bold">{couponMsg}</div>}

                  {coupon && (
                    <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1 font-bold">
                        <Check className="w-3.5 h-3.5" /> Coupon {coupon.code} Applied
                      </span>
                      <button onClick={removeCoupon} className="text-slate-400 hover:text-rose-400 text-[10px] underline font-bold cursor-pointer">
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Subtotals breakdown */}
                <div className="space-y-3 text-xs text-slate-300 border-t border-slate-800 pt-4 font-semibold">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-black text-white text-sm">₹{subtotal}</span>
                  </div>

                  {coupon && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Discount ({coupon.discountPercent}%)</span>
                      <span className="font-black">-₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>GST (18%)</span>
                    <span className="font-black text-white text-sm">₹{gstAmount}</span>
                  </div>

                  <div className="flex justify-between text-base font-black text-white border-t border-slate-800 pt-3">
                    <span>Grand Total</span>
                    <span className="text-xl text-indigo-400 font-black">₹{grandTotal}</span>
                  </div>
                </div>

                {/* Proceed Button */}
                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Proceed To Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
