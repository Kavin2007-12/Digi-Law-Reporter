import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Printer, Landmark, Calendar, FileText, Check, Bookmark, BookmarkCheck } from 'lucide-react';

const DUMMY_JUDGMENTS = {
  '1': {
    id: '1',
    title: 'State of Tamil Nadu vs. Ramesh Kumar & Ors.',
    court: 'Supreme Court of India',
    date: '15 April 2024',
    citation: '2024 INSC 512 | (2024) 4 SCC 321',
    judges: ['Hon\'ble Mr. Justice R. Subramanian', 'Hon\'ble Mrs. Justice B.V. Nagarathna'],
    headnote: 'Quashing of Criminal Proceedings under Section 482 CrPC - Scope of judicial intervention when dispute is predominantly of commercial/civil nature.',
    content: `
      1. Leave granted.
      2. This appeal arises out of a judgment and order passed by the High Court of Judicature at Madras under Section 482 of the Code of Criminal Procedure, 1973.
      3. Ratio Decidendi: The Supreme Court held that where the dispute between parties is predominantly of a civil or commercial transaction, criminal proceedings cannot be allowed to be used as an instrument of harassment or pressure tactic.
      4. The impugned proceedings before the trial court are hereby quashed.
      5. The appeal is allowed accordingly.
    `
  }
};

export default function Judgment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [savedCaseIds, setSavedCaseIds] = useState(() => {
    try {
      const saved = localStorage.getItem('digi_saved_cases');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Use dummy data for id 1, or fallback to a default structure
  const data = DUMMY_JUDGMENTS[id] || {
    id: id || '1',
    title: 'State of Tamil Nadu vs. Ramesh Kumar & Ors.',
    court: 'Supreme Court of India',
    date: '15 April 2024',
    citation: '2024 INSC 512 | (2024) 4 SCC 321',
    judges: ['Hon\'ble Mr. Justice R. Subramanian'],
    headnote: 'Quashing of Criminal Proceedings under Section 482 CrPC - Scope of judicial intervention.',
    content: '1. Leave granted.\n2. The appeal is allowed.'
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3200);
  };

  const handleToggleSaveCase = () => {
    const caseId = String(data.id || id || '1');
    let updated;
    if (savedCaseIds.includes(caseId)) {
      updated = savedCaseIds.filter(i => i !== caseId);
      showToast(`Removed "${data.title.substring(0, 30)}..." from saved cases`);
    } else {
      updated = [...savedCaseIds, caseId];
      showToast(`Saved "${data.title.substring(0, 30)}..." to your research library`);
    }
    setSavedCaseIds(updated);
    try {
      localStorage.setItem('digi_saved_cases', JSON.stringify(updated));
    } catch (err) {}
  };

  const handleDownloadCase = () => {
    const docContent = `
================================================================================
DIGI LAW REPORTER - OFFICIAL VERIFIED JUDGMENT RECORD
================================================================================

TITLE: ${data.title}
COURT: ${data.court}
DATE: ${data.date}
CITATION: ${data.citation}
BENCH: ${data.judges ? data.judges.join(', ') : 'N/A'}

--------------------------------------------------------------------------------
HEADNOTE & RATIO DECIDENDI
--------------------------------------------------------------------------------
${data.headnote || 'N/A'}

--------------------------------------------------------------------------------
FULL JUDGMENT TEXT
--------------------------------------------------------------------------------
${data.content || 'N/A'}

================================================================================
VERIFIED BY DIGI LAW REPORTER DIGITAL LEGAL DIGEST
================================================================================
`;
    const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const sanitizedTitle = (data.title || 'Judgment').replace(/[^a-zA-Z0-9]/g, '_');
    link.href = url;
    link.download = `Judgment_${sanitizedTitle}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Downloaded judgment text record successfully`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSaved = savedCaseIds.includes(String(data.id || id || '1'));

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-jakarta">
      
      {/* Top Nav */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-sm mb-6 transition-colors print:hidden"
      >
        <ArrowLeft size={16} /> Back to Results
      </button>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 print:hidden">
        <div className="flex items-center gap-3">
          {/* Download Button */}
          <button 
            onClick={handleDownloadCase}
            className="flex items-center gap-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
          >
            <Download size={16} /> Download Case
          </button>

          {/* Save Case Button */}
          <button 
            onClick={handleToggleSaveCase}
            className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-all border ${
              isSaved
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck size={16} className="text-emerald-600" /> Saved
              </>
            ) : (
              <>
                <Bookmark size={16} /> Save Case
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3 relative">
          <button 
            onClick={handleShare}
            className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors tooltip-trigger flex items-center justify-center relative" 
            title="Share"
          >
            {copied ? <Check size={20} className="text-green-500" /> : <Share2 size={20} />}
            {copied && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
                Link copied!
              </span>
            )}
          </button>
          <button 
            onClick={() => window.print()}
            className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors tooltip-trigger" 
            title="Print"
          >
            <Printer size={20} />
          </button>
        </div>
      </div>

      {/* Judgment Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none print:rounded-none">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-200 bg-slate-50/50 print:bg-white print:border-none print:p-0 print:pb-6 print:mb-6 print:break-inside-avoid">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 leading-snug">
            {data.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-bold text-slate-600">
            <span className="flex items-center gap-2"><Landmark size={16} className="text-blue-600 print:text-slate-800" /> {data.court}</span>
            <span className="flex items-center gap-2"><Calendar size={16} className="text-orange-600 print:text-slate-800" /> {data.date}</span>
            <span className="flex items-center gap-2"><FileText size={16} className="text-green-600 print:text-slate-800" /> Citation: {data.citation}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Coram:</span>
            <div className="mt-1 font-semibold text-slate-800">
              {data.judges.join(', ')}
            </div>
          </div>
        </div>

        {/* Headnote */}
        <div className="p-6 md:p-8 bg-blue-50/50 border-b border-slate-200 print:bg-white print:border-none print:p-0 print:pb-6 print:mb-6 print:break-inside-avoid">
          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2 print:text-slate-800">Headnote / Summary</h3>
          <p className="text-slate-700 leading-relaxed font-medium text-sm md:text-base text-justify">
            {data.headnote}
          </p>
        </div>

        {/* Full Text */}
        <div className="p-6 md:p-8 print:p-0">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 print:text-slate-800">Judgment</h3>
          <div className="prose prose-slate max-w-none">
            {data.content.split('\n').map((paragraph, idx) => (
              paragraph.trim() && (
                <p key={idx} className="mb-4 text-slate-800 leading-relaxed text-base md:text-lg text-justify print:break-inside-avoid">
                  {paragraph}
                </p>
              )
            ))}
          </div>
        </div>

      </div>

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white font-bold text-xs md:text-sm px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3">
          <Check size={18} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
