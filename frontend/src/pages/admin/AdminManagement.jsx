import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Lock, Trash2, X, AlertTriangle, CheckCircle2, Eye, EyeOff, Key } from 'lucide-react';

const INITIAL_MOCK_ADMINS = [
  { id: '1', name: 'Main Admin', username: 'mainadmin', role: 'MAIN_ADMIN', password: 'mainpassword123' },
  { id: '2', name: 'John Admin', username: 'johnadmin', role: 'EXTRA_ADMIN', password: 'johnpassword123' },
  { id: '3', name: 'Kumar Admin', username: 'kumaradmin', role: 'EXTRA_ADMIN', password: 'kumarpassword123' }
];

export default function AdminManagement() {
  const navigate = useNavigate();

  // Get logged-in role (defaults to MAIN_ADMIN for demonstration)
  const currentRole = localStorage.getItem('adminRole') || 'MAIN_ADMIN';

  // Persisted Admins List State
  const [adminsList, setAdminsList] = useState(() => {
    try {
      const saved = localStorage.getItem('digi_mock_admins');
      return saved ? JSON.parse(saved) : INITIAL_MOCK_ADMINS;
    } catch (e) {
      return INITIAL_MOCK_ADMINS;
    }
  });

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [adminToRemove, setAdminToRemove] = useState(null);
  
  // View / Edit Password Modal State
  const [adminToEditPassword, setAdminToEditPassword] = useState(null);
  const [editedPassword, setEditedPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);

  // Add Form State (ONLY Name, Username, Password)
  const [newAdminData, setNewAdminData] = useState({
    name: '',
    username: '',
    password: ''
  });

  const [toastMessage, setToastMessage] = useState('');

  // Access Security Check: Redirect EXTRA_ADMIN to /admin/dashboard
  useEffect(() => {
    if (currentRole !== 'MAIN_ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [currentRole, navigate]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSaveAdmins = (updated) => {
    setAdminsList(updated);
    try {
      localStorage.setItem('digi_mock_admins', JSON.stringify(updated));
    } catch (e) {}
  };

  // Handle Add Admin Form Submission
  const handleCreateAdmin = (e) => {
    e.preventDefault();

    if (!newAdminData.name.trim() || !newAdminData.username.trim() || !newAdminData.password.trim()) {
      showToast("Please fill out all fields.");
      return;
    }

    // Check duplicate username
    const usernameExists = adminsList.some(
      a => a.username.toLowerCase() === newAdminData.username.trim().toLowerCase()
    );
    if (usernameExists) {
      showToast("This username already exists.");
      return;
    }

    const createdAdmin = {
      id: Date.now().toString(),
      name: newAdminData.name.trim(),
      username: newAdminData.username.trim().toLowerCase(),
      password: newAdminData.password.trim(),
      role: 'EXTRA_ADMIN' // Automatically EXTRA_ADMIN
    };

    const updatedList = [...adminsList, createdAdmin];
    handleSaveAdmins(updatedList);

    setNewAdminData({ name: '', username: '', password: '' });
    setIsAddModalOpen(false);
    showToast(`Created extra administrator "${createdAdmin.name}"`);
  };

  // Open Edit Password Modal
  const handleOpenEditPassword = (admin) => {
    setAdminToEditPassword(admin);
    setEditedPassword(admin.password || 'password123');
    setShowPasswordText(false);
  };

  // Save Password Change
  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!adminToEditPassword) return;

    if (!editedPassword.trim()) {
      showToast("Password cannot be empty.");
      return;
    }

    const updatedList = adminsList.map(a => {
      if (a.id === adminToEditPassword.id) {
        return { ...a, password: editedPassword.trim() };
      }
      return a;
    });

    handleSaveAdmins(updatedList);
    showToast(`Updated password for "${adminToEditPassword.name}"`);
    setAdminToEditPassword(null);
  };

  // Handle Remove Admin Action
  const handleConfirmRemove = () => {
    if (!adminToRemove) return;
    if (adminToRemove.role === 'MAIN_ADMIN') return; // Double protection

    const updatedList = adminsList.filter(a => a.id !== adminToRemove.id);
    handleSaveAdmins(updatedList);
    showToast(`Removed administrator "${adminToRemove.name}"`);
    setAdminToRemove(null);
  };

  if (currentRole !== 'MAIN_ADMIN') {
    return null; // Don't render while redirecting
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 font-jakarta text-[#0B1727]">
      
      {/* ========================================================================= */}
      {/* 1. PAGE TITLE & TOP-RIGHT [+ ADD ADMIN] BUTTON */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-cinzel text-[#0B1727]">
            Manage Admins
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Manage administrator accounts and access privileges
          </p>
        </div>

        {/* Top-Right Add Admin Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 bg-[#0B1727] hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
        >
          <Plus size={16} />
          <span>+ Add Admin</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. ADMINS TABLE (Clean, Simple, Professional with Password View/Edit) */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-5 w-16 text-center">S.No</th>
                <th className="py-3.5 px-5">Admin Name</th>
                <th className="py-3.5 px-5">Username</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {adminsList.map((admin, idx) => {
                const isMainAdmin = admin.role === 'MAIN_ADMIN' || idx === 0;

                return (
                  <tr key={admin.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* S.No */}
                    <td className="py-4 px-5 text-center font-bold text-slate-500 text-xs">
                      {idx + 1}
                    </td>

                    {/* Admin Name */}
                    <td className="py-4 px-5 font-bold text-[#0B1727]">
                      <div className="flex items-center gap-2">
                        <span>{admin.name}</span>
                        {isMainAdmin && (
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded border border-blue-200">
                            MAIN ADMIN
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Username */}
                    <td className="py-4 px-5 font-mono text-slate-600 font-medium">
                      {admin.username}
                    </td>

                    {/* Action Column */}
                    <td className="py-4 px-5 text-right whitespace-nowrap font-bold text-xs">
                      {isMainAdmin ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditPassword(admin)}
                            className="inline-flex items-center gap-1 text-slate-700 hover:text-blue-700 hover:bg-slate-100 px-2.5 py-1 rounded transition-colors cursor-pointer"
                            title="View / Edit Password"
                          >
                            <Key size={13} className="text-slate-600" />
                            <span>Edit Password</span>
                          </button>

                          <span className="inline-flex items-center gap-1.5 text-slate-400 text-xs font-semibold px-2.5 py-1 rounded bg-slate-100/70 border border-slate-200">
                            <Lock size={12} className="text-slate-500" />
                            <span>Protected</span>
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {/* View & Edit Password Button */}
                          <button
                            onClick={() => handleOpenEditPassword(admin)}
                            className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 hover:bg-blue-50 px-2.5 py-1 rounded transition-colors cursor-pointer"
                            title="View and Edit Password"
                          >
                            <Key size={13} />
                            <span>Edit Password</span>
                          </button>

                          {/* Remove Button */}
                          <button
                            onClick={() => setAdminToRemove(admin)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1 rounded transition-colors cursor-pointer"
                            title="Remove Extra Admin"
                          >
                            <Trash2 size={13} />
                            <span>Remove</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ADD ADMIN MODAL */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0B1727]">Add Admin</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admin Name
                </label>
                <input
                  type="text"
                  required
                  value={newAdminData.name}
                  onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                  placeholder="e.g. John Admin"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={newAdminData.username}
                  onChange={(e) => setNewAdminData({ ...newAdminData, username: e.target.value })}
                  placeholder="e.g. johnadmin"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={newAdminData.password}
                  onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                  placeholder="Enter admin password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B1727] hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-all shadow-xs cursor-pointer"
                >
                  Create Admin
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. VIEW & EDIT PASSWORD MODAL */}
      {/* ========================================================================= */}
      {adminToEditPassword && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Key className="text-blue-600" size={18} />
                <h3 className="text-base font-bold text-[#0B1727]">View & Edit Password</h3>
              </div>
              <button 
                onClick={() => setAdminToEditPassword(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1">
                <div className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Account Details</div>
                <div className="text-xs font-bold text-[#0B1727]">{adminToEditPassword.name}</div>
                <div className="text-xs font-mono text-slate-500">Username: @{adminToEditPassword.username}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswordText ? "text" : "password"}
                    required
                    value={editedPassword}
                    onChange={(e) => setEditedPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3.5 pr-10 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title={showPasswordText ? "Hide password text" : "Reveal password text"}
                  >
                    {showPasswordText ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdminToEditPassword(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B1727] hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-all shadow-xs cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. REMOVE ADMIN CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      {adminToRemove && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95">
            
            <div className="flex items-center gap-2 text-red-600 font-bold">
              <AlertTriangle size={18} />
              <h3 className="text-base font-bold text-slate-900">Remove this admin?</h3>
            </div>

            <p className="text-slate-600 text-xs leading-relaxed">
              Are you sure you want to remove this administrator (<strong className="text-slate-900 font-bold">{adminToRemove.name}</strong>)?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAdminToRemove(null)}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleConfirmRemove}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition-all shadow-xs cursor-pointer"
              >
                Remove
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1727] text-white font-bold text-xs px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}