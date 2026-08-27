import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Search from './pages/Search';
import Judgment from './pages/Judgment';
import Login from './pages/Login';
import Signup from './pages/Signup';
import KeywordSearch from './pages/KeywordSearch';
import Contact from './pages/Contact';

import SearchResults from './pages/SearchResults';
import AdminLogin from './pages/admin/AdminLogin';
import AdminResetPassword from './pages/admin/AdminResetPassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCases from './pages/admin/AdminCases';
import AdminCaseForm from './pages/admin/AdminCaseForm';
import AdminCaseDetail from './pages/admin/AdminCaseDetail';
import AdminDraftCases from './pages/admin/AdminDraftCases';
import AdminPublishedCases from './pages/admin/AdminPublishedCases';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminManagement from './pages/admin/AdminManagement';
import AdminLayout from './components/admin/AdminLayout';
import MobileApp from './mobile/MobileApp';

function App() {
  const location = useLocation();
  const isMobilePort = window.location.port === '5174';

  if (isMobilePort) {
    return <MobileApp />;
  }
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const hideFooter = isAuthPage || location.pathname.startsWith('/search') || location.pathname.startsWith('/admin');
  const hideHeader = location.pathname.startsWith('/admin') || location.pathname.startsWith('/search/results');

  // Automatically scroll to top on page navigation without scroll locking
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-slate-900 font-sans relative selection:bg-primary-200 selection:text-primary-900 flex flex-col print:bg-white w-full max-w-full overflow-x-hidden">
      {/* Premium Background Glows & Grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 print:hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-200/30 blur-[120px]"></div>
         <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/20 blur-[120px]"></div>
         <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] rounded-full bg-indigo-100/40 blur-[120px]"></div>
         <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.15 }}></div>
      </div>
      
      <div className="relative z-10 flex flex-col flex-1 min-h-full">
        {!hideHeader && <Header />}
        
        <main className="flex-1 w-full flex flex-col">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/search" element={<Search />} />
            <Route path="/search/keyword" element={<KeywordSearch />} />
            <Route path="/search/results" element={<SearchResults />} />
            <Route path="/judgment/:id" element={<Judgment />} />
            
            {/* Admin Auth */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/reset-password" element={<AdminResetPassword />} />
            
            {/* Admin Dashboard Routes (Strictly Dashboard, Cases, Users, Settings) */}
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/cases" element={<AdminCases />} />
              <Route path="/admin/cases/add" element={<AdminCaseForm />} />
              <Route path="/admin/cases/edit/:id" element={<AdminCaseForm />} />
              <Route path="/admin/cases/draft" element={<AdminDraftCases />} />
              <Route path="/admin/cases/published" element={<AdminPublishedCases />} />
              <Route path="/admin/cases/:id/edit" element={<AdminCaseForm />} />
              <Route path="/admin/cases/:id" element={<AdminCaseDetail />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/users/:id" element={<AdminUsers />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/manage-admin" element={<AdminManagement />} />
            </Route>
          </Routes>
        </main>

        {!hideFooter && <Footer />}
      </div>
    </div>
  );
}
export default App;
