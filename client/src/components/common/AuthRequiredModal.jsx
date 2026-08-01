import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock, Sparkles, ShieldCheck, ArrowRight, UserPlus, LogIn } from 'lucide-react';

export const AuthRequiredModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSignInClick = () => {
    onClose();
    navigate('/login');
  };

  const handleRegisterClick = () => {
    onClose();
    navigate('/register');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-panel bg-[#0B0F17]/95 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 rounded-full blur-3xl pointer-events-none" />

        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[2px] shadow-glow">
            <div className="w-full h-full bg-[#0B0F17] rounded-[14px] flex items-center justify-center">
              <Lock className="w-7 h-7 text-cyan-400" />
            </div>
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Sign In Required to Continue
            </span>
            <h3 className="text-2xl font-extrabold text-white tracking-tight mt-2">
              Sign In to Add to Cart
            </h3>
            <p className="text-slate-400 text-xs mt-1.5 max-w-sm mx-auto leading-relaxed">
              Please sign in or register an account to customize project specs, apply discount coupons, and track delivery.
            </p>
          </div>
        </div>

        {/* Key Benefits Checklist */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Real-Time Live Order Progress Tracking</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>50% Advance Choice & Invoice Downloads</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Direct Priority Founders Support via WhatsApp</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSignInClick}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-glow hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Your Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleRegisterClick}
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-300 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-indigo-400" />
            <span>Create Free Account</span>
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-300 font-medium transition-colors underline cursor-pointer"
          >
            Continue Browsing as Guest
          </button>
        </div>

      </div>
    </div>
  );
};
