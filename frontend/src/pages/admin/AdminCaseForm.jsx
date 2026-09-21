import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Upload, FileText, CheckCircle2, X, Plus, AlertTriangle, 
  Sparkles, Loader2, Edit3, Send, Check, RefreshCw, FileCode
} from 'lucide-react';
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

  // PDF Extraction & Timeline Modal States
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionStep, setExtractionStep] = useState(1);
  const [pdfFileName, setPdfFileName] = useState('');
  const [showExtractionModal, setShowExtractionModal] = useState(false);
  const [extractedCaseData, setExtractedCaseData] = useState(null);

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

        try {
          const res = await fetch(`${API_BASE_URL}/cases/${id}`);
          const data = await res.json();
          if (data.success && data.data) {
            caseItem = data.data;
          }
        } catch (e) {}

        if (!caseItem) {
          try {
            const listRes = await fetch(`${API_BASE_URL}/cases`);
            const listData = await listRes.json();
            if (listData.success && Array.isArray(listData.data)) {
              caseItem = listData.data.find(c => String(c.id) === String(id));
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
        console.error('Failed to load case details:', err);
      } finally {
        if (isMounted) setLoadingCase(false);
      }
    };

    fetchCaseDetails();

    return () => {
      isMounted = false;
    };
  }, [id, isEditing]);

  // PDF Auto-Extraction Handler with Real-Time Timeline Progress
  const handlePdfAutoExtract = async (file) => {
    if (!file) return;
    setPdfFileName(file.name);
    setIsExtracting(true);
    setExtractionProgress(15);
    setExtractionStep(1);

    const formDataPayload = new FormData();
    formDataPayload.append('pdfFile', file);

    const progressTimer = setInterval(() => {
      setExtractionProgress(prev => {
        if (prev < 40) {
          setExtractionStep(2);
          return prev + 15;
        } else if (prev < 80) {
          setExtractionStep(3);
          return prev + 10;
        } else if (prev < 95) {
          return prev + 2;
        }
        return prev;
      });
    }, 200);

    try {
      const res = await fetch(`${API_BASE_URL}/cases/extract-pdf`, {
        method: 'POST',
        body: formDataPayload
      });
      const data = await res.json();
      clearInterval(progressTimer);

      if (data.success && data.data) {
        setExtractionProgress(100);
        setExtractionStep(4);
        setExtractedCaseData(data.data);

        setTimeout(() => {
          setIsExtracting(false);
          setShowExtractionModal(true);
        }, 400);
      } else {
        clearInterval(progressTimer);
        setIsExtracting(false);
        showToast(data.message || 'Failed to extract PDF text');
      }
    } catch (err) {
      clearInterval(progressTimer);
      setIsExtracting(false);
      console.error('PDF extraction failed:', err);
      showToast('Error connecting to backend PDF extractor service');
    }
  };

  // Citation Duplicate Check
  const checkDuplicateCitation = async (num, yr, mo) => {
    if (!num || !num.trim()) {
      setCitationError('');
      return false;
    }
    const cleanNum = num.trim();
    const cleanYr = yr ? yr.trim() : (formData.year || '2026');
    const cleanMo = mo ? mo.trim() : (citationInput.month || '');

    const existsLocally = citationsList.some(c => 
      String(c.number).trim() === cleanNum && 
      (!c.year || String(c.year).trim() === cleanYr) &&
      (!cleanMo || !c.month || String(c.month).trim().replace(/^0+/, '') === cleanMo.replace(/^0+/, ''))
    );
    if (existsLocally) {
      setCitationError(`Citation #${cleanNum} is already added in the list below.`);
      return true;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/judgments/check-citation?number=${encodeURIComponent(cleanNum)}&year=${encodeURIComponent(cleanYr)}&month=${encodeURIComponent(cleanMo)}`);
      const data = await res.json();
      if (data.exists) {
        const monthDetail = cleanMo ? ` (Month ${cleanMo})` : '';
        setCitationError(`Citation #${cleanNum} already exists in database for year ${cleanYr}${monthDetail}!`);
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
      showToast("Duplicate Citation Number: Citation already exists.");
      return;
    }

    const newCit = {
      id: Date.now(),
      ...citationInput
    };
    setCitationsList(prev => [...prev, newCit]);
    setCitationError('');

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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
      if (msg.includes('success') || msg.includes('saved') || msg.includes('published')) {
        navigate('/admin/cases');
      }
    }, 1500);
  };

  const handleSave = async (targetStatus) => {
    const finalStatus = targetStatus || formData.status || 'Published';
    try {
      const payload = {
        caseNumber: formData.caseNumber || '',
        title: formData.title || (formData.petitioner && formData.respondent ? `${formData.petitioner} vs. ${formData.respondent}` : (formData.caseNumber || 'Case Record')),
        petitioner: formData.petitioner || '',
        respondent: formData.respondent || '',
        court: formData.court || 'Supreme Court of India',
        judgmentDate: formData.judgmentDate || '',
        year: formData.year || (formData.judgmentDate ? formData.judgmentDate.substring(0, 4) : '2026'),
        act: formData.act || '',
        section: formData.section || '',
        headNote: formData.summary || '',
        summary: formData.summary || '',
        head_note: formData.summary || '',
        judgmentText: formData.judgmentText || '',
        content: formData.judgmentText || '',
        judgment_text: formData.judgmentText || '',
        status: finalStatus,
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
        showToast(isEditing ? `Case record updated successfully!` : `Case precedent published successfully!`);
      } else {
        showToast(data.message || 'Error saving case record');
      }
    } catch (err) {
      console.error('Error saving case:', err);
      showToast('Error connecting to backend API');
    }
  };

  // Apply Extracted PDF Data to Form Fields
  const handleApplyExtractedToForm = () => {
    if (!extractedCaseData) return;
    setFormData(prev => ({
      ...prev,
      caseNumber: extractedCaseData.caseNumber || prev.caseNumber,
      title: extractedCaseData.title || prev.title,
      petitioner: extractedCaseData.petitioner || prev.petitioner,
      respondent: extractedCaseData.respondent || prev.respondent,
      court: extractedCaseData.court || prev.court,
      judgmentDate: extractedCaseData.judgmentDate || prev.judgmentDate,
      year: extractedCaseData.year || prev.year,
      act: extractedCaseData.act || prev.act,
      section: extractedCaseData.section || prev.section,
      summary: extractedCaseData.summary || prev.summary,
      judgmentText: extractedCaseData.judgmentText || prev.judgmentText
    }));

    if (extractedCaseData.citations && Array.isArray(extractedCaseData.citations)) {
      setCitationsList(extractedCaseData.citations);
    }

    setShowExtractionModal(false);
  };

  // Direct Publish from Extracted Popup Modal
  const handleDirectPublishFromModal = async () => {
    if (!extractedCaseData) return;
    setShowExtractionModal(false);

    const payload = {
      caseNumber: extractedCaseData.caseNumber || 'DLR/' + Date.now().toString().slice(-6),
      title: extractedCaseData.title || `${extractedCaseData.petitioner || 'Petitioner'} vs. ${extractedCaseData.respondent || 'Respondent'}`,
      petitioner: extractedCaseData.petitioner || 'Petitioner',
      respondent: extractedCaseData.respondent || 'Respondent',
      court: extractedCaseData.court || 'Supreme Court of India',
      judgmentDate: extractedCaseData.judgmentDate || '2026-04-12',
      year: extractedCaseData.year || '2026',
      act: extractedCaseData.act || '',
      section: extractedCaseData.section || '',
      headNote: extractedCaseData.summary || '',
      summary: extractedCaseData.summary || '',
      judgmentText: extractedCaseData.judgmentText || '',
      content: extractedCaseData.judgmentText || '',
      status: 'Published',
      citations: extractedCaseData.citations || citationsList
    };

    try {
      const res = await fetch(`${API_BASE_URL}/cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast(`PDF Case precedent successfully published!`);
      } else {
        showToast(data.message || 'Error publishing PDF case record');
      }
    } catch (e) {
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
            Enter legal precedent information or upload PDF for instant AI extraction.
          </p>
        </div>

        {/* TOP RIGHT ACTION BUTTONS */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/admin/cases')}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 font-bold border border-slate-300 rounded-lg text-xs transition-all shadow-2xs cursor-pointer"
          >
            Cancel
          </button>

          {isEditing ? (
            <>
              {formData.status === 'Draft' && (
                <button
                  type="button"
                  onClick={() => handleSave('Published')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all shadow-2xs cursor-pointer"
                >
                  Publish Case
                </button>
              )}
              {formData.status === 'Published' && (
                <button
                  type="button"
                  onClick={() => handleSave('Draft')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition-all shadow-2xs cursor-pointer"
                >
                  Move to Draft
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSave(formData.status)}
                className="px-5 py-2 bg-[#0B1727] hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-all shadow-xs cursor-pointer"
              >
                Update Case
              </button>
            </>
          ) : (
            <>
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
                Publish Case
              </button>
            </>
          )}
        </div>
      </div>

      {/* UPLOAD PDF AUTO-CONVERT CARD (PREMIUM UPLOAD OPTION) */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0B1727] to-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Upload PDF Case Judgment</span>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-extrabold uppercase rounded-full border border-blue-400/30">
                  Fast Text Extractor
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Upload any legal judgment PDF to extract text, parties, court & formatting cleanly into structured fields.
              </p>
            </div>
          </div>

          <label className="shrink-0 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-lg shadow-sm cursor-pointer transition-all inline-flex items-center gap-2">
            <Upload size={15} />
            <span>Upload PDF File</span>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handlePdfAutoExtract(e.target.files[0]);
                }
              }}
            />
          </label>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(isEditing ? formData.status : 'Published'); }} className="bg-white border border-slate-200/80 rounded-xl p-8 shadow-xs space-y-10">
        
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

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-600 block">Add New Citation</span>
              
              <div className={`bg-white border rounded-xl p-3 sm:px-4 sm:py-3 flex items-center gap-2 flex-wrap sm:flex-nowrap shadow-2xs transition-colors ${citationError ? 'border-red-400 bg-red-50/20' : 'border-slate-200'}`}>
                
                <input
                  type="text"
                  value={citationInput.year}
                  onChange={(e) => handleCitationFieldChange('year', e.target.value)}
                  placeholder="YYYY"
                  className="w-14 sm:w-16 border-b border-slate-300 text-center font-mono text-xs font-bold text-slate-800 placeholder:text-slate-300 outline-none pb-0.5"
                />

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

                <span className="font-extrabold text-xs text-slate-900 px-1 tracking-tight">DLR</span>

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

                <input
                  type="text"
                  value={citationInput.number}
                  onChange={(e) => handleCitationFieldChange('number', e.target.value)}
                  placeholder="#"
                  className={`w-12 sm:w-14 border-b text-center font-mono text-xs font-bold outline-none pb-0.5 ${citationError ? 'border-red-500 text-red-600 font-black' : 'border-slate-300 text-slate-800 placeholder:text-slate-300'}`}
                />

                <span className="font-bold text-slate-400 px-0.5">:</span>

                <input
                  type="text"
                  value={citationInput.equivalentText}
                  onChange={(e) => handleCitationFieldChange('equivalentText', e.target.value)}
                  placeholder=""
                  className="flex-1 min-w-[180px] border-b border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 outline-none font-medium px-1 pb-0.5"
                />

              </div>
            </div>

            {citationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <AlertTriangle size={16} className="shrink-0 text-red-600" />
                <span>{citationError}</span>
              </div>
            )}

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

      {/* 1. REAL-TIME EXTRACTION TIMELINE PROGRESS MODAL */}
      {isExtracting && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 border border-slate-100 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Loader2 size={28} className="animate-spin text-blue-600" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-[#0B1727]">
                Extracting PDF Text & Legal Fields
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium truncate max-w-xs mx-auto">
                File: <span className="font-bold text-slate-800">{pdfFileName}</span>
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${extractionProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] font-extrabold text-slate-500 px-1">
                <span>Converting...</span>
                <span>{extractionProgress}%</span>
              </div>
            </div>

            {/* Step-by-Step Timeline Indicator */}
            <div className="space-y-3 text-left bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${extractionStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {extractionStep > 1 ? <Check size={14} /> : '1'}
                </div>
                <span className={`text-xs font-bold ${extractionStep >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>
                  Uploading PDF Document
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${extractionStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {extractionStep > 2 ? <Check size={14} /> : '2'}
                </div>
                <span className={`text-xs font-bold ${extractionStep >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>
                  Extracting Text & Layout Structure
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${extractionStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {extractionStep > 3 ? <Check size={14} /> : '3'}
                </div>
                <span className={`text-xs font-bold ${extractionStep >= 3 ? 'text-slate-900' : 'text-slate-400'}`}>
                  Parsing Legal Fields (Title, Parties, Citation, Date)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${extractionStep >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {extractionStep >= 4 ? <Check size={14} /> : '4'}
                </div>
                <span className={`text-xs font-bold ${extractionStep >= 4 ? 'text-slate-900' : 'text-slate-400'}`}>
                  Verification & Interactive Edit Preview
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. EXTRACTED DATA REVIEW & EDIT POPUP MODAL */}
      {showExtractionModal && extractedCaseData && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col my-auto animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
                  <FileCode size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0B1727]">
                    Extracted Legal Case Preview & Editor
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Review extracted text below. Edit any detail before publishing.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowExtractionModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body (Editable Fields) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Case Number</label>
                  <input
                    type="text"
                    value={extractedCaseData.caseNumber || ''}
                    onChange={(e) => setExtractedCaseData({ ...extractedCaseData, caseNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Court Name</label>
                  <input
                    type="text"
                    value={extractedCaseData.court || ''}
                    onChange={(e) => setExtractedCaseData({ ...extractedCaseData, court: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Petitioner / Appellant</label>
                  <input
                    type="text"
                    value={extractedCaseData.petitioner || ''}
                    onChange={(e) => setExtractedCaseData({ ...extractedCaseData, petitioner: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Respondent</label>
                  <input
                    type="text"
                    value={extractedCaseData.respondent || ''}
                    onChange={(e) => setExtractedCaseData({ ...extractedCaseData, respondent: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Judgment Date</label>
                  <input
                    type="date"
                    value={extractedCaseData.judgmentDate || ''}
                    onChange={(e) => setExtractedCaseData({ ...extractedCaseData, judgmentDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Act / Section</label>
                  <input
                    type="text"
                    value={`${extractedCaseData.act || ''} ${extractedCaseData.section || ''}`.trim()}
                    onChange={(e) => setExtractedCaseData({ ...extractedCaseData, act: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Head Note / Summary */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Extracted Head Note / Summary</label>
                <textarea
                  rows={3}
                  value={extractedCaseData.summary || ''}
                  onChange={(e) => setExtractedCaseData({ ...extractedCaseData, summary: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 text-xs"
                />
              </div>

              {/* Full Judgment Converted Text */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Converted Text from PDF</label>
                <textarea
                  rows={10}
                  value={extractedCaseData.judgmentText || ''}
                  onChange={(e) => setExtractedCaseData({ ...extractedCaseData, judgmentText: e.target.value })}
                  className="w-full p-3 bg-slate-900 text-slate-100 font-mono text-xs rounded-lg border border-slate-700"
                />
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex flex-wrap items-center justify-between gap-3">
              <label className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold rounded-xl text-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors">
                <RefreshCw size={14} />
                <span>Upload Another PDF</span>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setShowExtractionModal(false);
                      handlePdfAutoExtract(e.target.files[0]);
                    }
                  }}
                />
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplyExtractedToForm}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Edit3 size={14} />
                  <span>Apply to Form & Edit</span>
                </button>

                <button
                  type="button"
                  onClick={handleDirectPublishFromModal}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Send size={14} />
                  <span>Publish Case Now</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

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
