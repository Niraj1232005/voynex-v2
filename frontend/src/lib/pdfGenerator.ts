import { jsPDF } from 'jspdf';

interface ItineraryPdfOptions {
  destination: string;
  duration: number | string;
  budget?: string | number;
  vibe?: string;
  planText: string;
}

interface PackingItem {
  id: string;
  item: string;
  category: string;
  checked?: boolean;
}

interface PackingPdfOptions {
  destination: string;
  duration: number | string;
  activities?: string[];
  items: PackingItem[];
}

/**
 * Strips raw markdown syntax characters so text appears clean and readable in PDFs
 */
function cleanMarkdown(text: string): string {
  return text
    .replace(/^#+\s+/gm, '') // Remove # headings
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold asterisks
    .replace(/\*(.*?)\*/g, '$1') // Remove italic asterisks
    .replace(/_{1,2}(.*?)_{1,2}/g, '$1') // Remove underscores
    .replace(/^[-*•]\s+/gm, '• ') // Standardize bullets
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // Remove code backticks
    .trim();
}

/**
 * Generates a professionally branded PDF for the AI Trip Itinerary
 */
export function generateItineraryPDF(options: ItineraryPdfOptions) {
  const { destination, duration, budget, vibe, planText } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 18;

  const addHeader = () => {
    // Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Accent line
    doc.setFillColor(13, 148, 136); // teal-600
    doc.rect(0, 27, pageWidth, 1.5, 'F');

    // Logo / Brand
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('VOYNEX', margin, 14);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(153, 246, 228); // teal-200
    doc.text('AI TRAVEL ITINERARY & EXPEDITION GUIDE', margin, 20);

    // Date
    doc.setTextColor(203, 213, 225);
    doc.setFontSize(8);
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    doc.text(`Generated: ${dateStr}`, pageWidth - margin, 17, { align: 'right' });
  };

  const addFooter = (pageNum: number, totalPages: number) => {
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.text('VOYNEX • Your All-In-One Travel Companion', margin, pageHeight - 7);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  };

  // 1. Initial Header
  addHeader();
  currentY = 38;

  // 2. Metadata Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 24, 3, 3, 'FD');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(destination.toUpperCase(), margin + 6, currentY + 9);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const metaDetails = [
    `Duration: ${duration} Days`,
    budget ? `Budget: ${budget}` : null,
    vibe ? `Vibe: ${vibe}` : null,
  ].filter(Boolean).join('   |   ');

  doc.text(metaDetails, margin + 6, currentY + 17);

  currentY += 32;

  // 3. Process Sections
  const lines = planText.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) {
      currentY += 2.5;
      continue;
    }

    // Page overflow check
    if (currentY > pageHeight - 25) {
      doc.addPage();
      addHeader();
      currentY = 36;
    }

    // Heading 1 or 2
    if (rawLine.startsWith('# ') || rawLine.startsWith('## ')) {
      const headingText = cleanMarkdown(rawLine);
      currentY += 4;
      if (currentY > pageHeight - 25) {
        doc.addPage();
        addHeader();
        currentY = 36;
      }

      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, currentY - 1, contentWidth, 8.5, 1.5, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(13, 148, 136); // teal
      doc.text(headingText, margin + 4, currentY + 5);

      currentY += 12;
      continue;
    }

    // Heading 3 (e.g. Day 1, Day 2)
    if (rawLine.startsWith('### ')) {
      const subHeading = cleanMarkdown(rawLine);
      currentY += 3;
      if (currentY > pageHeight - 25) {
        doc.addPage();
        addHeader();
        currentY = 36;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(subHeading, margin + 2, currentY + 4);

      currentY += 8;
      continue;
    }

    // Bullet points / Regular text
    const cleaned = cleanMarkdown(rawLine);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    const isBullet = rawLine.startsWith('- ') || rawLine.startsWith('* ') || rawLine.startsWith('• ');
    const indent = isBullet ? 6 : 0;
    const splitLines = doc.splitTextToSize(cleaned, contentWidth - indent);

    for (const sLine of splitLines) {
      if (currentY > pageHeight - 20) {
        doc.addPage();
        addHeader();
        currentY = 36;
      }
      doc.text(sLine, margin + indent, currentY + 3.5);
      currentY += 5;
    }
  }

  // 4. Add page numbers across all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addFooter(p, totalPages);
  }

  // 5. Download
  const safeName = destination.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  doc.save(`voynex-itinerary-${safeName}.pdf`);
}

