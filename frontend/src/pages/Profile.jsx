import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, Bookmark, Trash2, ArrowRight, ShieldCheck, Scale, LogOut, Search, Sparkles, BookOpen, Clock } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [savedCases, setSavedCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user') || localStorage.getItem('dlr_user_session');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setUser(u);
        
        // Fetch user's saved cases from database
        const userMobile = u.mobile || '9876543210';
        fetch(`http://localhost:5000/api/auth/saved-cases/${userMobile}`)
          .then(res => res.json())
          .then(data => {
            if (data && Array.isArray(data.data)) {
              setSavedCases(data.data);
            }
            setLoading(false);
          })
          .catch(err => {
            console.error("Error fetching saved cases:", err);
            setLoading(false);
          });
      } catch (e) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('dlr_user_session');
    navigate('/');
    window.location.reload();
  };

  const handleRemoveSavedCase = (caseId) => {
    const updated = savedCases.filter(c => c && String(c.id) !== String(caseId));
    setSavedCases(updated);

    const userMobile = user?.mobile || '9876543210';
    fetch('http://localhost:5000/api/auth/saved-cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: userMobile, cases: updated })
    }).catch(err => console.error("Error updating saved cases:", err));
  };

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-md text-slate-700 font-bold text-sm animate-pulse">
          <Scale className="animate-spin text-blue-600" size={22} />
          <span>Loading Profile Dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200/90 shadow-xl text-center space-y-5">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100 shadow-xs">
          <User size={32} />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900">Account Login Required</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Please sign in to access your saved legal judgments, citation bookmarks, and profile dashboard.
          </p>
        </div>
        <Link 
          to="/login"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95"
        >
          <span>Log In to Account</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* 1. EXECUTIVE HERO CARD WITH GRADIENT BACKGROUND */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        
        {/* Subtle Background Glow Spheres */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* User Details Left Column */}
          <div className="flex items-center gap-5">
            {/* Avatar Circle */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-blue-500/30 border-2 border-white/20 flex-shrink-0">
              {user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white capitalize">
                  {user.name || 'Legal Advocate'}
                </h1>
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 backdrop-blur-md">
                  <ShieldCheck size={12} /> Verified Member
                </span>
              </div>

              <p className="text-xs text-slate-300 flex items-center gap-2 font-medium">
                <Phone size={14} className="text-blue-400" />
                <span>{user.mobile || 'Mobile Verified'}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons Right Column */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link 
              to="/search"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <Search size={15} />
              <span>Open Search Portal</span>
              <ArrowRight size={14} />
            </Link>

            <button 
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-white font-bold text-xs px-4 py-3 rounded-xl border border-red-500/30 transition-all cursor-pointer active:scale-95"
              title="Log Out of Account"
            >
              <LogOut size={15} />
              <span>Log Out</span>
            </button>
          </div>

        </div>
      </div>

      {/* SAVED JUDGMENTS SECTION */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 text-blue-700 p-1.5 rounded-lg">
              <Bookmark size={18} />
            </div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Saved Judgments & Bookmarks ({savedCases.length})
            </h2>
          </div>
        </div>

        {savedCases.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border border-slate-200/90 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto border border-slate-200">
              <Bookmark size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">No Saved Judgments Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                When reading judgments in the legal search portal, click the bookmark icon to save landmark rulings to your profile dashboard for instant reference.
              </p>
            </div>
            <Link 
              to="/search"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all"
            >
              <Search size={14} />
              <span>Browse Legal Repository</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {savedCases.map((item, idx) => (
              <div 
                key={item.id || idx}
                className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar: Citation & Remove */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="bg-blue-50 text-blue-700 font-extrabold text-[11px] px-3 py-1 rounded-lg border border-blue-100/90 shadow-2xs">
                      {item.citation || 'Official Citation'}
                    </span>
                    
                    <button 
                      onClick={() => handleRemoveSavedCase(item.id)}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                      title="Remove from saved"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-sm text-slate-900 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                    {item.title || `${item.petitioner || ''} vs ${item.respondent || ''}`}
                  </h3>

                  {/* Court Name */}
                  {item.court && (
                    <span className="inline-block text-[10px] font-black text-slate-500 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-md">
                      {item.court}
                    </span>
                  )}
                </div>

                {/* Footer Action Link */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                    <Clock size={12} /> Bookmarked
                  </span>

                  <Link 
                    to={`/judgment/${item.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>Read Full Judgment</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
