import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Upload, FileText, CheckCircle2, X, Plus, AlertTriangle, 
  Sparkles, Loader2, Edit3, Send, Check, FileCode, Eye, Save
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

  // PDF Extraction & View States
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionStep, setExtractionStep] = useState(1);
  const [pdfFileName, setPdfFileName] = useState('');
  const [extractionSuccessBanner, setExtractionSuccessBanner] = useState('');
  const [viewMode, setViewMode] = useState('form'); // 'form' or 'document'
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [showOriginalPdfModal, setShowOriginalPdfModal] = useState(false);

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

  // PDF Auto-Extraction & Direct Form Population Handler
  const handlePdfAutoExtract = async (file) => {
    if (!file) return;
    setPdfFileName(file.name);

    // Create browser URL to preview original PDF document
    try {
      const blobUrl = URL.createObjectURL(file);
      setPdfPreviewUrl(blobUrl);
    } catch (e) {
      console.error("Could not create object URL for PDF preview:", e);
    }

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
        const extracted = data.data;

        // Auto-populate all form fields directly
        setFormData(prev => ({
          ...prev,
          caseNumber: extracted.caseNumber || prev.caseNumber || 'DLR/' + Date.now().toString().slice(-6),
          title: extracted.title || (extracted.petitioner && extracted.respondent ? `${extracted.petitioner} vs. ${extracted.respondent}` : prev.title),
          petitioner: extracted.petitioner || prev.petitioner || 'Petitioner',
          respondent: extracted.respondent || prev.respondent || 'Respondent',
          court: extracted.court || prev.court || 'Supreme Court of India',
          judgmentDate: extracted.judgmentDate || prev.judgmentDate || '2026-04-12',
          year: extracted.year || prev.year || '2026',
          act: extracted.act || prev.act || '',
          section: extracted.section || prev.section || '',
          summary: extracted.summary || prev.summary || '',
          judgmentText: extracted.judgmentText || prev.judgmentText || ''
        }));

        if (extracted.citations && Array.isArray(extracted.citations)) {
          setCitationsList(extracted.citations);
        }

        setTimeout(() => {
          setIsExtracting(false);
          // Automatically switch to editable PDF view mode after extraction completes!
          setViewMode('document');
          setExtractionSuccessBanner(`✅ PDF Judgment "${file.name}" Extracted Successfully! Document opened in editable PDF View mode. Review details below, edit if needed, and click "Publish Case".`);
        }, 300);

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
      if (msg.includes('success') || msg.includes('saved') || msg.includes('published') || msg.includes('Publish')) {
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

        <div className="flex items-center gap-3">
          {/* View Mode Selector Tabs */}
          <div className="bg-slate-200/80 p-0.5 rounded-lg flex items-center gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('form')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'form' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Edit3 size={13} />
              <span>Edit Form</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('document')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'document' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Eye size={13} />
              <span>PDF Paper View</span>
            </button>
          </div>

          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            {isEditing ? `Edit Case #${id}` : 'Legal Document Record Form'}
          </span>
        </div>
      </div>

      {/* Form Title & Top Right Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-cinzel text-[#0B1727]">
            {isEditing ? 'Edit Legal Case Record' : 'Add Case Record'}
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-1">
            Upload PDF to auto-extract text or enter legal precedent details.
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

          <button
            type="button"
            onClick={() => handleSave('Draft')}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 font-bold border border-slate-300 rounded-lg text-xs transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <Save size={14} />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave('Published')}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Send size={14} />
            <span>Publish Case</span>
          </button>
        </div>
      </div>

      {/* UPLOAD PDF CARD (CLEAN & MINIMAL) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-extrabold text-[#0B1727]">
            Upload PDF Case Judgment
          </h3>

          <label className="shrink-0 px-4 py-2.5 bg-[#0B1727] hover:bg-slate-800 text-white text-xs font-extrabold rounded-lg shadow-xs cursor-pointer transition-all inline-flex items-center gap-2">
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

      {/* EXTRACTION SUCCESS BANNER */}
      {extractionSuccessBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center justify-between gap-3 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{extractionSuccessBanner}</span>
          </div>
          <button
            onClick={() => setExtractionSuccessBanner('')}
            className="text-emerald-500 hover:text-emerald-800 p-1"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* VIEW MODE 1: STANDARD EDIT FORM MODE */}
      {viewMode === 'form' && (
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

          {/* BOTTOM FORM ACTION BUTTONS */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => handleSave('Draft')}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold border border-slate-300 rounded-lg text-xs transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <Save size={14} />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave('Published')}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Send size={14} />
              <span>Publish Case</span>
            </button>
          </div>

        </form>
      )}

      {/* VIEW MODE 2: EDITABLE PDF DOCUMENT PAPER VIEW */}
      {viewMode === 'document' && (
        <div className="bg-slate-200/90 p-4 sm:p-8 rounded-2xl shadow-xl space-y-6">
          
          {/* Document Top Bar */}
          <div className="bg-[#0B1727] text-white p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                  {pdfFileName ? `Extracted PDF: ${pdfFileName}` : 'Editable Legal PDF Paper View'}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Directly edit any field or text below. Changes apply instantly to the precedent record.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {pdfPreviewUrl && (
                <button
                  type="button"
                  onClick={() => setShowOriginalPdfModal(true)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 border border-slate-700 shadow-2xs cursor-pointer"
                >
                  <Eye size={14} className="text-blue-400" />
                  <span>View Original PDF</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSave('Draft')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-700"
              >
                <Save size={14} />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave('Published')}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Send size={14} />
                <span>Publish Case</span>
              </button>
            </div>
          </div>

          {/* Authentic Document Paper Sheet */}
          <div className="bg-white rounded-sm shadow-xl border border-slate-300/80 p-8 sm:p-14 space-y-8 font-serif text-[#0B1727] relative min-h-[750px]">
            
            {/* Header / Court Title */}
            <div className="text-center space-y-3 pb-6 border-b-2 border-slate-900">
              <span className="text-[11px] font-mono uppercase tracking-widest font-extrabold text-slate-500 block">
                IN THE HIGH COURT / SUPREME COURT OF JUDICATURE
              </span>
              
              <input
                type="text"
                value={formData.court}
                onChange={(e) => handleChange('court', e.target.value)}
                placeholder="Court Name..."
                className="w-full text-center text-lg sm:text-xl font-bold font-cinzel text-[#0B1727] bg-transparent hover:bg-amber-50/50 border-b border-dashed border-slate-300 focus:border-blue-600 rounded px-2 py-1 outline-none transition-all"
              />

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-sans font-bold text-slate-600 pt-2">
                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
                  <span className="text-slate-500">Case No:</span>
                  <input
                    type="text"
                    value={formData.caseNumber}
                    onChange={(e) => handleChange('caseNumber', e.target.value)}
                    className="bg-transparent font-mono font-bold text-slate-900 outline-none w-36"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
                  <span className="text-slate-500">Date:</span>
                  <input
                    type="date"
                    value={formData.judgmentDate || ''}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      const derivedYear = newDate ? newDate.substring(0, 4) : '';
                      setFormData(prev => ({ ...prev, judgmentDate: newDate, year: derivedYear }));
                    }}
                    className="bg-transparent font-sans font-bold text-slate-900 outline-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Case Title & Parties */}
            <div className="space-y-4 bg-slate-50/80 p-6 rounded-xl border border-slate-200">
              <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-slate-400 block">
                Parties to the Precedent
              </span>

              <div className="space-y-3 font-sans">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block">Petitioner / Appellant</label>
                  <input
                    type="text"
                    value={formData.petitioner}
                    onChange={(e) => handleChange('petitioner', e.target.value)}
                    className="w-full font-bold text-sm text-slate-900 bg-white border border-slate-300 rounded-lg px-3.5 py-2 outline-none focus:border-blue-600"
                  />
                </div>

                <div className="text-center font-bold text-xs text-slate-400 italic">
                  — VERSUS —
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block">Respondent</label>
                  <input
                    type="text"
                    value={formData.respondent}
                    onChange={(e) => handleChange('respondent', e.target.value)}
                    className="w-full font-bold text-sm text-slate-900 bg-white border border-slate-300 rounded-lg px-3.5 py-2 outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Statutory Act & Section Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans bg-slate-50/50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Act / Statute</label>
                <input
                  type="text"
                  value={formData.act}
                  onChange={(e) => handleChange('act', e.target.value)}
                  placeholder="e.g. Constitution of India"
                  className="w-full font-semibold text-xs text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Section / Provision</label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => handleChange('section', e.target.value)}
                  placeholder="e.g. Article 21"
                  className="w-full font-semibold text-xs text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Citations List inside Paper View */}
            <div className="space-y-3 font-sans pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#0B1727]">
                  CITATIONS ({citationsList.length})
                </h4>
              </div>

              {citationsList.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {citationsList.map(cit => (
                    <div key={cit.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold font-mono text-blue-900">
                      <span>{cit.year} ({cit.month}) DLR ({cit.court}) #{cit.number}</span>
                      <button onClick={() => handleRemoveCitation(cit.id)} className="text-blue-400 hover:text-red-600">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic font-medium">No citations added to document yet.</p>
              )}
            </div>

            {/* Head Note Section */}
            <div className="space-y-2 font-sans pt-4 border-t border-slate-200">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#0B1727]">
                HEAD NOTE / SYNOPSIS
              </h4>
              <div className="rounded-xl border border-slate-300 overflow-hidden bg-white shadow-2xs">
                <TiptapEditor 
                  content={formData.summary} 
                  onChange={(val) => handleChange('summary', val)} 
                  placeholder="Enter or edit Head Note synopsis..." 
                  minHeight="150px"
                />
              </div>
            </div>

            {/* Full Judgment Document Body */}
            <div className="space-y-3 font-serif pt-4 border-t border-slate-200">
              <h4 className="text-xs font-sans font-extrabold uppercase tracking-widest text-[#0B1727]">
                FULL JUDGMENT TEXT
              </h4>
              <div className="rounded-xl border border-slate-300 overflow-hidden bg-white shadow-2xs min-h-[350px]">
                <TiptapEditor 
                  content={formData.judgmentText} 
                  onChange={(val) => handleChange('judgmentText', val)} 
                  placeholder="Enter or edit full judgment text..." 
                  minHeight="350px"
                />
              </div>
            </div>

          </div>

          {/* DOCUMENT PAPER BOTTOM ACTION BUTTONS */}
          <div className="bg-[#0B1727] text-white rounded-xl p-4 shadow-xl border border-slate-800 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400 font-medium">
              Review completed? Click Publish Case to push to database.
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSave('Draft')}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-700"
              >
                <Save size={14} />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave('Published')}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Send size={15} />
                <span>Publish Case</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ORIGINAL PDF PREVIEW MODAL */}
      {showOriginalPdfModal && pdfPreviewUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-[#0B1727] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText size={18} className="text-blue-400" />
                <span className="text-xs font-extrabold">Original PDF File: {pdfFileName}</span>
              </div>
              <button
                onClick={() => setShowOriginalPdfModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 bg-slate-100 p-2">
              <iframe
                src={pdfPreviewUrl}
                title="Original PDF Preview"
                className="w-full h-full rounded-xl border border-slate-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* REAL-TIME EXTRACTION TIMELINE PROGRESS MODAL */}
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
                  Populating Legal Form & Editable Document Page
                </span>
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
