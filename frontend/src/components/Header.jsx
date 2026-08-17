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
                       className={`relative text-sm transition-colors py-1 ${
                         isActive 
                           ? 'text-primary-700 font-bold border-b-2 border-primary-600' 
                           : 'text-slate-700 font-semibold hover:text-primary-600'
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
                 <div className="flex items-center gap-2">
                   {/* Clickable Profile Badge navigating to /search */}
                   <Link 
                     to="/search" 
                     className="flex items-center gap-2.5 bg-slate-100 hover:bg-primary-50 border border-slate-200 hover:border-primary-300 px-3.5 py-2 rounded-xl transition-all shadow-sm group cursor-pointer"
                     title="Click to go to Legal Search Dashboard"
                   >
                     <div className="w-7 h-7 rounded-full bg-primary-600 text-white font-bold text-xs flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                       {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                     </div>
                     <span className="text-slate-800 group-hover:text-primary-700 font-bold text-xs md:text-sm">
                       {user.name.split(' ')[0]}
                     </span>
                     <span className="bg-primary-100 text-primary-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md hidden sm:inline-block">
                       SEARCH PORTAL
                     </span>
                   </Link>

                   <button 
                     onClick={handleLogout} 
                     className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
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






