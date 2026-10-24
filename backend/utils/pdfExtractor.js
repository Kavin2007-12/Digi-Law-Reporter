import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { GoogleGenAI } from '@google/genai';

/**
 * AI-Powered Multimodal Legal Judgment Extractor
 * Uses Gemini Vision for 100% exact page-by-page replication of the original court judgment PDF.
 */
async function extractWithGeminiAI(pdfBuffer) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
  const base64Pdf = pdfBuffer.toString('base64');

  for (const model of models) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: base64Pdf,
                  mimeType: 'application/pdf'
                }
              },
              {
                text: `You are an expert Indian Legal Precedent and Supreme Court Judgment Document Formatter for Digital Law Reporter.
Analyze the attached Indian Supreme Court / High Court judgment PDF and extract every single page with 100% textual, structural, and visual fidelity into a strict JSON structure.

JSON STRUCTURE:
{
  "title": "Primary Appellant/Petitioner vs. Primary Respondent",
  "petitioner": "Full Name of Appellant / Petitioner (without '... APPELLANT(S)')",
  "respondent": "Full Name of Respondent (without '... RESPONDENT(S)')",
  "court": "Supreme Court of India (or High Court Name)",
  "year": "YYYY",
  "judgmentDate": "YYYY-MM-DD",
  "bench": "Hon'ble Judge names",
  "caseNumber": "Full Appeal / SLP Number (e.g. Crl. A. @ SLP (Crl.) No. 4333 of 2026)",
  "diaryNumber": "Diary Number if present",
  "totalPages": 14,
  "act": "Primary Act(s) (e.g. Bharatiya Nagarik Suraksha Sanhita, 2023 / Code of Criminal Procedure, 1973)",
  "section": "Key Sections referenced (e.g. Section 167 CrPC / Section 187 BNSS)",
  "summary": "Comprehensive editorial headnote / synopsis summarizing facts, questions of law, and the final decision (2-3 structured paragraphs)",
  "citations": [
    { "year": "2026", "month": "", "court": "SC", "number": "2026 INSC 666", "equivalentText": "" }
  ],
  "pages": [
    {
      "pageNum": 1,
      "html": "... exact HTML for Page 1 ..."
    }
  ],
  "extractedTablesCount": 1
}

CRITICAL FORMATTING & EXTRACTION RULES:
1. Divide the output into EXACT 1-to-1 individual pages in the "pages" array (pageNum: 1, 2, 3... totalPages) matching each physical page of the PDF.
2. STRICT OMISSIONS / SCRUBBING:
   - NEVER include any QR codes or barcode text.
   - NEVER include digital signature certification boxes (e.g., "Digitally signed by...", "Signature Not Verified", "Date:...", "Reason:...").
   - NEVER include question mark symbols ('?' or '\\uFFFD') near judge signatures, dates, or names.
3. PAGE 1 LAYOUT (Universal Legal Format for Supreme Court, High Courts, and IndianKanoon prints):
   - Top Citation & Reportability / Bench Initials:
     <div style="display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-family: 'Times New Roman', serif; font-size: 15px; margin-bottom: 24px;"><span>2026 INSC 666</span><span style="text-decoration: underline; letter-spacing: 1px;"><u>REPORTABLE</u></span></div>
     (For IndianKanoon/High Court prints, include top title, date, Author, Bench, and right-aligned case numbers if present).
   - Court Header (Centered, Bold):
     <div style="text-align: center; font-weight: bold; font-size: 16px; margin: 12px 0 4px; font-family: 'Times New Roman', serif;">IN THE SUPREME COURT OF INDIA</div> (or IN THE HIGH COURT OF JUDICATURE AT MADRAS / AT BOMBAY / IN THE HIGH COURT OF ANDHRA PRADESH / DELHI / GUJARAT / etc.)
   - Bench Location & Jurisdiction (Centered):
     <div style="text-align: center; font-weight: bold; font-size: 14.5px; margin: 2px 0; font-family: 'Times New Roman', serif;">AT AMARAVATI [3446]</div>
     <div style="text-align: center; font-size: 14px; font-style: italic; margin: 2px 0 12px; font-family: 'Times New Roman', serif; color: #475569;">(Special Original Jurisdiction)</div>
   - Date Line (Centered, Bold):
     <div style="text-align: center; font-weight: bold; font-size: 14px; margin: 4px 0; font-family: 'Times New Roman', serif;">THURSDAY, THE TWENTY NINETH DAY OF AUGUST TWO THOUSAND AND TWENTY FOUR</div>
   - Coram / Judges (Centered, Bold):
     <div style="text-align: center; font-weight: bold; font-size: 15px; letter-spacing: 2px; margin: 10px 0 4px; font-family: 'Times New Roman', serif;">PRESENT:</div>
     <div style="text-align: center; font-weight: bold; font-size: 15.5px; margin: 4px 0 8px; font-family: 'Times New Roman', serif;">HONOURABLE THE CHIEF JUSTICE DHIRAJ SINGH THAKUR</div>
     <div style="text-align: center; font-weight: bold; font-size: 15.5px; margin: 4px 0 8px; font-family: 'Times New Roman', serif;">THE HONOURABLE SRI JUSTICE R RAGHUNANDAN RAO</div>
   - Appeal / Writ Heading (Centered, Underlined):
     <div style="text-align: center; font-weight: bold; font-size: 15px; margin-bottom: 4px; font-family: 'Times New Roman', serif;"><u>WRIT PETITION NO: 18346/2024</u></div>
   - Parties Section (Cause Title):
     <div style="font-weight: bold; font-size: 15px; margin: 8px 0 4px; font-family: 'Times New Roman', serif; color: #0f172a;">Between:</div>
     <div style="display: flex; justify-content: space-between; align-items: baseline; font-weight: bold; font-size: 15px; margin: 12px 0; font-family: 'Times New Roman', serif;"><span>SHAURYA SUNIL KUMAR SINGH</span><span style="font-style: italic;">... APPELLANT(S)</span></div>
     <div style="text-align: center; font-weight: bold; font-size: 14px; letter-spacing: 2px; margin: 16px 0; font-family: 'Times New Roman', serif;">VERSUS</div> (or — AND —)
     <div style="display: flex; justify-content: space-between; align-items: baseline; font-weight: bold; font-size: 15px; margin: 12px 0; font-family: 'Times New Roman', serif;"><span>CENTRAL BUREAU OF INVESTIGATION</span><span style="font-style: italic;">... RESPONDENT(S)</span></div>
   - Counsels / Appearances (Clear block list):
     <div style="font-weight: bold; font-size: 14.5px; margin: 12px 0 4px; font-family: 'Times New Roman', serif;">Counsel for the Petitioner:</div>
     <div style="margin-left: 16px; font-family: 'Times New Roman', serif; font-size: 14px; color: #334155; margin-bottom: 4px;">1. Advocate Name</div>
   - JUDGMENT / ORDER Title (Centered, spaced):
     <div style="text-align: center; font-weight: bold; font-size: 18px; letter-spacing: 4px; margin: 28px 0 16px; font-family: 'Times New Roman', serif;">J U D G M E N T</div> (or <u>The Court made the following order:</u>)
   - Author Judge line:
     <div style="font-weight: bold; font-size: 15px; margin-bottom: 16px; font-family: 'Times New Roman', serif;"><u>SANJAY KAROL, J.</u></div> (or <i>(per Hon'ble Sri Justice R.Raghunandan Rao)</i>)
   - Numbered paragraphs: <p style="text-align: justify; text-justify: inter-word; line-height: 1.85; margin-bottom: 16px; font-family: 'Times New Roman', serif; font-size: 15px;"><strong>1.</strong> Leave granted.</p>
4. STATUTORY COMPARISON TABLES:
   Render side-by-side comparative statute tables with full content in clean multi-column HTML:
   <div class="dlr-table-container my-6 overflow-x-auto"><table class="dlr-extracted-table" style="width: 100%; border-collapse: collapse; margin: 16px 0; font-family: 'Times New Roman', serif; font-size: 14.5px; border: 1.5px solid #334155;"><thead><tr style="background-color: #f1f5f9; border-bottom: 2px solid #334155;"><th style="border: 1px solid #94a3b8; padding: 10px 14px; text-align: left; font-weight: bold; width: 50%;">Section 167 CrPC</th><th style="border: 1px solid #94a3b8; padding: 10px 14px; text-align: left; font-weight: bold; width: 50%;">Section 187 BNSS</th></tr></thead><tbody><tr><td style="border: 1px solid #cbd5e1; padding: 10px 14px; vertical-align: top; text-align: justify; line-height: 1.6;">...</td><td style="border: 1px solid #cbd5e1; padding: 10px 14px; vertical-align: top; text-align: justify; line-height: 1.6;">...</td></tr></tbody></table></div>
5. FOOTNOTES & RUNNING FOOTERS:
   - Footnotes at bottom of respective page: <div class="dlr-footnote-container" style="margin-top: 24px; padding-top: 8px; border-top: 1px solid #475569; width: 35%;"><sup>1</sup> Hereinafter 'subject FIR'.</div>
   - Running footer at bottom of EVERY page: <div class="dlr-page-running-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding-top: 8px; font-size: 13px; font-family: 'Times New Roman', serif; color: #475569; border-top: 1px solid #e2e8f0;"><span>Crl. A. @ SLP (Crl.) No. 4333 of 2026</span><span>Page X of Y</span></div>
6. SIGNATURE BLOCK (Last Page):
   <div style="margin-top: 40px; text-align: right; font-family: 'Times New Roman', serif; font-size: 15px;"><p style="margin-bottom: 4px;">…………………………………………………… J.</p><p style="font-weight: bold; margin-bottom: 30px;">(SANJAY KAROL)</p><p style="margin-bottom: 4px;">…………………………………………………… J.</p><p style="font-weight: bold;">(NONGMEIKAPAM KOTISWAR SINGH)</p></div>
   <div style="margin-top: 20px; font-family: 'Times New Roman', serif; font-size: 15px;"><p>New Delhi</p><p>July 1, 2026</p></div>

Return ONLY raw valid JSON.`
              }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json'
        }
      });

      const rawText = response.text ? response.text.trim() : '';
      const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (parsed && parsed.title) {
        // Scrub summary
        if (parsed.summary) {
          parsed.summary = parsed.summary
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/\s*[\?？\uFFFD]\s*/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        }

        // Scrub all page HTMLs
        if (Array.isArray(parsed.pages) && parsed.pages.length > 0) {
          parsed.pages = parsed.pages.map(page => {
            let html = page.html || '';
            html = html
              .replace(/[\uFFFD\u200B\uFEFF]/g, '')
              .replace(/(?:^|\s)[\?？]\s*(?=[A-Z\.\s]{3,40},\s*J\.?|\.{3,}|…|Date|New Delhi|[A-Z][a-z]+)/gi, ' ')
              .replace(/\s*[\?？]\s*$/g, '')
              .replace(/^\s*[\?？]\s*/g, '')
              .replace(/<img[^>]*>/gi, '') // Strip any stray images or QR tags
              .trim();
            return {
              ...page,
              html
            };
          });

          parsed.judgmentText = parsed.pages.map(p => p.html).filter(Boolean).join('\n');
          parsed.totalPages = parsed.pages.length;
        } else if (parsed.judgmentText) {
          let html = parsed.judgmentText
            .replace(/[\uFFFD\u200B\uFEFF]/g, '')
            .replace(/(?:^|\s)[\?？]\s*(?=[A-Z\.\s]{3,40},\s*J\.?|\.{3,}|…|Date|New Delhi|[A-Z][a-z]+)/gi, ' ')
            .replace(/\s*[\?？]\s*$/g, '')
            .replace(/^\s*[\?？]\s*/g, '')
            .trim();
          parsed.pages = [{ pageNum: 1, html }];
          parsed.judgmentText = html;
        }

        return parsed;
      }
    } catch (err) {
      console.warn(`Gemini (${model}) extraction attempt failed:`, err.message);
    }
  }

  return null;
}

