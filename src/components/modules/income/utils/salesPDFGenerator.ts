import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';

interface SalesDocumentData {
  type: 'quotation' | 'invoice' | 'receipt';
  title: string;
  number: string;
  clientName: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  date: string;
  dueDate?: string;
}

interface CompanyInfo {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
  rnc?: string;
}

// Function to get company settings from Supabase
const getCompanySettings = async (): Promise<CompanyInfo> => {
  try {
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching company settings:', error);
      return {
        companyName: 'HECHO SRL',
        address: 'Verón Punta Cana, Ciudad del Sol, Calle Sol 5 #476',
        phone: '849-649-2702',
        email: 'info@hecho.do',
        rnc: '131947532'
      };
    }

    return {
      companyName: data.company_name || 'HECHO SRL',
      address: data.address || 'Verón Punta Cana, Ciudad del Sol, Calle Sol 5 #476',
      phone: data.phone || '849-649-2702',
      email: data.email || 'info@hecho.do',
      logoUrl: data.logo_url,
      rnc: '131947532'
    };
  } catch (error) {
    console.error('Error in getCompanySettings:', error);
    return {
      companyName: 'HECHO SRL',
      address: 'Verón Punta Cana, Ciudad del Sol, Calle Sol 5 #476',
      phone: '849-649-2702',
      email: 'info@hecho.do',
      rnc: '131947532'
    };
  }
};

export const generateSalesPDF = async (data: SalesDocumentData) => {
  const companyInfo = await getCompanySettings();
  const doc = new jsPDF();

  // Colors
  const primaryColor = [30, 41, 59]; // Slate 800
  const secondaryColor = [100, 116, 139]; // Slate 500
  const accentColor = [15, 23, 42]; // Slate 900

  // Helper for currency
  const formatCurrency = (amount: number) =>
    `RD$ ${amount.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // --- HEADER ---
  let currentY = 20;
  const margin = 15;

  // Logo (if available) or Company Name
  if (companyInfo.logoUrl) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
        img.src = companyInfo.logoUrl!;
      });

      // Aspect ratio calculation
      const maxW = 40;
      const maxH = 20;
      const ratio = Math.min(maxW / img.width, maxH / img.height);
      const w = img.width * ratio;
      const h = img.height * ratio;

      doc.addImage(img, 'PNG', margin, currentY, w, h);
    } catch (e) {
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(companyInfo.companyName, margin, currentY + 8);
    }
  } else {
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(companyInfo.companyName, margin, currentY + 8);
  }

  // Company Details (Left side, below logo/name)
  currentY += 25;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

  doc.text(companyInfo.address, margin, currentY);
  currentY += 5;
  doc.text(`Tel: ${companyInfo.phone}`, margin, currentY);
  currentY += 5;
  doc.text(`Email: ${companyInfo.email}`, margin, currentY);
  if (companyInfo.rnc) {
    currentY += 5;
    doc.text(`RNC: ${companyInfo.rnc}`, margin, currentY);
  }

  // Document Info (Right side)
  const rightColX = 140;
  let rightColY = 20;

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text(data.title.toUpperCase(), 200, rightColY + 8, { align: 'right' });

  rightColY += 25;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);

  const addMetaRow = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, rightColX, rightColY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(value, 200, rightColY, { align: 'right' });
    rightColY += 6;
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]); // Reset
  };

  addMetaRow('NÚMERO:', data.number);
  addMetaRow('FECHA:', data.date);
  if (data.dueDate) {
    addMetaRow('VENCE:', data.dueDate);
  }

  // Client Info Section
  currentY = Math.max(currentY, rightColY) + 10;

  doc.setFillColor(248, 250, 252); // Slate 50
  doc.roundedRect(margin, currentY, 180, 25, 2, 2, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('FACTURAR A:', margin + 5, currentY + 8);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(data.clientName.toUpperCase(), margin + 5, currentY + 18);

  currentY += 35;

  // --- ITEMS TABLE ---
  const tableHeaders = [['DESCRIPCIÓN', 'CANT.', 'PRECIO', 'TOTAL']];
  const tableData = data.items.map(item => [
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    formatCurrency(item.quantity * item.unitPrice)
  ]);

  autoTable(doc, {
    startY: currentY,
    head: tableHeaders,
    body: tableData,
    theme: 'plain',
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [241, 245, 249], // Slate 100
      textColor: [71, 85, 105], // Slate 600
      fontStyle: 'bold',
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 'auto' }, // Description
      1: { cellWidth: 20, halign: 'center' }, // Qty
      2: { cellWidth: 35, halign: 'right' }, // Price
      3: { cellWidth: 35, halign: 'right' }  // Total
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    margin: { left: margin, right: margin }
  });

  // --- TOTALS ---
  // @ts-ignore
  let finalY = doc.lastAutoTable.finalY + 10;

  const totalsX = 130;
  const valuesX = 200;

  const addTotalRow = (label: string, value: string, isBold = false) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(isBold ? primaryColor[0] : secondaryColor[0], isBold ? primaryColor[1] : secondaryColor[1], isBold ? primaryColor[2] : secondaryColor[2]);
    doc.text(label, totalsX, finalY);
    doc.text(value, valuesX, finalY, { align: 'right' });
    finalY += 7;
  };

  addTotalRow('Subtotal:', formatCurrency(data.subtotal));

  if (data.discount > 0) {
    addTotalRow('Descuento:', `-${formatCurrency(data.discount)}`);
  }

  if (data.tax > 0) {
    addTotalRow('ITBIS (18%):', formatCurrency(data.tax));
  }

  finalY += 2;
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.line(totalsX, finalY - 5, valuesX, finalY - 5);

  doc.setFontSize(12);
  addTotalRow('Total:', formatCurrency(data.total), true);

  // --- NOTES ---
  if (data.notes) {
    finalY += 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('NOTAS:', margin, finalY);

    finalY += 5;
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(data.notes, 120);
    doc.text(splitNotes, margin, finalY);
  }

  // --- FOOTER ---
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Save
  const cleanName = data.clientName.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`${data.title}_${data.number}_${cleanName}.pdf`);
};