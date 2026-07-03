/**
 * feedbackExport.ts
 * Client-side export utilities for Feedback Analytics
 * Supports: CSV (native), Excel (.xlsx via SheetJS), PDF (jspdf + autotable)
 */

// ─── CSV ────────────────────────────────────────────────────────────────────
export const exportToCSV = (rows: Record<string, any>[], filename: string) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    const s = String(v ?? '').replace(/"/g, '""');
    return /[,"\n]/.test(s) ? `"${s}"` : s;
  };
  const csv = [
    headers.map(escape).join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
  ].join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `${filename}.csv`);
};

// ─── Excel (.xlsx) ──────────────────────────────────────────────────────────
export const exportToExcel = async (
  sheets: { name: string; rows: Record<string, any>[] }[],
  filename: string
) => {
  try {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    for (const sheet of sheets) {
      if (!sheet.rows.length) continue;
      const ws = XLSX.utils.json_to_sheet(sheet.rows);
      // Auto-width columns
      const colWidths = Object.keys(sheet.rows[0]).map((k) => ({
        wch: Math.max(k.length, ...sheet.rows.map((r) => String(r[k] ?? '').length)) + 2,
      }));
      ws['!cols'] = colWidths;
      XLSX.utils.book_append_sheet(wb, ws, sheet.name.slice(0, 31));
    }
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (e) {
    console.error('[feedbackExport] Excel export failed:', e);
    throw e;
  }
};

// ─── PDF ────────────────────────────────────────────────────────────────────
export const exportToPDF = async (
  title: string,
  subtitle: string,
  sections: { heading: string; columns: string[]; rows: (string | number)[][] }[],
  filename: string
) => {
  try {
    const { default: jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Header
    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text(title, 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(subtitle, 14, 26);
    doc.setTextColor(150);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

    let yPos = 38;

    for (const section of sections) {
      if (!section.rows.length) continue;
      doc.setFontSize(12);
      doc.setTextColor(30);
      doc.text(section.heading, 14, yPos);
      yPos += 3;

      autoTable(doc, {
        startY: yPos,
        head: [section.columns],
        body: section.rows,
        theme: 'striped',
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold',
        },
        bodyStyles: { fontSize: 8, textColor: 40 },
        alternateRowStyles: { fillColor: [238, 242, 255] },
        margin: { left: 14, right: 14 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
      if (yPos > 180) {
        doc.addPage();
        yPos = 14;
      }
    }

    doc.save(`${filename}.pdf`);
  } catch (e) {
    console.error('[feedbackExport] PDF export failed:', e);
    throw e;
  }
};

// ─── Internal: trigger browser download ─────────────────────────────────────
const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
