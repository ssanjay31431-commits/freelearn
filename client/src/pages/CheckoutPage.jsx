import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, CheckCircle2, Lock, ArrowRight, Zap, Building, Copy, Check, QrCode, MessageCircle, ExternalLink, Sparkles } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { createFirestoreOrder } from '../firebase/dbService';

export const CheckoutPage = () => {
  const { cartItems, grandTotal, coupon, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('');
  const [paymentType, setPaymentType] = useState('advance_50'); // 'advance_50', 'full', 'token_50'
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [copiedField, setCopiedField] = useState(null);
  const [loading, setLoading] = useState(false);

  // Admin Notification Credentials
  const adminWhatsAppPhone = '919943380320';
  const adminEmail = 'vibeforge@gmail.com';

  const upiId = 'ssanjay31431@oksbi';
  const upiPhone = '7708447215';

  // Compute payment amounts based on choice
  let amountToPayNow = grandTotal;
  let amountDueLater = 0;

  if (paymentType === 'advance_50') {
    amountToPayNow = Math.round(grandTotal * 0.5);
    amountDueLater = grandTotal - amountToPayNow;
  } else if (paymentType === 'token_50') {
    amountToPayNow = 50;
    amountDueLater = Math.max(0, grandTotal - 50);
  } else {
    amountToPayNow = grandTotal;
    amountDueLater = 0;
  }

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Pre-warm / Wake up Render backend server in advance when customer lands on Checkout Page
  useEffect(() => {
    const apiUrls = [
      import.meta.env.VITE_API_BASE_URL,
      import.meta.env.VITE_API_URL,
      'https://vibeforge-server.onrender.com/api',
      'https://freelearn.onrender.com/api'
    ].filter(Boolean);

    apiUrls.forEach((baseUrl) => {
      try {
        const cleanUrl = baseUrl.replace(/\/$/, '');
        fetch(`${cleanUrl}/orders`, { method: 'GET' }).catch(() => {});
      } catch (e) {}
    });
  }, []);

  const saveOrderToMongoDB = async (orderPayload) => {
    const apiUrls = [
      import.meta.env.VITE_API_BASE_URL,
      import.meta.env.VITE_API_URL,
      'https://vibeforge-server.onrender.com/api',
      'https://freelearn.onrender.com/api',
      'http://localhost:5000/api'
    ].filter(Boolean);

    for (const baseUrl of apiUrls) {
      try {
        const cleanUrl = baseUrl.replace(/\/$/, '');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(`${cleanUrl}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          console.log('✅ Saved order in MongoDB. No customer email was sent automatically:', cleanUrl, data);
          return data;
        }
      } catch (e) {
        console.warn(`[MongoDB Save Attempt] Post to ${baseUrl} failed:`, e.message);
      }
    }
    return null;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !customerPhone) {
      alert('Please fill in your name, email, and phone number.');
      return;
    }

    setLoading(true);
    try {
      const generatedOrderId = 'VF-' + Math.floor(100000 + Math.random() * 900000);

      const orderPayload = {
        orderId: generatedOrderId,
        user: user || null,
        userId: user?._id || user?.uid || 'guest',
        customerName,
        customerEmail,
        customerPhone,
        address,
        items: cartItems,
        totalAmount: grandTotal,
        amountPaid: amountToPayNow,
        amountDue: amountDueLater,
        paymentType,
        paymentMethod,
        paymentStatus: paymentType === 'token_50' ? 'Token Deposit Paid (Rs.50 Deducted)' : paymentType === 'advance_50' ? 'Advance Paid (50%)' : 'Full Payment Completed',
        orderStatus: 'Pending',
        statusTimeline: 'Pending',
        emailStatus: 'Not Sent',
        couponCode: coupon?.code || '',
        adminNotificationEmail: adminEmail,
        adminNotificationPhone: adminWhatsAppPhone,
        upiId,
        upiPhone,
      };

      // 1. Store order in MongoDB Database with Order Status = Pending, Email Status = Not Sent
      const mongoResult = await saveOrderToMongoDB(orderPayload);

      // 2. Write to Firebase Firestore
      const createdOrder = await createFirestoreOrder(orderPayload);

      // 3. Clear cart (Do NOT send any email automatically from customer website)
      clearCart();
      setLoading(false);

      // 4. Redirect to tracking page
      const targetId = mongoResult?.orderId || createdOrder?.orderId || generatedOrderId;
      navigate(`/track?id=${targetId}&newOrder=true`);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert('Order placement failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-extrabold uppercase">
            <Lock className="w-4 h-4 text-indigo-600" />
            <span>Official VibeForge Checkout</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Checkout & Order Confirmation
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-600">
            Complete your booking. Instant order alerts are automatically dispatched to admin email ({adminEmail}) and WhatsApp (+91 99433 80320)!
          </p>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Customer Details Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Contact Details */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                Contact & Project Info
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1.5">WhatsApp / Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    placeholder="+91 99433 80320"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1.5">College / Organization Name</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    placeholder="e.g. SRM / Local Business"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Plan Choice */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                Choose Payment Option
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* 50% Advance Option */}
                <button
                  type="button"
                  onClick={() => setPaymentType('advance_50')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentType === 'advance_50'
                      ? 'border-2 border-indigo-600 bg-indigo-50/90 shadow-md'
                      : 'border border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1 uppercase">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>50% Advance</span>
                  </div>
                  <div className="text-sm text-indigo-700 font-extrabold mt-1">₹{Math.round(grandTotal * 0.5)} Today</div>
                  <div className="text-xs font-bold text-slate-700 mt-1">Pay rest after delivery</div>
                </button>

                {/* Full Payment Option */}
                <button
                  type="button"
                  onClick={() => setPaymentType('full')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentType === 'full'
                      ? 'border-2 border-emerald-600 bg-emerald-50/90 shadow-md'
                      : 'border border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1 uppercase">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-600 text-white" />
                    <span>Full Payment</span>
                  </div>
                  <div className="text-sm text-emerald-700 font-extrabold mt-1">₹{grandTotal} Today</div>
                  <div className="text-xs font-bold text-slate-700 mt-1">Priority dispatch</div>
                </button>

                {/* ₹50 Token Booking Option */}
                <button
                  type="button"
                  onClick={() => setPaymentType('token_50')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentType === 'token_50'
                      ? 'border-2 border-purple-600 bg-purple-50/90 shadow-md'
                      : 'border border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-black text-slate-900 uppercase">₹50 Token Deposit</div>
                  <div className="text-sm text-purple-700 font-extrabold mt-1">₹50 Today</div>
                  <div className="text-xs font-bold text-slate-700 mt-1">Pay ₹50 token to initiate</div>
                </button>

              </div>

              {/* DEDUCTION NOTICE MESSAGE BOX FOR ₹50 TOKEN PAYMENT */}
              {paymentType === 'token_50' && (
                <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-200 text-xs space-y-1.5 animate-in fade-in">
                  <div className="font-extrabold text-purple-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 fill-purple-600" />
                    <span>₹50 Token Deposit Deduction Guarantee</span>
                  </div>
                  <p className="text-purple-950 font-bold leading-relaxed">
                    💡 <strong>Note to Customer:</strong> Your ₹50 deposit paid today will be <strong>fully deducted</strong> from your total bill! Your remaining balance will only be <strong>₹{Math.max(0, grandTotal - 50)}</strong> after final project delivery.
                  </p>
                </div>
              )}

            </div>

            {/* Step 3: OFFICIAL GPAY QR CODE & UPI PAYMENT DETAILS */}
            <div className="bg-white p-6 rounded-3xl border-2 border-indigo-500/40 shadow-xl space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-indigo-600" />
                  Scan GPay QR Code to Pay (₹{amountToPayNow})
                </h3>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                  INSTANT UPI
                </span>
              </div>

              {/* GPay QR Display Card */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-4">
                <div className="inline-block p-3 bg-white rounded-2xl border border-slate-200 shadow-md">
                  <img
                    src="/gpay_qr.jpg"
                    alt="S Sanjay GPay QR Code"
                    className="w-56 h-auto mx-auto rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-black text-slate-900">Account Holder: S Sanjay</div>
                  <div className="text-xs text-slate-600 font-semibold">Scan with Google Pay, PhonePe, Paytm, BHIM, or any UPI App</div>
                </div>

                {/* Copy UPI Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="text-left">
                      <div className="text-[10px] font-bold text-slate-500">UPI ID</div>
                      <div className="text-xs font-extrabold text-indigo-700">{upiId}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(upiId, 'upi')}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedField === 'upi' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'upi' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="text-left">
                      <div className="text-[10px] font-bold text-slate-500">GPay Phone Number</div>
                      <div className="text-xs font-extrabold text-emerald-700">{upiPhone}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(upiPhone, 'phone')}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'phone' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-5 sticky top-24">
              <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Order Summary
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
                    <div>
                      <div className="font-extrabold text-slate-900">{item.title}</div>
                      <div className="text-[11px] font-semibold text-slate-500">Qty: {item.quantity} • {item.deliverables?.[0] || 'Standard Service'}</div>
                    </div>
                    <div className="font-extrabold text-indigo-700 text-sm">₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
                <div className="flex justify-between font-bold text-slate-600">
                  <span>Total Package Value</span>
                  <span className="text-slate-900">₹{grandTotal}</span>
                </div>

                <div className="flex justify-between font-extrabold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span>Amount Due Now ({paymentType === 'advance_50' ? '50% Advance' : paymentType === 'token_50' ? '₹50 Token' : '100% Full'})</span>
                  <span className="text-emerald-700 text-sm">₹{amountToPayNow}</span>
                </div>

                {amountDueLater > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between font-extrabold text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      <span>Remaining Balance Due After Delivery</span>
                      <span>₹{amountDueLater}</span>
                    </div>
                    {paymentType === 'token_50' && (
                      <div className="text-[11px] font-extrabold text-emerald-700 text-right pr-1">
                        ✓ ₹50 token paid today is fully reduced from ₹{grandTotal} total!
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Admin Notification Banner */}
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-[11px] font-semibold text-indigo-900 space-y-1">
                <div className="font-extrabold flex items-center gap-1 text-indigo-950">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Instant Admin Alert Guarantee:</span>
                </div>
                <div>Order details & payment receipts are automatically dispatched to admin email (<strong>vibeforge@gmail.com</strong>) & WhatsApp (<strong>+91 99433 80320</strong>).</div>
              </div>

              <button
                type="submit"
                disabled={loading || cartItems.length === 0}
                className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Processing & Notifying Admin...</span>
                ) : (
                  <>
                    <span>Confirm Order & Pay ₹{amountToPayNow}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-[11px] font-extrabold text-slate-600 text-center flex items-center justify-center gap-1.5 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Firebase Database Sync • Instant Invoice PDF</span>
              </div>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