/**
 * Universal In-Memory PDF Legal Judgment Extractor
 * Extracts Court, Title, Parties, Date, Bench, Citation, Acts, Sections,
 * Headnote, and comparative HTML Tables with 100% in-memory processing.
 */
export async function extractJudgmentFromBuffer(pdfBuffer) {
  if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
    throw new Error('Invalid PDF buffer provided for extraction');
  }

  // 1. Primary Engine: High-Precision Gemini Vision AI (100% exact page reproduction)
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
    try {
      const aiResult = await extractWithGeminiAI(pdfBuffer);
      if (aiResult && aiResult.title && Array.isArray(aiResult.pages) && aiResult.pages.length > 0) {
        return aiResult;
      }
    } catch (e) {
      console.warn('Gemini extraction fallback:', e.message);
    }
  }

  // 2. Fallback Engine: Instant In-Memory PDF Parser
  const uint8 = new Uint8Array(pdfBuffer);
  const loadingTask = pdfjsLib.getDocument({
    data: uint8,
    useSystemFonts: true,
    disableFontFace: true
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  const pagesData = [];
  let fullPlainText = '';

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });

    const items = textContent.items.map(item => {
      const tx = item.transform;
      return {
        str: item.str || '',
        x: Math.round(tx[4]),
        y: Math.round(viewport.height - tx[5]), // Top to bottom coordinate
        width: Math.round(item.width || 0),
        height: Math.round(item.height || 0),
        hasEOL: Boolean(item.hasEOL)
      };
    }).filter(it => it.str.trim().length > 0);

    // Group items into horizontal lines (items with similar Y coordinate)
    const lineBuckets = [];
    const yTolerance = 4;

    for (const item of items) {
      let bucket = lineBuckets.find(b => Math.abs(b.y - item.y) <= yTolerance);
      if (!bucket) {
        bucket = { y: item.y, items: [] };
        lineBuckets.push(bucket);
      }
      bucket.items.push(item);
    }

    // Sort lines top to bottom
    lineBuckets.sort((a, b) => a.y - b.y);

    // Sort items within each line left to right
    for (const b of lineBuckets) {
      b.items.sort((a, b) => a.x - b.x);
      b.lineText = b.items.map(it => it.str).join(' ').replace(/\s+/g, ' ').trim();
    }

    pagesData.push({
      pageNum: i,
      pageWidth: viewport.width,
      pageHeight: viewport.height,
      lines: lineBuckets
    });

    const pageStr = lineBuckets.map(b => b.lineText).filter(Boolean).join('\n');
    fullPlainText += (fullPlainText ? '\n\n' : '') + pageStr;
  }

  // Format body & metadata
  if (fullPlainText.trim().length >= 50) {
    const { htmlBody, extractedTablesCount, pages } = reconstructStructuredBody(pagesData);
    const metadata = extractLegalMetadata(fullPlainText, pagesData);

    if (!metadata.caseNumber && pages.length > 0 && pages[0].headerLeft) {
      metadata.caseNumber = pages[0].headerLeft;
    }

    return {
      ...metadata,
      judgmentText: htmlBody,
      pages,
      totalPages: numPages,
      extractedTablesCount,
      numPages
    };
  }

  // Default fallback if empty
  return {
    title: '',
    court: 'Supreme Court of India',
    year: String(new Date().getFullYear()),
    judgmentDate: new Date().toISOString().split('T')[0],
    judgmentText: '',
    pages: [],
    totalPages: numPages,
    extractedTablesCount: 0
  };
}

/**
 * Reconstructs the judgment body with authentic Indian Court formatting:
 * - Clean Reportability & Citations
 * - Centered Court & Jurisdiction headers
 * - Cleanly aligned Appellant/Respondent parties with VERSUS
 * - Centered JUDGMENT and Judge signatures
 * - Multi-line statutory comparative tables with clear borders
 * - Continuous, fully justified numbered paragraphs
 * - Complete elimination of running footers and page number leaks
 */
