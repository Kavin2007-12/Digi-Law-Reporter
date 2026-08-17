import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronLeft, ChevronRight, AlertTriangle, Eye, Edit3, Trash2 } from 'lucide-react';
import { MOCK_CASES } from '../../data/adminMockData';

// Generates 227 years from 2026 down to 1800
const YEARS_LIST = Array.from({ length: 2026 - 1800 + 1 }, (_, i) => 2026 - i);

// 12 Months
const MONTHS_LIST = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
];

export default function AdminCases() {
  const navigate = useNavigate();
  const [casesList, setCasesList] = useState(MOCK_CASES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedCourt, setSelectedCourt] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalCase, setDeleteModalCase] = useState(null);

  const itemsPerPage = 5;

  const filteredCases = casesList.filter(c => {
    const matchesSearch = 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.citation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.petitioner.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !selectedStatus || c.status === selectedStatus;
    const matchesYear = !selectedYear || String(c.year) === String(selectedYear);
    const matchesCourt = !selectedCourt || c.court === selectedCourt;

    return matchesSearch && matchesStatus && matchesYear && matchesCourt;
  });

  const totalPages = Math.ceil(filteredCases.length / itemsPerPage) || 1;
  const paginatedCases = filteredCases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDeleteCase = () => {
    if (deleteModalCase) {
      setCasesList(prev => prev.filter(c => c.id !== deleteModalCase.id));
      setDeleteModalCase(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 font-jakarta text-[#0B1727]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-cinzel text-[#0B1727]">
            Case Records
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-1">
            Manage, publish, and review legal case judgments
          </p>
        </div>

        <Link
          to="/admin/cases/add"
          className="px-4 py-2.5 bg-[#0B1727] hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs shrink-0"
        >
          <Plus size={16} />
          <span>Add Case Record</span>
        </Link>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        
        {/* Filters Header Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/40 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search cases by case number, title, citation, party name..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary-600"
            />
          </div>

          {/* Filter Dropdowns (1800 - 2026) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Year Dropdown (1800 - 2026) */}
            <select
              value={selectedYear}
              onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}
              className="bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary-600 cursor-pointer"
            >
              <option value="">Year</option>
              {YEARS_LIST.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>

            {/* Month Dropdown */}
            <select
              value={selectedMonth}
              onChange={(e) => { setSelectedMonth(e.target.value); setCurrentPage(1); }}
              className="bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary-600 cursor-pointer"
            >
              <option value="">Month</option>
              {MONTHS_LIST.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary-600 cursor-pointer"
            >
              <option value="">Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>

            {/* Court Filter */}
            <select
              value={selectedCourt}
              onChange={(e) => { setSelectedCourt(e.target.value); setCurrentPage(1); }}
              className="bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary-600 cursor-pointer"
            >
              <option value="">Court</option>
              <option value="Supreme Court of India">Supreme Court</option>
              <option value="Delhi High Court">Delhi High Court</option>
              <option value="Bombay High Court">Bombay High Court</option>
            </select>
          </div>

        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 w-12 text-center">S.No</th>
                <th className="py-3 px-4">Case Details</th>
                <th className="py-3 px-4">Citation & Bench</th>
                <th className="py-3 px-4">Court</th>
                <th className="py-3 px-4">Judgment Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No case records found matching the search criteria.
                  </td>
                </tr>
              ) : (
                paginatedCases.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-center font-bold text-slate-500 text-xs">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-[#0B1727] truncate">{c.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{c.caseNumber}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-xs font-semibold text-primary-700">{c.citation || 'Unassigned'}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[160px]">{c.bench || 'Bench info N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{c.court}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {c.judgmentDate || `${c.year}-01-01`}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                        c.status === 'Published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/admin/cases/edit/${c.id}`)}
                        className="text-slate-600 hover:text-primary-600 font-bold hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteModalCase(c)}
                        className="text-red-600 hover:text-red-800 font-bold hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">{filteredCases.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, filteredCases.length)}</span> of <span className="font-bold text-slate-800">{filteredCases.length}</span> cases
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 font-semibold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* Delete Case Confirmation Modal */}
      {deleteModalCase && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle size={24} />
              <h3 className="text-base font-extrabold">Confirm Delete Case</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete case record <span className="font-bold text-slate-900">"{deleteModalCase.title}"</span> ({deleteModalCase.caseNumber})? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModalCase(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCase}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded transition-colors cursor-pointer"
              >
                Delete Case Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
