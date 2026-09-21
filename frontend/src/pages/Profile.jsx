import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, Bookmark, Trash2, ArrowRight, ShieldCheck, FileText, Scale, LogOut } from 'lucide-react';

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
        <div className="flex items-center gap-3 text-slate-500 font-semibold text-sm">
          <Scale className="animate-spin text-blue-600" size={20} />
          <span>Loading Profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-md text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100 shadow-xs">
          <User size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Account Access Required</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Please log in to view your user profile, manage saved cases, and access search history.
        </p>
        <Link 
          to="/login"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm transition-all"
        >
          <span>Log In to Account</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">User Account</span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-4 py-2 rounded-xl border border-red-200/80 transition-all shadow-2xs cursor-pointer"
        >
          <LogOut size={14} />
          <span>Log Out</span>
        </button>
      </div>

      {/* Profile Info Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              {user.name ? user.name.substring(0, 2).toUpperCase() : <User size={28} />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{user.name || 'Legal Advocate'}</h2>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck size={12} /> Verified Member
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <Phone size={14} className="text-slate-400" />
                <span>{user.mobile || 'Mobile Verified'}</span>
              </p>
            </div>
          </div>

          <Link 
            to="/search"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <span>Open Legal Search Portal</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Saved Cases Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Bookmark size={16} className="text-blue-600" />
            <span>Saved Judgments ({savedCases.length})</span>
          </h2>
        </div>

        {savedCases.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <Bookmark size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No saved judgments yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              When viewing judgments, click the bookmark icon to save case laws directly to your profile for quick access.
            </p>
            <Link 
              to="/search"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 pt-1"
            >
              <span>Browse Repository</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedCases.map((item, idx) => (
              <div 
                key={item.id || idx}
                className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-500 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="bg-blue-50 text-blue-700 font-extrabold text-[10px] px-2.5 py-0.5 rounded-md border border-blue-100">
                      {item.citation || 'Official Citation'}
                    </span>
                    <button 
                      onClick={() => handleRemoveSavedCase(item.id)}
                      className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <h3 className="font-semibold text-xs text-slate-900 leading-snug line-clamp-2">
                    {item.title || `${item.petitioner || ''} vs ${item.respondent || ''}`}
                  </h3>

                  {item.court && (
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                      {item.court}
                    </p>
                  )}
                </div>

                <Link 
                  to={`/judgment/${item.id}`}
                  className="inline-flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-700 pt-2 border-t border-slate-100"
                >
                  <span>Read Full Judgment</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
