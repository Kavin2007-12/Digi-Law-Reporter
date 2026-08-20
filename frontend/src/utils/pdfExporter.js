import { jsPDF } from 'jspdf';
import html2pdf from 'html2pdf.js';
import QRCode from 'qrcode';

/**
 * Universal Single-Source-of-Truth Legal PDF Model Builder
 * Constructs 100% identical A4 vector document for both Download & Print
 */
export const buildVectorLegalPDF = async (caseItem) => {
  const caseId = caseItem.id || caseItem._id || '1';
  const canonicalUrl = `https://www.digilawreporter.in/case/${caseId}`;

  // 1. Generate Case QR Code Data URL
  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(canonicalUrl, { 
      margin: 1, 
      width: 160,
      color: { dark: '#0F172A', light: '#FFFFFF' }
    });
  } catch (err) {
    console.error("QR Code generation error:", err);
  }

  // 2. Dynamic Generation Timestamp (DD/MM/YYYY, hh:mm am/pm)
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const dateStr = `${day}/${month}/${year}`;

  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const timeStr = `${hours}:${minutes} ${ampm}`;
  const timestampText = `Date: ${dateStr}, ${timeStr}`;

  // 3. Initialize jsPDF (A4 Portrait, inches)
  const doc = new jsPDF({
    unit: 'in',
    format: 'a4',
    orientation: 'portrait'
  });

  const pageWidth = 8.27;   // 210 mm
  const pageHeight = 11.69; // 297 mm
  const margin = 0.6;       // 0.6 in side margins
  const contentWidth = pageWidth - (margin * 2); // 7.07 in
  const maxY = pageHeight - 1.0; // max Y before footer

  let yPos = 0.6;

  const checkNewPage = (requiredSpace = 0.22) => {
    if (yPos + requiredSpace > maxY) {
      doc.addPage();
      yPos = 0.6;
      drawHeaderOnSubsequentPage();
    }
  };

  const drawHeaderOnSubsequentPage = () => {
    doc.setFont("times", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(citation, margin, 0.45);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("DIGI LAW REPORTER (DLR)", pageWidth - margin, 0.45, { align: 'right' });

    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.008);
    doc.line(margin, 0.48, pageWidth - margin, 0.48);

    yPos = 0.85; // Generous clearance below top header line
  };

  const citation = caseItem.citation || `${caseItem.year || '2024'} DLR (${caseItem.court || 'SC'}) #1`;
  const court = caseItem.court_name || caseItem.court || 'SUPREME COURT OF INDIA';
  const rawTitle = caseItem.title || 'Untitled Case';

  let petitioner = caseItem.petitioner_name || caseItem.petitioner || '';
  let respondent = caseItem.respondent_name || caseItem.respondent || '';

  if (!petitioner && !respondent && rawTitle) {
    const splitMatch = rawTitle.split(/\s*(?:v\.?|vs\.?|VERSUS|V\/S)\s*/i);
    if (splitMatch.length === 2) {
      petitioner = splitMatch[0].trim();
      respondent = splitMatch[1].trim();
    }
  }

  const caseNumber = caseItem.case_number || caseItem.caseNumber || '';
  let formattedDate = '';
  if (caseItem.judgment_date || caseItem.judgmentDate) {
    try {
      const d = new Date(caseItem.judgment_date || caseItem.judgmentDate);
      formattedDate = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch (e) {
      formattedDate = String(caseItem.judgment_date || '').trim();
    }
  }

  const bench = caseItem.bench || caseItem.coram || caseItem.author || '';
  const headNote = caseItem.head_note || caseItem.headnote || caseItem.summary || '';
  const fullContent = caseItem.content || caseItem.judgment_text || caseItem.judgmentText || '';
  const authorJudge = caseItem.author || caseItem.judge || '';

  // RENDER PAGE 1 HEADER & COURT METADATA
  doc.setFont("times", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(citation, margin, yPos);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("DIGI LAW REPORTER (DLR)", pageWidth - margin, yPos, { align: 'right' });

  yPos += 0.08;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.01);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 0.35;

  // Court Title
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`IN THE ${court.toUpperCase()}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 0.35;

  // Parties
  if (petitioner && respondent) {
    doc.setFont("times", "bold");
    doc.setFontSize(11.5);
    const petLines = doc.splitTextToSize(petitioner, contentWidth - 1.5);
    doc.text(petLines, pageWidth / 2, yPos, { align: 'center' });
    yPos += (petLines.length * 0.2);

    doc.setFont("times", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text(". . . Appellant(s);", pageWidth / 2, yPos, { align: 'center' });
    yPos += 0.25;

    doc.setFont("times", "italic");
    doc.setFontSize(10.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Versus", pageWidth / 2, yPos, { align: 'center' });
    yPos += 0.25;

    doc.setFont("times", "bold");
    doc.setFontSize(11.5);
    doc.setTextColor(15, 23, 42);
    const respLines = doc.splitTextToSize(respondent, contentWidth - 1.5);
    doc.text(respLines, pageWidth / 2, yPos, { align: 'center' });
    yPos += (respLines.length * 0.2);

    doc.setFont("times", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text(". . . Respondent(s).", pageWidth / 2, yPos, { align: 'center' });
    yPos += 0.3;
  } else {
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    const titleLines = doc.splitTextToSize(rawTitle, contentWidth - 1.0);
    doc.text(titleLines, pageWidth / 2, yPos, { align: 'center' });
    yPos += (titleLines.length * 0.22) + 0.2;
  }

  if (caseNumber || formattedDate) {
    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const dateLine = `${caseNumber ? caseNumber : ''}${caseNumber && formattedDate ? ', ' : ''}${formattedDate ? `Decided on ${formattedDate}` : ''}`;
    doc.text(dateLine, pageWidth / 2, yPos, { align: 'center' });
    yPos += 0.25;
  }

  if (bench) {
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`Before ${bench.toUpperCase()}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 0.25;
  }

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.008);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 0.3;

  // Sanitizer Helper — Converts HTML into clean text while preserving list numbers (<ol>), bullet points (<ul>), paragraph breaks & decoding entities
  const sanitizeText = (str) => {
    if (!str) return '';
    let text = String(str);

    // 1. Process ordered lists <ol><li>...</li></ol> -> add explicit numbers "1.  ", "2.  "
    text = text.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, listContent) => {
      let itemIndex = 1;
      return listContent.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (m, itemText) => {
        const cleanItem = itemText.replace(/<[^>]*>/g, '').trim();
        if (!cleanItem) return '';
        // If item already starts with a number like "1." or "1)", don't duplicate
        const hasNumber = /^\d+[\.\)]\s*/.test(cleanItem);
        const prefix = hasNumber ? '' : `${itemIndex}.  `;
        itemIndex++;
        return `\n\n${prefix}${cleanItem}`;
      });
    });

    // 2. Process unordered lists <ul><li>...</li></ul> -> add bullet point "•  "
    text = text.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, listContent) => {
      return listContent.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (m, itemText) => {
        const cleanItem = itemText.replace(/<[^>]*>/g, '').trim();
        if (!cleanItem) return '';
        const hasBullet = /^[•\-\*]\s*/.test(cleanItem);
        const prefix = hasBullet ? '' : `•  `;
        return `\n\n${prefix}${cleanItem}`;
      });
    });

    // 3. Convert block closing tags and line break tags into double newlines for paragraph preservation
    text = text
      .replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|blockquote|tr)>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<hr\s*\/?>/gi, '\n\n');

    // 4. Remove remaining HTML tags
    text = text.replace(/<[^>]*>/g, '');

    // 5. Decode HTML entities (especially &nbsp; and &amp;)
    text = text
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&#x27;/gi, "'")
      .replace(/&ndash;/gi, '–')
      .replace(/&mdash;/gi, '—');

    // 6. Remove duplicate JUDGMENT / ORDER headers at top of body text
    text = text
      .replace(/^(?:\s*<[^>]+>)*\s*(?:J\s*U\s*D\s*G\s*M\s*E\s*N\s*T|JUDGMENT|O\s*R\s*D\s*E\s*R|ORDER)\s*/i, '');

    // 7. Remove unwanted watermark / header stamp text
    text = text
      .replace(/(?:DIGITAL|DIGI)?\s*LAW\s*REPORTER\s*Generated\s*by\s*Digital\s*Law\s*Reporter\s*Date:.*?(?:Page\s*\d+\s*of\s*\d+)/gi, '')
      .replace(/Generated\s*by\s*Digital\s*Law\s*Reporter\s*Date:.*?(?:Page\s*\d+\s*of\s*\d+)/gi, '')
      .replace(/www\.digilawreporter\.in/gi, '')
      .replace(/DIGI LAW REPORTER \(DLR\)/gi, '');

    // 8. Clean up duplicate horizontal whitespace per line
    text = text
      .split('\n')
      .map(line => line.replace(/[ \t]+/g, ' ').trim())
      .join('\n');

    // 9. Normalize multiple consecutive newlines to maximum double newlines (\n\n)
    text = text.replace(/\n{3,}/g, '\n\n');

    return text.trim();
  };

  // RENDER HEADNOTE (BOX CONTAINER FORMAT)
  if (headNote) {
    checkNewPage(0.5);

    const cleanHeadnoteText = sanitizeText(headNote);
    const headnoteParagraphs = cleanHeadnoteText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

    let headnoteLinesCount = 0;
    doc.setFont("times", "normal");
    doc.setFontSize(10.5);
    for (const para of headnoteParagraphs) {
      const lines = doc.splitTextToSize(para, contentWidth - 0.4);
      headnoteLinesCount += lines.length;
    }

    const boxHeaderHeight = 0.35;
    const boxBodyHeight = (headnoteLinesCount * 0.2) + (headnoteParagraphs.length * 0.08);
    const totalBoxHeight = boxHeaderHeight + boxBodyHeight + 0.15;

    checkNewPage(Math.min(totalBoxHeight, 2.5));

    const boxStartY = yPos;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.008);
    doc.roundedRect(margin, boxStartY, contentWidth, totalBoxHeight, 0.04, 0.04, 'FD');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text("HEADNOTE", margin + 0.2, boxStartY + 0.24);

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.005);
    doc.line(margin + 0.2, boxStartY + 0.30, margin + contentWidth - 0.2, boxStartY + 0.30);

    let innerY = boxStartY + 0.48;

    for (const para of headnoteParagraphs) {
      doc.setFont("times", "normal");
      doc.setFontSize(10.5);
      const lines = doc.splitTextToSize(para, contentWidth - 0.4);
      for (let lIdx = 0; lIdx < lines.length; lIdx++) {
        const line = lines[lIdx];
        if (!line || !line.trim()) continue;
        if (innerY > maxY - 0.2) {
          doc.addPage();
          drawHeaderOnSubsequentPage();
          innerY = yPos;
        }
        doc.setFont("times", "normal");
        doc.setFontSize(10.5);
        doc.setTextColor(30, 41, 59);

        const isLastLine = lIdx === lines.length - 1;
        if (!isLastLine && line.trim().indexOf(' ') > 0) {
          doc.text(line.trim(), margin + 0.2, innerY, { align: 'justify', maxWidth: contentWidth - 0.4 });
        } else {
          doc.text(line.trim(), margin + 0.2, innerY);
        }
        innerY += 0.2;
      }
      innerY += 0.08;
    }

    yPos = boxStartY + totalBoxHeight + 0.35;
  }

  // RENDER BOLD CENTERED JUDGMENT HEADING
  checkNewPage(0.4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("JUDGMENT", pageWidth / 2, yPos, { align: 'center' });
  yPos += 0.3;

  if (authorJudge) {
    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text("The Judgment of the Court was delivered by", margin, yPos);
    yPos += 0.22;

    doc.setFont("times", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${authorJudge.toUpperCase()}, J.—`, margin, yPos);
    yPos += 0.28;
  }

  // RENDER JUDGMENT BODY (FULL JUSTIFIED ALIGNMENT)
  const cleanBodyText = sanitizeText(fullContent);
  const bodyParagraphs = cleanBodyText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

  for (const para of bodyParagraphs) {
    doc.setFont("times", "normal");
    doc.setFontSize(11);

    const lines = doc.splitTextToSize(para, contentWidth);
    for (let lIdx = 0; lIdx < lines.length; lIdx++) {
      const line = lines[lIdx];
      if (!line || !line.trim()) continue;
      checkNewPage(0.26);
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);

      // Apply justification to all lines except paragraph end line
      const isLastLine = lIdx === lines.length - 1;
      if (!isLastLine && line.trim().indexOf(' ') > 0) {
        doc.text(line.trim(), margin, yPos, { align: 'justify', maxWidth: contentWidth });
      } else {
        doc.text(line.trim(), margin, yPos);
      }
      yPos += 0.26;
    }
    yPos += 0.18;
  }

  // STAMP RUNNING FOOTERS ON EVERY PAGE
  const totalPages = doc.internal.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    const footerY = pageHeight - 0.72;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);

    let leftY = footerY + 0.14;
    doc.text("Generated by Digital Law Reporter", margin, leftY);

    leftY += 0.12;
    doc.text(timestampText, margin, leftY);

    leftY += 0.12;
    doc.setFont("helvetica", "bold");
    doc.text(`Page ${i} of ${totalPages}`, margin, leftY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("www.digilawreporter.in", pageWidth / 2, footerY + 0.25, { align: 'center' });

    if (qrDataUrl) {
      const qrSize = 0.45;
      const qrX = pageWidth - margin - qrSize;
      const qrY = footerY + 0.04;
      doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    }
  }

  return doc;
};

/**
 * Download Action: Generates PDF model and triggers direct .pdf download file save
 */
export const downloadCaseAsPDF = async (caseItem, elementId = 'printable-judgment-document', showToast = () => {}) => {
  if (!caseItem) return;

  const docTitle = (caseItem.title || 'Judgment_Record').replace(/[^a-zA-Z0-9_\-]/g, '_');
  showToast(`Generating DLR Official Legal PDF...`);

  // Direct PDF file path check
  if (caseItem.pdf_file_path) {
    const pdfUrl = `${import.meta.env.VITE_BASE_URL || ''}${caseItem.pdf_file_path}`;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.target = '_blank';
    link.download = `DLR_${docTitle}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloading official PDF judgment file...`);
    return;
  }

  try {
    const doc = await buildVectorLegalPDF(caseItem);
    doc.save(`DLR_${docTitle}.pdf`);
    showToast(`Official PDF downloaded successfully!`);
  } catch (nativeErr) {
    console.error("Native PDF Exporter error:", nativeErr);
    showToast("Generating PDF report...");

    try {
      const element = document.getElementById(elementId);
      if (!element) {
        window.print();
        return;
      }
      const opt = {
        margin:       [0.5, 0.5, 0.85, 0.5],
        filename:     `DLR_${docTitle}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false, scrollY: 0 },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
      };
      await html2pdf().set(opt).from(element).save();
      showToast(`PDF downloaded successfully!`);
    } catch (fallbackErr) {
      console.error("PDF fallback failed:", fallbackErr);
      window.print();
    }
  }
};

/**
 * Print Action: Uses the EXACT SAME PDF Document Model, sets autoPrint, and opens print preview blob
 */
export const printCaseAsPDF = async (caseItem, elementId = 'printable-judgment-document', showToast = () => {}) => {
  if (!caseItem) return;

  const docTitle = (caseItem.title || 'Judgment_Record').replace(/[^a-zA-Z0-9_\-]/g, '_');
  showToast(`Preparing official DLR document for print preview...`);

  try {
    // Generate the EXACT SAME PDF Document Model used for Download
    const doc = await buildVectorLegalPDF(caseItem);
    
    // Set jsPDF autoPrint
    doc.autoPrint({ variant: 'non-prompt' });
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);

    // Print via hidden iframe for instant print dialog without browser layout artifacts
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.src = blobUrl;

    document.body.appendChild(iframe);
    iframe.onload = () => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        showToast(`Print preview launched.`);
      } catch (e) {
        console.error("Iframe print error, opening blob window", e);
        window.open(blobUrl, '_blank');
      }
    };
  } catch (err) {
    console.error("PDF Print generation error:", err);
    window.print();
  }
};
