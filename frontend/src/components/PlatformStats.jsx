import React from 'react';
import { Search, BookOpen, Users, Landmark, Calendar, Folder, CheckCircle2 } from 'lucide-react';

export default function PlatformStats() {
  const leftColumnCapabilities = [
    {
      icon: <Search size={24} />,
      title: "Keyword Search",
      desc: "Query legal terms, statutory sections, ratio decidendi, and precedent arguments with sub-second accuracy across millions of judgments.",
      tag: "FULL-TEXT INDEX",
      featurePill: "Boolean Search (AND, OR, NOT)"
    },
    {
      icon: <BookOpen size={24} />,
      title: "Citation Search",
      desc: "Instantly lookup official SCC, INSC, AIR, SCALE, and State High Court reporter citations with exact volume and page matching.",
      tag: "EXACT CITATION",
      featurePill: "SCC, INSC, AIR, SCALE & High Courts"
    },
    {
      icon: <Users size={24} />,
      title: "Party Name Search",
      desc: "Filter proceedings by Petitioner name, Respondent name, Senior Advocate appearances, or specific judicial bench compositions.",
      tag: "BENCH & COUNSEL",
      featurePill: "Petitioner vs Respondent & Counsel"
    }
  ];

  const rightColumnCapabilities = [
    {
      icon: <Landmark size={24} />,
      title: "Court Filtering",
      desc: "Narrow down search results to the Supreme Court of India, all 28 State High Courts, NCLAT, NGT, and specialized appellate tribunals.",
      tag: "28+ HIGH COURTS",
      featurePill: "Supreme Court & All State High Courts"
    },
    {
      icon: <Calendar size={24} />,
      title: "Year Range Filter",
      desc: "Segment case law decisions across specific decades, landmark eras (1950–2024), or custom date ranges for historical analysis.",
      tag: "1950 - 2024 ERAS",
      featurePill: "Landmark Decadal Era Segmentation"
    },
    {
      icon: <Folder size={24} />,
      title: "Topic Indexing",
      desc: "Systematically pre-categorized by Constitutional Law, Criminal Code (IPC/BNSS), Corporate Acts, Tax, and Intellectual Property.",
      tag: "50+ SUBJECTS",
      featurePill: "Constitutional, Criminal, Corporate & Tax"
    }
  ];

  return (
    <section className="relative pt-10 md:pt-14 pb-16 md:pb-20 border-b border-slate-200 overflow-hidden bg-slate-50 font-jakarta">
      
      {/* Subtle Supreme Court / Legal Environment Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-multiply pointer-events-none"
        style={{ backgroundImage: "url('/subtle_legal_bg.jpg')" }}
      ></div>

      {/* Light White/Blue-Gray Radial Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-50/90 via-slate-50/95 to-slate-50/90 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-8 md:mb-10 text-center max-w-3xl mx-auto space-y-3">
          <span className="text-primary-600 font-extrabold tracking-widest uppercase text-xs px-3.5 py-1 bg-white border border-primary-100 rounded-full inline-block shadow-sm">
            Search Capabilities
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight font-cinzel">
            Precision Research Tools
          </h2>
          <p className="text-slate-600 text-sm md:text-base font-normal">
            Multiple search vectors designed for exact legal discovery and courtroom preparation.
          </p>
        </div>

        {/* 2 Side-by-Side Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          
          {/* Left Column */}
          <div className="space-y-6">
            {leftColumnCapabilities.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm hover:shadow-xl hover:border-primary-300 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  {/* Top Row: Icon Badge & Feature Tag */}
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 group-hover:bg-[#D4AF37] group-hover:text-[#0A1128] transition-all duration-300">
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-extrabold tracking-widest text-primary-700 bg-primary-50 border border-primary-100 px-3 py-1 rounded-full uppercase">
                      {item.tag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-6 font-normal">
                    {item.desc}
                  </p>
                </div>

                {/* Bottom Feature Pill */}
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 size={16} className="text-primary-600 shrink-0" />
                  <span>{item.featurePill}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {rightColumnCapabilities.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm hover:shadow-xl hover:border-primary-300 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  {/* Top Row: Icon Badge & Feature Tag */}
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#0A1128] text-[#D4AF37] flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-extrabold tracking-widest text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full uppercase">
                      {item.tag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-6 font-normal">
                    {item.desc}
                  </p>
                </div>

                {/* Bottom Feature Pill */}
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 size={16} className="text-primary-600 shrink-0" />
                  <span>{item.featurePill}</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}








