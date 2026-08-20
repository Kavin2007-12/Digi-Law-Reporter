import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, CheckCircle2, X, Plus, AlertTriangle } from 'lucide-react';
import { MOCK_CASES } from '../../data/adminMockData';
import TiptapEditor from '../../components/admin/TiptapEditor';
import { API_BASE_URL } from '../../config/api';

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

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Citation Builder State
  const [citationInput, setCitationInput] = useState({
    year: '',
    month: '',
    court: '',
    number: '',
    equivalentText: ''
  });

  const [citationsList, setCitationsList] = useState([]);
  const [citationError, setCitationError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [loadingCase, setLoadingCase] = useState(isEditing);

  // Load existing case details when editing
  useEffect(() => {
    if (!isEditing || !id) {
      setLoadingCase(false);
      return;
    }

    let isMounted = true;
    setLoadingCase(true);

    const fetchCaseDetails = async () => {
      try {
        let caseItem = null;

        // 1. Try GET /api/cases/:id
        try {
          const res = await fetch(`${API_BASE_URL}/cases/${id}`);
          const data = await res.json();
          if (data.success && data.data) {
            caseItem = data.data;
          }
        } catch (e) {}

        // 2. Fallback: Try GET /api/cases and find matching ID
        if (!caseItem) {
          try {
            const listRes = await fetch(`${API_BASE_URL}/cases`);
            const listData = await listRes.json();
            if (listData.success && Array.isArray(listData.data)) {
              caseItem = listData.data.find(c => String(c.id) === String(id));
            }
          } catch (e) {}
        }

        // 3. Fallback: Try public search API
        if (!caseItem) {
          try {
            const publicRes = await fetch(`${API_BASE_URL}/public/cases/search?q=${encodeURIComponent(id)}`);
            const publicData = await publicRes.json();
            if (publicData.success && Array.isArray(publicData.data)) {
              caseItem = publicData.data.find(c => String(c.id) === String(id)) || publicData.data[0];
            }
          } catch (e) {}
        }

        if (isMounted && caseItem) {
          const rawDate = caseItem.judgment_date || caseItem.judgmentDate || '';
          let formattedDate = '2026-04-12';
          if (typeof rawDate === 'string' && rawDate.length >= 10) {
            formattedDate = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate.substring(0, 10);
          }

          const rawTitle = String(caseItem.title || '');
          const titleParts = rawTitle.includes(' vs ') ? rawTitle.split(' vs ') : (rawTitle.includes(' v. ') ? rawTitle.split(' v. ') : [rawTitle, '']);

          setFormData({
            caseNumber: String(caseItem.case_number || caseItem.caseNumber || ''),
            title: rawTitle,
            petitioner: String(caseItem.petitioner_name || caseItem.petitioner || titleParts[0] || ''),
            respondent: String(caseItem.respondent_name || caseItem.respondent || titleParts[1] || ''),
            court: String(caseItem.court_name || caseItem.court || 'Supreme Court of India'),
            year: caseItem.year ? String(caseItem.year) : (formattedDate ? formattedDate.substring(0, 4) : '2026'),
            judgmentDate: formattedDate,
            bench: String(caseItem.bench || (Array.isArray(caseItem.judges) ? caseItem.judges.join(', ') : (caseItem.judges || ''))),

            diaryNumber: String(caseItem.diaryNumber || ''),
            act: String(caseItem.act || ''),
            section: String(caseItem.section || ''),

            summary: String(caseItem.head_note || caseItem.headNote || caseItem.summary || ''),
            issues: String(caseItem.issues || ''),
            importantPoints: String(caseItem.importantPoints || ''),
            judgmentText: String(caseItem.content || caseItem.judgment_text || caseItem.judgmentText || ''),

            status: String(caseItem.status || 'Published'),
            uploadedFiles: Array.isArray(caseItem.uploadedFiles) ? caseItem.uploadedFiles : []
          });

          if (caseItem.citations && Array.isArray(caseItem.citations)) {
            setCitationsList(caseItem.citations);
          } else if (caseItem.citation) {
            setCitationsList([{ id: Date.now(), number: String(caseItem.citation), year: String(caseItem.year || '') }]);
          }
        }
      } catch (err) {
        console.error('Failed to load case details for editing:', err);
      } finally {
        if (isMounted) setLoadingCase(false);
      }
    };

    fetchCaseDetails();

    return () => {
      isMounted = false;
    };
  }, [id, isEditing]);

  // Live duplicate citation check (checks Number + Year + Month)
  const checkDuplicateCitation = async (num, yr, mo) => {
    if (!num || !num.trim()) {
      setCitationError('');
      return false;
    }
    const cleanNum = num.trim();
    const cleanYr = yr ? yr.trim() : (formData.year || '2026');
    const cleanMo = mo ? mo.trim() : (citationInput.month || '');

    // 1. Check in current case citations list
    const existsLocally = citationsList.some(c => 
      String(c.number).trim() === cleanNum && 
      (!c.year || String(c.year).trim() === cleanYr) &&
      (!cleanMo || !c.month || String(c.month).trim().replace(/^0+/, '') === cleanMo.replace(/^0+/, ''))
    );
    if (existsLocally) {
      setCitationError(`Citation #${cleanNum} is already added in the list below.`);
      return true;
    }

    // 2. Check in database via backend / localStore
    try {
      const res = await fetch(`http://localhost:5000/api/admin/judgments/check-citation?number=${encodeURIComponent(cleanNum)}&year=${encodeURIComponent(cleanYr)}&month=${encodeURIComponent(cleanMo)}`);
      const data = await res.json();
      if (data.exists) {
        const monthDetail = cleanMo ? ` (Month ${cleanMo})` : '';
        setCitationError(`Citation number #${cleanNum} already exists in the database for year ${cleanYr}${monthDetail}! Please enter a different citation number.`);
        return true;
      }
    } catch (e) {}

    setCitationError('');
    return false;
  };

  const handleCitationFieldChange = (field, val) => {
    const updated = { ...citationInput, [field]: val };
    setCitationInput(updated);
    if (field === 'number' || field === 'year' || field === 'month') {
      checkDuplicateCitation(updated.number, updated.year, updated.month);
    }
  };

  const handleAddCitation = async () => {
    if (!citationInput.number.trim()) {
      setCitationError("Please enter a Citation Number (#)");
      return;
    }

    const isDup = await checkDuplicateCitation(citationInput.number, citationInput.year, citationInput.month);
    if (isDup) {
      showToast("Duplicate Citation Number: This citation already exists in the database.");
      return;
    }

    const newCit = {
      id: Date.now(),
      ...citationInput
    };
    setCitationsList(prev => [...prev, newCit]);
    setCitationError('');

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

  const handleSave = async (targetStatus) => {
    try {
      const payload = {
        caseNumber: formData.caseNumber,
        title: formData.title || (formData.petitioner && formData.respondent ? `${formData.petitioner} vs. ${formData.respondent}` : (formData.caseNumber || 'Case Record')),
        petitioner: formData.petitioner,
        respondent: formData.respondent,
        court: formData.court,
        judgmentDate: formData.judgmentDate,
        year: formData.year || (formData.judgmentDate ? formData.judgmentDate.substring(0, 4) : '2026'),
        act: formData.act,
        section: formData.section,
        headNote: formData.summary,
        judgmentText: formData.judgmentText,
        status: targetStatus,
        citations: citationsList
      };

      const url = isEditing ? `${API_BASE_URL}/cases/${id}` : `${API_BASE_URL}/cases`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        showToast(isEditing ? `Case updated as "${targetStatus}"` : `Case precedent saved as "${targetStatus}"!`);
      } else {
        showToast(data.message || 'Error saving case record');
      }
    } catch (err) {
      console.error('Error saving case:', err);
      showToast('Error connecting to backend API');
    }
  };

  if (loadingCase) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-600">Loading case precedent record for editing...</p>
      </div>
    );
  }

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
                placeholder=""
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:border-primary-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Petitioner / Appellant</label>
              <input
                type="text"
                value={formData.petitioner}
                onChange={(e) => handleChange('petitioner', e.target.value)}
                placeholder=""
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:border-primary-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Respondent</label>
              <input
                type="text"
                value={formData.respondent}
                onChange={(e) => handleChange('respondent', e.target.value)}
                placeholder=""
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:border-primary-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Court</label>
              <input
                type="text"
                value={formData.court}
                onChange={(e) => handleChange('court', e.target.value)}
                placeholder=""
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:border-primary-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Act</label>
              <input
                type="text"
                value={formData.act}
                onChange={(e) => handleChange('act', e.target.value)}
                placeholder=""
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
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:border-primary-600 cursor-pointer"
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
              
              <div className={`bg-white border rounded-xl p-3 sm:px-4 sm:py-3 flex items-center gap-2 flex-wrap sm:flex-nowrap shadow-2xs transition-colors ${citationError ? 'border-red-400 bg-red-50/20' : 'border-slate-200'}`}>
                
                {/* Year YYYY */}
                <input
                  type="text"
                  value={citationInput.year}
                  onChange={(e) => handleCitationFieldChange('year', e.target.value)}
                  placeholder="YYYY"
                  className="w-14 sm:w-16 border-b border-slate-300 text-center font-mono text-xs font-bold text-slate-800 placeholder:text-slate-300 outline-none pb-0.5"
                />

                {/* ( MM ) */}
                <div className="flex items-center font-mono text-xs text-slate-500 font-semibold">
                  <span>(</span>
                  <input
                    type="text"
                    value={citationInput.month}
                    onChange={(e) => handleCitationFieldChange('month', e.target.value)}
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
                    onChange={(e) => handleCitationFieldChange('court', e.target.value)}
                    placeholder="SC"
                    className="w-10 border-b border-slate-300 text-center font-mono text-xs font-bold text-slate-800 placeholder:text-slate-300 uppercase outline-none pb-0.5 mx-1"
                  />
                  <span>)</span>
                </div>

                {/* # Page/Citation Number */}
                <input
                  type="text"
                  value={citationInput.number}
                  onChange={(e) => handleCitationFieldChange('number', e.target.value)}
                  placeholder="#"
                  className={`w-12 sm:w-14 border-b text-center font-mono text-xs font-bold outline-none pb-0.5 ${citationError ? 'border-red-500 text-red-600 font-black' : 'border-slate-300 text-slate-800 placeholder:text-slate-300'}`}
                />

                {/* Colon : */}
                <span className="font-bold text-slate-400 px-0.5">:</span>

                {/* Equivalent Text */}
                <input
                  type="text"
                  value={citationInput.equivalentText}
                  onChange={(e) => handleCitationFieldChange('equivalentText', e.target.value)}
                  placeholder=""
                  className="flex-1 min-w-[180px] border-b border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 outline-none font-medium px-1 pb-0.5"
                />

              </div>
            </div>

            {/* Citation Duplicate Error Notice */}
            {citationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <AlertTriangle size={16} className="shrink-0 text-red-600" />
                <span>{citationError}</span>
              </div>
            )}

            {/* + Add Citation Button (Bottom Right) */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleAddCitation}
                disabled={Boolean(citationError)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Plus size={15} />
                <span>Add Citation</span>
              </button>
            </div>

          </div>
        </div>

        {/* CASE CONTENT RICH TEXT EDITORS */}
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
                placeholder="" 
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
                placeholder="" 
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
