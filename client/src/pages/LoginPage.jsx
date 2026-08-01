import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight, Zap, Loader2, Sparkles } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export const LoginPage = () => {
  const { login, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        setTimeout(() => {
          setIsSubmitting(false);
          navigate('/dashboard');
        }, 650);
      } else {
        setIsSubmitting(false);
        setErrorMsg(res.message || 'Invalid credentials');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg('Login failed. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        setTimeout(() => {
          setIsSubmitting(false);
          navigate('/dashboard');
        }, 650);
      } else {
        setIsSubmitting(false);
        setErrorMsg(res.message || 'Google Sign-In failed');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg('Google Sign-In failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 flex items-center justify-center px-4 relative overflow-hidden">
      
      {/* Subtle Corporate Glow Spheres */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Top Tagline Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-extrabold uppercase">
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span>CLIENT PORTAL SIGN IN</span>
          </div>
        </div>

        {/* Main Card Container */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
          
          {/* Loading Overlay Screen */}
          {isSubmitting && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center space-y-3.5 animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 p-[2px] shadow-md animate-pulse">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
                </div>
              </div>
              
              <div className="text-center space-y-1">
                <div className="text-sm font-extrabold text-slate-900 uppercase tracking-widest animate-pulse">
                  SIGNING IN...
                </div>
                <div className="text-xs font-semibold text-indigo-600">
                  Hang on tight! Please wait... 🚀
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Authenticating security credentials...
              </div>
            </div>
          )}

          <div className="space-y-6">
            
            {/* Logo & Header */}
            <div className="text-center space-y-2">
              <Link to="/" className="inline-flex items-center gap-3 group mb-1">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Vibe<span className="text-gradient">Forge</span>
                </span>
              </Link>

              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
              <p className="text-xs font-medium text-slate-500 max-w-xs mx-auto">
                Sign in with your Google account or email to access your client portal.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center font-bold animate-in fade-in">
                {errorMsg}
              </div>
            )}

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer border border-slate-300 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign In with Google</span>
            </button>

            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-3 text-[10px] text-slate-500 font-extrabold uppercase tracking-wider absolute">
                OR SIGN IN WITH EMAIL
              </span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    disabled={isSubmitting}
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 font-medium placeholder-slate-400 transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    disabled={isSubmitting}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 font-medium placeholder-slate-400 transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>SIGN IN</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Footer Prompt */}
            <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-200">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 font-extrabold hover:underline">
                Create Free Account
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
