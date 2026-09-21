import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, Bookmark, Trash2, ArrowRight, ShieldCheck, Scale, LogOut, Search, Clock, FileText, CheckCircle2 } from 'lucide-react';

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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white px-6 py-3.5 rounded-2xl border border-slate-200 shadow-sm text-slate-700 font-bold text-xs">
          <Scale className="animate-spin text-blue-600" size={18} />
          <span>Loading Profile Dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200/90 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
          <User size={28} />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">Account Access Required</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Please log in to view your user profile and manage your saved legal judgments.
          </p>
        </div>
        <Link 
          to="/login"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-xs transition-all"
        >
          <span>Log In to Account</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-7">
      
      {/* 1. EXECUTIVE USER PROFILE HEADER CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs transition-all relative overflow-hidden">
        
        {/* Subtle Accent Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/50 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          
          {/* Left: Avatar & Identity Details */}
          <div className="flex items-center gap-4">
            {/* User Initial Avatar Circle */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-blue-600/20 border-2 border-white flex-shrink-0">
              {user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-slate-900 capitalize tracking-tight">
                  {user.name || 'Legal Advocate'}
                </h1>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                  <CheckCircle2 size={12} className="text-emerald-600" /> Verified Practitioner
                </span>
              </div>

              <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <Phone size={13} className="text-slate-400" />
                <span>{user.mobile || 'Mobile Verified'}</span>
              </p>
            </div>
          </div>

          {/* Right: Log Out Button */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100/90 text-red-600 font-bold text-xs px-4 py-2.5 rounded-xl border border-red-200/80 transition-all cursor-pointer active:scale-95 shadow-2xs"
              title="Log Out of Account"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. SAVED JUDGMENTS SECTION */}
      <div className="space-y-4 pt-1">
        
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-slate-200/90 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-2xs">
              <Bookmark size={16} />
            </div>
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Saved Judgments & Bookmarks
            </h2>
          </div>

          <span className="bg-blue-50 text-blue-700 text-xs font-black px-3 py-1 rounded-full border border-blue-100">
            {savedCases.length} {savedCases.length === 1 ? 'Case' : 'Cases'} Saved
          </span>
        </div>

        {/* Empty State */}
        {savedCases.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border border-slate-200/90 text-center space-y-4 shadow-2xs">
            <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto border border-slate-200/80">
              <Bookmark size={26} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800">No Saved Judgments Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                When searching precedents, click the bookmark icon on any judgment to save it directly to your profile.
              </p>
            </div>
            <Link 
              to="/search"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all"
            >
              <Search size={14} />
              <span>Go to Legal Search</span>
            </Link>
          </div>
        ) : (
          /* Single-Column Vertical List */
          <div className="flex flex-col space-y-3.5">
            {savedCases.map((item, idx) => (
              <div 
                key={item.id || idx}
                className="group bg-white p-5 rounded-2xl border border-slate-200/90 border-l-4 border-l-blue-600 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Case Info Left */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-blue-50 text-blue-700 font-extrabold text-[11px] px-3 py-0.5 rounded-md border border-blue-100/90">
                      {item.citation || 'Official Citation'}
                    </span>
                    {item.court && (
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-md">
                        {item.court}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
                    {item.title || `${item.petitioner || ''} vs ${item.respondent || ''}`}
                  </h3>
                </div>

                {/* Case Actions Right */}
                <div className="flex items-center gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex-shrink-0 justify-between sm:justify-end">
                  <Link 
                    to={`/judgment/${item.id}`}
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Read Full Judgment</span>
                    <ArrowRight size={14} />
                  </Link>

                  <button 
                    onClick={() => handleRemoveSavedCase(item.id)}
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-200/80"
                    title="Remove from saved"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
