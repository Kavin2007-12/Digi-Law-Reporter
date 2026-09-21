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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-2 w-full font-jakarta relative">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative"
      >
        <div className="p-6 sm:p-7">
          
          {/* Header */}
          <div className="text-center mb-5">
            <div className="w-11 h-11 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-2xs">
              <LogIn size={20} />
            </div>
            <h2 className="text-lg md:text-xl font-black text-slate-900 mb-1">
              Quick Search Access
            </h2>
            <p className="text-slate-500 text-xs font-normal">
              Enter your Name & Mobile Number to start searching precedents instantly.
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 bg-red-50 border-l-4 border-red-500 p-2.5 rounded-r-lg"
              >
                <p className="text-red-700 text-xs font-semibold">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900" 
                  placeholder="e.g. Adv. Rajesh Sharma" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input 
                  type="tel" 
                  required 
                  maxLength={10}
                  value={formData.mobile} 
                  onChange={e => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '')})} 
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900" 
                  placeholder="e.g. 9876543210" 
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] shadow-md shadow-blue-600/20 flex justify-center items-center gap-2 mt-2 text-xs cursor-pointer"
            >
              {loading ? 'Accessing Portal...' : 'Login to Search'}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <ShieldCheck size={13} className="text-emerald-500" />
              <span>No registration needed. Instant practitioner access.</span>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

