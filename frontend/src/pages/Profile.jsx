import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, Bookmark, Trash2, ArrowRight, ShieldCheck, Scale, LogOut, Search } from 'lucide-react';

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
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-slate-500 font-medium text-xs">
          <Scale className="animate-spin text-blue-600" size={16} />
          <span>Loading User Profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-sm mx-auto my-16 p-6 bg-white rounded-xl border border-slate-200 text-center space-y-3">
        <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center mx-auto">
          <User size={22} />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900">Sign In Required</h2>
          <p className="text-xs text-slate-500">
            Please log in to view your user profile and access saved case law bookmarks.
          </p>
        </div>
        <Link 
          to="/login"
          className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <span>Log In</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-8 space-y-6">
      
      {/* CONCEPT 2: MINIMALIST ACCOUNT HEADER */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {/* Avatar Initial Circle */}
          <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center flex-shrink-0">
            {user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 capitalize">
                {user.name || 'Legal Practitioner'}
              </h1>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {user.mobile || 'Mobile Verified'}
            </p>
          </div>
        </div>

        {/* Minimal Log Out Button */}
        <button 
          onClick={handleLogout}
          className="text-xs font-semibold text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Log Out of Account"
        >
          <LogOut size={13} />
          <span>Log Out</span>
        </button>
      </div>

      {/* SAVED JUDGMENTS SECTION */}
      <div className="space-y-3.5 pt-1">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <Bookmark size={16} className="text-blue-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Saved Judgments ({savedCases.length})
            </h2>
          </div>
        </div>

        {savedCases.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-3">
            <Bookmark size={22} className="text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-700">No saved judgments</h3>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Bookmark judgments in the search portal to view them here.
              </p>
            </div>
            <Link 
              to="/search"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              <span>Go to Search</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        ) : (
          /* Concept 2: Minimalist Single Column List with Left Border */
          <div className="flex flex-col space-y-2.5">
            {savedCases.map((item, idx) => (
              <div 
                key={item.id || idx}
                className="group bg-white p-4 rounded-xl border border-slate-200 border-l-2 border-l-slate-300 hover:border-l-blue-600 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {item.citation || 'Official Citation'}
                    </span>
                    {item.court && (
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                        {item.court}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-xs text-slate-900 group-hover:text-blue-700 transition-colors leading-relaxed">
                    {item.title || `${item.petitioner || ''} vs ${item.respondent || ''}`}
                  </h3>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 justify-between sm:justify-end border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
                  <Link 
                    to={`/judgment/${item.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded hover:bg-blue-50 transition-colors"
                  >
                    <span>View Judgment</span>
                    <ArrowRight size={12} />
                  </Link>

                  <button 
                    onClick={() => handleRemoveSavedCase(item.id)}
                    className="text-slate-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                    title="Remove bookmark"
                  >
                    <Trash2 size={14} />
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