/**
 * Generates a clean, categorized checklist PDF for Packing Assistant
 */
export function generatePackingListPDF(options: PackingPdfOptions) {
  const { destination, duration, activities = [], items } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 18;

  const addHeader = () => {
    // Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 26, 'F');

    // Accent line
    doc.setFillColor(59, 130, 246); // blue-500
    doc.rect(0, 25, pageWidth, 1.2, 'F');

    // Logo / Brand
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('VOYNEX', margin, 13);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(191, 219, 254); // blue-200
    doc.text('SMART TRAVEL PACKING CHECKLIST', margin, 19);

    // Date
    doc.setTextColor(203, 213, 225);
    doc.setFontSize(8);
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    doc.text(`Created: ${dateStr}`, pageWidth - margin, 16, { align: 'right' });
  };

  const addFooter = (pageNum: number, totalPages: number) => {
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.text('VOYNEX • Packing Checklist • Pack Smart, Travel Better', margin, pageHeight - 7);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  };

  // 1. Initial Header
  addHeader();
  currentY = 34;

  // 2. Summary Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 22, 3, 3, 'FD');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Checklist for ${destination.toUpperCase()}`, margin + 5, currentY + 8);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const actText = activities.length > 0 ? `   |   Activities: ${activities.join(', ')}` : '';
  doc.text(`Duration: ${duration} Days${actText}`, margin + 5, currentY + 15);

  currentY += 28;

  // 3. Render Categorized Checklist
  const categories = Array.from(new Set(items.map((i) => i.category)));

  for (const cat of categories) {
    const catItems = items.filter((i) => i.category === cat);

    // Check if category header fits
    if (currentY > pageHeight - 30) {
      doc.addPage();
      addHeader();
      currentY = 34;
    }

    // Category Header
    doc.setFillColor(238, 242, 255); // indigo-50
    doc.setDrawColor(199, 210, 254);
    doc.roundedRect(margin, currentY, contentWidth, 7, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(49, 46, 129); // indigo-900
    doc.text(`${cat.toUpperCase()} (${catItems.length})`, margin + 4, currentY + 5);

    currentY += 10;

    // Items in 2-column layout if wide enough, otherwise single column with checkbox
    const colWidth = contentWidth / 2 - 4;

    for (let i = 0; i < catItems.length; i += 2) {
      if (currentY > pageHeight - 18) {
        doc.addPage();
        addHeader();
        currentY = 34;
      }

      const item1 = catItems[i];
      const item2 = catItems[i + 1];

      // Item 1
      doc.setDrawColor(148, 163, 184);
      doc.roundedRect(margin + 2, currentY, 3.5, 3.5, 0.5, 0.5, 'D'); // Checkbox square
      if (item1.checked) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(13, 148, 136);
        doc.text('✓', margin + 2.7, currentY + 2.8);
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const text1 = doc.splitTextToSize(item1.item, colWidth - 8);
      doc.text(text1[0] || '', margin + 7.5, currentY + 2.8);

      // Item 2 (if present in row)
      if (item2) {
        const x2 = margin + colWidth + 8;
        doc.roundedRect(x2, currentY, 3.5, 3.5, 0.5, 0.5, 'D');
        if (item2.checked) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(13, 148, 136);
          doc.text('✓', x2 + 0.7, currentY + 2.8);
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        const text2 = doc.splitTextToSize(item2.item, colWidth - 8);
        doc.text(text2[0] || '', x2 + 5.5, currentY + 2.8);
      }

      currentY += 6;
    }

    currentY += 4; // Spacing after category
  }

  // 4. Add page numbers
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addFooter(p, totalPages);
  }

  // 5. Download
  const safeName = destination.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  doc.save(`voynex-packing-${safeName}.pdf`);
}