function reconstructStructuredBody(pagesData) {
  let htmlResult = '';
  let extractedTablesCount = 0;
  const pages = [];

  let hasEmittedKanoonTitle = false;
  let inTable = false;
  let currentTableRows = [];
  let activeTableRow = { isHeader: false, cells: ['', ''] };
  let currentTableHeaders = ['', ''];
  let tablePendingContinuation = null;
  let lastCourtParaNum = 0;

  const pushActiveTableRow = () => {
    if (activeTableRow.cells[0].trim() || activeTableRow.cells[1].trim()) {
      currentTableRows.push({
        isHeader: activeTableRow.isHeader,
        cells: [activeTableRow.cells[0].trim(), activeTableRow.cells[1].trim()]
      });
      activeTableRow = { isHeader: false, cells: ['', ''] };
    }
  };

  const flushTable = (target) => {
    if (inTable) {
      pushActiveTableRow();
      if (currentTableRows.length > 0) {
        const tableHtml = formatTableToHtml(currentTableRows);
        if (tableHtml) {
          htmlResult += tableHtml;
          if (target) target.pageHtml += tableHtml;
          extractedTablesCount++;
        }
      }
      inTable = false;
      currentTableRows = [];
      activeTableRow = { isHeader: false, cells: ['', ''] };
    }
  };

  for (let pIdx = 0; pIdx < pagesData.length; pIdx++) {
    const page = pagesData[pIdx];
    const pageCtx = { pageNum: page.pageNum, pageHtml: '' };
    const lines = page.lines;
    const pageWidth = page.pageWidth || 600;
    const midX = pageWidth / 2;

    let currentParagraph = null;
    let inFootnote = false;
    let footnoteItems = [];
    let sigBoxLinesRemaining = 0;
    let partyBuffer = [];
    let inPartySection = false;
    let inAdvocateSection = false;

    // Resume comparative table if it continued across from previous page
    if (tablePendingContinuation && tablePendingContinuation.isContinuing) {
      inTable = true;
      currentTableHeaders = tablePendingContinuation.headers;
      currentTableRows = [{ isHeader: true, cells: tablePendingContinuation.headers }];
      activeTableRow = { isHeader: false, cells: ['', ''] };
      tablePendingContinuation = null;
    }

    const flushParagraph = () => {
      if (!currentParagraph || !currentParagraph.text.trim()) {
        currentParagraph = null;
        return;
      }
      let fullText = currentParagraph.text.trim();
      let pChunk = '';

      // Check for trailing judge signature lines bundled at the end of the final paragraph
      let signatureHtml = '';
      if (pIdx >= pagesData.length - 2) {
        const sigIdx = fullText.search(/(?:\.{3,}|…+|―+|-+)\s*J\.?|\([A-Z\.\s]{3,40}\)\s*(?:(?:\.{3,}|…+|―+|-+)\s*J\.?|\([A-Z\.\s]{3,40}\)|New\s+Delhi|[A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i);
        if (sigIdx > 15) {
          const bodyText = fullText.slice(0, sigIdx).trim();
          const sigRaw = fullText.slice(sigIdx).trim();
          fullText = bodyText;

          // Format trailing signature
          signatureHtml = `\n<div style="margin-top: 36px; text-align: right; font-family: 'Times New Roman', Times, serif; font-size: 15px; font-weight: bold; color: #0f172a;">${escapeHtml(sigRaw)}</div>\n`;
        }
      }

      if (currentParagraph.isHeading) {
        pChunk = `<div style="text-align: center; font-weight: bold; font-size: 16px; letter-spacing: 1.5px; margin: 24px 0 14px; font-family: 'Times New Roman', serif; color: #0f172a;">${escapeHtml(fullText)}</div>\n`;
      } else if (currentParagraph.prefix) {
        pChunk = `<p style="margin-bottom: 16px; line-height: 1.85; text-align: justify; text-justify: inter-word; text-align-last: left; font-family: 'Times New Roman', Times, serif; font-size: 15px; color: #0f172a;"><strong>${escapeHtml(currentParagraph.prefix)}</strong> ${escapeHtml(fullText)}</p>\n`;
      } else {
        pChunk = `<p style="margin-bottom: 16px; line-height: 1.85; text-align: justify; text-justify: inter-word; text-align-last: left; font-family: 'Times New Roman', Times, serif; font-size: 15px; color: #0f172a;">${escapeHtml(fullText)}</p>\n`;
      }

      if (signatureHtml) {
        pChunk += signatureHtml;
      }

      htmlResult += pChunk;
      pageCtx.pageHtml += pChunk;
      currentParagraph = null;
    };

    const flushPartyBuffer = () => {
      if (partyBuffer.length === 0) return;
      const joined = partyBuffer.join(' ').trim();
      partyBuffer = [];
      if (!joined) return;
      const chunk = `<div style="margin: 4px 0; font-family: 'Times New Roman', Times, serif; font-size: 15px; color: #0f172a; line-height: 1.6;">${escapeHtml(joined)}</div>\n`;
      htmlResult += chunk;
      pageCtx.pageHtml += chunk;
    };

    const flushFootnotes = (target = pageCtx) => {
      if (footnoteItems.length > 0) {
        let fnChunk = `<div class="dlr-footnote-container" style="margin-top: 24px; padding-top: 8px; border-top: 1px solid #475569; width: 35%; max-width: 280px;">\n`;
        footnoteItems.forEach(fn => {
          fnChunk += `  <p style="font-size: 13px; line-height: 1.5; font-family: 'Times New Roman', Times, serif; color: #334155; margin: 3px 0;">${fn}</p>\n`;
        });
        fnChunk += `</div>\n`;
        htmlResult += fnChunk;
        if (target) target.pageHtml += fnChunk;
        footnoteItems = [];
      }
      inFootnote = false;
    };

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      const items = line.items || [];
      // Clean invisible and corrupt glyphs (e.g. signature question mark artifacts)
      let text = line.lineText
        .replace(/[\uFFFD\u200B\uFEFF]/g, '')
        .replace(/(?:^|\s)[\?？]\s*(?=[A-Z\.\s]{3,40},\s*J\.?|\.{3,}|…|Date|New Delhi|[A-Z][a-z]+)/gi, ' ')
        .replace(/\s*[\?？]\s*$/g, '')
        .replace(/^\s*[\?？]\s*/g, '')
        .replace(/\s+[\?？]\s+/g, ' ')
        .trim();

      if (!text) continue;

      // 1. DIGITAL SIGNATURE / QR CODE / STAMP FILTER: Drop digital verification stamp, certificates & question marks
      const isSigTrigger = /Digitally\s+signed|Signature\s+Not\s+Verified|Signature\s+Valid|QR\s*Code|Scan\s+to\s+verify|https?:\/\/[^\s]*\/qr\//i.test(text);
      if (isSigTrigger) {
        sigBoxLinesRemaining = 4;
        continue;
      }
      if (sigBoxLinesRemaining > 0) {
        if (/^(?:Date\s*:|Reason\s*:|Location\s*:|[A-Z\s]{3,35}$|[\?\uFFFD]$)/i.test(text) && !/^\d+[\.\)]/.test(text)) {
          sigBoxLinesRemaining--;
          continue;
        } else {
          sigBoxLinesRemaining = 0;
        }
      }
      if (/^\s*[\?\uFFFD]\s*$/.test(text)) {
        continue;
      }

      // Scrub repeating inline initials that repeat inside sentences (e.g. HCJ & RRR,J)
      text = text.replace(/\bHCJ\s*&\s*RRR\s*,?\s*J\b/gi, '').replace(/\s+/g, ' ').trim();
      if (!text) continue;

      // 2. RUNNING HEADER on Pages > 1
      if (pIdx > 0 && idx <= 2) {
        if (/^(?:Order\s+dated|Writ\s+Petition|CRIMINAL\s+APPEAL|CIVIL\s+APPEAL|SLP|Page\s*\d+)/i.test(text) ||
            /vs.*on\s+\d{1,2}\s+[A-Za-z]+,?\s+\d{4}/i.test(text) ||
            /^(?:HCJ|RRR|[A-Z]{2,4}\s*&\s*[A-Z]{2,4},?\s*J)$/i.test(text) ||
            /^\d{1,2}[\.\/\-]\d{1,2}[\.\/\-]\d{4}$/.test(text)) {
          continue; // Suppress repeating running header from document body on later pages
        }
      }

      // 3. RUNNING FOOTER PRESERVATION: Capture running case footer, website, or IndianKanoon footer
      const isBottomRunningFooter = (idx >= lines.length - 3) && (
        /Page\s*\d+\s*(?:of\s*\d+)?/i.test(text) ||
        /^\d+\s*(?:of|\/)\s*\d+$/i.test(text) ||
        /https?:\/\/[a-z0-9\.\_\-\/]+/i.test(text) ||
        /Indian\s+Kanoon|http:\/\/indiankanoon/i.test(text) ||
        (/^(?:Crl\.|Civ\.|Writ|Appeal|SLP|Diary|Special\s*Leave)\s*.*?No\.?\s*[0-9\/\w\-]+/i.test(text) && /(?:Page\s*\d+|\b\d+\s*(?:of|\/)\s*\d+\b)/i.test(text))
      );

      if (isBottomRunningFooter) {
        flushParagraph();
        flushPartyBuffer();
        if (inTable) {
          tablePendingContinuation = { isContinuing: true, headers: currentTableHeaders };
        }
        flushTable(pageCtx);
        flushFootnotes(pageCtx);

        let leftFooter = '';
        let rightFooter = '';
        const pageMatch = text.match(/(Page\s*\d+\s*(?:of\s*\d+)?|\b\d+\s*(?:of|\/)\s*\d+\b|\b\d+\b)$/i);
        if (/Indian\s+Kanoon|http:\/\/indiankanoon/i.test(text)) {
          leftFooter = 'Indian Kanoon';
          const pM = text.match(/(\d+)$/);
          rightFooter = `Page ${pM ? pM[1] : (pIdx + 1)} of ${pagesData.length}`;
        } else if (pageMatch && !/https?:\/\//i.test(text)) {
          rightFooter = pageMatch[1].trim();
          leftFooter = text.slice(0, text.length - pageMatch[0].length).trim();
        } else if (/https?:\/\//i.test(text)) {
          leftFooter = text;
          if (idx + 1 < lines.length && /^\d+\s*(?:\/|of)\s*\d+$/i.test(lines[idx + 1].lineText.trim())) {
            rightFooter = lines[idx + 1].lineText.trim();
            idx++;
          }
        } else if (/^\d+\s*(?:\/|of)\s*\d+$/i.test(text)) {
          rightFooter = text;
        } else if (items.length >= 2 && items[items.length - 1].x > midX) {
          leftFooter = items.slice(0, items.length - 1).map(it => it.str).join(' ').trim();
          rightFooter = items[items.length - 1].str.trim();
        } else {
          leftFooter = text;
        }

        if (!rightFooter) {
          rightFooter = `Page ${page.pageNum || (pIdx + 1)} of ${pagesData.length}`;
        }

        const footerChunk = `<div class="dlr-page-running-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding-top: 8px; font-size: 13px; font-family: 'Times New Roman', Times, serif; color: #475569; border-top: 1px solid #e2e8f0;"><span>${escapeHtml(leftFooter)}</span><span>${escapeHtml(rightFooter)}</span></div>\n`;
        htmlResult += footerChunk;
        pageCtx.pageHtml += footerChunk;
        continue;
      }

      // Drop standalone website watermarks
      if (/^(?:DIGI LAW REPORTER|www\.digilawreporter)/i.test(text)) {
        continue;
      }

      // 4. FOOTNOTE DIVIDER LINE (________ or --------- or *****)
      if (/^_{3,}|^-{3,}|^―{3,}|^\*{3,}/.test(text)) {
        flushParagraph();
        flushPartyBuffer();
        if (/^\*{3,}/.test(text)) {
          const divChunk = `<div style="text-align: center; letter-spacing: 4px; margin: 16px 0; color: #64748b;">* * * * *</div>\n`;
          htmlResult += divChunk;
          pageCtx.pageHtml += divChunk;
          continue;
        }
        if (inTable) {
          tablePendingContinuation = { isContinuing: true, headers: currentTableHeaders };
        }
        flushTable(pageCtx);
        inFootnote = true;
        continue;
      }

      // 5. FOOTNOTE TEXT ITEMS
      if (inFootnote || (idx >= lines.length - 4 && /^[¹²³⁴⁵⁶⁷⁸⁹\*†‡]|^[1-9]\s*(?:Hereinafter|See|Ibid|Supra|AIR|SCC|Cr\.?P\.?C|Section|[a-z]|[\x27"“‘])/i.test(text))) {
        flushParagraph();
        flushPartyBuffer();
        flushTable(pageCtx);
        inFootnote = true;
        const cleanFootnote = text.replace(/^([¹²³⁴⁵⁶⁷⁸⁹\*†‡]|\d+[\.\)]?)\s*/, (m, mark) => {
          const num = mark.replace(/[\.\)]/, '').trim();
          return `<sup>${escapeHtml(num)}</sup> `;
        });
        footnoteItems.push(cleanFootnote);
        continue;
      }

      // 6. IndianKanoon Document Title on Page 1 top (lines 0-3)
      if (pIdx === 0 && idx <= 3 && /vs/i.test(text)) {
        if (hasEmittedKanoonTitle) {
          if (idx + 1 < lines.length && /\d{1,2}\s+[A-Za-z]+,?\s+\d{4}/.test(lines[idx + 1].lineText)) {
            idx++;
          }
          continue;
        }
        hasEmittedKanoonTitle = true;
        flushParagraph();
        let fullTitle = text;
        if (idx + 1 < lines.length && /\d{1,2}\s+[A-Za-z]+,?\s+\d{4}/.test(lines[idx + 1].lineText)) {
          idx++;
          fullTitle += ' ' + lines[idx].lineText.trim();
        }
        const cleanTitle = fullTitle.replace(/,\s*on.*$/i, '').trim();
        const datePart = fullTitle.match(/on\s+(\d{1,2}\s+[A-Za-z]+,?\s+\d{4})/i);
        let chunk = `<div style="font-weight: bold; font-size: 16px; margin: 4px 0 4px; font-family: 'Times New Roman', serif; color: #0f172a;">${escapeHtml(cleanTitle)}</div>\n`;
        if (datePart) {
          chunk += `<div style="font-size: 14px; font-weight: bold; color: #475569; font-family: 'Times New Roman', serif; margin-bottom: 12px;">${escapeHtml(datePart[1])}</div>\n`;
        }
        htmlResult += chunk;
        pageCtx.pageHtml += chunk;
        continue;
      }

      // IndianKanoon Author & Bench
      if (pIdx === 0 && idx < 6 && /^Author\s*:\s*(.+)$/i.test(text)) {
        flushParagraph();
        const chunk = `<div style="font-size: 14px; color: #475569; font-family: 'Times New Roman', serif; margin: 2px 0;"><strong>${escapeHtml(text)}</strong></div>\n`;
        htmlResult += chunk;
        pageCtx.pageHtml += chunk;
        continue;
      }
      if (pIdx === 0 && idx < 6 && /^Bench\s*:\s*(.+)$/i.test(text)) {
        flushParagraph();
        const chunk = `<div style="font-size: 14px; color: #475569; font-family: 'Times New Roman', serif; margin: 2px 0 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;"><strong>${escapeHtml(text)}</strong></div>\n`;
        htmlResult += chunk;
        pageCtx.pageHtml += chunk;
        continue;
      }
      if (pIdx === 0 && idx < 6 && /^\d+$/.test(text)) {
        continue;
      }

      // Bench Initials & Case Number on Right Side (e.g. HCJ & RRR,J / W.P.No.18346/2024 / APHC010364302024)
      if (pIdx === 0 && idx < 10 && (/^(?:HCJ|RRR|[A-Z]{2,4}\s*&\s*[A-Z]{2,4},?\s*J)$/i.test(text) || /^W\.?P\.?No\.?\s*[0-9\/\-]+$/i.test(text) || /^APHC\d+$/i.test(text))) {
        flushParagraph();
        const chunk = `<div style="text-align: right; font-size: 13px; font-weight: bold; font-family: 'Times New Roman', serif; color: #475569; margin-bottom: 3px;">${escapeHtml(text)}</div>\n`;
        htmlResult += chunk;
        pageCtx.pageHtml += chunk;
        continue;
      }

      // 7. Detect 2-column or split text items (Physical Gutter Gap or MidX Split)
      let gapCol1 = '';
      let gapCol2 = '';
      let hasGapSplit = false;

      if (items.length >= 2) {
        for (let k = 0; k < items.length - 1; k++) {
          const rightEdge = items[k].x + (items[k].width || 0);
          const nextLeft = items[k + 1].x;
          if (nextLeft - rightEdge >= 25 && nextLeft > midX - 80 && rightEdge < midX + 80) {
            gapCol1 = items.slice(0, k + 1).map(it => it.str).join(' ').trim();
            gapCol2 = items.slice(k + 1).map(it => it.str).join(' ').trim();
            hasGapSplit = true;
            break;
          }
        }
      }

      let leftItems = [];
      let rightItems = [];
      if (!hasGapSplit && items.length >= 1) {
        for (const it of items) {
          if (it.x < midX - 10) {
            leftItems.push(it.str);
          } else {
            rightItems.push(it.str);
          }
        }
      }

      const leftText = leftItems.join(' ').replace(/\s+/g, ' ').trim();
      const rightText = rightItems.join(' ').replace(/\s+/g, ' ').trim();

      // Check for split pipe
      let hasPipeSplit = false;
      let pipeLeft = '';
      let pipeRight = '';
      if (text.includes('|') && text.split('|').length >= 2) {
        const pParts = text.split('|').map(p => p.trim()).filter(Boolean);
        pipeLeft = pParts[0] || '';
        pipeRight = pParts[1] || '';
        hasPipeSplit = true;
      }

      const col1 = hasPipeSplit ? pipeLeft : (hasGapSplit ? gapCol1 : leftText);
      const col2 = hasPipeSplit ? pipeRight : (hasGapSplit ? gapCol2 : rightText);

      // Top Running Note/Header on Page 1 (e.g. Order dated: ... / Case No on right)
      if (pIdx === 0 && idx <= 1 && (/^Order\s+dated\s*:/i.test(text) || (idx === 1 && /^(?:Writ\s+Petition|CRIMINAL|CIVIL)/i.test(text) && items[0]?.x > midX))) {
        flushParagraph();
        flushPartyBuffer();
        const chunk = `<div style="text-align: right; font-size: 13.5px; font-family: 'Times New Roman', Times, serif; color: #475569; margin-bottom: 4px;">${escapeHtml(text)}</div>\n`;
        htmlResult += chunk;
        pageCtx.pageHtml += chunk;
        continue;
      }

      // 8. Check for Indian Court Document Structures (Cause Titles, Citations, Parties)
      // A. Citation + REPORTABLE / NON-REPORTABLE line
      const isReportableLine = (/\b(?:REPORTABLE|NON-REPORTABLE)\b/i.test(col2) || /\b(?:REPORTABLE|NON-REPORTABLE)\b/i.test(text)) &&
                               (/\bINSC\b|\bSCC\b|\bAIR\b|\b\d{4}\b/i.test(col1) || /\b(?:REPORTABLE|NON-REPORTABLE)\b/i.test(text));
      if (isReportableLine) {
        flushParagraph();
        flushPartyBuffer();
        flushTable(pageCtx);
        const citText = col1 || text.replace(/REPORTABLE|NON-REPORTABLE/gi, '').trim();
        const repTag = (text.match(/NON-REPORTABLE/i) ? 'NON-REPORTABLE' : 'REPORTABLE');
        const chunk = `<div style="display: flex; justify-content: space-between; align-items: center; font-weight: bold; margin-bottom: 22px; font-family: 'Times New Roman', Times, serif; font-size: 15px; color: #0f172a;"><span>${escapeHtml(citText)}</span><span style="letter-spacing: 1.5px; font-weight: bold; text-decoration: underline;"><u>${repTag}</u></span></div>\n`;
        htmlResult += chunk;
        pageCtx.pageHtml += chunk;
        continue;
      }

      // B. Court & Jurisdiction Headings (Centered, Bold)
      const isCourtHeader = /^(?:(?:IN|BEFORE)\s+THE\s+)?(?:SUPREME\s+COURT\s+OF\s+INDIA|(?:[A-Z\s]+\s+BENCH\s+OF\s+)?HIGH\s+COURT\s+(?:OF\s+JUDICATURE\s+(?:AT|FOR)|OF)?\s+[A-Z\s&,]+|CRIMINAL\s+APPELLATE\s+JURISDICTION|CIVIL\s+APPELLATE\s+JURISDICTION|EXTRAORDINARY\s+(?:CIVIL\s+|CRIMINAL\s+)?(?:APPELLATE|ORIGINAL)\s+JURISDICTION|ORIGINAL\s+JURISDICTION|WRIT\s+JURISDICTION|APPELLATE\s+SIDE|CIVIL\s+ORIGINAL\s+JURISDICTION)$/i.test(text);
      if (isCourtHeader) {
        flushParagraph();
        flushPartyBuffer();
        flushTable(pageCtx);
        const chunk = `<div style="text-align: center; font-weight: bold; font-size: 16px; letter-spacing: 0.8px; margin: 10px 0 6px; font-family: 'Times New Roman', Times, serif; color: #0f172a;">${escapeHtml(text)}</div>\n`;
        htmlResult += chunk;
        pageCtx.pageHtml += chunk;
        continue;
      }

      // Bench city: AT AMARAVATI [3446] / AT MADURAI / BENCH AT JAIPUR / BENCH AT NAGPUR
      if (pIdx === 0 && idx < 15 && /^\(?\s*(?:AT\s+[A-Z\s]+(?:\s*\[\d+\])?|BENCH\s+AT\s+[A-Z\s]+|MADURAI\s+BENCH|NAGPUR\s+BENCH|JAIPUR\s+BENCH|LUCKNOW\s+BENCH|DHARWAD\s+BENCH|GULBARGA\s+BENCH)\s*\)?$/i.test(text)) {
        flushParagraph();
        const chunk = `<div style="text-align: center; font-weight: bold; font-size: 14.5px; margin: 2px 0; font-family: 'Times New Roman', serif; color: #0f172a;">${escapeHtml(text)}</div>\n`;
        htmlResult += chunk;
        pageCtx.pageHtml += chunk;
        continue;
      }

      // Jurisdiction: (Special Original Jurisdiction) / (Extraordinary Civil Jurisdiction)
      if (pIdx === 0 && idx < 15 && /^\(?\s*(?:Special\s+|Extraordinary\s+)?(?:Original|Appellate|Writ|Civil|Criminal)\s+(?:Original\s+|Appellate\s+)?Jurisdiction\s*\)?$/i.test(text)) {
        flushParagraph();
        const chunk = `<div style="text-align: center; font-size: 14px; font-style: italic; margin: 2px 0 12px; font-family: 'Times New Roman', serif; color: #475569;">${escapeHtml(text)}</div>\n`;
        htmlResult += chunk;
        pageCtx.pageHtml += chunk;
        continue;
      }

      // Spelled out Date in Words: THURSDAY, THE TWENTY NINTH DAY OF AUGUST / TWO THOUSAND AND TWENTY FOUR
      if (pIdx === 0 && idx < 16 && (/^(?:(?:MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY),?\s+)?THE\s+[A-Z\s]+DAY\s+OF\s+[A-Z]+$/i.test(text) || /^(?:TWO\s+THOUSAND\s+[A-Z\s]+|NINETEEN\s+[A-Z\s]+)$/i.test(text))) {
        flushParagraph();
        const chunk = `<div style="text-align: center; font-weight: bold; font-size: 14px; margin: 4px 0; font-family: 'Times New Roman', serif; color: #0f172a;">${escapeHtml(text)}</div>\n`;
        htmlResult += chunk;
        pageCtx.pageHtml += chunk;
        continue;
      }

      // C. Numeric Date Line (Centered, Bold)
      const isDateLine = /^(?:DATED|DATE\s*OF\s*(?:DECISION|JUDGMENT|ORDER)|DATE|ORDER\s+DATED|RESERVED\s+ON|PRONOUNCED\s+ON)\s*[:\-]\s*[0-9A-Za-z\s\.,\/\-]+$/i.test(text);
      if (isDateLine && pIdx === 0 && idx < 10) {
        flushParagraph();
        flushPartyBuffer();
        flushTable(pageCtx);
        const chunk = `<div style="text-align: center; font-weight: bold; font-size: 14.5px; margin: 6px 0 10px; font-family: 'Times New Roman', Times, serif; color: #0f172a;">${escapeHtml(text)}</div>\n`;
        htmlResult += chunk;
        pageCtx.pageHtml += chunk;
        continue;
      }

      // D. CORAM / PRESENT / BEFORE Heading (Centered, Bold)
      const isCoramHeader = /^(?:PRESENT|CORAM|BEFORE)\s*[:\-]?$/i.test(text);
      if (isCoramHeader) {
        flushParagraph();
        flushPartyBuffer();
        flushTable(pageCtx);
        const chunk = `<div style="text-align: center; font-weight: bold; font-size: 15px; letter-spacing: 2px; margin: 10px 0 4px; font-family: 'Times New Roman', Times, serif; color: #0f172a;">${escapeHtml(text)}</div>\n`;
        htmlResult += chunk;
        pageCtx.pageHtml += chunk;
        continue;
      }

      // E. Hon'ble Judge Name Line (Centered, Bold)
      const isCoramJudge = /^(?:THE\s+)?(?:HON['’]BLE|HONOURABLE)\s+(?:THE\s+CHIEF\s+JUSTICE|(?:SRI|SMT\.|MR\.|MS\.|MRS\.|DR\.)?\s*JUSTICE)\s+[A-Z\.\s]+$/i.test(text) ||
                           /^(?:CHIEF\s+JUSTICE|(?:SRI|SMT\.|MR\.|MS\.|MRS\.|DR\.)\s*JUSTICE)\s+[A-Z\.\s]+$/i.test(text);
      if (isCoramJudge && pIdx === 0 && idx < 20) {
        flushParagraph();
        flushPartyBuffer();
        flushTable(pageCtx);
        const chunk = `<div style="text-align: center; font-weight: bold; font-size: 15.5px; margin: 4px 0 8px; font-family: 'Times New Roman', Times, serif; color: #0f172a;">${escapeHtml(text)}</div>\n`;
        htmlResult += chunk;
        pageCtx.pageHtml += chunk;
        continue;
      }

      // F. Appeal & Case Numbers (Centered/Formatted with Underline)
      const isAppealNoHeading = /^(?:CRIMINAL|CIVIL)?\s*APPEAL\s*NO\.?\s*.*?OF\s*\d{4}/i.test(text) ||
                                /^(?:WRIT\s+PETITION|W\.?P\.?|CIVIL\s+MISC|C\.?M\.?A\.?|O\.?S\.?A\.?|CONTEMPT\s+PETITION|REVIEW\s+(?:APPLICATION|PETITION)|WRIT\s+APPEAL|W\.?A\.?|ORIGINAL\s+PETITION|O\.?P\.?|CRL\.?\s*(?:O\.?P\.?|R\.?C\.?|M\.?C\.?|REV\.?)|FIRST\s+APPEAL|SECOND\s+APPEAL|F\.?A\.?|S\.?A\.?|T\.?C\.?A\.?)(?:\s*\([^\)]*\))?\s*(?:NO\.?|NUMBER|NO\s*:)?\s*[0-9\/\s\w\-]+(?:\s*(?:OF|\/)\s*[0-9]{4})?$/i.test(text) ||
                                /^\(@?\s*(?:Special\s*Leave\s*Petition|SLP)\s*\(.*?\)\s*NO\.?\s*.*?\)$/i.test(text);
      if (isAppealNoHeading && idx < 20) {
        flushParagraph();
        flushPartyBuffer();
        flushTable(pageCtx);
        const isSubSLP = text.startsWith('(');
        const chunk = `<div style="text-align: center; font-weight: ${isSubSLP ? 'normal' : 'bold'}; font-size: ${isSubSLP ? '14px' : '15px'}; margin: ${isSubSLP ? '2px 0 14px' : '8px 0 14px'}; font-family: 'Times New Roman', Times, serif; color: #0f172a; ${isSubSLP ? '' : 'text-decoration: underline;'}">${isSubSLP ? escapeHtml(text) : `<u>${escapeHtml(text)}</u>`}</div>\n`;
        htmlResult += chunk;
        pageCtx.pageHtml += chunk;
        inPartySection = true;
        continue;
      }

      // Between:
      if (/^Between\s*[:\-]?$/i.test(text)) {
        flushParagraph();
        const chunk = `<div style="font-weight: bold; font-size: 15px; margin: 8px 0 4px; font-family: 'Times New Roman', serif; color: #0f172a;">Between:</div>\n`;
        htmlResult += chunk;
        pageCtx.pageHtml += chunk;
        inPartySection = true;
        continue;
      }

      // G. Parties Section (Petitioner / Appellant / Respondent / VERSUS)
      const isPartyLine = (/(?:\.{2,}|\u2026+|\u22EF+|\s*[-–—]\s*)\s*(?:APPELLANTS?|PETITIONERS?|RESPONDENTS?|ACCUSED|STATE)/i.test(col2) || 
                           /(?:\.{2,}|\u2026+|\u22EF+|\s*[-–—]\s*)\s*(?:APPELLANTS?|PETITIONERS?|RESPONDENTS?|ACCUSED|STATE)/i.test(text)) &&
                          !/\bSection\b/i.test(text);
      if (isPartyLine) {
        flushParagraph();
        flushTable(pageCtx);
        let pName = col1;
        let pRole = col2;
        if (!pName || !pRole) {
          const m = text.match(/^(.*?)\s*((?:\.{2,}|\u2026+|\u22EF+|\s*[-–—]\s*)\s*(?:APPELLANTS?|PETITIONERS?|RESPONDENTS?|ACCUSED|STATE).*)$/i);
          if (m) {
            pName = m[1];
            pRole = m[2];
          } else {
            pName = text;
            pRole = '';
          }
        }

        if (partyBuffer.length > 0) {
          pName = partyBuffer.join(' ') + ' ' + pName;
          partyBuffer = [];
        }

        const chunk = `<div style="display: flex; justify-content: space-between; align-items: baseline; font-weight: bold; margin: 8px 0; font-family: 'Times New Roman', Times, serif; font-size: 15px; color: #0f172a;"><span>${escapeHtml(pName)}</span><span style="font-style: italic; white-space: nowrap; margin-left: 16px;">${escapeHtml(pRole)}</span></div>\n`;
        htmlResult += chunk;
        pageCtx.pageHtml += chunk;
        continue;
      }

      // H. VERSUS / AND
      if (/^(?:VERSUS|V\/S|VS\.?|V\.|AND)$/i.test(text)) {
        flushParagraph();
        flushPartyBuffer();
        flushTable(pageCtx);
        const chunk = `<div style="text-align: center; font-weight: bold; font-size: 14px; letter-spacing: 2.5px; margin: 14px 0; font-family: 'Times New Roman', Times, serif; color: #475569;">— ${escapeHtml(text.toUpperCase())} —</div>\n`;
        htmlResult += chunk;
        pageCtx.pageHtml += chunk;
        continue;
      }

      // If in party section before PRAYER or JUDGMENT, buffer party addresses
      if (inPartySection && pIdx === 0 && idx < 20 && !/^(?:PRAYER|ORDER|JUDGMENT|Court\s+made|Counsel\s+for|For\s+Petitioner|For\s+Respondent)/i.test(text)) {
        partyBuffer.push(text);
        continue;
      } else if (partyBuffer.length > 0) {
        flushPartyBuffer();
      }

      // I. PRAYER SECTION
      if (/^PRAYER\s*[:\-]/i.test(text)) {
        flushParagraph();
        flushPartyBuffer();
        inPartySection = false;
        inAdvocateSection = false;
        const m = text.match(/^(PRAYER\s*[:\-])\s*(.*)$/i);
        const prefix = m ? m[1] : 'PRAYER :';
        const rest = m ? m[2] : text.replace(/^PRAYER\s*[:\-]\s*/i, '');
        currentParagraph = { prefix, text: rest };
        continue;
      }

      // J. ADVOCATE / COUNSEL APPEARANCES
      if (/^(?:Counsel\s+for\s+(?:the\s+)?(?:Petitioner|Appellant|Respondent|State|Applicant|Opposite\s+Party)|For\s+(?:the\s+)?(?:Petitioner|Appellant|Respondent|State|Defendant|Plaintiff|Applicant)|Advocate[s]?\s+for\s+(?:the\s+)?(?:Petitioner|Appellant|Respondent))\s*(?:\([^\)]*\))?\s*[:\-]?/i.test(text)) {
        flushParagraph();
        flushPartyBuffer();
        inAdvocateSection = true;
        const chunk = `<div style="font-weight: bold; font-size: 14.5px; margin: 12px 0 4px; font-family: 'Times New Roman', serif; color: #0f172a;">${escapeHtml(text)}</div>\n`;
        htmlResult += chunk;
        pageCtx.pageHtml += chunk;
        continue;
      }
      if (/Counsel\s+for\s+(?:the\s+)?Respondent/i.test(text) && /^\d+\.\s+[A-Z\s]+/i.test(text)) {
        flushParagraph();
        const parts = text.split(/(?=Counsel\s+for\s+(?:the\s+)?Respondent)/i);
        const p1 = parts[0]?.trim();
        const p2 = parts[1]?.trim();
        let chunk = '';
        if (p1) chunk += `<div style="margin-left: 16px; font-family: 'Times New Roman', serif; font-size: 14px; color: #334155; margin-bottom: 4px;">${escapeHtml(p1)}</div>\n`;
        if (p2) chunk += `<div style="font-weight: bold; font-size: 14.5px; margin: 12px 0 4px; font-family: 'Times New Roman', serif; color: #0f172a;">${escapeHtml(p2)}</div>\n`;
        htmlResult += chunk;
        pageCtx.pageHtml += chunk;
        continue;
      }
      if (/Court\s+(?:made|passed)\s+the|following\s+order\s+of\s+the\s+Court\s+was\s+delivered/i.test(text)) {
        flushParagraph();
        flushPartyBuffer();
        inAdvocateSection = false;
        const parts = text.split(/Court\s+(?:made|passed)\s+the|following\s+order\s+of\s+the\s+Court\s+was\s+delivered/i);
        if (parts[0]?.trim()) {
          const cChunk = `<div style="margin-left: 16px; font-family: 'Times New Roman', serif; font-size: 14px; color: #334155; margin-bottom: 8px;">${escapeHtml(parts[0].trim())}</div>\n`;
          htmlResult += cChunk;
          pageCtx.pageHtml += cChunk;
        }
        if (idx + 1 < lines.length && /following\s+order/i.test(lines[idx + 1].lineText)) {
          idx++;
        }
        const orderChunk = `<div style="font-weight: bold; font-size: 15px; margin: 18px 0 10px; font-family: 'Times New Roman', serif; color: #0f172a; text-decoration: underline;"><u>The Court made the following order:</u></div>\n`;
        htmlResult += orderChunk;
        pageCtx.pageHtml += orderChunk;
        continue;
      }
      if (inAdvocateSection && idx < 30 && (/^\d+\.\s+[A-Z\s\(\)]+/i.test(text) || /^(?:Special\s+Government|Government\s+Pleader|Standing\s+Counsel|Senior\s+Counsel|Not\s+ready|Advocate)/i.test(text))) {
        flushParagraph();
        const chunk = `<div style="margin-left: 16px; font-family: 'Times New Roman', Times, serif; font-size: 14px; color: #334155; line-height: 1.5; margin-bottom: 4px;">${escapeHtml(text)}</div>\n`;
        htmlResult += chunk;
        pageCtx.pageHtml += chunk;
        continue;
      } else if (inAdvocateSection && !/^(?:Counsel|For\s+|\*|―|_|-)/i.test(text)) {
        inAdvocateSection = false;
      }

      // Order Author line: (per Hon'ble Sri Justice R.Raghunandan Rao)
      if (/^\(?\s*per\s+(?:HON['’]BLE|HONOURABLE)\s+(?:SRI|MR\.|MS\.|DR\.)?\s*JUSTICE/i.test(text)) {
        flushParagraph();
        const m = text.match(/^(\(?\s*per\s+[^)]+\)?)\s*(.*)$/i);
        const auth = m ? m[1] : text;
        const rest = m ? m[2] : '';
        const aChunk = `<div style="font-style: italic; font-weight: bold; font-size: 14.5px; margin: 8px 0 12px; font-family: 'Times New Roman', serif; color: #334155;">${escapeHtml(auth)}</div>\n`;
        htmlResult += aChunk;
        pageCtx.pageHtml += aChunk;
        if (rest.trim()) {
          currentParagraph = { prefix: '', text: rest.trim() };
        }
        continue;
      }


      // I. PRAYER SECTION
      if (/^PRAYER\s*[:\-]/i.test(text)) {
        flushParagraph();
        flushPartyBuffer();
        inPartySection = false;
        inAdvocateSection = false;
        const m = text.match(/^(PRAYER\s*[:\-])\s*(.*)$/i);
        const prefix = m ? m[1] : 'PRAYER :';
        const rest = m ? m[2] : text.replace(/^PRAYER\s*[:\-]\s*/i, '');
        currentParagraph = { prefix, text: rest };
        continue;
      }

      // J. ADVOCATE / COUNSEL APPEARANCES
      if (/^(?:For\s+Petitioner|For\s+Appellant|For\s+Respondent|For\s+State|For\s+Defendant|For\s+Plaintiff)\s*[:\-]/i.test(text)) {
        flushParagraph();
        flushPartyBuffer();
        inAdvocateSection = true;
        const chunk = `<div style="margin: 4px 0; font-family: 'Times New Roman', Times, serif; font-size: 14.5px; color: #0f172a; line-height: 1.6;">${escapeHtml(text)}</div>\n`;
        htmlResult += chunk;
        pageCtx.pageHtml += chunk;
        continue;
      }
      if (inAdvocateSection && idx < 28 && /^(?:Special\s+Government|Government\s+Pleader|Standing\s+Counsel|Senior\s+Counsel|Not\s+ready|Advocate)/i.test(text)) {
        flushParagraph();
        const chunk = `<div style="margin: 2px 0 2px 20px; font-family: 'Times New Roman', Times, serif; font-size: 14px; color: #334155; line-height: 1.5;">${escapeHtml(text)}</div>\n`;
        htmlResult += chunk;
        pageCtx.pageHtml += chunk;
        continue;
      } else if (inAdvocateSection && !/^(?:For\s+|\*|―|_|-)/i.test(text)) {
        inAdvocateSection = false;
      }

      // K. JUDGMENT / ORDER Title (Underlined)
      const isJudgmentTitle = /^(?:JUDGMENT|ORDER|O\s*R\s*D\s*E\s*R|J\s*U\s*D\s*G\s*M\s*E\s*N\s*T)$/i.test(text);
      if (isJudgmentTitle) {
        flushParagraph();
        flushPartyBuffer();
        flushTable(pageCtx);
        inPartySection = false;
        inAdvocateSection = false;
        const titleLabel = /O\s*R\s*D\s*E\s*R/i.test(text) ? 'O R D E R' : 'J U D G M E N T';
        const chunk = `<div style="text-align: center; font-weight: bold; font-size: 18px; letter-spacing: 4px; margin: 28px 0 16px; font-family: 'Times New Roman', Times, serif; color: #0f172a; text-decoration: underline;"><u>${titleLabel}</u></div>\n`;
        htmlResult += chunk;
        pageCtx.pageHtml += chunk;
        continue;
      }

      // L. Judge Signature / Author line (Underlined)
      const isJudgeNameLine = /^[A-Z\.\s]{3,40},\s*J\.?$/i.test(text) ||
                              /^(?:The\s+Judgment\s+of\s+the\s+Court\s+was\s+delivered\s+by|JUDGMENT\s+DELIVERED\s+BY)/i.test(text);
      if (isJudgeNameLine) {
        flushParagraph();
        flushPartyBuffer();
        flushTable(pageCtx);
        const chunk = `<div style="font-weight: bold; font-size: 15px; margin: 16px 0 20px; font-family: 'Times New Roman', Times, serif; color: #0f172a; text-decoration: underline;"><u>${escapeHtml(text)}</u></div>\n`;
        htmlResult += chunk;
        pageCtx.pageHtml += chunk;
        continue;
      }


      // 4. STATUTORY COMPARISON TABLES (CrPC vs BNSS, IPC vs BNS, or comparative columns)
      const isTableHeaderTrigger = (col1 && col2) && (
        ((/Section\s*\d+|Cr\.?P\.?C|B\.?N\.?S\.?S|I\.?P\.?C|B\.?N\.?S|Criminal\s*Procedure|Nagarik\s*Suraksha|Nyaya\s*Sanhita|Penal\s*Code|Evidence/i.test(col1)) &&
         (/Section\s*\d+|Cr\.?P\.?C|B\.?N\.?S\.?S|I\.?P\.?C|B\.?N\.?S|Criminal\s*Procedure|Nagarik\s*Suraksha|Nyaya\s*Sanhita|Penal\s*Code|Evidence/i.test(col2))) ||
        (/Provision|Clause|Act|Existing|Proposed|Earlier|Old|Amended|Law\b/i.test(col1) && /Provision|Clause|Act|Existing|Proposed|New|Amended|Law\b/i.test(col2)) ||
        (/^Section\b/i.test(col1) && /^Section\b/i.test(col2))
      );

      if (!inTable && isTableHeaderTrigger) {
        flushParagraph();
        inTable = true;
        currentTableHeaders = [col1, col2];
        currentTableRows = [];
        currentTableRows.push({
          isHeader: true,
          cells: [col1, col2]
        });
        activeTableRow = { isHeader: false, cells: ['', ''] };
        continue;
      }

      if (inTable) {
        // Check if table has terminated:
        // A comparative table terminates when:
        // A. A major court heading appears (JUDGMENT, ORDER, CONCLUSION, HELD)
        // B. A new sequential judgment paragraph begins (e.g. 17. when last was 16) across the full width of the page
        const courtParaMatch = text.match(/^(\d{1,3})\.\s+([A-Za-z])/);
        let isTableTerminator = false;

        if (courtParaMatch) {
          const pNum = parseInt(courtParaMatch[1], 10);
          if (lastCourtParaNum > 0 && pNum === lastCourtParaNum + 1 && (!col2 || items[items.length - 1].x > midX + 100)) {
            isTableTerminator = true;
          }
        }
        if (/^(?:JUDGMENT|ORDER|CONCLUSION|HELD|Leave\s+granted)\b/i.test(text)) {
          isTableTerminator = true;
        }

        if (isTableTerminator) {
          flushTable(pageCtx);
          tablePendingContinuation = null;
          // Fall through to normal paragraph processing below
        } else {
          // Inside the comparative table:
          // Check if this line starts a new row / sub-clause (e.g., "(2)", "(3)", "167.", "Provided that")
          const isNewSubClause = /^(?:\([0-9a-z]+\)|\[[0-9a-z]+\]|\d+\.\s+|Section\s+\d+|Provided\s+that|Explanation)/i.test(col1) ||
                                 /^(?:\([0-9a-z]+\)|\[[0-9a-z]+\]|\d+\.\s+|Section\s+\d+|Provided\s+that|Explanation)/i.test(col2);

          if (isNewSubClause && (activeTableRow.cells[0].trim() || activeTableRow.cells[1].trim())) {
            pushActiveTableRow();
          }

          const joinWithNewline = (curr, add) => {
            if (!curr) return add;
            if (/^(?:Provided\s+that|\([a-z0-9]+\)|\[[a-z0-9]+\]|Explanation|\.{3,}|…)/i.test(add)) {
              return curr + '\n' + add;
            }
            return curr + ' ' + add;
          };

          if (col1) {
            activeTableRow.cells[0] = joinWithNewline(activeTableRow.cells[0], col1);
          }
          if (col2) {
            activeTableRow.cells[1] = joinWithNewline(activeTableRow.cells[1], col2);
          } else if (!col1 && text) {
            const avgX = items.reduce((sum, it) => sum + it.x, 0) / (items.length || 1);
            if (avgX < midX - 10) {
              activeTableRow.cells[0] = joinWithNewline(activeTableRow.cells[0], text);
            } else {
              activeTableRow.cells[1] = joinWithNewline(activeTableRow.cells[1], text);
            }
          }
          continue;
        }
      }

      // 5. Judge Signature Lines on Final Pages (Right-Aligned, Bold)
      if (pIdx >= pagesData.length - 2 && (
        /^(?:\.{3,}|…+|―+|-+)\s*J\.?$/i.test(text) ||
        /^\([A-Z\.\s]{3,40}\)$/.test(text) ||
        /^\[[A-Z\.\s]{3,40}\]$/.test(text)
      )) {
        flushParagraph();
        const chunk = `<div style="text-align: right; margin: 12px 0 2px; font-family: 'Times New Roman', Times, serif; font-size: 15px; font-weight: bold; color: #0f172a;">${escapeHtml(text)}</div>\n`;
        htmlResult += chunk;
        pageCtx.pageHtml += chunk;
        continue;
      }

      // City / Date at Final Page bottom (e.g. New Delhi, July 1, 2026)
      if (pIdx >= pagesData.length - 2 && idx >= lines.length - 6 && (
        /^(?:New\s+Delhi|Chennai|Amaravati|Hyderabad|Mumbai|Bangalore|Bengaluru|Kolkata|Ahmedabad|Allahabad|Lucknow|Chandigarh|Patna|Cuttack|Jabalpur|Jaipur|Jodhpur|Srinagar|Jammu|Shimla|Ranchi|Bilaspur|Nainital|Guwahati)\.?$/i.test(text) ||
        /^(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\.?$/i.test(text) ||
        /^\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December),?\s+\d{4}\.?$/i.test(text) ||
        /^Dated?\s*[:\-]\s*[0-9A-Za-z\s,\.\/\-]+$/i.test(text)
      )) {
        flushParagraph();
        const chunk = `<div style="margin: 6px 0 2px; font-family: 'Times New Roman', Times, serif; font-size: 14.5px; color: #334155;">${escapeHtml(text)}</div>\n`;
        htmlResult += chunk;
        pageCtx.pageHtml += chunk;
        continue;
      }

      // 6. Standard Court Judgment Paragraphs (Continuous, fully justified)
      let courtPara = null;
      const isNumberedDateLine = /^\d{1,2}\s*[\.\/\-]\s*\d{1,2}\s*[\.\/\-]\s*\d{2,4}/.test(text);
      if (!isNumberedDateLine) {
        const m = text.match(/^(\d{1,3}\.|\(\d{1,3}\)|\[\d{1,3}\]|\([a-z]\))\s+([A-Za-z"“‘\(\[])/);
        if (m) {
          courtPara = {
            prefix: m[1].trim(),
            content: text.slice(m[1].length).trim()
          };
        }
      }

      if (courtPara) {
        // Track the current court paragraph number
        const pNumMatch = courtPara.prefix.match(/^(\d{1,3})/);
        if (pNumMatch) {
          const num = parseInt(pNumMatch[1], 10);
          if (num < 100) {
            lastCourtParaNum = num;
          }
        }
        flushParagraph();
        currentParagraph = { prefix: courtPara.prefix, text: courtPara.content };
      } else {
        // Continuation line of the current paragraph
        if (currentParagraph) {
          if (currentParagraph.text.endsWith('-')) {
            currentParagraph.text = currentParagraph.text.slice(0, -1) + text;
          } else {
            currentParagraph.text += ' ' + text;
          }
        } else {
          currentParagraph = { prefix: '', text: text };
        }
      }
    }

    // Flush any pending paragraph, table, and footnotes on page end
    flushParagraph();
    if (inTable) {
      tablePendingContinuation = { isContinuing: true, headers: currentTableHeaders };
    }
    flushTable(pageCtx);
    flushFootnotes(pageCtx);

    pages.push({
      pageNum: page.pageNum,
      html: pageCtx.pageHtml
    });
  }

  // Final flush on document end
  flushTable(pages.length > 0 ? pages[pages.length - 1] : null);

  return { htmlBody: htmlResult, extractedTablesCount, pages };
}

/**
 * Formats table rows into clean, editable HTML table
 */
function formatTableToHtml(rows) {
  if (!rows || rows.length === 0) return '';

  // Filter out any faux header/footer tables
  const isHeaderFooterTable = rows.some(r => 
    r.cells.some(cell => 
      /^(?:Page\s*\d+\s*(?:of\s*\d+)?|\d+\s*(?:of|\/)\s*\d+|\d+\s*\|\s*Page)$/i.test(cell.trim()) ||
      (/(?:Crl\.|Civ\.|Writ|Appeal|SLP).+?No\.\s*\d+/i.test(cell) && /Page\s*\d+/i.test(cell))
    )
  );
  if (isHeaderFooterTable) return '';

  let html = `<div class="dlr-table-container my-6" style="width: 100%; overflow: visible;">\n`;
  html += `  <table class="dlr-extracted-table" contenteditable="true" style="width: 100%; border-collapse: collapse; margin: 20px 0; font-family: 'Times New Roman', Times, serif; font-size: 14.5px; border: 1.5px solid #334155; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">\n`;

  const first = rows[0];
  let bodyRows = rows;
  if (first && (first.isHeader || /CrPC|BNSS|IPC|BNS|Section|Provision|Act/i.test(first.cells.join(' ')))) {
    html += `    <thead>\n      <tr style="background-color: #f1f5f9; border-bottom: 2px solid #334155;">\n`;
    for (const cell of first.cells) {
      html += `        <th contenteditable="true" style="border: 1px solid #94a3b8; padding: 12px 16px; text-align: left; font-weight: bold; width: 50%; font-size: 14.5px; color: #0f172a; cursor: text; user-select: text; -webkit-user-select: text;">${escapeHtml(cell)}</th>\n`;
    }
    html += `      </tr>\n    </thead>\n`;
    bodyRows = rows.slice(1);
  }

  html += `    <tbody>\n`;
  for (let rIdx = 0; rIdx < bodyRows.length; rIdx++) {
    const row = bodyRows[rIdx];
    const bg = rIdx % 2 === 1 ? 'background-color: #f8fafc;' : 'background-color: #ffffff;';
    html += `      <tr style="${bg} border-bottom: 1px solid #e2e8f0;">\n`;
    for (const cell of row.cells) {
      const formatted = escapeHtml(cell).replace(/\n/g, '<br/>');
      html += `        <td contenteditable="true" style="border: 1px solid #cbd5e1; padding: 12px 16px; vertical-align: top; text-align: justify; text-justify: inter-word; line-height: 1.7; font-size: 14px; color: #1e293b; width: 50%; cursor: text; user-select: text; -webkit-user-select: text;">${formatted}</td>\n`;
    }
    html += `      </tr>\n`;
  }

  html += `    </tbody>\n  </table>\n</div>\n`;
  return html;
}

function parseIndianDate(str) {
  if (!str) return null;
  // Match DD.MM.YYYY or DD/MM/YYYY or DD-MM-YYYY
  const numMatch = str.match(/\b(\d{1,2})[\.\/\-](\d{1,2})[\.\/\-](\d{4})\b/);
  if (numMatch) {
    const [_, d, m, y] = numMatch;
    return {
      iso: `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`,
      year: y
    };
  }
  // Match e.g. 29 August, 2024 or 29 August 2024
  const namedMatch = str.match(/([0-9]{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December),?\s+([0-9]{4})/i);
  if (namedMatch) {
    const months = { january: '01', february: '02', march: '03', april: '04', may: '05', june: '06', july: '07', august: '08', september: '09', october: '10', november: '11', december: '12' };
    const d = namedMatch[1].padStart(2, '0');
    const m = months[namedMatch[2].toLowerCase()];
    const y = namedMatch[3];
    return {
      iso: `${y}-${m}-${d}`,
      year: y
    };
  }
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return {
      iso: `${y}-${m}-${day}`,
      year: String(y)
    };
  }
  return null;
}

/**
 * Extracts legal metadata (Court, Title, Parties, Date, Bench, Citation, Act, Section)
 */
function extractLegalMetadata(rawText, pagesData) {
  const result = {
    title: '',
    petitioner: '',
    respondent: '',
    court: 'Supreme Court of India',
    year: String(new Date().getFullYear()),
    judgmentDate: new Date().toISOString().split('T')[0],
    bench: '',
    caseNumber: '',
    diaryNumber: '',
    act: '',
    section: '',
    summary: '',
    citations: []
  };

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const first100Lines = lines.slice(0, 100).join('\n');

  // 1. Court Name (check first 25 lines specifically for High Court name before falling back to Supreme Court)
  let detectedCourt = '';
  for (const l of lines.slice(0, 25)) {
    const hc = l.match(/HIGH\s+COURT\s+(?:OF\s+JUDICATURE\s+AT|OF)?\s+([A-Z\s]+)/i);
    if (hc && hc[1]) {
      const city = hc[1].trim().split(/\n|\r/)[0].trim();
      detectedCourt = `${city.charAt(0) + city.slice(1).toLowerCase()} High Court`;
      break;
    }
  }
  if (detectedCourt) {
    result.court = detectedCourt;
  } else if (/SUPREME\s+COURT\s+OF\s+INDIA/i.test(first100Lines)) {
    result.court = 'Supreme Court of India';
  }

  // 2. Case Number / Appeal Number (check per line for precision)
  for (const l of lines.slice(0, 45)) {
    const caseMatch = l.match(/^(?:(?:Crl\.|Civ\.)?\s*A\.\s*@\s*SLP\s*\([^\)]+\)\s*No\.?\s*[0-9\/\s\w\-]+(?:of\s*[0-9]{4})?|(?:CRIMINAL|CIVIL)?\s*APPEAL\s*(?:NO\.?|@\s*SLP)?\s*[0-9\/\s\w\-]+(?:OF\s*[0-9]{4})?|(?:SPECIAL\s+LEAVE\s+PETITION|SLP)\s*\(.*?\)\s*NO\.?\s*[0-9\/\s\w\-]+(?:OF\s*[0-9]{4})?|(?:WRIT\s+PETITION|W\.?P\.?|CIVIL\s+MISC|C\.?M\.?A\.?|O\.?S\.?A\.?|CONTEMPT\s+PETITION|REVIEW\s+APPLICATION)(?:\s*\([^\)]*\))?\s*(?:NO\.?|NUMBER|NO\s*:)?\s*[0-9\/\s\w\-]+(?:\s*(?:OF|\/)\s*[0-9]{4})?)/i);
    if (caseMatch) {
      result.caseNumber = caseMatch[0].replace(/\s+/g, ' ').trim();
      break;
    }
  }

  // 3. Diary Number
  const diaryMatch = first100Lines.match(/DIARY\s*NO\.?\s*([0-9\/\s\w\-]+)/i);
  if (diaryMatch) {
    result.diaryNumber = diaryMatch[1].trim();
  }

  // 4. Parties & Title (Appellant / Petitioner vs. Respondent)
  const petIdx = lines.findIndex(l => /(?:\.{2,}|\u2026+|\u22EF+|\s*[-–—]\s*)\s*PETITIONERS?(?:\(s\))?/i.test(l));
  const respIdx = lines.findIndex(l => /(?:\.{2,}|\u2026+|\u22EF+|\s*[-–—]\s*)\s*RESPONDENTS?(?:\(s\))?/i.test(l));
  if (petIdx >= 0 && respIdx > petIdx) {
    const rawPet = lines[petIdx].replace(/(?:\.{2,}|\u2026+|\u22EF+|\s*[-–—]\s*)\s*PETITIONERS?(?:\(s\))?/gi, '').trim();
    const rawResp = lines[respIdx].replace(/(?:\.{2,}|\u2026+|\u22EF+|\s*[-–—]\s*)\s*RESPONDENTS?(?:\(s\))?/gi, '').trim();
    if (rawPet) result.petitioner = cleanPartyName(rawPet);
    if (rawResp) result.respondent = cleanPartyName(rawResp);
    if (result.petitioner && result.respondent) {
      result.title = `${result.petitioner} vs. ${result.respondent}`;
    }
  }

  if (!result.title) {
    const versusIdx = lines.findIndex(l => /^(?:VERSUS|V\/S|VS\.?|V\.|AND)$/i.test(l.trim()));
    if (versusIdx > 0 && versusIdx < 80) {
      const petLines = [];
      for (let j = versusIdx - 1; j >= 0 && j >= versusIdx - 6; j--) {
        const line = lines[j].trim();
        if (/^\s*\(|^(?:CRIMINAL|CIVIL|WRIT|APPEAL|IN THE|SPECIAL LEAVE|HON'BLE|CORAM|DATED|Between)/i.test(line)) break;
        petLines.unshift(line);
      }
      const rawPet = petLines.join(' ');

      const respLines = [];
      for (let j = versusIdx + 1; j < lines.length && j <= versusIdx + 8; j++) {
        const line = lines[j].trim();
        if (/^(?:JUDGMENT|ORDER|J\s*U\s*D\s*G\s*M\s*E\s*N\s*T|O\s*R\s*D\s*E\s*R|CORAM|BEFORE|DATED|PRAYER|Counsel)/i.test(line)) break;
        respLines.push(line);
      }
      const rawResp = respLines.join(' ');

      const pet = cleanPartyName(rawPet);
      const resp = cleanPartyName(rawResp);
      if (pet) result.petitioner = pet;
      if (resp) result.respondent = resp;
      if (pet && resp) result.title = `${pet} vs. ${resp}`;
    }
  }

  // Fallback for title if not yet established
  if (!result.title) {
    const rawVersus = first100Lines.match(/([A-Z\s\.,]{3,80})\s+(?:VS\.?|VERSUS|V\/S)\s+([A-Z\s\.,]{3,80})/i);
    if (rawVersus) {
      result.petitioner = cleanPartyName(rawVersus[1]);
      result.respondent = cleanPartyName(rawVersus[2]);
      result.title = `${result.petitioner} vs. ${result.respondent}`;
    }
  }

  // 5. Decision Date & Year
  const dateMatch = rawText.match(/(?:DECIDED\s+ON|DATED|DATE\s*:|ORDER\s+DATED\s*:?|on)\s*[:\-]?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{4}|[0-9]{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December),?\s+[0-9]{4})/i) ||
                    rawText.match(/([0-9]{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December),?\s+[0-9]{4})/i) ||
                    rawText.match(/([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{4})/i);

  if (dateMatch && dateMatch[1]) {
    const dStr = dateMatch[1].trim();
    const parsedD = parseIndianDate(dStr);
    if (parsedD) {
      result.judgmentDate = parsedD.iso;
      result.year = parsedD.year;
    }
  }

  // 6. Bench / Coram / Author Judge
  const benchMetaMatch = first100Lines.match(/^Bench\s*:\s*(.+)$/im);
  const authorMetaMatch = first100Lines.match(/^Author\s*:\s*(.+)$/im);
  const coramJudgesMatch = first100Lines.match(/(?:THE\s+)?(?:HON['’]BLE|HONOURABLE)\s+(?:THE\s+CHIEF\s+JUSTICE|(?:SRI|MR\.|MS\.|DR\.)?\s*JUSTICE)\s+([^\n\r]+)/i);
  const benchMatch = first100Lines.match(/(?:CORAM|BEFORE)\s*[:\-]?\s*(?:\r?\n)?\s*(?:THE\s+)?(?:HON['’]BLE|HONOURABLE)\s+(?:MR\.|MS\.|DR\.)?\s*JUSTICE\s+([^\n\r]+)/i) ||
                    first100Lines.match(/(?:THE\s+)?(?:HON['’]BLE|HONOURABLE)\s+(?:MR\.|MS\.|DR\.)?\s*JUSTICE\s+([^\n\r]+)/i) ||
                    first100Lines.match(/(?:CORAM|BEFORE)\s*[:\-]\s*([^\n\r]+)/i) ||
                    first100Lines.match(/HON'BLE\s+MR\.\s+JUSTICE\s+([^\n\r]+)/i);

  if (benchMetaMatch) {
    result.bench = `Hon'ble Mr. Justice ` + benchMetaMatch[1].replace(/HON'BLE|HONOURABLE|JUSTICE|MR\.|THE|SRI/gi, '').replace(/\s+/g, ' ').trim();
  } else if (coramJudgesMatch) {
    result.bench = coramJudgesMatch[0].trim();
  } else if (benchMatch) {
    result.bench = `Hon'ble Mr. Justice ` + benchMatch[1].replace(/HON'BLE|HONOURABLE|JUSTICE|MR\.|THE/gi, '').replace(/\s+/g, ' ').trim();
  } else if (authorMetaMatch) {
    result.bench = authorMetaMatch[1].replace(/,?\s*J\.?$/i, '').trim();
  }

  const authorMatch = rawText.match(/(?:The\s+Judgment\s+of\s+the\s+Court\s+was\s+delivered\s+by|JUDGMENT\s+DELIVERED\s+BY)\s*[:\-]?\s*([^\n\r]+)/i);
  if (authorMatch && !result.bench) {
    result.bench = authorMatch[1].replace(/,?\s*J\.?$/i, '').trim();
  }

  // 7. Citations (e.g. 2026 INSC 666)
  const inscMatch = rawText.match(/(20\d{2})\s+INSC\s+(\d+)/i);
  if (inscMatch) {
    result.citations.push({
      year: inscMatch[1],
      court: 'SC',
      month: '',
      number: `${inscMatch[1]} INSC ${inscMatch[2]}`,
      equivalentText: ''
    });
  }

  const sccMatch = rawText.match(/\((20\d{2})\)\s*(\d+)\s+SCC\s+(\d+)/i);
  if (sccMatch) {
    result.citations.push({
      year: sccMatch[1],
      court: 'SC',
      month: '',
      number: `(${sccMatch[1]}) ${sccMatch[2]} SCC ${sccMatch[3]}`,
      equivalentText: ''
    });
  }

  // 8. Acts & Sections Detection
  const actCandidates = [
    'Bharatiya Nagarik Suraksha Sanhita',
    'BNSS',
    'Code of Criminal Procedure',
    'CrPC',
    'Bharatiya Nyaya Sanhita',
    'BNS',
    'Indian Penal Code',
    'IPC',
    'Constitution of India',
    'Arbitration and Conciliation Act',
    'Negotiable Instruments Act',
    'Companies Act',
    'Evidence Act'
  ];

  for (const act of actCandidates) {
    if (new RegExp(`\\b${act}\\b`, 'i').test(rawText)) {
      result.act = act;
      break;
    }
  }

  const secMatch = rawText.match(/Section\s+(\d+[A-Za-z]*)/i);
  if (secMatch) {
    result.section = `Section ${secMatch[1]}`;
  }

  // 9. Headnote / Summary
  const paras = rawText.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 80 && !p.startsWith('IN THE') && !p.includes('APPEAL NO'));
  if (paras.length > 0) {
    result.summary = paras[0].slice(0, 450).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim() + '...';
  }

  return result;
}

function cleanPartyName(name) {
  if (!name) return '';
  return name
    .replace(/^(?:IN THE|BEFORE|COURT OF|APPEAL NO|HON'BLE|CRIMINAL|CIVIL)[^\n\r]*?:/i, '')
    .replace(/(?:\.{2,}|\u2026+|\u22EF+|\s*[-–—]\s*|\s*~+\s*|\s*\.\.\.\s*)\s*(?:APPELLANTS?|PETITIONERS?|RESPONDENTS?|ACCUSED|STATE|DEFENDANTS?|PLAINTIFFS?)(?:\(s\))?/gi, '')
    .replace(/\b(?:APPELLANTS?|PETITIONERS?|RESPONDENTS?|ACCUSED|STATE)\b\s*\(s\)?$/gi, '')
    .replace(/[;,\(\)\n\r]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
