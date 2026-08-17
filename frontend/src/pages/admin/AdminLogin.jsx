import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Key, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    localStorage.setItem('adminAuth', 'true');
    localStorage.setItem('adminToken', 'mock-admin-jwt-token');
    localStorage.setItem('adminUser', JSON.stringify({ name: 'Admin User', role: 'Administrator' }));
    setTimeout(() => {
      setLoading(false);
      navigate('/admin/dashboard');
    }, 400);
  };

  return (
    <div className="h-[100dvh] bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Top Left Back to Home Button */}
      <Link 
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl text-slate-700 hover:text-blue-600 hover:border-blue-300 font-bold text-xs shadow-xs transition-all z-30 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform text-slate-500 group-hover:text-blue-600" />
        <span>Back to Home</span>
      </Link>

      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/60 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-100/60 blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10">
          
          {/* Top Section with Logo */}
          <div className="flex flex-col items-center justify-center mb-8 text-center">
            <img 
              src="/logo/digital_law_reporter.png" 
              alt="Digital Law Reporter" 
              className="h-12 object-contain mb-3"
            />
            <h1 className="text-xl font-bold text-slate-800 mb-1">Admin Portal</h1>
            <p className="text-xs text-slate-500">Secure access to Digi Law Reporter</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center font-medium shadow-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              {/* Admin Email */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Admin Email</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pl-11 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all placeholder:text-slate-400 font-medium text-sm"
                    placeholder="admin@digilawreporter.in"
                  />
                  <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Password Header with Forgot Password Link */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                  <button
                    type="button"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pl-11 pr-11 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all placeholder:text-slate-400 font-medium text-sm"
                    placeholder="••••••••"
                  />
                  <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3.5 font-semibold transition-all flex items-center justify-center gap-2 mt-2 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] disabled:opacity-70 disabled:hover:bg-blue-600 text-sm cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Secure Login'} 
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

        </div>
        
        <div className="text-center mt-6 text-[13px] text-slate-500 font-medium">
          &copy; {new Date().getFullYear()} Digi Law Reporter. All rights reserved.
        </div>
      </motion.div>

    </div>
  );
}
