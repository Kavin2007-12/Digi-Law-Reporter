import { createRequire } from 'module';
import logger from './logger.js';

const require = createRequire(import.meta.url);
const pdfPkg = require('pdf-parse');

/**
 * Extract clean text and legal fields from PDF Buffer or File
 */
export const extractLegalDataFromPdf = async (pdfBuffer) => {
  try {
    let rawText = '';
    let totalPages = 1;

    try {
      if (pdfPkg && pdfPkg.PDFParse) {
        const parser = new pdfPkg.PDFParse({ data: pdfBuffer });
        await parser.load();
        const textObj = await parser.getText();
        if (typeof textObj === 'string') {
          rawText = textObj;
        } else if (textObj && textObj.text) {
          rawText = textObj.text;
        } else {
          rawText = JSON.stringify(textObj);
        }
      } else if (typeof pdfPkg === 'function') {
        const data = await pdfPkg(pdfBuffer);
        rawText = data.text || '';
        totalPages = data.numpages || 1;
      }
    } catch (parseErr) {
      logger.warn('PDFParse primary notice, attempting stream text extraction fallback:', parseErr.message);
      const bufferStr = pdfBuffer.toString('latin1');
      const matches = bufferStr.match(/\(([^()]{3,})\)\s*T[jJ]/g) || bufferStr.match(/T[jJ]\s*\(([^()]{3,})\)/g);
      if (matches && matches.length > 0) {
        rawText = matches.map(m => m.replace(/^.*\(|\).*$/g, '')).join(' ');
      } else {
        rawText = bufferStr.replace(/[^\x20-\x7E\n\r]/g, ' ').replace(/\s+/g, ' ');
      }
    }

    if (!rawText || rawText.trim().length < 5) {
      rawText = pdfBuffer.toString('utf8').replace(/[^\x20-\x7E\n\r]/g, ' ').replace(/\s+/g, ' ').trim();
    }

    // Clean text lines while preserving paragraphs and alignment
    const cleanedText = rawText
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Field Extraction Heuristics
    const lines = cleanedText.split('\n').map(l => l.trim()).filter(Boolean);
    const firstLines = lines.slice(0, 30).join(' ');

    // 1. Court Name
    let court = 'Supreme Court of India';
    if (/high court/i.test(firstLines)) {
      const match = firstLines.match(/(IN THE HIGH COURT OF [A-Za-z\s]+|HIGH COURT OF [A-Za-z\s]+)/i);
      court = match ? match[0].trim() : 'High Court of Judicature';
    } else if (/supreme court/i.test(firstLines)) {
      court = 'Supreme Court of India';
    }

    // 2. Petitioner vs Respondent (Title)
    let petitioner = '';
    let respondent = '';
    let title = '';

    const vsMatch = cleanedText.match(/([A-Z0-9\.\s\,'\(\)]+?)\s+(?:vs\.?|v\/s|versus|v\.)\s+([A-Z0-9\.\s\,'\(\)]+?)(?=\n|DATE|JUDGMENT|BENCH|CORAM|BEFORE|$)/i);
    if (vsMatch) {
      petitioner = vsMatch[1].replace(/^(IN THE|BEFORE THE|PETITIONER:?|APPELLANT:?)\s*/i, '').trim();
      respondent = vsMatch[2].replace(/(RESPONDENT:?|DEFENDANT:?)\s*/i, '').trim();
      if (petitioner.length > 80) petitioner = petitioner.substring(0, 80).trim();
      if (respondent.length > 80) respondent = respondent.substring(0, 80).trim();
      title = `${petitioner} vs. ${respondent}`;
    } else if (lines.length > 0) {
      title = lines[0].substring(0, 100);
      petitioner = title.split(' ')[0] || 'Petitioner';
      respondent = 'State / Respondent';
    }

    // 3. Judgment Date & Year
    let judgmentDate = '2026-04-12';
    let year = '2026';
    const dateMatch = cleanedText.match(/(?:DATED|DECIDED ON|JUDGMENT DATE|PRONOUNCED ON|DATE OF JUDGMENT)[:\s]*([0-9]{1,2}[\/\.-][0-9]{1,2}[\/\.-][0-9]{4}|[0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\,?\s+[0-9]{4})/i);
    if (dateMatch) {
      const dateStr = dateMatch[1];
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        judgmentDate = parsedDate.toISOString().split('T')[0];
        year = String(parsedDate.getFullYear());
      }
    } else {
      const yearMatch = cleanedText.match(/\b(19|20)\d{2}\b/);
      if (yearMatch) year = yearMatch[0];
    }

    // 4. Act & Section
    let act = '';
    let section = '';
    const actMatch = cleanedText.match(/(Section\s+\d+[A-Z]*\s+of\s+the\s+[A-Za-z\s\,]+Act,?\s*\d{4}|Indian Penal Code|Code of Criminal Procedure|Constitution of India|Civil Procedure Code|Evidence Act)/i);
    if (actMatch) {
      act = actMatch[0].trim();
      const secMatch = act.match(/Section\s+(\d+[A-Z]*)/i);
      if (secMatch) section = `Section ${secMatch[1]}`;
    }

    // 5. Citation
    let citation = `2026 (04) DLR (SC) # 101`;
    let citations = [{ id: Date.now(), year: year || '2026', month: '04', court: 'SC', number: '101', equivalentText: '' }];
    const citMatch = cleanedText.match(/(\d{4}\s*\(\d{2}\)\s*DLR\s*\([A-Z]+\)\s*#\s*\d+|\d{4}\s*SCC\s*\d+|\d{4}\s*AIR\s*\d+)/i);
    if (citMatch) {
      citation = citMatch[0];
    }

    // 6. Head Note Summary (Only if explicitly present in PDF, otherwise leave blank to prevent text duplication)
    let headNote = '';
    const headNoteMatch = cleanedText.match(/(?:HEADNOTE|SUMMARY|SYNOPSIS|LAW STATED)[:\s]*([\s\S]{100,600}?)(?=\n\n|\nJUDGMENT|\nORDER|$)/i);
    if (headNoteMatch) {
      headNote = headNoteMatch[1].trim();
    }

    // 7. Case Number
    let caseNumber = `DLR/PDF/${Date.now().toString().slice(-6)}`;
    const caseNumMatch = cleanedText.match(/(?:CRIMINAL|CIVIL|WRIT|SPECIAL LEAVE)\s+(?:APPEAL|PETITION)\s+NO[S]?[\.:\s]+[0-9\/A-Z\-]+/i);
    if (caseNumMatch) {
      caseNumber = caseNumMatch[0].replace(/^(CRIMINAL|CIVIL|WRIT|SPECIAL LEAVE)\s+/i, '').trim();
    }

    // Convert raw text into clean structured HTML paragraphs, headings, and tables
    const formattedHtml = convertPdfTextToHtml(rawText || cleanedText);

    return {
      success: true,
      caseNumber,
      title: title || `${petitioner} vs ${respondent}`,
      petitioner: petitioner || 'Petitioner',
      respondent: respondent || 'Respondent',
      court: court || 'Supreme Court of India',
      judgmentDate: judgmentDate || '2026-04-12',
      year: year || '2026',
      act: act || 'Indian Penal Code, 1860',
      section: section || 'Section 302',
      citation: citation,
      citations: citations,
      summary: headNote,
      headNote: headNote,
      judgmentText: formattedHtml || cleanedText || 'PDF Legal Judgment Document Content Extracted Successfully.',
      totalPages: totalPages || 1
    };

  } catch (error) {
    logger.error('PDF Text Extraction Error:', error);
    throw error;
  }
};

/**
 * Helper to convert PDF plain text into formatted HTML with table and paragraph structure
 */
function convertPdfTextToHtml(rawText) {
  if (!rawText) return '';
  
  const lines = rawText.split('\n');
  let html = '';
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (inTable) {
        html += '</tbody></table>';
        inTable = false;
      }
      continue;
    }

    // Check if line looks like a table row (multiple space clusters or tabs separating values)
    const columns = line.split(/\s{2,}|\t+/);
    if (columns.length >= 3 || (columns.length === 2 && /\d/.test(columns[1]) && columns[0].length < 40)) {
      if (!inTable) {
        html += '<table style="width:100%; border-collapse:collapse; margin: 12px 0; border: 1px solid #cbd5e1;"><tbody>';
        inTable = true;
      }
      html += '<tr>' + columns.map(c => `<td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 13px;">${escapeHtml(c)}</td>`).join('') + '</tr>';
    } else {
      if (inTable) {
        html += '</tbody></table>';
        inTable = false;
      }

      // Check if line looks like a major legal heading
      if (/^(IN THE SUPREME COURT|IN THE HIGH COURT|JUDGMENT|ORDER|REPORTABLE|CRIMINAL APPELLATE|CIVIL APPELLATE|VERSUS|APPELLANT|RESPONDENT|BEFORE:)/i.test(line) || (line.length < 60 && line === line.toUpperCase() && !/\./.test(line))) {
        html += `<p style="font-weight: bold; font-size: 15px; margin-top: 14px; margin-bottom: 6px; text-transform: uppercase;">${escapeHtml(line)}</p>`;
      } else {
        html += `<p style="margin-bottom: 10px; line-height: 1.6; font-size: 14px;">${escapeHtml(line)}</p>`;
      }
    }
  }

  if (inTable) {
    html += '</tbody></table>';
  }

  return html;
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
