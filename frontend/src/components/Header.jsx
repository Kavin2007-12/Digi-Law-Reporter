import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Shield } from 'lucide-react';

export default function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/');
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
           
           {/* Left: Original Logo Image */}
           <div className="flex items-center">
             <Link to="/" className="cursor-pointer flex items-center">
               <img 
                 src="/logo/digital_law_reporter.png" 
                 alt="Digital Law Reporter" 
                 className="h-8 md:h-9 object-contain" 
               />
             </Link>
           </div>

           {/* Right: Nav Links (Home, About, Contact) & Actions (Login, Admin) */}
           <div className="flex items-center space-x-6 md:space-x-8">
             {!isAuthPage && (
               <nav className="hidden md:flex items-center space-x-5 lg:space-x-6">
                 {navItems.map((item) => {
                   const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/');
                   return (
                     <Link
                       key={item.path}
                       to={item.path}
                       className={`relative text-sm transition-colors py-1 border-b-2 ${
                         isActive 
                           ? 'text-primary-700 font-bold border-primary-600' 
                           : 'text-slate-700 font-semibold border-transparent hover:text-primary-600 hover:border-primary-400/30'
                       }`}
                     >
                       {item.label}
                     </Link>
                   );
                 })}
               </nav>
             )}

              {/* Right Action Buttons: Login & Admin */}
              {!isAuthPage && (
                user ? (
                  <div className="flex items-center gap-3">
                    {/* 1. Distinct User Profile Box */}
                    <Link 
                      to="/search"
                      className="flex items-center gap-2.5 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/90 px-3.5 py-1.5 rounded-2xl transition-all shadow-2xs group cursor-pointer"
                      title={`Logged in as ${user.name || 'User'} - Click to open Search Portal`}
                    >
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="text-blue-700 group-hover:text-blue-800 font-bold text-xs md:text-sm capitalize">
                        {user.name ? user.name.split(' ')[0] : 'User'}
                      </span>
                    </Link>

                    {/* 2. Distinct Search Portal Box (Hidden ONLY on /search page) */}
                    {location.pathname !== '/search' && (
                      <Link 
                        to="/search" 
                        className="flex items-center gap-2 bg-blue-100/90 hover:bg-blue-200/90 border border-blue-200/90 text-blue-700 px-3.5 py-1.5 rounded-2xl transition-all shadow-2xs group cursor-pointer"
                        title="Click to go to Legal Search Portal"
                      >
                        <span className="text-blue-700 font-extrabold text-[11px] md:text-xs tracking-wider">
                          SEARCH PORTAL
                        </span>
                      </Link>
                    )}

                    {/* Logout Button */}
                    <button 
                      onClick={handleLogout} 
                      className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-colors ml-0.5"
                      title="Logout"
                    >
                      <LogOut size={17} />
                    </button>
                  </div>
                ) : (
                 <div className="flex items-center space-x-3">
                   <Link 
                     to="/login" 
                     className="border border-slate-300 text-slate-800 hover:text-primary-600 hover:border-primary-500 hover:bg-primary-50/50 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-sm"
                   >
                     <User size={16} className="text-primary-600" />
                     <span>Login</span>
                   </Link>
                    <button 
                      onClick={() => {
                        localStorage.setItem('adminAuth', 'true');
                        navigate('/admin/dashboard');
                      }}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-primary-500/25 cursor-pointer"
                      title="Open Admin Dashboard"
                    >
                      <Shield size={16} className="text-white" />
                      <span>Admin</span>
                    </button>
                 </div>
               )
             )}
           </div>

        </div>
      </div>
    </header>
  );
}






