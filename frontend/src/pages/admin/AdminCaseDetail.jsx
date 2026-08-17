import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit3, Globe, Star, FileText, Download, Landmark, Calendar, Scale, Users, CheckCircle2, ShieldCheck } from 'lucide-react';
import { MOCK_CASES } from '../../data/adminMockData';

export default function AdminCaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const initialCase = MOCK_CASES.find(c => String(c.id) === String(id)) || MOCK_CASES[0];
  const [caseData, setCaseData] = useState(initialCase);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleTogglePublish = () => {
    const nextStatus = caseData.status === 'Published' ? 'Draft' : 'Published';
    setCaseData(prev => ({ ...prev, status: nextStatus }));
    showToast(`Case status updated to "${nextStatus}"`);
  };

  const handleToggleImportant = () => {
    setCaseData(prev => ({ ...prev, isImportant: !prev.isImportant }));
    showToast(caseData.isImportant ? 'Unmarked from important judgments' : 'Marked as Important Judgment');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 font-jakarta">
      
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/admin/cases')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200/90 rounded-xl text-slate-700 hover:text-primary-600 hover:border-primary-300 font-bold text-xs md:text-sm shadow-xs transition-all group self-start"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Cases</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleToggleImportant}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              caseData.isImportant 
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs' 
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Star size={15} className={caseData.isImportant ? 'text-amber-500 fill-amber-400' : 'text-slate-400'} />
            <span>{caseData.isImportant ? 'Marked Important' : 'Mark Important'}</span>
          </button>

          <button
            onClick={handleTogglePublish}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              caseData.status === 'Published'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-primary-50 text-primary-800 border-primary-300'
            }`}
          >
            <Globe size={15} />
            <span>{caseData.status === 'Published' ? 'Unpublish' : 'Publish Case'}</span>
          </button>

          <Link
            to={`/admin/cases/${caseData.id}/edit`}
            className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all active:scale-98"
          >
            <Edit3 size={15} />
            <span>Edit Case</span>
          </Link>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 px-3 py-1 rounded-lg border border-primary-100 uppercase">
            {caseData.caseNumber}
          </span>

          <span className={`px-3.5 py-1 rounded-full text-xs font-extrabold border ${
            caseData.status === 'Published'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {caseData.status}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-snug font-cinzel">
          {caseData.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-extrabold text-slate-600 pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1.5"><Landmark size={15} className="text-primary-600" /> {caseData.court}</span>
          <span className="flex items-center gap-1.5"><Calendar size={15} className="text-amber-600" /> Year: {caseData.year}</span>
          <span className="flex items-center gap-1.5"><FileText size={15} className="text-emerald-600" /> Citation: {caseData.citation}</span>
        </div>
      </div>

      {/* Grid: Details Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Parties & Bench Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Users size={16} className="text-primary-600" />
            <span>Parties & Coram Bench</span>
          </h2>
          
          <div className="space-y-3 text-xs md:text-sm">
            <div>
              <span className="text-slate-400 font-bold block text-[11px]">Petitioner</span>
              <span className="font-bold text-slate-900">{caseData.petitioner || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[11px]">Respondent</span>
              <span className="font-bold text-slate-900">{caseData.respondent || 'N/A'}</span>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-400 font-bold block text-[11px]">Coram / Bench</span>
              <span className="font-semibold text-slate-800">{caseData.bench || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Legal References & Timelines Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Scale size={16} className="text-primary-600" />
            <span>References & Key Dates</span>
          </h2>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-bold block text-[10px]">DLR Number</span>
              <span className="font-bold text-slate-900 font-mono">{caseData.dlrNumber || 'N/A'}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-bold block text-[10px]">Diary Number</span>
              <span className="font-bold text-slate-900 font-mono">{caseData.diaryNumber || 'N/A'}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-bold block text-[10px]">Filing Date</span>
              <span className="font-bold text-slate-900">{caseData.filingDate || 'N/A'}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-bold block text-[10px]">Judgment Date</span>
              <span className="font-bold text-slate-900">{caseData.judgmentDate || 'N/A'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Case Summary & Legal Issues */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-xs font-extrabold text-primary-700 uppercase tracking-wider mb-2">Executive Case Summary</h3>
          <p className="text-slate-800 text-sm md:text-base leading-relaxed font-normal">
            {caseData.summary}
          </p>
        </div>

        {caseData.issues && caseData.issues.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Framed Legal Issues</h3>
            <ul className="space-y-2 text-xs md:text-sm font-semibold text-slate-800 list-disc list-inside">
              {caseData.issues.map((issue, idx) => (
                <li key={idx}>{issue}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Judgment Text */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Verbatim Judgment Text</h3>
        <div className="whitespace-pre-line text-slate-800 text-xs md:text-sm font-normal leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200 font-mono">
          {caseData.judgmentText || 'No verbatim text attached.'}
        </div>
      </div>

      {/* Uploaded Documents */}
      {caseData.documents && caseData.documents.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Attached Court Documents</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {caseData.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-3 truncate">
                  <FileText size={20} className="text-primary-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 truncate">{doc.name}</p>
                    <span className="text-[10px] text-slate-400 font-medium">{doc.size}</span>
                  </div>
                </div>
                <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-colors">
                  <Download size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white font-bold text-xs md:text-sm px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
