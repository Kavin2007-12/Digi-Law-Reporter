import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, Eye, Edit3, Scale, Clock, Activity, FileText, Users } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  const [stats, setStats] = useState({
    totalCases: 0,
    publishedCases: 0,
    draftCases: 0,
    totalUsers: 3
  });

  const [recentCases, setRecentCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const casesRes = await fetch(`${API_BASE_URL}/cases`);
        const casesData = await casesRes.json();

        if (casesData.success && Array.isArray(casesData.data)) {
          const allCases = casesData.data;
          const published = allCases.filter(c => c.status === 'Published').length;
          const draft = allCases.filter(c => c.status === 'Draft').length;

          setStats(prev => ({
            ...prev,
            totalCases: allCases.length,
            publishedCases: published,
            draftCases: draft
          }));

          const recent = allCases.slice(0, 5).map(c => ({
            id: c.id,
            caseNumber: c.case_number || '',
            title: c.title || '',
            court: c.court || 'Supreme Court of India',
            judgmentDate: c.judgment_date ? new Date(c.judgment_date).toISOString().split('T')[0] : '',
            status: c.status || 'Published',
            citation: Array.isArray(c.citations) && c.citations.length > 0
              ? `${c.citations[0].year} (${c.citations[0].month}) DLR (${c.citations[0].court}) #${c.citations[0].number}`
              : '2026 (04) DLR (SC) #123'
          }));
          setRecentCases(recent);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16 font-jakarta text-[#0B1727]">
      
      {/* 1. Heading & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-cinzel text-[#0B1727]">
            Dashboard
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-1">
            Legal case research portal overview
          </p>
        </div>

        {/* Year and Month Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-white border border-slate-200 rounded-md px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary-600 cursor-pointer shadow-2xs"
          >
            <option value="">Year</option>
            {YEARS_LIST.map(yr => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>

          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white border border-slate-200 rounded-md px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary-600 cursor-pointer shadow-2xs"
          >
            <option value="">Month</option>
            {MONTHS_LIST.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Editorial Statistics Banner */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-8">
        
        {/* Total Cases */}
        <div className="space-y-1 pr-8 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <Scale size={16} className="text-primary-600" />
            <span>Total Cases</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-[#0B1727] font-cinzel">{stats.totalCases}</span>
            <span className="text-xs text-slate-400 font-medium">All case records</span>
          </div>
        </div>

        {/* Published Cases */}
        <div className="space-y-1 pr-8 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <Activity size={16} className="text-emerald-600" />
            <span>Published</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-[#0B1727] font-cinzel">{stats.publishedCases}</span>
            <span className="text-xs text-slate-400 font-medium">Available to users</span>
          </div>
        </div>

        {/* Draft Cases */}
        <div className="space-y-1 pr-8 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <FileText size={16} className="text-amber-600" />
            <span>Draft</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-[#0B1727] font-cinzel">{stats.draftCases}</span>
            <span className="text-xs text-slate-400 font-medium">Awaiting publication</span>
          </div>
        </div>

        {/* Action Button: Add New Case */}
        <div className="pt-2 md:pt-0 shrink-0">
          <Link
            to="/admin/cases/add"
            className="px-5 py-3 bg-[#0B1727] hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus size={16} />
            <span>Add New Case</span>
          </Link>
        </div>
      </div>

      {/* 3. Recent Cases Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-200/80 flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#0B1727]">
            Recent Legal Precedent Activity
          </h2>
          <Link
            to="/admin/cases"
            className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
          >
            <span>View All Cases</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 font-medium text-xs">
            Loading recent precedent activity...
          </div>
        ) : recentCases.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-medium text-xs">
            No precedent activity recorded yet. Click "+ Add New Case" to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 w-12 text-center">S.No</th>
                  <th className="py-3 px-4">Case Details</th>
                  <th className="py-3 px-4">Citation</th>
                  <th className="py-3 px-4">Court</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentCases.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {c.title}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {c.citation}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {c.court}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {c.judgmentDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        c.status === 'Published'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/admin/cases/edit/${c.id}`}
                        className="inline-flex items-center gap-1 p-1 text-slate-400 hover:text-amber-600 rounded"
                        title="Edit Case"
                      >
                        <Edit3 size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
