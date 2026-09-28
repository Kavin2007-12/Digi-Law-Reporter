import React from 'react';

/**
 * Universal DLR Legal Document Design System — Compact Law Report Standard
 * Formats ANY legal document with compact, refined typography and exact law report proportions.
 */
export default function UniversalLegalDocument({ 
  doc, 
  fontSize = 13.5, 
  searchQuery = '', 
  isHighlightingEnabled = true 
}) {
  if (!doc) return null;

  // 1. Data Normalization & Dynamic Extraction
  const rawTitle = doc.title || doc.case_name || doc.name || '';
  
  let petitioner = doc.petitioner_name || doc.petitioner || '';
  let respondent = doc.respondent_name || doc.respondent || '';

  if (!petitioner && !respondent && rawTitle) {
    const splitMatch = rawTitle.split(/\s*(?:v\.?|vs\.?|VERSUS|V\/S)\s*/i);
    if (splitMatch.length === 2) {
      petitioner = splitMatch[0].trim();
      respondent = splitMatch[1].trim();
    }
  }

  const court = doc.court_name || doc.court || doc.jurisdiction || '';
  const bench = doc.bench || doc.coram || doc.judges || doc.author || '';
  const caseNumber = doc.case_number || doc.caseNumber || doc.appeal_number || doc.petition_number || '';
  const jurisdiction = doc.jurisdiction_type || doc.jurisdictionType || '';

  // Extract Citation
  let citation = doc.citation || doc.citations_string || '';
  if (!citation && Array.isArray(doc.citations) && doc.citations.length > 0) {
    const item = doc.citations[0];
    if (typeof item === 'string') {
      citation = item;
    } else if (item && typeof item === 'object') {
      const yr = item.year || doc.year || '';
      const ct = item.court || 'SC';
      const num = item.number || item.count || item.dlrNumber || '';
      citation = `${yr} (${item.month || '08'}) DLR (${ct}) #${num}`.trim();
    }
  }
  if (!citation && doc.year) {
    citation = `${doc.year} DLR (${doc.court || 'SC'})`;
  }

  // Format Decision Date
  let formattedDate = '';
  const rawDate = doc.judgment_date || doc.judgmentDate || doc.date || doc.decided_date;
  if (rawDate) {
    try {
      const parsedDate = new Date(rawDate);
      if (!isNaN(parsedDate.getTime())) {
        formattedDate = parsedDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      } else {
        formattedDate = String(rawDate).trim();
      }
    } catch (e) {
      formattedDate = String(rawDate).trim();
    }
  }

  const documentType = (doc.document_type || doc.category || doc.type || 'JUDGMENT').toUpperCase();
  const headNote = doc.head_note || doc.headnote || doc.summary || doc.abstract || '';
  const fullContent = doc.content || doc.judgment_text || doc.judgmentText || doc.body || '';
  const orderContent = doc.order || doc.disposition || '';
  const authorJudge = doc.author || doc.judge || '';

  // Helper for highlighting keywords without breaking HTML
  const highlightText = (text) => {
    if (!text) return '';
    const strText = String(text);
    if (!isHighlightingEnabled || !searchQuery || !searchQuery.trim()) {
      return strText;
    }

    const query = searchQuery.trim();
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');

    return strText.replace(regex, '<mark class="bg-yellow-300 text-slate-950 font-semibold px-0.5 rounded-xs">$1</mark>');
  };

  const renderFormattedBlock = (textString, customStyle = {}, isItalic = false) => {
    if (!textString) return null;
    const cleanStr = String(textString).trim()
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'");

    const isHtml = /<[a-z][\s\S]*>/i.test(cleanStr);
    const baseClasses = `text-slate-950 font-lora leading-relaxed text-justify tracking-normal ${isItalic ? 'italic' : 'not-italic'}`;
    const breakStyle = { breakInside: 'avoid', pageBreakInside: 'avoid', textAlign: 'justify' };

    if (isHtml) {
      return (
        <div 
          className={`prose prose-slate max-w-none ${baseClasses} [&_p]:text-justify [&_p]:leading-relaxed [&_p]:my-3 [&_ol]:list-decimal [&_ol]:pl-7 [&_ol]:my-3 [&_ul]:list-disc [&_ul]:pl-7 [&_ul]:my-3 [&_li]:pl-1 [&_li]:my-1.5 [&_li]:text-justify`}
          style={{ ...customStyle, textAlign: 'justify' }}
          dangerouslySetInnerHTML={{ __html: highlightText(cleanStr) }}
        />
      );
    }

    const formattedParagraphs = cleanStr
      .replace(/\r\n/g, '\n')
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(Boolean);

    return (
      <div className="space-y-4" style={{ ...customStyle, textAlign: 'justify' }}>
        {formattedParagraphs.map((para, idx) => (
          <p 
            key={idx} 
            className={`${baseClasses} text-justify`}
            style={{ ...customStyle, ...breakStyle, textAlign: 'justify' }}
            dangerouslySetInnerHTML={{ __html: highlightText(para) }}
          />
        ))}
      </div>
    );
  };

  const calculatedLineHeight = Math.round(fontSize * 1.82);
  const textInlineStyle = {
    fontSize: `${fontSize}px`,
    lineHeight: `${calculatedLineHeight}px`
  };

  return (
    <div 
      id="printable-judgment-document" 
      className="max-w-3xl mx-auto bg-white border border-slate-300/90 shadow-xs p-6 sm:p-10 space-y-6 font-lora text-slate-950 pb-6 select-text rounded-sm print:p-0 print:m-0 print:border-none print:shadow-none print:pb-0"
    >
      {/* Force Automatic Text Justification on all paragraphs & list items */}
      <style>{`
        #printable-judgment-document p,
        #printable-judgment-document li,
        #printable-judgment-document div.prose,
        #printable-judgment-document div.prose p,
        #printable-judgment-document div.prose li {
          text-align: justify !important;
          text-justify: inter-word !important;
        }
      `}</style>
      
      {/* 1. COMPACT SCC TOP CITATION HEADER */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-2 font-lora text-xs no-print-border">
        <div className="font-bold tracking-wide text-slate-950">
          {citation || 'DIGI LAW REPORTER'}
        </div>
        <div className="text-[10px] font-sans font-bold tracking-widest text-slate-500 uppercase">
          DIGI LAW REPORTER (DLR)
        </div>
      </div>

      {/* 2. COURT & JURISDICTION */}
      {court && (
        <div className="text-center pt-2 space-y-0.5">
          <h1 className="text-base sm:text-xl font-bold font-cinzel text-slate-950 tracking-widest uppercase leading-snug">
            IN THE {court}
          </h1>
          {jurisdiction && (
            <div className="text-[11px] uppercase font-sans text-slate-600 tracking-wider">
              ( {jurisdiction} )
            </div>
          )}
        </div>
      )}

      {/* 3. PARTY NAMES (COMPACT AUTHENTIC FORMAT) */}
      {(petitioner || respondent || rawTitle) && (
        <div className="text-center py-3 my-1 font-lora space-y-2">
          {petitioner && respondent ? (
            <div className="space-y-1 max-w-xl mx-auto">
              <div className="text-sm sm:text-base font-bold text-slate-950 leading-snug">
                {petitioner} <span className="font-normal text-[11px] text-slate-600 italic font-sans ml-1">. . . Appellant(s);</span>
              </div>
              <div className="text-[11px] italic font-serif text-slate-600 py-0.5">
                Versus
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-950 leading-snug">
                {respondent} <span className="font-normal text-[11px] text-slate-600 italic font-sans ml-1">. . . Respondent(s).</span>
              </div>
            </div>
          ) : (
            <div className="text-sm sm:text-base font-bold text-slate-950 leading-snug max-w-xl mx-auto">
              {rawTitle}
            </div>
          )}
        </div>
      )}

      {/* 4. CASE NO. & DECIDED DATE LINE */}
      {(caseNumber || formattedDate) && (
        <div className="text-center text-xs font-lora text-slate-800 italic pt-0.5">
          {caseNumber && <span>{caseNumber}</span>}
          {caseNumber && formattedDate && <span>, </span>}
          {formattedDate && <span>decided on {formattedDate}</span>}
        </div>
      )}

      {/* 5. BENCH / CORAM LINE */}
      {bench && (
        <div className="text-center text-xs font-lora text-slate-900 font-semibold pt-0.5">
          Before <span className="uppercase tracking-wide font-sans text-[11px]">{bench}</span>
        </div>
      )}

      {/* 6. SCC DIVIDER RULE */}
      <div className="border-t border-slate-900 my-4"></div>

      {/* 7. HEADNOTE SECTION (BOX CONTAINER FORMAT) */}
      {headNote && (
        <div className="my-5 font-lora">
          <div className="border border-slate-300 rounded-sm p-4 sm:p-5 bg-slate-50/60 shadow-xs space-y-2">
            <div className="text-xs font-bold font-sans uppercase tracking-widest text-slate-950 border-b border-slate-300 pb-2 mb-2">
              HEADNOTE
            </div>
            <div className="text-slate-900 leading-relaxed">
              {renderFormattedBlock(headNote, textInlineStyle, false)}
            </div>
          </div>
        </div>
      )}

      {/* 8. JUDGMENT DELIVERY & BODY SECTION */}
      {fullContent && (
        <div className="space-y-3 font-lora pt-1">
          <div className="text-center text-xs font-bold uppercase tracking-widest text-slate-950 font-sans py-1">
            {documentType === 'ORDER' ? 'ORDER' : 'JUDGMENT'}
          </div>

          {authorJudge && (
            <div className="text-xs font-lora text-slate-900 italic">
              The Judgment of the Court was delivered by
              <div className="font-bold uppercase tracking-wider not-italic text-slate-950 mt-0.5 font-sans text-[11px]">
                {authorJudge}, J.—
              </div>
            </div>
          )}

          <div className="pt-1">
            {renderFormattedBlock(fullContent, textInlineStyle, false)}
          </div>
        </div>
      )}

      {/* 9. FINAL ORDER & DISPOSITION */}
      {orderContent && (
        <div className="space-y-2 font-lora pt-5 border-t border-slate-900">
          <div className="text-[11px] font-bold font-sans uppercase tracking-widest text-slate-950">
            ORDER
          </div>
          <div>
            {renderFormattedBlock(orderContent, textInlineStyle, false)}
          </div>
        </div>
      )}

    </div>
  );
}
