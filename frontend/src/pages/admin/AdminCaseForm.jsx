import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, CheckCircle2, X, Plus } from 'lucide-react';
import { MOCK_CASES } from '../../data/adminMockData';
import TiptapEditor from '../../components/admin/TiptapEditor';

export default function AdminCaseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    caseNumber: '',
    title: '',
    petitioner: '',
    respondent: '',
    court: 'Supreme Court of India',
    year: '2026',
    judgmentDate: '2026-04-12',
    bench: '',

    diaryNumber: '',
    act: '',
    section: '',

    summary: '',
    issues: '',
    importantPoints: '',
    judgmentText: '',

    status: 'Published',
    uploadedFiles: []
  });

  // Citation Builder State
  const [citationInput, setCitationInput] = useState({
    year: '',
    month: '',
    court: '',
    number: '',
    equivalentText: ''
  });

  const [citationsList, setCitationsList] = useState([]);

  const [toastMessage, setToastMessage] = useState('');

  // Initial load
  useEffect(() => {
    if (isEditing) {
      const existing = MOCK_CASES.find(c => String(c.id) === String(id));
      if (existing) {
        setFormData({
          caseNumber: existing.caseNumber || '',
          title: existing.title || '',
          petitioner: existing.petitioner || '',
          respondent: existing.respondent || '',
          court: existing.court || 'Supreme Court of India',
          year: existing.year || '2026',
          bench: existing.bench || '',

          diaryNumber: existing.diaryNumber || '',
          act: existing.act || '',
          section: existing.section || '',

          summary: existing.summary || '',
          issues: existing.issues ? existing.issues.join('\n') : '',
          importantPoints: existing.importantPoints ? existing.importantPoints.join('\n') : '',
          judgmentText: existing.judgmentText || '',

          status: existing.status || 'Published',
          uploadedFiles: existing.documents || []
        });

        if (existing.citation || existing.dlrNumber) {
          setCitationsList([
            {
              id: Date.now(),
              year: existing.year || '2026',
              month: '04',
              court: 'SC',
              number: '123',
              equivalentText: existing.citation || '2026 INSC 810'
            }
          ]);
        }
      }
    }
  }, [id, isEditing]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddCitation = () => {
    if (!citationInput.year.trim() && !citationInput.court.trim() && !citationInput.equivalentText.trim()) return;

    const newCit = {
      id: Date.now(),
      ...citationInput
    };
    setCitationsList(prev => [...prev, newCit]);

    // Reset citation input fields to blank
    setCitationInput({
      year: '',
      month: '',
      court: '',
      number: '',
      equivalentText: ''
    });
  };

  const handleRemoveCitation = (citId) => {
    setCitationsList(prev => prev.filter(c => c.id !== citId));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newDocs = files.map((f, i) => ({
      id: Date.now() + i,
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      type: "Judgment PDF",
      date: "Today"
    }));
    setFormData(prev => ({ ...prev, uploadedFiles: [...prev.uploadedFiles, ...newDocs] }));
  };

  const handleRemoveFile = (fileId) => {
    setFormData(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter(f => f.id !== fileId)
    }));
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
      navigate('/admin/cases');
    }, 1500);
  };

  const handleSave = (targetStatus) => {
    showToast(isEditing ? `Case record updated as "${targetStatus}"` : `New case record saved as "${targetStatus}"`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 font-jakarta text-[#0B1727]">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
        <button
          onClick={() => navigate('/admin/cases')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft size={15} />
          <span>Back to Cases</span>
        </button>

        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          {isEditing ? `Edit Case #${id}` : 'Legal Document Record Form'}
        </span>
      </div>

      {/* Form Title & Top Right Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-cinzel text-[#0B1727]">
            {isEditing ? 'Edit Legal Case Record' : 'Add Case Record'}
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-1">
            Enter legal precedent information into the editorial research index.
          </p>
        </div>

        {/* TOP RIGHT ACTION BUTTONS (Matching User Screenshot) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/admin/cases')}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 font-bold border border-slate-300 rounded-lg text-xs transition-all shadow-2xs cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => handleSave('Draft')}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 font-bold border border-slate-300 rounded-lg text-xs transition-all shadow-2xs cursor-pointer"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => handleSave('Published')}
            className="px-5 py-2 bg-[#0B1727] hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-all shadow-xs cursor-pointer"
          >
            {isEditing ? 'Update Case' : 'Publish Case'}
          </button>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSave('Published'); }} className="bg-white border border-slate-200/80 rounded-xl p-8 shadow-xs space-y-10">
        
        {/* SECTION 1: CASE INFORMATION */}
        <div className="space-y-5">
          <div className="pb-2 border-b border-slate-200">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#0B1727]">1. Case Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Case Number *</label>
              <input
                type="text"
                required
                value={formData.caseNumber}
                onChange={(e) => handleChange('caseNumber', e.target.value)}
                placeholder="Criminal Appeal No. 1428 of 2026"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:border-primary-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Case Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="State of Tamil Nadu vs. Ramesh Kumar & Ors."
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:border-primary-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Petitioner / Appellant</label>
              <input
                type="text"
                value={formData.petitioner}
                onChange={(e) => handleChange('petitioner', e.target.value)}
                placeholder="Petitioner name"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:border-primary-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Respondent</label>
              <input
                type="text"
                value={formData.respondent}
                onChange={(e) => handleChange('respondent', e.target.value)}
                placeholder="Respondent name"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:border-primary-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Court</label>
              <input
                type="text"
                value={formData.court}
                onChange={(e) => handleChange('court', e.target.value)}
                placeholder="e.g. Supreme Court of India or Delhi High Court"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:border-primary-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Judgment Date *</label>
              <input
                type="date"
                required
                value={formData.judgmentDate || ''}
                onChange={(e) => {
                  const newDate = e.target.value;
                  const derivedYear = newDate ? newDate.substring(0, 4) : '';
                  setFormData(prev => ({ ...prev, judgmentDate: newDate, year: derivedYear }));
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:border-primary-600"
              />
            </div>


          </div>
        </div>

        {/* SECTION 2: LEGAL REFERENCES (WITH CITATION BUILDER) */}
        <div className="space-y-6">
          <div className="pb-2 border-b border-slate-200">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#0B1727]">2. Legal References</h2>
          </div>

          {/* CITATION BUILDER CONTAINER (Matching Exact Screenshot UI) */}
          <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 space-y-4">
            
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold text-slate-800">
                Citation <span className="text-red-500">*</span>
              </label>

              {citationsList.length > 0 && (
                <span className="text-[11px] font-bold text-slate-500">
                  {citationsList.length} Citation{citationsList.length > 1 ? 's' : ''} Added
                </span>
              )}
            </div>

            {/* List of Added Citations */}
            {citationsList.length > 0 && (
              <div className="space-y-2 mb-3">
                {citationsList.map((cit) => (
                  <div key={cit.id} className="flex items-center justify-between p-3 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-900 shadow-2xs">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-primary-700 font-extrabold">{cit.year} ({cit.month}) DLR ({cit.court}) #{cit.number}</span>
                      {cit.equivalentText && (
                        <>
                          <span className="text-slate-400 font-normal">:</span>
                          <span className="text-slate-700 font-semibold">{cit.equivalentText}</span>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCitation(cit.id)}
                      className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                      title="Remove Citation"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Structured Composite Input Box */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-600 block">Add New Citation</span>
              
              <div className="bg-white border border-slate-200 rounded-xl p-3 sm:px-4 sm:py-3 flex items-center gap-2 flex-wrap sm:flex-nowrap shadow-2xs">
                
                {/* Year YYYY */}
                <input
                  type="text"
                  value={citationInput.year}
                  onChange={(e) => setCitationInput({ ...citationInput, year: e.target.value })}
                  placeholder="YYYY"
                  className="w-14 sm:w-16 border-b border-slate-300 text-center font-mono text-xs font-bold text-slate-800 placeholder:text-slate-300 outline-none pb-0.5"
                />

                {/* ( MM ) */}
                <div className="flex items-center font-mono text-xs text-slate-500 font-semibold">
                  <span>(</span>
                  <input
                    type="text"
                    value={citationInput.month}
                    onChange={(e) => setCitationInput({ ...citationInput, month: e.target.value })}
                    placeholder="MM"
                    className="w-8 border-b border-slate-300 text-center font-mono text-xs font-bold text-slate-800 placeholder:text-slate-300 outline-none pb-0.5 mx-1"
                  />
                  <span>)</span>
                </div>

                {/* DLR Constant Label */}
                <span className="font-extrabold text-xs text-slate-900 px-1 tracking-tight">DLR</span>

                {/* ( SC ) */}
                <div className="flex items-center font-mono text-xs text-slate-500 font-semibold">
                  <span>(</span>
                  <input
                    type="text"
                    value={citationInput.court}
                    onChange={(e) => setCitationInput({ ...citationInput, court: e.target.value })}
                    placeholder="SC"
                    className="w-10 border-b border-slate-300 text-center font-mono text-xs font-bold text-slate-800 placeholder:text-slate-300 uppercase outline-none pb-0.5 mx-1"
                  />
                  <span>)</span>
                </div>

                {/* # Page/Citation Number */}
                <input
                  type="text"
                  value={citationInput.number}
                  onChange={(e) => setCitationInput({ ...citationInput, number: e.target.value })}
                  placeholder="#"
                  className="w-12 sm:w-14 border-b border-slate-300 text-center font-mono text-xs font-bold text-slate-800 placeholder:text-slate-300 outline-none pb-0.5"
                />

                {/* Colon : */}
                <span className="font-bold text-slate-400 px-0.5">:</span>

                {/* Equivalent Text */}
                <input
                  type="text"
                  value={citationInput.equivalentText}
                  onChange={(e) => setCitationInput({ ...citationInput, equivalentText: e.target.value })}
                  placeholder="Equivalent text (e.g. 2026 INSC 666)"
                  className="flex-1 min-w-[180px] border-b border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 outline-none font-medium px-1 pb-0.5"
                />

              </div>
            </div>

            {/* + Add Citation Button (Bottom Right) */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleAddCitation}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Plus size={15} />
                <span>Add Citation</span>
              </button>
            </div>

          </div>

          {/* Diary Number, Act, Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Diary Number</label>
              <input
                type="text"
                value={formData.diaryNumber}
                onChange={(e) => handleChange('diaryNumber', e.target.value)}
                placeholder="18492/2025"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:border-primary-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Act</label>
              <input
                type="text"
                value={formData.act}
                onChange={(e) => handleChange('act', e.target.value)}
                placeholder="Code of Criminal Procedure, 1973"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:border-primary-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Section / Article</label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => handleChange('section', e.target.value)}
                placeholder="Section 482 or Article 21"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:border-primary-600"
              />
            </div>
          </div>
        </div>

        {/* CASE CONTENT RICH TEXT EDITORS (Matching Picture 2 & Picture 3) */}
        <div className="space-y-6">
          {/* Head Note * */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Head Note <span className="text-red-500">*</span>
            </label>
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
              <TiptapEditor 
                content={formData.summary} 
                onChange={(val) => handleChange('summary', val)} 
                placeholder="Enter Head Note & Ratio Decidendi summary..." 
                minHeight="150px"
              />
            </div>
          </div>

          {/* Full Judgment Text * */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Full Judgment Text <span className="text-red-500">*</span>
            </label>
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs min-h-[280px]">
              <TiptapEditor 
                content={formData.judgmentText} 
                onChange={(val) => handleChange('judgmentText', val)} 
                placeholder="Enter complete judgment text..." 
                minHeight="280px"
              />
            </div>
          </div>
        </div>

      </form>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1727] text-white font-bold text-xs px-5 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
