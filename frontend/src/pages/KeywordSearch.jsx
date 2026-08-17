import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, BookOpen, FileText, Users, Library, Type, ChevronDown } from 'lucide-react';

const TAB_KEY_MAP = {
  keyword: 'Keyword Search',
  section: 'Title or Act',
  citation: 'Find By Citation',
  party: 'Find By Party Name',
  topic: 'Find By Topic',
  phrase: 'Words & Phrases'
};

const REVERSE_TAB_MAP = {
  'Keyword Search': 'keyword',
  'Title or Act': 'section',
  'Find By Citation': 'citation',
  'Find By Party Name': 'party',
  'Find By Topic': 'topic',
  'Words & Phrases': 'phrase'
};

const COURTS_CATEGORIES = [
  { group: "All Jurisdiction", options: ["All Jurisdiction"] },
  { 
    group: "Indian Courts", 
    options: [
      "Supreme Court of India",
      "Federal Court",
      "Privy Council"
    ] 
  },
  { 
    group: "High Courts", 
    options: [
      "Allahabad High Court",
      "Andhra Pradesh High Court",
      "Bombay High Court",
      "Calcutta High Court",
      "Chhattisgarh High Court",
      "Delhi High Court",
      "Gauhati High Court",
      "Gujarat High Court",
      "Himachal Pradesh High Court",
      "Jammu & Kashmir High Court",
      "Jharkhand High Court",
      "Karnataka High Court",
      "Kerala High Court",
      "Madhya Pradesh High Court",
      "Madras High Court",
      "Manipur High Court",
      "Meghalaya High Court",
      "Orissa High Court",
      "Patna High Court",
      "Punjab and Haryana High Court",
      "Rajasthan High Court",
      "Sikkim High Court",
      "Telangana High Court",
      "Tripura High Court",
      "Uttarakhand High Court"
    ] 
  }
];

