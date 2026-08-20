import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Phone, LogIn, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({ name: '', mobile: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('user')) {
      navigate('/search');
    }
  }, [navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const nameTrimmed = formData.name.trim();
    const mobileTrimmed = formData.mobile.trim();

    if (!nameTrimmed || !mobileTrimmed) {
      return setError("Please enter both Name and Mobile Number");
    }

    if (mobileTrimmed.length < 10) {
      return setError("Please enter a valid 10-digit mobile number");
    }

    setLoading(true);

    const userData = {
      id: Date.now(),
      name: nameTrimmed,
      mobile: mobileTrimmed
    };

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameTrimmed, mobile: mobileTrimmed })
      });
      const data = await res.json();
      
      if (data.status === 'success' && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (err) {
      console.warn("Backend auth offline, logging in locally", err);
      localStorage.setItem('user', JSON.stringify(userData));
    } finally {
      setLoading(false);
      window.location.href = '/search';
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 pb-20 md:pb-4 w-full h-full min-h-[calc(100vh-80px)] font-jakarta relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative"
      >
        <div className="p-8 md:p-10 pt-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-50 text-primary-600 border border-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <LogIn size={26} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-1.5 font-cinzel">
              Quick Search Access
            </h2>
            <p className="text-slate-500 text-xs md:text-sm font-normal">
              Enter your Name & Mobile Number to start searching precedents instantly.
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 bg-red-50 border-l-4 border-red-500 p-3.5 rounded-r-xl"
              >
                <p className="text-red-700 text-xs font-semibold">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-3.5 text-slate-400" />
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none transition-all bg-slate-50 focus:bg-white text-sm font-semibold text-slate-900" 
                  placeholder="e.g. Adv. Rajesh Sharma" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-3.5 text-slate-400" />
                <input 
                  type="tel" 
                  required 
                  maxLength={10}
                  value={formData.mobile} 
                  onChange={e => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '')})} 
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none transition-all bg-slate-50 focus:bg-white text-sm font-semibold text-slate-900" 
                  placeholder="e.g. 9876543210" 
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg hover:shadow-primary-500/25 flex justify-center items-center gap-2 mt-4 text-base"
            >
              {loading ? 'Accessing Portal...' : 'Login to Search'}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-8 pt-5 border-t border-slate-100 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>No registration needed. Instant guest & practitioner access.</span>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

