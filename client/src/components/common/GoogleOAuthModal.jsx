import React, { useState, useEffect, useContext } from 'react';
import { X, Sparkles, UserCircle2, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export const GoogleOAuthModal = ({ isOpen, onClose, onSelectAccount }) => {
  const [step, setStep] = useState('email'); // 'email', 'password', 'saved'
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState([]);
  const { register } = useContext(AuthContext);

  useEffect(() => {
    const local = localStorage.getItem('vf_saved_google_accounts');
    if (local) {
      setSavedAccounts(JSON.parse(local));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleResetAndClose = () => {
    setStep('email');
    setEmailInput('');
    setNameInput('');
    setPasswordInput('');
    onClose();
  };

  const handleEmailStepSubmit = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setStep('password');
  };

  const handlePasswordStepSubmit = async (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    const cleanEmail = emailInput.trim().toLowerCase();
    const displayName = nameInput.trim() || cleanEmail.split('@')[0];

    const accountObj = {
      name: displayName,
      email: cleanEmail,
      password: passwordInput,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366F1&color=fff`,
    };

    // Attempt backend account creation / authentication so email & password are saved in DB
    try {
      await register(displayName, cleanEmail, passwordInput, '');
    } catch (err) {
      // Ignore if user already registered, google login will proceed
    }

    // Save to local storage for saved accounts list
    const updated = [accountObj, ...savedAccounts.filter((a) => a.email !== cleanEmail)].slice(0, 3);
    localStorage.setItem('vf_saved_google_accounts', JSON.stringify(updated));

    onSelectAccount(accountObj);
    handleResetAndClose();
  };

  const handleSelectSaved = (acc) => {
    onSelectAccount(acc);
    handleResetAndClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#1E1E1E] text-slate-100 rounded-3xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col justify-between animate-in zoom-in-95 duration-200 min-h-[480px]">
        
        {/* Top Google Header */}
        <div className="px-8 pt-6 pb-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span className="text-sm font-semibold text-slate-200">Sign in with Google</span>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="p-8 sm:p-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-start flex-1">
          
          {/* Left Column: Branding */}
          <div className="md:col-span-5 space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[2px]">
              <div className="w-full h-full bg-[#1E1E1E] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-cyan-400" />
              </div>
            </div>

            <div className="space-y-2">
              {step === 'email' && (
                <>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Sign in / Create Account</h2>
                  <p className="text-sm text-slate-300 font-medium">
                    to continue to <span className="font-bold text-indigo-400">VibeForge</span>
                  </p>
                </>
              )}

              {step === 'password' && (
                <>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Welcome</h2>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-indigo-300 font-medium">
                    <span>{emailInput}</span>
                  </div>
                </>
              )}

              {step === 'saved' && (
                <>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Choose an account</h2>
                  <p className="text-sm text-slate-300 font-medium">
                    to continue to <span className="font-bold text-indigo-400">VibeForge</span>
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="md:col-span-7 space-y-6">
            
            {/* STEP 1: Email and Name Input */}
            {step === 'email' && (
              <form onSubmit={handleEmailStepSubmit} className="space-y-5">
                <div className="relative">
                  <input
                    type="email"
                    required
                    id="g_email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder=" "
                    className="block w-full px-4 py-4 text-sm text-white bg-transparent border border-slate-600 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-cyan-400 peer"
                  />
                  <label
                    htmlFor="g_email"
                    className="absolute text-xs text-slate-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#1E1E1E] px-2 peer-focus:px-2 peer-focus:text-cyan-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-3"
                  >
                    Email or phone *
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    id="g_name"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder=" "
                    className="block w-full px-4 py-4 text-sm text-white bg-transparent border border-slate-600 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-cyan-400 peer"
                  />
                  <label
                    htmlFor="g_name"
                    className="absolute text-xs text-slate-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#1E1E1E] px-2 peer-focus:px-2 peer-focus:text-cyan-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-3"
                  >
                    Your Full Name
                  </label>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Before using this app, you can review VibeForge's <span className="text-indigo-400 font-semibold cursor-pointer underline">Privacy Policy</span> and <span className="text-indigo-400 font-semibold cursor-pointer underline">Terms of Service</span>.
                </p>

                <div className="flex items-center justify-between pt-4">
                  {savedAccounts.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setStep('saved')}
                      className="text-xs font-bold text-cyan-400 hover:underline"
                    >
                      Saved Accounts ({savedAccounts.length})
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500">Google Account Authentication</span>
                  )}

                  <button
                    type="submit"
                    className="px-8 py-3 rounded-full bg-[#A8C7FA] hover:bg-[#8AB4F8] text-slate-950 font-semibold text-xs transition-colors shadow-md flex items-center gap-2"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Password Input View */}
            {step === 'password' && (
              <form onSubmit={handlePasswordStepSubmit} className="space-y-5">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    id="g_pass"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder=" "
                    className="block w-full px-4 py-4 text-sm text-white bg-transparent border border-slate-600 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-cyan-400 peer"
                  />
                  <label
                    htmlFor="g_pass"
                    className="absolute text-xs text-slate-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#1E1E1E] px-2 peer-focus:px-2 peer-focus:text-cyan-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-3"
                  >
                    Enter your password *
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="show_pass"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="rounded border-slate-600 text-cyan-500 focus:ring-0"
                  />
                  <label htmlFor="show_pass" className="text-xs text-slate-300 font-medium">Show password</label>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  This password will allow you to sign in directly with email & password anytime.
                </p>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-xs font-bold text-cyan-400 hover:underline"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    className="px-8 py-3 rounded-full bg-[#A8C7FA] hover:bg-[#8AB4F8] text-slate-950 font-semibold text-xs transition-colors shadow-md flex items-center gap-2"
                  >
                    <span>Sign In & Create Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Saved Accounts Picker */}
            {step === 'saved' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Saved Accounts</div>
                {savedAccounts.map((acc, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSaved(acc)}
                    className="w-full p-4 rounded-2xl bg-[#282828] hover:bg-[#333333] border border-slate-700/60 transition-all flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <img src={acc.avatar} alt={acc.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-sm text-white group-hover:text-cyan-400">{acc.name}</div>
                        <div className="text-xs text-slate-400">{acc.email}</div>
                      </div>
                    </div>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full p-3.5 rounded-2xl bg-[#282828] hover:bg-[#333333] border border-slate-700/60 text-xs font-bold text-cyan-400 text-center"
                >
                  + Sign in with another Google Email
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Footer Bar */}
        <div className="px-8 py-4 bg-[#141414] border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div>English (United States)</div>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer">Help</span>
            <span className="hover:text-white cursor-pointer">Privacy</span>
            <span className="hover:text-white cursor-pointer">Terms</span>
          </div>
        </div>

      </div>
    </div>
  );
};
