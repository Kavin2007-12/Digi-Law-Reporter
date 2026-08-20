import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { MOCK_LAWYER_SETTINGS } from '../data/adminMockData';

export default function About() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('siteSettings');
    return saved ? JSON.parse(saved) : MOCK_LAWYER_SETTINGS;
  });

  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('siteSettings');
      if (saved) setSettings(JSON.parse(saved));
    };

    window.addEventListener('siteSettingsUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('siteSettingsUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const about = settings.aboutPage || MOCK_LAWYER_SETTINGS.aboutPage;

  const founders = [
    {
      name: about.founder1Name || "Senior Advocate & Founder Name",
      title: about.founder1Title || "Senior Advocate & Managing Founder",
      court: about.founder1Court || "Supreme Court of India",
      experience: about.founder1Experience || "25+ Years Bar Practice",
      barNo: about.founder1BarNo || "Bar Registration No.",
      specialization: ["Constitutional Law", "Supreme Court Appeals", "Commercial Writs"],
      image: about.founder1Image || null,
      bio: about.founder1Bio || "Founder profile details, legal background, bar accomplishments, and leadership overview will be added here.",
      badge: "FOUNDING PARTNER"
    },
    {
      name: about.founder2Name || "Co-Founder & Advocate Name",
      title: about.founder2Title || "Advocate-on-Record (AoR) & Co-Founder",
      court: about.founder2Court || "Supreme Court of India",
      experience: about.founder2Experience || "18+ Years Litigation",
      barNo: about.founder2BarNo || "SCBA Registration No.",
      specialization: ["Special Leave Petitions", "Appellate Litigation", "Civil & Criminal Code"],
      image: about.founder2Image || null,
      bio: about.founder2Bio || "Co-founder profile details, editorial board role, practice specialization, and background information will be added here.",
      badge: "HEAD OF EDITORIAL"
    }
  ];

  const team = (about.teamMembers && about.teamMembers.length > 0) 
    ? about.teamMembers.map((m, idx) => ({
        ...m,
        avatarBg: idx % 4 === 0 ? "bg-primary-600" : idx % 4 === 1 ? "bg-indigo-600" : idx % 4 === 2 ? "bg-blue-600" : "bg-slate-800"
      }))
    : MOCK_LAWYER_SETTINGS.aboutPage.teamMembers;

  return (
    <div className="bg-[#FAFBFF] font-jakarta min-h-screen pb-6">
      
      {/* Senior Founders & Managing Lawyers Showcase */}
      <section className="pt-8 md:pt-10 pb-10 md:pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-6 md:mb-8">
          <span className="text-primary-600 font-extrabold tracking-widest uppercase text-[10px] px-3 py-0.5 bg-primary-50 border border-primary-100 rounded-full inline-block">
            LEADERSHIP & LEGAL BAR EXPERIENCE
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-cinzel">
            Senior Advocates & Founders
          </h2>
          <p className="text-slate-600 text-xs md:text-sm">
            Guided by active Supreme Court and High Court litigation practice.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {founders.map((lawyer, idx) => (
            <div 
              key={idx}
              className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row group"
            >
              {/* Compact Advocate Portrait Container */}
              <div className="md:w-4/12 relative bg-slate-900 shrink-0 overflow-hidden flex flex-col items-center justify-center min-h-[160px] md:min-h-[180px] p-4 text-center">
                {lawyer.image ? (
                  <img 
                    src={lawyer.image} 
                    alt={lawyer.name} 
                    className="w-full h-44 md:h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 space-y-1.5">
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                      <User size={24} />
                    </div>
                    <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">Advocate Profile</span>
                  </div>
                )}

                <div className="absolute top-2.5 left-2.5 bg-[#0A1128]/90 backdrop-blur-md border border-[#D4AF37]/50 text-[#D4AF37] text-[9px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-xs z-10">
                  {lawyer.badge}
                </div>
              </div>

              {/* Compact Details Column */}
              <div className="md:w-8/12 p-5 md:p-6 flex flex-col justify-between space-y-3">
                <div>
                  <div className="space-y-0.5 mb-2.5">
                    <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-primary-700 transition-colors leading-tight">
                      {lawyer.name}
                    </h3>
                    <p className="text-[11px] font-bold text-primary-700 uppercase tracking-wide">
                      {lawyer.title}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {lawyer.court}
                    </p>
                  </div>

                  {/* Badges & Experience */}
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    <span className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                      {lawyer.experience}
                    </span>
                    <span className="bg-primary-50 border border-primary-100 text-primary-800 text-[10px] font-semibold px-2 py-0.5 rounded">
                      {lawyer.barNo}
                    </span>
                  </div>

                  {/* Bio */}
                  <p className="text-slate-600 text-xs leading-relaxed mb-3 italic line-clamp-3">
                    "{lawyer.bio}"
                  </p>

                  {/* Specializations */}
                  <div>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Practice Specialization</span>
                    <div className="flex flex-wrap gap-1">
                      {lawyer.specialization.map((spec, sIdx) => (
                        <span key={sIdx} className="bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-500" /> Bar Verified Practitioner
                  </span>
                  <span className="text-primary-700 font-bold text-[10px]">Supreme Court Senior Bar</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </section>

      {/* Legal Research & Editorial Team Section */}
      <section className="pt-6 pb-10 md:pt-8 md:pb-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-6">
            <span className="text-primary-600 font-extrabold tracking-widest uppercase text-[10px] px-3 py-0.5 bg-primary-50 border border-primary-100 rounded-full inline-block">
              EDITORIAL & RESEARCH BOARD
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-cinzel">
              Legal Research & Editorial Board
            </h2>
            <p className="text-slate-600 text-xs md:text-sm">
              A dedicated team of senior advocates, judicial clerks, and legal researchers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {team.map((m, idx) => (
              <div 
                key={idx}
                className="bg-slate-50 border border-slate-200/90 rounded-xl p-5 hover:bg-white hover:border-primary-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Avatar Circle */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg ${m.avatarBg} text-white font-black text-sm flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                      <User size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-primary-700 transition-colors leading-tight">
                        {m.name}
                      </h4>
                      <span className="text-[10px] font-bold text-primary-600 block mt-0.5">
                        {m.role}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-500 text-[11px] font-semibold mb-2">
                    {m.qual}
                  </p>

                  <p className="text-slate-600 text-[11px] leading-relaxed mb-3">
                    <strong className="text-slate-800">Domain Focus:</strong> {m.focus}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-semibold text-slate-700">Verified Contributor</span>
                  <ShieldCheck size={13} className="text-primary-600" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
