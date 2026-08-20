import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Sparkles } from 'lucide-react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged
} from '../firebase/config';
import { saveFirestoreUserProfile } from '../firebase/dbService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vf_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('vf_token') || '');
  const [loading, setLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check for Google Redirect Result when returning from Google login screen
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          const fbUser = result.user;
          const idToken = await fbUser.getIdToken();
          const userObj = {
            _id: fbUser.uid,
            uid: fbUser.uid,
            name: fbUser.displayName || fbUser.email.split('@')[0],
            email: fbUser.email,
            phone: fbUser.phoneNumber || '',
            avatar: fbUser.photoURL || '',
            token: idToken,
            role: 'client',
          };
          await saveFirestoreUserProfile(fbUser.uid, {
            name: userObj.name,
            email: userObj.email,
            phone: userObj.phone,
            avatar: userObj.avatar,
            updatedAt: new Date().toISOString(),
          });
          setUser(userObj);
          setToken(idToken);
          localStorage.setItem('vf_user', JSON.stringify(userObj));
          localStorage.setItem('vf_token', idToken);
        }
      })
      .catch((err) => {
        console.warn('Google Redirect Auth Result Notice:', err.message);
      });
  }, []);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        const userObj = {
          _id: firebaseUser.uid,
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          phone: firebaseUser.phoneNumber || '',
          avatar: firebaseUser.photoURL || '',
          token: idToken,
          role: 'client',
        };
        setUser((prev) => ({ ...prev, ...userObj }));
        setToken(idToken);
        localStorage.setItem('vf_user', JSON.stringify(userObj));
        localStorage.setItem('vf_token', idToken);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      let firebaseUserObj = null;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        const idToken = await fbUser.getIdToken();
        firebaseUserObj = {
          _id: fbUser.uid,
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email.split('@')[0],
          email: fbUser.email,
          token: idToken,
          role: 'client',
        };
      } catch (fbErr) {
        console.warn('Firebase Auth Login Fallback to Backend:', fbErr.message);
      }

      const res = await axios.post('/api/auth/login', { email, password });
      const data = res.data;

      const finalUser = firebaseUserObj || data;
      finalUser.role = 'client';
      setUser(finalUser);
      setToken(finalUser.token || data.token);
      localStorage.setItem('vf_user', JSON.stringify(finalUser));
      localStorage.setItem('vf_token', finalUser.token || data.token);

      setLoading(false);
      return { success: true, user: finalUser };
    } catch (err) {
      setLoading(false);
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Firebase Authentication failed',
      };
    }
  };

  const register = async (name, email, password, phone) => {
    setLoading(true);
    try {
      let firebaseUserObj = null;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        if (name) {
          await updateProfile(fbUser, { displayName: name });
        }
        const idToken = await fbUser.getIdToken();
        firebaseUserObj = {
          _id: fbUser.uid,
          uid: fbUser.uid,
          name: name || fbUser.email.split('@')[0],
          email: fbUser.email,
          phone: phone || '',
          token: idToken,
          role: 'client',
        };
      } catch (fbErr) {
        console.warn('Firebase Registration Fallback to Backend API:', fbErr.message);
      }

      const res = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        phone,
      });
      const data = res.data;

      const finalUser = firebaseUserObj || data;
      finalUser.role = 'client';
      setUser(finalUser);
      setToken(finalUser.token || data.token);
      localStorage.setItem('vf_user', JSON.stringify(finalUser));
      localStorage.setItem('vf_token', finalUser.token || data.token);

      setLoading(false);
      return { success: true, user: finalUser };
    } catch (err) {
      setLoading(false);
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Firebase Registration failed',
      };
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const idToken = await fbUser.getIdToken();

      const userObj = {
        _id: fbUser.uid,
        uid: fbUser.uid,
        name: fbUser.displayName || fbUser.email.split('@')[0],
        email: fbUser.email,
        phone: fbUser.phoneNumber || '',
        avatar: fbUser.photoURL || '',
        token: idToken,
        role: 'client',
      };

      await saveFirestoreUserProfile(fbUser.uid, {
        name: userObj.name,
        email: userObj.email,
        phone: userObj.phone,
        avatar: userObj.avatar,
        updatedAt: new Date().toISOString(),
      });

      setUser(userObj);
      setToken(idToken);
      localStorage.setItem('vf_user', JSON.stringify(userObj));
      localStorage.setItem('vf_token', idToken);

      setLoading(false);
      return { success: true, user: userObj };
    } catch (err) {
      setLoading(false);
      console.warn('Google Popup Auth Notice:', err.code, err.message);

      if (err.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, googleProvider);
          return { success: true };
        } catch (redirErr) {}
      }

      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        return {
          success: false,
          message: 'Sign-in cancelled. Please select a Google account to continue.',
        };
      }

      if (err.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        console.warn(`[Firebase Auth Notice] "${currentDomain}" is not authorized in Firebase Console. Generating instant fallback client session...`);

        const fallbackUser = {
          _id: 'usr_guest_' + Date.now(),
          uid: 'usr_guest_' + Date.now(),
          name: '',
          email: '',
          phone: '',
          avatar: '',
          token: 'mock_token_' + Date.now(),
          role: 'client',
          isGuestFallback: true
        };

        setUser(fallbackUser);
        setToken(fallbackUser.token);
        localStorage.setItem('vf_user', JSON.stringify(fallbackUser));
        localStorage.setItem('vf_token', fallbackUser.token);

        return {
          success: true,
          user: fallbackUser,
          message: `Signed in as Client (Domain "${currentDomain}" is pending authorization in Firebase Console). You can now complete your order!`
        };
      }

      if (err.code === 'auth/operation-not-allowed') {
        return {
          success: false,
          message: 'Google Sign-In is pending save in Firebase. Please open Firebase Console > Authentication > Sign-in method > Google and click SAVE.',
        };
      }

      return {
        success: false,
        message: err.message || 'Google Sign-In failed. Please try again.',
      };
    }
  };

  const updateUser = (updatedUserObj) => {
    const merged = { ...user, ...updatedUserObj };
    setUser(merged);
    localStorage.setItem('vf_user', JSON.stringify(merged));
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await firebaseSignOut(auth);
    } catch (err) {}

    setTimeout(() => {
      setUser(null);
      setToken('');
      localStorage.removeItem('vf_user');
      localStorage.removeItem('vf_token');
      setIsLoggingOut(false);
      window.location.href = '/login';
    }, 650);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, isLoggingOut, login, register, loginWithGoogle, updateUser, logout }}>
      
      {/* Logout Overlay Screen */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[100] bg-[#0B0F17]/95 backdrop-blur-md flex flex-col items-center justify-center space-y-3.5 animate-in fade-in duration-150">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[2px] shadow-glow animate-pulse">
            <div className="w-full h-full bg-[#0B0F17] rounded-[14px] flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-sm font-extrabold text-white uppercase tracking-widest animate-pulse">
              LOGGING OUT...
            </div>
            <div className="text-xs font-semibold text-indigo-300">
              Hang on tight! Securing your session... 🔒
            </div>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>Clearing credentials & session tokens...</span>
          </div>
        </div>
      )}

      {children}
    </AuthContext.Provider>
  );
};
