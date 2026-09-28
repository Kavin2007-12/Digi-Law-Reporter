import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { GoogleGenAI } from '@google/genai';

/**
 * AI-Powered Multimodal Legal Judgment Extractor
 * Uses Gemini 2.5 Flash if GEMINI_API_KEY / GOOGLE_API_KEY is present
 */
async function extractWithGeminiAI(pdfBuffer) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const base64Pdf = pdfBuffer.toString('base64');
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
              text: `You are an expert Indian Legal Precedent and Court Judgment Extractor for Digital Law Reporter.
Extract all details from this court judgment PDF into a strict JSON object with this exact structure:
{
  "title": "Main Appellant/Petitioner vs. Main Respondent",
  "petitioner": "Primary Appellant or Petitioner name",
  "respondent": "Primary Respondent name",
  "court": "Full name of court (e.g., Supreme Court of India, High Court of Delhi)",
  "year": "YYYY (4 digits)",
  "judgmentDate": "YYYY-MM-DD",
  "bench": "Hon'ble Judges / Coram names",
  "caseNumber": "e.g., Crl. A. @ SLP (Crl.) No. 4333 of 2026 or Criminal Appeal No. ...",
  "diaryNumber": "Diary Number if present",
  "totalPages": 14,
  "act": "Primary Act or Code (e.g., Code of Criminal Procedure, 1973 or Bharatiya Nagarik Suraksha Sanhita, 2023)",
  "section": "Key Sections referenced (e.g., Section 167 or Section 187)",
  "summary": "Comprehensive legal headnote / editorial synopsis summarizing the case facts, the legal question, the comparative provisions, and the final decision / ratio decidendi (2-3 structured paragraphs)",
  "citations": [
    { "year": "2026", "month": "04", "court": "SC", "number": "123", "equivalentText": "AIR 2026 SC ..." }
  ],
  "judgmentText": "The complete judgment text formatted in continuous, fully justified HTML paragraphs (<p style=\"text-align: justify; text-justify: inter-word; margin-bottom: 16px; line-height: 1.8; font-family: 'Times New Roman', serif; font-size: 15px;\"><strong>5.</strong> The case put forth by...</p>). CRITICAL RULE: NEVER extract or include any running footers, running headers, or page number bars (e.g., 'Page 1 of 14', 'Crl. A. @ SLP (Crl.) No. 4333 of 2026 | Page 1 of 14', or any page numbers) inside the judgment text or paragraphs. DO NOT split individual visual lines within a paragraph into separate tags. If there are statutory comparison tables, format them with <table class=\"dlr-extracted-table\"><thead><tr><th>...</th></tr></thead><tbody><tr><td>...</td></tr></tbody></table>.",
  "pages": [
    {
      "pageNum": 2,
      "html": "<p style=\"text-align: justify; text-justify: inter-word; margin-bottom: 16px; line-height: 1.8; font-family: 'Times New Roman', serif; font-size: 15px;\"><strong>5.</strong> The case put forth...</p>"
    }
  ],
  "extractedTablesCount": 1
}
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
    if (parsed && parsed.summary) {
      parsed.summary = parsed.summary
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
    }
    return parsed;
  } catch (err) {
    console.warn('Gemini extraction fallback to local parser due to:', err.message);
    return null;
  }
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

  // 1. Try Gemini Vision AI Extraction if API key is provided
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
    const aiResult = await extractWithGeminiAI(pdfBuffer);
    if (aiResult && aiResult.title) {
      return aiResult;
    }
  }

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

  // Detect Tables & Build Structured HTML Body
  const { htmlBody, extractedTablesCount, pages } = reconstructStructuredBody(pagesData);

  // Extract Metadata using Indian Legal Rules & NLP Patterns
  const metadata = extractLegalMetadata(fullPlainText, pagesData);

  // If case number wasn't found from text but was found in running headers
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

/**
 * Reconstructs the judgment body with detected tables, running headers, and formatted paragraphs
 */
/**
 * Reconstructs the judgment body with authentic Indian Court formatting:
 * - Clean Reportability & Citations (NO table borders)
 * - Centered Court & Jurisdiction headers
 * - Properly aligned Appellant/Respondent parties with VERSUS
 * - Centered JUDGMENT and Judge signatures
 * - True statutory comparative tables (with clean borders)
 * - Continuous, fully justified numbered paragraphs
 * - Zero running footers or page number leaks
 */
function reconstructStructuredBody(pagesData) {
  let htmlResult = '';
  let extractedTablesCount = 0;
  const pages = [];

  for (const page of pagesData) {
    let pageHtml = '';
    const lines = page.lines;
    const pageWidth = page.pageWidth || 600;
    const midX = pageWidth / 2;

    let inTable = false;
    let currentTableRows = [];
    let currentParagraph = null;

    const flushParagraph = () => {
      if (!currentParagraph || !currentParagraph.text.trim()) {
        currentParagraph = null;
        return;
      }
      const fullText = currentParagraph.text.trim();
      let pChunk = '';
      if (currentParagraph.isHeading) {
        pChunk = `<div style="text-align: center; font-weight: bold; font-size: 16px; letter-spacing: 1.5px; margin: 24px 0 14px; font-family: 'Times New Roman', serif; color: #0f172a;">${escapeHtml(fullText)}</div>\n`;
      } else if (currentParagraph.prefix) {
        pChunk = `<p style="margin-bottom: 16px; line-height: 1.85; text-align: justify; text-justify: inter-word; text-align-last: left; font-family: 'Times New Roman', Times, serif; font-size: 15px; color: #0f172a;"><strong>${escapeHtml(currentParagraph.prefix)}</strong> ${escapeHtml(fullText)}</p>\n`;
      } else {
        pChunk = `<p style="margin-bottom: 16px; line-height: 1.85; text-align: justify; text-justify: inter-word; text-align-last: left; font-family: 'Times New Roman', Times, serif; font-size: 15px; color: #0f172a;">${escapeHtml(fullText)}</p>\n`;
      }
      htmlResult += pChunk;
      pageHtml += pChunk;
      currentParagraph = null;
    };

    const flushTable = () => {
      if (inTable && currentTableRows.length > 0) {
        const tableHtml = formatTableToHtml(currentTableRows);
        if (tableHtml) {
          htmlResult += tableHtml;
          pageHtml += tableHtml;
          extractedTablesCount++;
        }
        inTable = false;
        currentTableRows = [];
      }
    };

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      const items = line.items;
      const text = line.lineText.trim();

      if (!text) continue;

      // 1. UNIVERSAL FILTER: Discard any running footers, running headers, or page number bars
      const isFooterOrPageNum = /Page\s*\d+|\b\d+\s*of\s*\d+\b|\d+\s*\|\s*Page/i.test(text) ||
                                /^(?:Page\s*\d+|\d+\s*\|\s*Page|\d+\s*of\s*\d+|DIGI LAW REPORTER|www\.digilawreporter)/i.test(text) ||
                                ((idx === 0 || idx >= lines.length - 3) && /^(?:Crl\.|Civ\.|Writ|Appeal|SLP|Diary|Special\s*Leave)\s*.*?No\.?\s*[0-9\/\w\-]+/i.test(text));

      if (isFooterOrPageNum) {
        continue; // Completely drop footer and header lines
      }

      // 2. Detect 2-column or split text items
      let leftItems = [];
      let rightItems = [];
      if (items.length >= 2) {
        const first = items[0];
        const last = items[items.length - 1];
        for (const it of items) {
          if (it.x < midX - 10) {
            leftItems.push(it.str);
          } else if (it.x >= midX - 10) {
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

      const col1 = hasPipeSplit ? pipeLeft : leftText;
      const col2 = hasPipeSplit ? pipeRight : rightText;

      // 3. Check for Indian Court Document Structures (Cause Titles, Citations, Parties)
      // A. Citation + REPORTABLE / NON-REPORTABLE line
      const isReportableLine = (/\b(?:REPORTABLE|NON-REPORTABLE)\b/i.test(col2) || /\b(?:REPORTABLE|NON-REPORTABLE)\b/i.test(text)) &&
                               (/\bINSC\b|\bSCC\b|\bAIR\b|\b\d{4}\b/i.test(col1) || /\b(?:REPORTABLE|NON-REPORTABLE)\b/i.test(text));
      if (isReportableLine) {
        flushParagraph();
        flushTable();
        const citText = col1 || text.replace(/REPORTABLE|NON-REPORTABLE/gi, '').trim();
        const repTag = (text.match(/NON-REPORTABLE/i) ? 'NON-REPORTABLE' : 'REPORTABLE');
        const chunk = `<div style="display: flex; justify-content: space-between; align-items: center; font-weight: bold; margin-bottom: 22px; font-family: 'Times New Roman', Times, serif; font-size: 15px; color: #0f172a;"><span>${escapeHtml(citText)}</span><span style="letter-spacing: 1.5px; font-weight: bold;">${repTag}</span></div>\n`;
        htmlResult += chunk;
        pageHtml += chunk;
        continue;
      }

      // B. Court & Jurisdiction Headings (Centered, Bold)
      const isCourtHeader = /^(?:IN\s+THE\s+SUPREME\s+COURT\s+OF\s+INDIA|IN\s+THE\s+HIGH\s+COURT\s+OF|CRIMINAL\s+APPELLATE\s+JURISDICTION|CIVIL\s+APPELLATE\s+JURISDICTION|EXTRAORDINARY\s+APPELLATE\s+JURISDICTION|ORIGINAL\s+JURISDICTION|WRIT\s+JURISDICTION)$/i.test(text);
      if (isCourtHeader) {
        flushParagraph();
        flushTable();
        const chunk = `<div style="text-align: center; font-weight: bold; font-size: 16px; letter-spacing: 0.8px; margin: 8px 0; font-family: 'Times New Roman', Times, serif; color: #0f172a;">${escapeHtml(text)}</div>\n`;
        htmlResult += chunk;
        pageHtml += chunk;
        continue;
      }

      // C. Appeal & SLP Numbers (Centered/Formatted)
      const isAppealNoHeading = /^(?:CRIMINAL|CIVIL)?\s*APPEAL\s*NO\.?\s*.*?OF\s*\d{4}/i.test(text) ||
                                /^\(@?\s*(?:Special\s*Leave\s*Petition|SLP)\s*\(.*?\)\s*NO\.?\s*.*?\)$/i.test(text);
      if (isAppealNoHeading) {
        flushParagraph();
        flushTable();
        const isSubSLP = text.startsWith('(');
        const chunk = `<div style="text-align: center; font-weight: ${isSubSLP ? 'normal' : 'bold'}; font-size: ${isSubSLP ? '14px' : '15px'}; margin: ${isSubSLP ? '2px 0 16px' : '6px 0 2px'}; font-family: 'Times New Roman', Times, serif; color: #0f172a;">${escapeHtml(text)}</div>\n`;
        htmlResult += chunk;
        pageHtml += chunk;
        continue;
      }

      // D. Parties Section (Petitioner / Appellant / Respondent / VERSUS)
      const isPartyLine = (/\.\.\.\s*(?:APPELLANT|PETITIONER|RESPONDENT|ACCUSED|STATE)/i.test(col2) || 
                           /\.\.\.\s*(?:APPELLANT|PETITIONER|RESPONDENT|ACCUSED|STATE)/i.test(text)) &&
                          !/\bSection\b/i.test(text);
      if (isPartyLine) {
        flushParagraph();
        flushTable();
        let pName = col1;
        let pRole = col2;
        if (!pName || !pRole) {
          const m = text.match(/^(.*?)\s*(\.\.\.\s*(?:APPELLANT|PETITIONER|RESPONDENT|ACCUSED|STATE).*)$/i);
          if (m) {
            pName = m[1];
            pRole = m[2];
          } else {
            pName = text;
            pRole = '';
          }
        }
        const chunk = `<div style="display: flex; justify-content: space-between; align-items: baseline; font-weight: bold; margin: 8px 0; font-family: 'Times New Roman', Times, serif; font-size: 15px; color: #0f172a;"><span>${escapeHtml(pName)}</span><span style="font-style: italic; white-space: nowrap;">${escapeHtml(pRole)}</span></div>\n`;
        htmlResult += chunk;
        pageHtml += chunk;
        continue;
      }

      // E. VERSUS
      if (/^(?:VERSUS|V\/S|VS\.?|V\.)$/i.test(text)) {
        flushParagraph();
        flushTable();
        const chunk = `<div style="text-align: center; font-weight: bold; font-size: 14px; letter-spacing: 2.5px; margin: 14px 0; font-family: 'Times New Roman', Times, serif; color: #475569;">— VERSUS —</div>\n`;
        htmlResult += chunk;
        pageHtml += chunk;
        continue;
      }

      // F. JUDGMENT / ORDER Title
      const isJudgmentTitle = /^(?:JUDGMENT|ORDER|O\s*R\s*D\s*E\s*R|J\s*U\s*D\s*G\s*M\s*E\s*N\s*T)$/i.test(text);
      if (isJudgmentTitle) {
        flushParagraph();
        flushTable();
        const chunk = `<div style="text-align: center; font-weight: bold; font-size: 18px; letter-spacing: 4px; margin: 28px 0 16px; font-family: 'Times New Roman', Times, serif; color: #0f172a;">J U D G M E N T</div>\n`;
        htmlResult += chunk;
        pageHtml += chunk;
        continue;
      }

      // G. Judge Signature / Author line (e.g., "SANJAY KAROL, J." or "B.R. GAVAI, J.")
      const isJudgeNameLine = /^[A-Z\.\s]{3,40},\s*J\.?$/i.test(text) ||
                              /^(?:The\s+Judgment\s+of\s+the\s+Court\s+was\s+delivered\s+by|JUDGMENT\s+DELIVERED\s+BY)/i.test(text);
      if (isJudgeNameLine) {
        flushParagraph();
        flushTable();
        const chunk = `<div style="font-weight: bold; font-size: 15px; margin: 16px 0 20px; font-family: 'Times New Roman', Times, serif; color: #0f172a;">${escapeHtml(text)}</div>\n`;
        htmlResult += chunk;
        pageHtml += chunk;
        continue;
      }

      // 4. Check for TRUE Statutory Comparison Tables (CrPC vs BNSS, IPC vs BNS, or data columns)
      const isStatutoryTableLine = (col1 && col2 && col1.length > 5 && col2.length > 5) &&
                                   (/Section\s*\d+|CrPC|BNSS|IPC|BNS|Provision|Clause|Act|Table|Column|Particulars/i.test(col1) ||
                                    /Section\s*\d+|CrPC|BNSS|IPC|BNS|Provision|Clause|Act|Table|Column|Particulars/i.test(col2) ||
                                    inTable);

      if (isStatutoryTableLine) {
        flushParagraph();
        if (!inTable) {
          inTable = true;
          currentTableRows = [];
        }
        const isHeader = /Section\s*\d+|CrPC|BNSS|IPC|BNS|Provision|Clause|Act/i.test(col1) && 
                         /Section\s*\d+|CrPC|BNSS|IPC|BNS|Provision|Clause|Act/i.test(col2);
        currentTableRows.push({
          isHeader,
          cells: [col1, col2]
        });
        continue;
      } else {
        flushTable();
      }

      // 5. Standard Court Judgment Paragraphs (Continuous, fully justified)
      let courtPara = null;
      const isDateLine = /^\d{1,2}\s*[\.\/\-]\s*\d{1,2}\s*[\.\/\-]\s*\d{2,4}/.test(text);
      if (!isDateLine) {
        const m = text.match(/^(\d{1,3}\.|\(\d{1,3}\)|\[\d{1,3}\]|\([a-z]\))\s+([A-Za-z"“‘\(\[])/);
        if (m) {
          courtPara = {
            prefix: m[1].trim(),
            content: text.slice(m[1].length).trim()
          };
        }
      }

      if (courtPara) {
        // New numbered paragraph starts!
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

    // Flush any pending paragraph/table on page end
    flushParagraph();
    flushTable();

    pages.push({
      pageNum: page.pageNum,
      html: pageHtml
    });
  }

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

  let html = `<table class="dlr-extracted-table" style="width: 100%; border-collapse: collapse; margin: 18px 0; font-family: 'Times New Roman', Times, serif; font-size: 14px;">\n`;

  // First row check for header
  let hasHeader = rows.some(r => r.isHeader);
  if (!hasHeader && rows.length > 0) {
    rows[0].isHeader = true; // Default first row as column headers
  }

  let inThead = false;

  for (let rIdx = 0; rIdx < rows.length; rIdx++) {
    const row = rows[rIdx];

    if (row.isHeader && rIdx === 0) {
      html += `  <thead>\n    <tr style="background-color: #f8fafc;">\n`;
      for (const cell of row.cells) {
        html += `      <th style="border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; font-weight: bold; width: 50%; font-size: 14px; color: #0f172a;">${escapeHtml(cell)}</th>\n`;
      }
      html += `    </tr>\n  </thead>\n  <tbody>\n`;
      inThead = true;
    } else {
      if (!inThead && rIdx === 0) {
        html += `  <tbody>\n`;
      }
      html += `    <tr>\n`;
      for (const cell of row.cells) {
        html += `      <td style="border: 1px solid #cbd5e1; padding: 10px 14px; vertical-align: top; text-align: justify; line-height: 1.6; width: 50%;">${escapeHtml(cell)}</td>\n`;
      }
      html += `    </tr>\n`;
    }
  }

  html += `  </tbody>\n</table>\n`;
  return html;
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

  // 1. Court Name
  if (/SUPREME\s+COURT\s+OF\s+INDIA/i.test(first100Lines)) {
    result.court = 'Supreme Court of India';
  } else {
    const hcMatch = first100Lines.match(/HIGH\s+COURT\s+(?:OF\s+JUDICATURE\s+AT|OF)?\s+([A-Z\s]+)/i);
    if (hcMatch && hcMatch[1]) {
      const city = hcMatch[1].trim().split(/\n|\r/)[0].trim();
      result.court = `${city.charAt(0) + city.slice(1).toLowerCase()} High Court`;
    }
  }

  // 2. Case Number / Appeal Number
  const caseNumMatch = first100Lines.match(/(?:Crl\.|Civ\.)?\s*A\.\s*@\s*SLP\s*\([^\)]+\)\s*No\.?\s*[0-9\/\s\w\-]+(?:of\s*[0-9]{4})?/i) ||
                       first100Lines.match(/(?:CRIMINAL|CIVIL)?\s*APPEAL\s*(?:NO\.?|@\s*SLP)?\s*([0-9\/\s\w\-]+(?:OF\s*[0-9]{4})?)/i) ||
                       first100Lines.match(/(?:SPECIAL\s+LEAVE\s+PETITION|SLP)\s*\(.*?\)\s*NO\.?\s*([0-9\/\s\w\-]+)/i) ||
                       first100Lines.match(/WRIT\s+PETITION\s*\(.*?\)\s*NO\.?\s*([0-9\/\s\w\-]+)/i);
  if (caseNumMatch) {
    result.caseNumber = caseNumMatch[0].replace(/\s+/g, ' ').trim();
  }

  // 3. Diary Number
  const diaryMatch = first100Lines.match(/DIARY\s*NO\.?\s*([0-9\/\s\w\-]+)/i);
  if (diaryMatch) {
    result.diaryNumber = diaryMatch[1].trim();
  }

  // 4. Parties & Title (Appellant / Petitioner vs. Respondent)
  const versusMatch = first100Lines.match(/([\w\s\.,'\(\)]+?)\s*(?:\.\.\.\s*Appellant\(s\)|\.\.\.\s*Petitioner\(s\)|\.\.\.\s*Accused)?\s*\n*\s*(?:VERSUS|VERSUS|V\/S|VS\.?|V\.)\s*\n*\s*([\w\s\.,'\(\)]+?)\s*(?:\.\.\.\s*Respondent\(s\)|\.\.\.\s*State)?(?:\n|DATED|BEFORE|JUDGMENT)/i);
  
  if (versusMatch) {
    const pet = cleanPartyName(versusMatch[1]);
    const resp = cleanPartyName(versusMatch[2]);
    if (pet && resp && pet.length < 120 && resp.length < 120) {
      result.petitioner = pet;
      result.respondent = resp;
      result.title = `${pet} vs. ${resp}`;
    }
  }

  // Fallback for title from first few lines if not found
  if (!result.title) {
    const rawVersus = first100Lines.match(/([A-Z\s\.,]{3,60})\s+(?:VS\.?|VERSUS|V\/S)\s+([A-Z\s\.,]{3,60})/i);
    if (rawVersus) {
      result.petitioner = cleanPartyName(rawVersus[1]);
      result.respondent = cleanPartyName(rawVersus[2]);
      result.title = `${result.petitioner} vs. ${result.respondent}`;
    }
  }

  // 5. Decision Date & Year
  const dateMatch = rawText.match(/(?:DECIDED\s+ON|DATED|DATE\s*:)\s*[:\-]?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{4}|[0-9]{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December),?\s+[0-9]{4})/i) ||
                    rawText.match(/([0-9]{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December),?\s+[0-9]{4})/i) ||
                    rawText.match(/([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{4})/i);

  if (dateMatch && dateMatch[1]) {
    const dStr = dateMatch[1].trim();
    try {
      const d = new Date(dStr);
      if (!isNaN(d.getTime())) {
        result.judgmentDate = d.toISOString().split('T')[0];
        result.year = String(d.getFullYear());
      }
    } catch {}
  }

  // 6. Bench / Coram / Author Judge
  const benchMatch = first100Lines.match(/(?:CORAM|BEFORE)\s*[:\-]\s*([^\n\r]+)/i) ||
                    first100Lines.match(/HON'BLE\s+MR\.\s+JUSTICE\s+([^\n\r]+)/i);
  if (benchMatch) {
    result.bench = benchMatch[1].replace(/HON'BLE|JUSTICE/gi, '').replace(/\s+/g, ' ').trim();
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

  // 9. Headnote / Summary (Extract introductory summary)
  const paras = rawText.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 80 && !p.startsWith('IN THE') && !p.includes('APPEAL NO'));
  if (paras.length > 0) {
    result.summary = paras[0].slice(0, 450).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim() + '...';
  }

  return result;
}

function cleanPartyName(name) {
  if (!name) return '';
  return name
    .replace(/^(IN THE|BEFORE|COURT OF|APPEAL NO|HON'BLE)/i, '')
    .replace(/\.\.\.\s*(Appellant|Petitioner|Respondent|State|Accused).*$/i, '')
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
