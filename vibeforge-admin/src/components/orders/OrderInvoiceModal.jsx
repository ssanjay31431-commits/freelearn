import React from 'react';
import { X, Printer, Download, Sparkles } from 'lucide-react';

export default function OrderInvoiceModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0D1322] border border-slate-800 rounded-3xl max-w-3xl w-full p-8 shadow-2xl relative text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900 border border-slate-800 print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Invoice Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-xl text-white">VibeForge Digital Agency</h2>
              <p className="text-xs text-slate-400">contact@vibeforge.com • +91 98765 43210</p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-extrabold text-indigo-400">INVOICE</h3>
            <p className="text-xs font-mono text-slate-400">#{order.orderId}</p>
            <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Customer & Payment Info */}
        <div className="grid grid-cols-2 gap-6 mb-8 text-xs">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h4 className="font-bold text-white uppercase text-[10px] tracking-wider mb-2">Billed To</h4>
            <p className="font-semibold text-slate-200">{order.customerName}</p>
            <p className="text-slate-400">{order.customerEmail}</p>
            <p className="text-slate-400">{order.customerPhone}</p>
            {order.address && <p className="text-slate-400 mt-1">{order.address}</p>}
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h4 className="font-bold text-white uppercase text-[10px] tracking-wider mb-2">Payment Details</h4>
            <p><span className="text-slate-400">Method:</span> {order.paymentMethod || 'Razorpay'}</p>
            <p><span className="text-slate-400">Status:</span> <span className="uppercase font-bold text-emerald-400">{order.paymentStatus}</span></p>
            <p><span className="text-slate-400">Type:</span> {order.paymentType}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-left text-xs mb-8">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <th className="py-2">Service Description</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {order.items?.map((item, i) => (
              <tr key={i}>
                <td className="py-3 font-semibold text-slate-200">{item.title}</td>
                <td className="py-3 text-center text-slate-400">{item.quantity || 1}</td>
                <td className="py-3 text-right text-slate-400">₹{item.price?.toLocaleString()}</td>
                <td className="py-3 text-right font-bold text-slate-200">₹{(item.price * (item.quantity || 1))?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary Breakdown */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span>₹{order.subtotal?.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount:</span>
                <span>-₹{order.discount?.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>GST (18%):</span>
              <span>₹{order.gst?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-800">
              <span>Total Amount:</span>
              <span className="text-indigo-400">₹{order.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <div className="flex justify-end space-x-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-lg shadow-indigo-600/30"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
}
