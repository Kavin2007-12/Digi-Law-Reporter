import React, { useState } from 'react';
import { Search, Eye, Lock, Unlock, X } from 'lucide-react';
import { MOCK_USERS } from '../../data/adminMockData';

export default function AdminUsers() {
  const [usersList, setUsersList] = useState(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.mobile.includes(searchTerm)
  );

  const handleToggleUserStatus = (userId) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, status: u.status === 'Active' ? 'Disabled' : 'Active' };
      }
      return u;
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 font-jakarta text-[#0B1727]">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-200/80">
        <h1 className="text-3xl font-extrabold tracking-tight font-cinzel text-[#0B1727]">
          Users
        </h1>
        <p className="text-slate-500 text-xs font-medium mt-1">
          Manage users accessing the legal research portal
        </p>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name or mobile number..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary-600"
          />
        </div>
      </div>

      {/* Editorial Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-12 text-center">S.No</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400 font-semibold text-xs">
                    No matching users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, idx) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-center font-bold text-slate-500 text-xs">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#0B1727] whitespace-nowrap">
                      {u.name}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {u.mobile}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-semibold whitespace-nowrap">{u.joinedDate}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap">{u.lastLogin}</td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                        u.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-red-50 text-red-800 border-red-200'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full border border-slate-200 shadow-xl space-y-4 text-xs font-medium">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-[#0B1727]">{selectedUserDetail.name}</h3>
                <span className="font-mono text-xs font-bold text-slate-500">{selectedUserDetail.mobile}</span>
              </div>
              <button onClick={() => setSelectedUserDetail(null)} className="text-slate-400 hover:text-slate-900">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px]">Registration</span>
                <span className="font-bold text-slate-900">{selectedUserDetail.joinedDate}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px]">Last Login</span>
                <span className="font-bold text-slate-900">{selectedUserDetail.lastLogin}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px]">Saved Cases</span>
                <span className="font-bold text-slate-900">{selectedUserDetail.savedCasesCount}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px]">Status</span>
                <span className="font-bold text-slate-900">{selectedUserDetail.status}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button onClick={() => setSelectedUserDetail(null)} className="px-4 py-1.5 bg-[#0B1727] text-white rounded text-xs font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
