import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, ChevronDown, Download, FileText, Bookmark, BookmarkCheck, 
  Printer, Share2, Filter, Copy, Check, ZoomIn, ZoomOut, Scale, Landmark,
  LayoutDashboard, Volume2, VolumeX, Highlighter, Mail, X, ExternalLink,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, SlidersHorizontal,
  FolderBookmark, Sparkles, CheckCircle2
} from 'lucide-react';

// Authentic Social Media Brand SVG Icons
const WhatsappIcon = () => (
  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
    <path d="M12.031 0C5.398 0 0 5.397 0 12.03c0 2.124.553 4.197 1.606 6.02L.057 24l6.163-1.616A11.968 11.968 0 0012.03 24c6.633 0 12.031-5.397 12.031-12.03C24.062 5.397 18.664 0 12.031 0zm.001 22.013c-1.805 0-3.573-.485-5.113-1.402l-.367-.218-3.797.995 1.012-3.7-.239-.38a9.972 9.972 0 01-1.529-5.278c.002-5.523 4.495-10.016 10.021-10.016 5.524 0 10.017 4.493 10.018 10.016 0 5.524-4.494 10.017-10.006 10.017zm5.492-7.502c-.301-.151-1.782-.879-2.057-.979-.276-.1-.476-.151-.676.151-.201.301-.777.979-.952 1.18-.175.201-.351.226-.652.075-1.83-.919-3.037-1.637-4.244-3.71-.321-.552.321-.512.919-1.706.1-.201.05-.376-.025-.527-.075-.151-.676-1.63-0.927-2.233-.244-.587-.492-.507-.676-.517-.175-.01-.376-.01-.577-.01-.201 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.508s1.078 2.908 1.228 3.109c.15.201 2.122 3.241 5.14 4.547.718.31 1.279.495 1.716.634.721.23 1.377.197 1.896.12.577-.086 1.782-.727 2.033-1.429.251-.702.251-1.304.175-1.43-.075-.125-.276-.201-.577-.352z"/>
  </svg>
);

const TwitterXIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z"/>
  </svg>
);