export default function KeywordSearch() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const tabParam = searchParams.get('tab') || 'keyword';

  const TABS = [
    'Keyword Search', 
    'Title or Act', 
    'Find By Citation', 
    'Find By Party Name', 
    'Find By Topic', 
    'Words & Phrases'
  ];

  const initialTabName = TAB_KEY_MAP[tabParam] || 'Keyword Search';
  const [activeTab, setActiveTab] = useState(initialTabName);

  // Form Fields State
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [sectionTerm, setSectionTerm] = useState('');
  
  // Composite Citation Builder State (Fixed DLR Journal)
  const [citeYear, setCiteYear] = useState('2026');
  const [citeMonth, setCiteMonth] = useState('');
  const citeJournal = 'DLR';
  const [citeCourt, setCiteCourt] = useState('SC');
  const [citeNumber, setCiteNumber] = useState('');
  const [citeEquivalent, setCiteEquivalent] = useState('');

  // Find By Party Name State
  const [partyCourt, setPartyCourt] = useState('');
  const [partyKeyword, setPartyKeyword] = useState('');
  const [famousCaseKeyword, setFamousCaseKeyword] = useState('');

  const [topicTerm, setTopicTerm] = useState('');
  const [phraseTerm, setPhraseTerm] = useState('');

  // Sync tab from URL if present
  useEffect(() => {
    if (tabParam && TAB_KEY_MAP[tabParam]) {
      setActiveTab(TAB_KEY_MAP[tabParam]);
    }
  }, [tabParam]);

  // Sync search term from URL query if present
  useEffect(() => {
    if (queryParam) {
      setSearchTerm(queryParam);
      setPartyKeyword(queryParam);
      setSectionTerm(queryParam);
    }
  }, [queryParam]);

  // Tab click switches search option view
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    const code = REVERSE_TAB_MAP[tab] || 'keyword';
    setSearchParams({ tab: code, ...(queryParam ? { q: queryParam } : {}) });
  };

  // Navigates directly to the 3-Pane Legal Search Workspace Results Page (/search/results)
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();

    let activeVal = '';
    if (activeTab === 'Keyword Search') {
      activeVal = searchTerm;
    } else if (activeTab === 'Title or Act') {
      activeVal = sectionTerm;
    } else if (activeTab === 'Find By Citation') {
      const yearPart = citeYear ? citeYear.trim() : '';
      const monthPart = citeMonth ? `(${citeMonth.trim()})` : '';
      const journalPart = 'DLR';
      const courtPart = citeCourt ? `(${citeCourt.trim()})` : '';
      const numPart = citeNumber ? citeNumber.trim() : '';
      const eqPart = citeEquivalent ? `: ${citeEquivalent.trim()}` : '';

      activeVal = `${yearPart} ${monthPart} ${journalPart} ${courtPart} ${numPart} ${eqPart}`.replace(/\s+/g, ' ').trim();
    } else if (activeTab === 'Find By Party Name') {
      activeVal = partyKeyword.trim();
    } else if (activeTab === 'Find By Topic') {
      activeVal = topicTerm;
    } else if (activeTab === 'Words & Phrases') {
      activeVal = phraseTerm;
    }

    const tabCode = REVERSE_TAB_MAP[activeTab] || 'keyword';
    const finalQuery = activeVal.trim() || 'Kavin';

    // Direct Navigation to Full 3-Pane Workspace Page
    navigate(`/search/results?q=${encodeURIComponent(finalQuery)}&tab=${tabCode}`);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 font-sans relative z-10">
      
      {/* 1. Top Header (Dark Theme - RESEARCH+) */}
      <div className="bg-slate-900 w-full pt-6 md:pt-8 pb-6 md:pb-7 px-4 sm:px-6 relative z-20 shadow-md">
        <div className="max-w-5xl mx-auto">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-4xl font-light tracking-wide text-slate-300 font-cinzel">
                RE<span className="text-primary-500 font-semibold">SEARCH+</span>
              </h1>
              <span className="text-slate-400 border-l border-slate-700 pl-3 text-xs tracking-wider uppercase font-medium">
                {activeTab}
              </span>
            </div>
            <div className="text-slate-400 text-xs">
              <p className="text-xs">Use the <span className="font-semibold text-white">Advanced Search options</span> below to refine your research.</p>
            </div>
          </div>

          {/* Special UI Layout for "Find By Citation" (Centered, Compact Box) */}
          {activeTab === 'Find By Citation' && (
            <div className="bg-white border border-slate-300 rounded-xl p-3.5 sm:p-4 shadow-lg text-slate-900 max-w-lg mx-auto space-y-2.5">
              
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="bg-slate-900 text-white font-extrabold px-2 py-0.5 rounded text-[10px]">DLR</span>
                  <span className="text-xs font-bold text-slate-800">Digital Law Reporter</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500">Citation Search <span className="text-red-500">*</span></span>
              </div>

              <form onSubmit={handleSearchSubmit} className="space-y-2.5">
                <div className="text-[10px] font-semibold text-slate-500">
                  Add New Citation
                </div>

                {/* Composite Line Input Container */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex flex-wrap items-center gap-1 text-xs font-mono shadow-2xs">
                  <input
                    type="text"
                    value={citeYear}
                    onChange={(e) => setCiteYear(e.target.value)}
                    placeholder="YYYY"
                    className="w-11 text-center bg-transparent border-b border-slate-300 focus:border-blue-600 text-slate-900 font-bold px-0.5 py-0.5 outline-none placeholder:text-slate-400 text-xs"
                  />

                  <span className="font-bold text-slate-400 text-xs">(</span>
                  <input
                    type="text"
                    value={citeMonth}
                    onChange={(e) => setCiteMonth(e.target.value)}
                    placeholder="MM"
                    className="w-8 text-center bg-transparent border-b border-slate-300 focus:border-blue-600 text-slate-900 font-bold px-0.5 py-0.5 outline-none placeholder:text-slate-400 text-xs"
                  />
                  <span className="font-bold text-slate-400 text-xs">)</span>

                  <span className="font-extrabold text-slate-900 px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px]">
                    DLR
                  </span>

                  <span className="font-bold text-slate-400 text-xs">(</span>
                  <input
                    type="text"
                    value={citeCourt}
                    onChange={(e) => setCiteCourt(e.target.value)}
                    placeholder="SC"
                    className="w-9 text-center bg-transparent border-b border-slate-300 focus:border-blue-600 text-slate-900 font-bold uppercase px-0.5 py-0.5 outline-none placeholder:text-slate-400 text-xs"
                  />
                  <span className="font-bold text-slate-400 text-xs">)</span>

                  <input
                    type="text"
                    value={citeNumber}
                    onChange={(e) => setCiteNumber(e.target.value)}
                    placeholder="#"
                    className="w-9 text-center bg-transparent border-b border-slate-300 focus:border-blue-600 text-slate-900 font-bold px-0.5 py-0.5 outline-none placeholder:text-slate-400 text-xs"
                  />

                  <span className="font-bold text-slate-400 px-0.5 text-xs">:</span>

                  <input
                    type="text"
                    value={citeEquivalent}
                    onChange={(e) => setCiteEquivalent(e.target.value)}
                    placeholder="Equivalent text (e.g. 2026 INSC 666)"
                    className="flex-1 min-w-[120px] bg-transparent border-b border-slate-300 focus:border-blue-600 text-slate-900 font-medium px-1 py-0.5 outline-none placeholder:text-slate-400 text-xs font-sans"
                  />
                </div>

                <div className="flex justify-end pt-0.5">
                  <button
                    type="submit"
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-1.5 rounded-md transition-colors shadow-xs flex items-center justify-center gap-1.5 text-xs shrink-0 cursor-pointer active:scale-95"
                  >
                    <Search size={13} />
                    <span>Get Citation</span>
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* Special UI Layout for "Find By Party Name" (Ultra Sleek & Reduced Box Size) */}
          {activeTab === 'Find By Party Name' && (
            <div className="bg-slate-100 border border-slate-300 rounded-xl p-2.5 sm:p-3 shadow-lg text-slate-900 space-y-2 max-w-md mx-auto">
              
              {/* SECTION 1: Search by Party Name */}
              <div className="bg-white border border-slate-200/90 rounded-lg p-2.5 sm:p-3 shadow-xs space-y-1.5">
                <h3 className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider">
                  Search by Party Name
                </h3>

                {/* Court Dropdown */}
                <div className="relative">
                  <select
                    value={partyCourt}
                    onChange={(e) => setPartyCourt(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-[11px] font-medium text-slate-700 focus:outline-none focus:border-blue-600 appearance-none cursor-pointer pr-6 shadow-2xs"
                  >
                    <option value="">---Select Court---</option>
                    {COURTS_CATEGORIES.map((cat, idx) => (
                      <optgroup key={idx} label={cat.group} className="font-bold text-slate-900 bg-slate-100">
                        {cat.options.map((opt) => (
                          <option key={opt} value={opt} className="bg-white font-medium text-slate-800">
                            {opt}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>

                {/* Party Keyword Input + Search Button */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const searchVal = partyKeyword.trim() || 'Kavin';
                    const finalQuery = partyCourt ? `${partyCourt}: ${searchVal}` : searchVal;
                    navigate(`/search/results?q=${encodeURIComponent(finalQuery)}&tab=party`);
                  }} 
                  className="flex items-center gap-1.5"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={partyKeyword}
                      onChange={(e) => setPartyKeyword(e.target.value)}
                      placeholder="Type Keywords Or Select History"
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-[11px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 font-medium shadow-2xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-3 py-1 rounded transition-colors shadow-xs flex items-center justify-center gap-1 text-[11px] shrink-0 cursor-pointer active:scale-95"
                  >
                    <Search size={11} />
                    <span>Find Case</span>
                  </button>
                </form>
              </div>

              {/* OR Divider Badge */}
              <div className="relative flex items-center justify-center py-0.5">
                <div className="border-t border-slate-300 w-full"></div>
                <span className="absolute bg-slate-100 px-2 text-[9px] font-extrabold text-slate-500 tracking-widest">
                  OR
                </span>
              </div>

              {/* SECTION 2: Search by Famous Case Names */}
              <div className="bg-white border border-slate-200/90 rounded-lg p-2.5 sm:p-3 shadow-xs space-y-1.5">
                <h3 className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider">
                  Search by Famous Case Names
                </h3>

                {/* Famous Case Keyword Input + Search Button */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const searchVal = famousCaseKeyword.trim() || 'Kavin';
                    navigate(`/search/results?q=${encodeURIComponent(searchVal)}&tab=party`);
                  }} 
                  className="flex items-center gap-1.5"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={famousCaseKeyword}
                      onChange={(e) => setFamousCaseKeyword(e.target.value)}
                      placeholder="Type Keywords Or Select History"
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-[11px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 font-medium shadow-2xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-3 py-1 rounded transition-colors shadow-xs flex items-center justify-center gap-1 text-[11px] shrink-0 cursor-pointer active:scale-95"
                  >
                    <Search size={11} />
                    <span>Find Case</span>
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* Standard Search Form Inputs (Clean single input without dropdowns) */}
          {activeTab !== 'Find By Citation' && activeTab !== 'Find By Party Name' && (
            <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center w-full max-w-2xl mx-auto">
              
              {activeTab === 'Keyword Search' && (
                <div className="flex-1 flex w-full bg-white rounded-md border border-slate-300 overflow-hidden shadow-sm">
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter Search Term (e.g. Article 21, natural justice, arbitration)" 
                    className="w-full bg-transparent text-slate-900 px-3.5 py-2 focus:outline-none text-xs sm:text-sm font-medium"
                  />
                </div>
              )}

              {activeTab === 'Title or Act' && (
                <div className="flex-1 flex w-full bg-white rounded-md border border-slate-300 overflow-hidden shadow-sm">
                  <input 
                    type="text" 
                    value={sectionTerm}
                    onChange={(e) => setSectionTerm(e.target.value)}
                    placeholder="Enter Title, Act Name, or Section (e.g. IPC, Companies Act 2013, Section 482)" 
                    className="w-full bg-transparent text-slate-900 px-3.5 py-2 focus:outline-none text-xs sm:text-sm font-medium"
                  />
                </div>
              )}

              {activeTab === 'Find By Topic' && (
                <div className="flex-1 flex w-full bg-white rounded-md border border-slate-300 overflow-hidden shadow-sm">
                  <input 
                    type="text" 
                    value={topicTerm}
                    onChange={(e) => setTopicTerm(e.target.value)}
                    placeholder="Enter Legal Topic (e.g. Fundamental Rights, Commercial Arbitration)" 
                    className="w-full bg-transparent text-slate-900 px-3.5 py-2 focus:outline-none text-xs sm:text-sm font-medium"
                  />
                </div>
              )}

              {activeTab === 'Words & Phrases' && (
                <div className="flex-1 flex w-full bg-white rounded-md border border-slate-300 overflow-hidden shadow-sm">
                  <input 
                    type="text" 
                    value={phraseTerm}
                    onChange={(e) => setPhraseTerm(e.target.value)}
                    placeholder="Enter Legal Word or Phrase (e.g. Mens Rea, Ratio Decidendi)" 
                    className="w-full bg-transparent text-slate-900 px-3.5 py-2 focus:outline-none text-xs sm:text-sm font-medium"
                  />
                </div>
              )}

              <button 
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-5 py-2 rounded-md transition-colors shadow-md flex items-center justify-center gap-1.5 text-xs shrink-0 active:scale-95 cursor-pointer"
              >
                <Search size={14} />
                <span>Search</span>
              </button>

            </form>
          )}

        </div>
      </div>

      {/* 2. Top Sub-Navigation Menu Tabs */}
      <div className="bg-[#E8EAEF] border-b border-slate-300 relative z-20 shadow-inner">
        <div className="max-w-6xl mx-auto flex flex-nowrap overflow-x-auto hide-scrollbar">
          {TABS.map(tab => (
            <button 
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-r border-slate-300/60
                ${activeTab === tab 
                  ? 'bg-primary-600 text-white shadow-sm' 
                  : 'text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      {/* 3. Welcome Guidelines Container */}
      <div className="w-full flex-1 relative z-10 p-6 flex flex-col items-center justify-center text-slate-500 text-center">
        <div className="max-w-md bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <Search size={36} className="mx-auto text-primary-600 stroke-[1.5]" />
          <h2 className="text-sm font-bold text-slate-800">Legal Search Portal</h2>
          <p className="text-xs text-slate-500">
            Enter your search terms above and click <span className="font-semibold text-slate-800">Search</span> or <span className="font-semibold text-slate-800">Get Citation</span> to open the full 3-Pane Legal Search Workspace.
          </p>
        </div>
      </div>

    </div>
  );
}
