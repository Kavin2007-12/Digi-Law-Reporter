import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, Eye, Edit3, Scale, Clock, Activity, FileText } from 'lucide-react';
import { MOCK_STATS, MOCK_CASES, MOCK_RECENT_ACTIVITY } from '../../data/adminMockData';

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

        {/* Year and Month Dropdown Filters Placed Side-by-Side */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Year Dropdown (1800 - 2026) */}
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

          {/* Month Dropdown (12 Months) */}
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
        
        {/* Main Stat: Total Cases */}
        <div className="space-y-1 pr-8 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <Scale size={16} className="text-primary-600" />
            <span>Total Cases</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-[#0B1727] font-cinzel">{MOCK_STATS.totalCases}</span>
            <span className="text-xs text-slate-400 font-medium">{MOCK_STATS.totalCasesSub}</span>
          </div>
        </div>

        {/* Published Cases */}
        <div className="space-y-1 pr-8 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <Activity size={16} className="text-emerald-600" />
            <span>Published</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-[#0B1727] font-cinzel">{MOCK_STATS.publishedCases}</span>
            <span className="text-xs text-slate-400 font-medium">{MOCK_STATS.publishedCasesSub}</span>
          </div>
        </div>

        {/* Draft Cases */}
        <div className="space-y-1 pr-8 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <FileText size={16} className="text-amber-600" />
            <span>Draft</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-[#0B1727] font-cinzel">{MOCK_STATS.draftCases}</span>
            <span className="text-xs text-slate-400 font-medium">{MOCK_STATS.draftCasesSub}</span>
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

      {/* 3. Two-Column Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Recent Activity Feed */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-[#0B1727]">Recent Activity Log</h2>
              <p className="text-xs text-slate-500 font-medium">Real-time system events & case updates</p>
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
              0 New Events
            </span>
          </div>

          {MOCK_RECENT_ACTIVITY.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium space-y-2">
              <Clock size={28} className="mx-auto text-slate-300 stroke-1" />
              <p>No recent case activities reported.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {MOCK_RECENT_ACTIVITY.map((act) => (
                <div key={act.id} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Activity size={15} />
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#0B1727] truncate">{act.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">{act.desc}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">{act.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Quick Admin Links */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-[#0B1727]">Quick Actions</h2>
            <p className="text-xs text-slate-500 font-medium">Common administrative workflows</p>
          </div>

          <div className="space-y-3">
            <Link
              to="/admin/cases/add"
              className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-lg text-xs font-bold text-[#0B1727] transition-all border border-slate-200/60 group"
            >
              <span className="flex items-center gap-2.5">
                <Plus size={15} className="text-primary-600" />
                <span>Create Case Record</span>
              </span>
              <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/admin/cases"
              className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-lg text-xs font-bold text-[#0B1727] transition-all border border-slate-200/60 group"
            >
              <span className="flex items-center gap-2.5">
                <Eye size={15} className="text-slate-600" />
                <span>Browse All Cases</span>
              </span>
              <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/admin/settings"
              className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-lg text-xs font-bold text-[#0B1727] transition-all border border-slate-200/60 group"
            >
              <span className="flex items-center gap-2.5">
                <Edit3 size={15} className="text-slate-600" />
                <span>Portal Settings</span>
              </span>
              <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