// Utility to extract a snippet around the keyword and highlight the keyword
const getHighlightedSnippet = (text, keyword, snippetLength = 140) => {
  if (!text) return { __html: '' };
  if (!keyword) return { __html: text.substring(0, snippetLength) + (text.length > snippetLength ? '...' : '') };
  
  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  const index = lowerText.indexOf(lowerKeyword);
  
  if (index === -1) {
    return { __html: text.substring(0, snippetLength) + (text.length > snippetLength ? '...' : '') };
  }

  let start = Math.max(0, index - (snippetLength / 2));
  let end = Math.min(text.length, index + lowerKeyword.length + (snippetLength / 2));
  
  let snippet = text.substring(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';

  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const highlighted = snippet.replace(regex, '<mark class="bg-yellow-200 text-slate-900 px-1 rounded font-bold">$1</mark>');

  return { __html: highlighted };
};

// Normalizes text by removing single line breaks but keeping double line breaks
const processDocumentText = (text) => {
  if (!text) return '';
  let normalized = text.replace(/\r\n/g, '\n');
  normalized = normalized.replace(/\n\n+/g, '___PARAGRAPH___');
  normalized = normalized.replace(/\n/g, ' ');
  normalized = normalized.replace(/___PARAGRAPH___/g, '\n\n');
  return normalized;
};

const getHighlightedFullText = (text, keyword, isHighlightEnabled = true) => {
  if (!text) return { __html: '' };
  const processedText = processDocumentText(text);
  if (!keyword || !isHighlightEnabled) return { __html: processedText };
  
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const highlighted = processedText.replace(regex, '<mark class="bg-yellow-300 text-slate-950 px-1 py-0.5 rounded font-bold shadow-2xs">$1</mark>');
  
  return { __html: highlighted };
};

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [fontSize, setFontSize] = useState(15); // Default font size in px
  
  // Filter States
  const [selectedCourtFilter, setSelectedCourtFilter] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [startYear, setStartYear] = useState(1800);
  const [endYear, setEndYear] = useState(2026);
  const [searchWithinResults, setSearchWithinResults] = useState('');
  const [searchWithinDoc, setSearchWithinDoc] = useState('');
  const [showDocSearch, setShowDocSearch] = useState(false);

  // UI Interactive States
  const [toastMessage, setToastMessage] = useState('');
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [isHighlightingEnabled, setIsHighlightingEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Persisted Saved Cases in LocalStorage
  const [savedCases, setSavedCases] = useState(() => {
    try {
      const saved = localStorage.getItem('digi_saved_cases_full');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Toggle Save Case / Bookmark for Future Use
  const handleToggleSaveCase = (caseItem, e) => {
    if (e) e.stopPropagation();
    if (!caseItem) return;

    const exists = savedCases.some(c => String(c.id) === String(caseItem.id));
    let updated;

    if (exists) {
      updated = savedCases.filter(c => String(c.id) !== String(caseItem.id));
      showToast(`Removed "${(caseItem.title || 'Case').substring(0, 30)}..." from your saved bookmarks`);
    } else {
      updated = [...savedCases, caseItem];
      showToast(`Saved "${(caseItem.title || 'Case').substring(0, 30)}..." to your account bookmarks for future use!`);
    }

    setSavedCases(updated);
    try {
      localStorage.setItem('digi_saved_cases_full', JSON.stringify(updated));
    } catch (err) {}
  };

  // Audio Text to Speech Reader
  const handleToggleAudio = () => {
    if (!selectedCase) return;

    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        showToast("Audio reader paused");
      } else {
        window.speechSynthesis.cancel();
        const textToRead = `${selectedCase.title}. Judgment delivered by ${selectedCase.court_name || 'Supreme Court of India'}. ${selectedCase.head_note || ''}. ${selectedCase.content || ''}`;
        const utterance = new SpeechSynthesisUtterance(textToRead.substring(0, 1500));
        utterance.rate = 0.95;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
        showToast("Reading judgment summary aloud...");
      }
    } else {
      showToast("Text-to-Speech is not supported in this browser");
    }
  };

  // Download Case (Direct PDF or Clean Legal Document)
  const handleDownloadCase = (caseItem, e) => {
    if (e) e.stopPropagation();
    if (!caseItem) return;

    if (caseItem.pdf_file_path) {
      const pdfUrl = `${import.meta.env.VITE_BASE_URL || ''}${caseItem.pdf_file_path}`;
      window.open(pdfUrl, '_blank');
      showToast(`Downloading official PDF judgment file...`);
      return;
    }

    const docContent = `
================================================================================
DIGI LAW REPORTER - OFFICIAL VERIFIED JUDGMENT RECORD
================================================================================

TITLE: ${caseItem.title || 'Untitled Case'}
COURT: ${caseItem.court_name || 'Supreme Court of India'}
DATE: ${caseItem.judgment_date ? new Date(caseItem.judgment_date).toLocaleDateString('en-IN') : 'N/A'}
CITATIONS: ${caseItem.citation || 'N/A'}
CASE NO: ${caseItem.case_number || 'N/A'}
PARTIES: ${caseItem.petitioner_name || 'Petitioner'} VERSUS ${caseItem.respondent_name || 'Respondent'}

--------------------------------------------------------------------------------
HEADNOTE & RATIO DECIDENDI
--------------------------------------------------------------------------------
${caseItem.head_note || 'N/A'}

--------------------------------------------------------------------------------
FULL JUDGMENT TEXT
--------------------------------------------------------------------------------
${caseItem.content || 'N/A'}

================================================================================
VERIFIED BY DIGI LAW REPORTER DIGITAL LEGAL DIGEST
================================================================================
`;

    const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const sanitizedTitle = (caseItem.title || 'Judgment').replace(/[^a-zA-Z0-9]/g, '_');
    link.href = url;
    link.download = `Judgment_${sanitizedTitle}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Downloaded judgment text record successfully`);
  };

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        if (query && query.trim()) {
          const res = await fetch(`http://localhost:5000/api/public/search?keyword=${encodeURIComponent(query.trim())}`);
          const data = await res.json();
          if (data.success && data.data && data.data.length > 0) {
            setResults(data.data);
            setSelectedCase(data.data[0]);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Error fetching search results:", err);
      }
      
      // Clean state: No dummy fallback data
      setResults([]);
      setSelectedCase(null);
      setLoading(false);
    };

    fetchResults();
  }, [query]);

  // Compute Categories & Courts
  const categoryCounts = useMemo(() => {
    const counts = { ALL: results.length, Judgments: 0, "Digest Notes": 0, Articles: 0, Notifications: 0 };
    results.forEach(r => {
      const cat = r.category || 'Judgments';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [results]);

  const courtCounts = useMemo(() => {
    const counts = {};
    results.forEach(r => {
      const court = r.court_name || 'Supreme Court of India';
      counts[court] = (counts[court] || 0) + 1;
    });
    return counts;
  }, [results]);

  // Filtered Results Calculation
  const filteredResults = useMemo(() => {
    return results.filter(item => {
      // Category filter
      if (selectedCategory !== 'ALL' && (item.category || 'Judgments') !== selectedCategory) return false;
      // Court filter
      if (selectedCourtFilter !== 'ALL' && (item.court_name || 'Supreme Court of India') !== selectedCourtFilter) return false;
      // Year range filter
      if (item.judgment_date) {
        const yr = new Date(item.judgment_date).getFullYear();
        if (yr < startYear || yr > endYear) return false;
      }
      // Search within search results input
      if (searchWithinResults.trim()) {
        const q = searchWithinResults.toLowerCase();
        const full = `${item.title} ${item.citation} ${item.content} ${item.head_note}`.toLowerCase();
        if (!full.includes(q)) return false;
      }
      return true;
    });
  }, [results, selectedCategory, selectedCourtFilter, startYear, endYear, searchWithinResults]);

  // Current selected case index & navigation handlers
  const currentIndex = useMemo(() => {
    if (!selectedCase) return -1;
    return filteredResults.findIndex(r => String(r.id) === String(selectedCase.id));
  }, [filteredResults, selectedCase]);

  const handleNavFirst = () => { if (filteredResults.length > 0) setSelectedCase(filteredResults[0]); };
  const handleNavPrev = () => { if (currentIndex > 0) setSelectedCase(filteredResults[currentIndex - 1]); };
  const handleNavNext = () => { if (currentIndex >= 0 && currentIndex < filteredResults.length - 1) setSelectedCase(filteredResults[currentIndex + 1]); };
  const handleNavLast = () => { if (filteredResults.length > 0) setSelectedCase(filteredResults[filteredResults.length - 1]); };

  const handleCopyCitation = (citation) => {
    if (!citation) return;
    navigator.clipboard.writeText(citation);
    setCopiedCitation(true);
    showToast("Citation & judgment title copied to clipboard!");
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  const activeHighlightQuery = searchWithinDoc.trim() ? searchWithinDoc : query;

  return (
    <div className="flex flex-col w-full h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      
      {/* ========================================================================= */}
      {/* 1. TOP GLOBAL WORKSPACE HEADER BAR */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border-b border-slate-700/80 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0 z-30 shadow-md">
        
        {/* Left: Brand Badge */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => navigate('/search')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-1.5 rounded-lg shadow-md group-hover:scale-105 transition-transform">
              <Scale size={18} className="text-white" />
            </div>
            <div>
              <span className="font-cinzel text-sm font-bold tracking-wider text-white">DIGI <span className="text-blue-400">LAW</span></span>
              <span className="text-[10px] block font-mono text-slate-400 -mt-1 tracking-widest uppercase">Reporter</span>
            </div>
          </div>
        </div>

        {/* Center: Search within search results box */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              value={searchWithinResults}
              onChange={(e) => setSearchWithinResults(e.target.value)}
              placeholder="Search within Search Results..."
              className="w-full bg-slate-800/90 border border-slate-700 rounded-md pl-3 pr-8 py-1.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-medium"
            />
            {searchWithinResults ? (
              <X 
                size={13} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-white"
                onClick={() => setSearchWithinResults('')}
              />
            ) : (
              <Search size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            )}
          </div>
        </div>

        {/* Right: Dashboard Button & Saved Cases Library Button */}
        <div className="flex items-center gap-2">
          
          {/* Dashboard Button next to Saved Cases */}
          <button
            onClick={() => navigate('/search')}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700 transition-colors shadow-xs cursor-pointer"
            title="Return to Legal Research Dashboard"
          >
            <LayoutDashboard size={14} className="text-blue-400" />
            <span>Dashboard</span>
          </button>

          {/* Saved Cases Button */}
          <button
            onClick={() => setIsSavedDrawerOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            title="View Saved Cases Library"
          >
            <FolderBookmark size={15} />
            <span>Saved Cases</span>
            {savedCases.length > 0 && (
              <span className="bg-yellow-400 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                {savedCases.length}
              </span>
            )}
          </button>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. THREE-PANE LEGAL RESEARCH WORKSPACE */}
      {/* ========================================================================= */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row w-full h-[calc(100vh-49px)] overflow-hidden bg-slate-200">
        
        {/* PANE 1: FILTERS SIDEBAR (Left Column) */}
        <div className="w-full lg:w-64 bg-slate-900 text-slate-200 border-b lg:border-b-0 lg:border-r border-slate-700 flex flex-col shrink-0">
          
          {/* Category Tabs */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-blue-400" /> Filter Options
            </span>
            <button 
              onClick={() => { setSelectedCategory('ALL'); setSelectedCourtFilter('ALL'); setSearchWithinResults(''); }}
              className="text-[10px] font-bold text-blue-400 hover:underline cursor-pointer"
            >
              Reset
            </button>
          </div>

          {/* Categories List */}
          <div className="p-2 space-y-1 border-b border-slate-800">
            <div className="text-[10px] font-extrabold text-slate-400 px-2 py-1 uppercase tracking-wider">
              Document Types
            </div>
            
            {[
              { id: 'ALL', label: 'All Results', count: categoryCounts.ALL },
              { id: 'Judgments', label: 'Judgments', count: categoryCounts.Judgments },
              { id: 'Digest Notes', label: 'Digest Notes', count: categoryCounts["Digest Notes"] },
              { id: 'Articles', label: 'Legal Articles', count: categoryCounts.Articles },
              { id: 'Notifications', label: 'Notifications', count: categoryCounts.Notifications }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === cat.id ? 'bg-blue-800 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Courts List */}
          <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1" data-lenis-prevent>
            <div className="text-[10px] font-extrabold text-slate-400 px-2 py-1 uppercase tracking-wider">
              Courts & Jurisdiction
            </div>

            <button
              onClick={() => setSelectedCourtFilter('ALL')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                selectedCourtFilter === 'ALL'
                  ? 'bg-slate-800 text-blue-400 border border-blue-500/40'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>All Courts</span>
              <span className="bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded-full text-[10px]">{results.length}</span>
            </button>

            {Object.entries(courtCounts).map(([court, count], idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCourtFilter(court)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
                  selectedCourtFilter === court
                    ? 'bg-slate-800 text-blue-400 border border-blue-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <span className="truncate text-left max-w-[140px]">{court}</span>
                <span className="bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded-full text-[10px]">{count}</span>
              </button>
            ))}
          </div>

          {/* Year Range Filter */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-400 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <span>Filter Years:</span>
              <span className="text-blue-400 font-mono">{startYear} to {endYear}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(Number(e.target.value))}
                min="1800"
                max="2026"
                className="w-16 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-center text-xs text-white"
              />
              <span>-</span>
              <input
                type="number"
                value={endYear}
                onChange={(e) => setEndYear(Number(e.target.value))}
                min="1800"
                max="2026"
                className="w-16 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-center text-xs text-white"
              />
            </div>
          </div>

        </div>

        {/* PANE 2: RESULT LIST (Middle Column) */}
        <div className="w-full lg:w-[380px] h-[320px] lg:h-full flex flex-col bg-slate-100 border-b lg:border-b-0 lg:border-r border-slate-300 shrink-0 z-10">
          
          {/* Result List Header Bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-300 bg-white shrink-0 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Result List
              </span>
              <span className="bg-slate-200 text-slate-700 font-mono font-bold text-[10px] px-1.5 py-0.2 rounded">
                {filteredResults.length}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500">Sort by:</span>
              <select className="bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600">
                <option>Relevance</option>
                <option>Latest Date</option>
                <option>Court Name</option>
              </select>
            </div>
          </div>

          {/* Scrollable Result Item Cards */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-200 bg-white" data-lenis-prevent>
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Searching database...</span>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No judgments matching filter criteria.
              </div>
            ) : (
              filteredResults.map((item, index) => {
                const isSelected = selectedCase?.id === item.id;
                const isSaved = savedCases.some(c => String(c.id) === String(item.id));

                return (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedCase(item)}
                    className={`p-3 cursor-pointer transition-all duration-150 ${
                      isSelected 
                        ? 'bg-blue-50/90 border-l-4 border-l-blue-700 shadow-2xs' 
                        : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                    }`}
                  >
                    {/* Top Row: Case Title & Check Save Badge */}
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className={`font-bold text-xs leading-snug ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                        {index + 1}. {item.title}
                      </span>
                      {isSaved && (
                        <span className="bg-emerald-100 text-emerald-800 p-0.5 rounded shrink-0" title="Saved Case">
                          <CheckCircle2 size={12} />
                        </span>
                      )}
                    </div>
                    
                    {/* Citation & Date Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] mb-1.5">
                      {item.citation && (
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                          {item.citation}
                        </span>
                      )}
                      {item.judgment_date && (
                        <span className="text-slate-500 text-[10px] font-medium">
                          {new Date(item.judgment_date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      )}
                    </div>

                    {/* Highlighted Snippet */}
                    <div 
                      className="text-[11px] text-slate-600 leading-normal line-clamp-2 mb-1.5 bg-slate-50 p-1.5 rounded border border-slate-200 font-sans"
                      dangerouslySetInnerHTML={getHighlightedSnippet(item.content || item.head_note, query)}
                    />

                    {/* Court Badge */}
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Landmark size={11} className="text-blue-600" /> {item.court_name || 'Supreme Court of India'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* PANE 3: CASE DETAILS WORKSPACE & TOOLBAR (Right Column) */}
        <div className="flex-1 min-h-0 bg-slate-200 flex flex-col relative z-0 h-full overflow-hidden">
          
          {selectedCase ? (
            <>
              {/* CASE DETAILS ACTION TOOLBAR BAR */}
              <div className="bg-[#1E4D6E] text-white px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 shrink-0 shadow-md z-10">
                
                {/* Navigation Pill (|< < Pencil > >|) */}
                <div className="flex items-center bg-[#153852] rounded-full px-2 py-0.5 gap-1 border border-blue-400/30">
                  <button 
                    onClick={handleNavFirst} 
                    disabled={currentIndex <= 0}
                    className="p-1 hover:text-yellow-300 disabled:opacity-40 transition-colors cursor-pointer" 
                    title="First Case (|<)"
                  >
                    <ChevronsLeft size={14} />
                  </button>
                  <button 
                    onClick={handleNavPrev} 
                    disabled={currentIndex <= 0}
                    className="p-1 hover:text-yellow-300 disabled:opacity-40 transition-colors cursor-pointer" 
                    title="Previous Case (<)"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  
                  {/* Highlighter Pencil Toggle */}
                  <button 
                    onClick={() => setIsHighlightingEnabled(!isHighlightingEnabled)} 
                    className={`p-1.5 rounded-md transition-all cursor-pointer ${isHighlightingEnabled ? 'bg-yellow-400 text-slate-950 font-bold shadow-xs' : 'text-slate-300 hover:text-white'}`} 
                    title="Toggle Keyword Highlighter"
                  >
                    <Highlighter size={13} />
                  </button>

                  <button 
                    onClick={handleNavNext} 
                    disabled={currentIndex < 0 || currentIndex >= filteredResults.length - 1}
                    className="p-1 hover:text-yellow-300 disabled:opacity-40 transition-colors cursor-pointer" 
                    title="Next Case (>)"
                  >
                    <ChevronRight size={14} />
                  </button>
                  <button 
                    onClick={handleNavLast} 
                    disabled={currentIndex < 0 || currentIndex >= filteredResults.length - 1}
                    className="p-1 hover:text-yellow-300 disabled:opacity-40 transition-colors cursor-pointer" 
                    title="Last Case (>|)"
                  >
                    <ChevronsRight size={14} />
                  </button>
                </div>

                {/* Right Action Icons (Copy, Save, Search, Share, Font Size, Print, Download, Audio) */}
                <div className="flex items-center gap-1 sm:gap-2">
                  
                  {/* 1. Copy Icon */}
                  <button 
                    onClick={() => handleCopyCitation(`${selectedCase.title}\nCitation: ${selectedCase.citation || 'N/A'}\nCourt: ${selectedCase.court_name || ''}`)}
                    className="p-1.5 hover:bg-blue-800/80 rounded transition-colors text-white cursor-pointer"
                    title="Copy Citation & Judgment Title"
                  >
                    {copiedCitation ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>

                  {/* 2. Save / Bookmark Icon for Future Use */}
                  <button
                    onClick={(e) => handleToggleSaveCase(selectedCase, e)}
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      savedCases.some(c => String(c.id) === String(selectedCase.id))
                        ? 'bg-yellow-400 text-slate-950 font-bold shadow-xs'
                        : 'hover:bg-blue-800/80 text-white'
                    }`}
                    title="Save Case to Bookmarks for Future Use"
                  >
                    <Bookmark size={16} fill={savedCases.some(c => String(c.id) === String(selectedCase.id)) ? "currentColor" : "none"} />
                  </button>

                  {/* 3. Search inside Judgment Document */}
                  <div className="relative flex items-center">
                    <button 
                      onClick={() => setShowDocSearch(!showDocSearch)}
                      className={`p-1.5 rounded transition-colors cursor-pointer ${showDocSearch ? 'bg-blue-800 text-yellow-300' : 'hover:bg-blue-800/80 text-white'}`}
                      title="Find / Search in Judgment Text"
                    >
                      <Search size={16} />
                    </button>

                    {showDocSearch && (
                      <div className="absolute right-0 top-9 bg-slate-900 border border-slate-700 p-2 rounded-lg shadow-xl flex items-center gap-1.5 z-50 min-w-[220px]">
                        <input
                          type="text"
                          value={searchWithinDoc}
                          onChange={(e) => setSearchWithinDoc(e.target.value)}
                          placeholder="Search in judgment..."
                          className="bg-slate-800 text-white text-xs px-2.5 py-1 rounded border border-slate-700 focus:outline-none focus:border-blue-500 flex-1"
                          autoFocus
                        />
                        <X size={14} className="text-slate-400 cursor-pointer hover:text-white" onClick={() => setShowDocSearch(false)} />
                      </div>
                    )}
                  </div>

                  {/* 4. Social & Email Share Icon */}
                  <button 
                    onClick={() => setIsShareModalOpen(true)}
                    className="p-1.5 hover:bg-blue-800/80 rounded transition-colors text-white cursor-pointer"
                    title="Share Case (WhatsApp, Twitter/X, LinkedIn & Email)"
                  >
                    <Share2 size={16} />
                  </button>

                  {/* 5. Font Size Toggle (A+/A-) */}
                  <div className="flex items-center bg-[#153852] rounded px-1.5 py-0.5 border border-blue-400/30 text-xs font-mono font-bold">
                    <button 
                      onClick={() => setFontSize(prev => Math.max(12, prev - 1))}
                      className="px-1 hover:text-yellow-300 transition-colors cursor-pointer"
                      title="Decrease Font Size"
                    >
                      A-
                    </button>
                    <span className="px-1 text-[11px] text-blue-200">{fontSize}px</span>
                    <button 
                      onClick={() => setFontSize(prev => Math.min(22, prev + 1))}
                      className="px-1 hover:text-yellow-300 transition-colors cursor-pointer"
                      title="Increase Font Size"
                    >
                      A+
                    </button>
                  </div>

                  {/* 6. Print Icon */}
                  <button 
                    onClick={() => window.print()}
                    className="p-1.5 hover:bg-blue-800/80 rounded transition-colors text-white cursor-pointer"
                    title="Print Judgment Document"
                  >
                    <Printer size={16} />
                  </button>

                  {/* 7. Download PDF / Text File Icon */}
                  <button 
                    onClick={(e) => handleDownloadCase(selectedCase, e)}
                    className="p-1.5 hover:bg-blue-800/80 rounded transition-colors text-white cursor-pointer"
                    title="Download Judgment PDF / File"
                  >
                    <Download size={16} />
                  </button>

                  {/* 8. Audio Speaker Text-to-Speech Icon */}
                  <button 
                    onClick={handleToggleAudio}
                    className={`p-1.5 rounded transition-colors cursor-pointer ${isSpeaking ? 'bg-yellow-400 text-slate-950 font-bold animate-pulse' : 'hover:bg-blue-800/80 text-white'}`}
                    title="Listen to Audio Judgment (Text-to-Speech)"
                  >
                    {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>

                </div>
              </div>

              {/* Judgment Text Viewer (Full Height Scrollable Container) */}
              <div 
                className="flex-1 min-h-0 overflow-y-auto p-4 md:p-8 bg-slate-200 select-text" 
                style={{ fontSize: `${fontSize}px` }}
                data-lenis-prevent
              >
                <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-lg border border-slate-300 shadow-md text-slate-900 font-serif leading-relaxed mb-12">
                  
                  {/* Formal Citation Header */}
                  <div className="mb-6 pb-6 border-b border-slate-300 space-y-3">
                    {selectedCase.citation && (
                      <div className="text-lg md:text-xl font-bold font-mono text-slate-900">
                        {selectedCase.citation}
                      </div>
                    )}

                    <div className="text-center font-sans space-y-1">
                      <h1 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-wide">
                        {selectedCase.court_name || 'In the Supreme Court of India'}
                      </h1>
                      {selectedCase.bench && (
                        <div className="text-xs text-slate-600 font-semibold italic">
                          ({selectedCase.bench})
                        </div>
                      )}
                    </div>

                    <div className="py-3 text-sm md:text-base font-semibold text-slate-800 text-center font-sans space-y-1">
                      <div><span className="font-bold text-blue-900">{selectedCase.petitioner_name || selectedCase.title}</span> ... Appellant(s);</div>
                      <div className="text-xs italic font-bold text-slate-500">Versus</div>
                      <div><span className="font-bold text-blue-900">{selectedCase.respondent_name || 'Respondent'}</span> ... Respondent(s).</div>
                    </div>

                    {selectedCase.case_number && (
                      <div className="text-xs text-center text-slate-600 font-medium font-sans">
                        {selectedCase.case_number}
                      </div>
                    )}
                    
                    {selectedCase.judgment_date && (
                      <div className="text-xs text-center font-bold text-slate-700 font-sans">
                        Decided on {new Date(selectedCase.judgment_date).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}

                    {selectedCase.advocates && (
                      <div className="pt-3 border-t border-slate-200 text-xs text-slate-700 font-sans leading-normal">
                        <span className="font-bold text-slate-900 block mb-1">Advocates who appeared in this case:</span>
                        <p className="text-slate-600">{selectedCase.advocates}</p>
                      </div>
                    )}
                  </div>

                  {/* Body Text & Headnotes */}
                  <div className="space-y-6">
                    {selectedCase.head_note && (
                      <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-sans">
                          Head Note & Ratio Decidendi
                        </h3>
                        <div 
                          className="text-sm font-medium text-slate-800 leading-relaxed font-sans"
                          dangerouslySetInnerHTML={getHighlightedFullText(selectedCase.head_note, activeHighlightQuery, isHighlightingEnabled)}
                        />
                      </div>
                    )}

                    {selectedCase.content && (
                      <div className="space-y-3 pt-2">
                        <div 
                          className="whitespace-pre-line text-slate-900 text-justify font-serif"
                          dangerouslySetInnerHTML={getHighlightedFullText(selectedCase.content, activeHighlightQuery, isHighlightingEnabled)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-10 pt-4 border-t border-slate-200 text-center font-sans text-xs text-slate-400">
                    - DIGI LAW REPORTER OFFICIAL VERIFIED RECORD -
                  </div>

                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-6 text-center space-y-2">
              <Scale size={48} className="text-slate-400 stroke-[1.5]" />
              <p className="text-sm font-semibold">Select a case from the Result List to view details.</p>
            </div>
          )}

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. SAVED CASES BOOKMARKS DRAWER */}
      {/* ========================================================================= */}
      {isSavedDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white text-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FolderBookmark className="text-yellow-400" size={18} />
                <h2 className="font-bold text-sm">Saved Cases Library ({savedCases.length})</h2>
              </div>
              <X size={18} className="cursor-pointer hover:text-yellow-300" onClick={() => setIsSavedDrawerOpen(false)} />
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 divide-y divide-slate-100" data-lenis-prevent>
              {savedCases.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-3">
                  <Bookmark size={40} className="mx-auto text-slate-300" />
                  <p className="text-xs font-semibold">No saved cases yet.</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Click the bookmark icon on any judgment to save it to your account for future reference.
                  </p>
                </div>
              ) : (
                savedCases.map((item, idx) => (
                  <div key={idx} className="py-3 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span 
                        onClick={() => { setSelectedCase(item); setIsSavedDrawerOpen(false); }}
                        className="font-bold text-xs text-blue-900 hover:underline cursor-pointer leading-snug"
                      >
                        {item.title}
                      </span>
                      <button 
                        onClick={(e) => handleToggleSaveCase(item, e)}
                        className="text-slate-400 hover:text-red-600 text-xs font-bold shrink-0 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                    {item.citation && (
                      <div className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 inline-block">
                        {item.citation}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
              <button 
                onClick={() => setIsSavedDrawerOpen(false)}
                className="w-full bg-slate-900 text-white font-bold text-xs py-2 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Close Library
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SOCIAL MEDIA & EMAIL SHARE MODAL (WhatsApp, Twitter/X, LinkedIn, Email) */}
      {/* ========================================================================= */}
      {isShareModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="text-blue-600" size={18} />
                <h3 className="font-bold text-sm">Share Judgment Record</h3>
              </div>
              <X size={16} className="cursor-pointer text-slate-400 hover:text-slate-700" onClick={() => setIsShareModalOpen(false)} />
            </div>

            <div className="text-xs text-slate-600 font-medium">
              Share <span className="font-bold text-slate-900">"{selectedCase.title}"</span> across social media platforms or direct link:
            </div>

            {/* Social Media & Email Share Buttons (4 Platforms: WhatsApp, Twitter/X, LinkedIn, Email) */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              
              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Digi Law Reporter Judgment:\n${selectedCase.title}\nCitation: ${selectedCase.citation || ''}\nLink: ${window.location.href}`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-[#075E54] hover:bg-[#128C7E] text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                <WhatsappIcon />
                <span>WhatsApp</span>
              </a>

              {/* Twitter / X */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this judgment on Digi Law Reporter: ${selectedCase.title}`)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-[#0F1419] hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                <TwitterXIcon />
                <span>Twitter / X</span>
              </a>

              {/* LinkedIn */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                <LinkedinIcon />
                <span>LinkedIn</span>
              </a>

              {/* Direct Email */}
              <button
                onClick={() => { setIsShareModalOpen(false); setIsEmailModalOpen(true); }}
                className="flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                <Mail size={15} />
                <span>Email</span>
              </button>

            </div>

            {/* Copy Direct Link */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="flex-1 bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded border border-slate-300 font-mono"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast("Direct link copied to clipboard!");
                  setIsShareModalOpen(false);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded text-xs shrink-0 cursor-pointer"
              >
                Copy Link
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. EMAIL DIRECT SHARE MODAL */}
      {/* ========================================================================= */}
      {isEmailModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="text-blue-600" size={18} />
                <h3 className="font-bold text-sm">Send Judgment via Email</h3>
              </div>
              <X size={16} className="cursor-pointer text-slate-400 hover:text-slate-700" onClick={() => setIsEmailModalOpen(false)} />
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const mailtoUrl = `mailto:${encodeURIComponent(emailAddress)}?subject=${encodeURIComponent(`Legal Judgment: ${selectedCase.title}`)}&body=${encodeURIComponent(`Hi,\n\nPlease find the details of the judgment from Digi Law Reporter:\n\nTitle: ${selectedCase.title}\nCitation: ${selectedCase.citation || 'N/A'}\nCourt: ${selectedCase.court_name || ''}\n\nSummary:\n${selectedCase.head_note || ''}\n\nRead full judgment online: ${window.location.href}`)}`;
                window.location.href = mailtoUrl;
                showToast(`Opening your email client...`);
                setIsEmailModalOpen(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  required
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="lawyer@firm.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">Case Preview:</div>
                <div className="truncate font-semibold">{selectedCase.title}</div>
                <div className="font-mono text-[11px] text-blue-700">{selectedCase.citation}</div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded text-xs shadow-md cursor-pointer"
                >
                  Send Email
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white font-bold text-xs md:text-sm px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <Sparkles size={16} className="text-yellow-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
