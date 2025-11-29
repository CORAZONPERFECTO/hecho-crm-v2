import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

interface DocumentData {
  type: 'quotation' | 'proforma' | 'invoice';
  title: string;
  number: string;
  clientName: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    itemDiscount?: number;
  }>;
  subtotal: number;
  globalDiscount: number;
  includeITBIS: boolean;
  total: number;
  notes: string;
  date: string;
}

interface CompanyInfo {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
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
      // Return default values if no settings found
      return {
        companyName: 'HECHO SRL',
        address: 'Verón Punta Cana, Ciudad del Sol, Calle Sol 5 #476',
        phone: '849-649-2702',
        email: 'info@hecho.do'
      };
    }

    return {
      companyName: data.company_name || 'HECHO SRL',
      address: data.address || 'Verón Punta Cana, Ciudad del Sol, Calle Sol 5 #476',
      phone: data.phone || '849-649-2702',
      email: data.email || 'info@hecho.do',
      logoUrl: data.logo_url
    };
  } catch (error) {
    console.error('Error in getCompanySettings:', error);
    // Return default values on error
    return {
      companyName: 'HECHO SRL',
      address: 'Verón Punta Cana, Ciudad del Sol, Calle Sol 5 #476',
      phone: '849-649-2702',
      email: 'info@hecho.do'
    };
  }
};

export const generateProfessionalPDF = async (data: DocumentData) => {
  // Get company settings
  const companyInfo = await getCompanySettings();
  const pdf = new jsPDF();
  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  
  // Adjusted margins for professional format (converted from cm to mm)
  const marginLeft = 25; // 2.5 cm
  const marginRight = 20; // 2 cm  
  const marginTop = 22; // 2.2 cm
  const marginBottom = 22; // 2.2 cm
  let currentY = marginTop;
  let currentPage = 1;

  // Multi-page management
  const maxItemsPerPage = 20;
  const pageContentHeight = pageHeight - marginTop - marginBottom - 80; // Reserve space for totals and signatures

  // Colors (in RGB)
  const grayLight: [number, number, number] = [242, 242, 242]; // #F2F2F2
  const greenOlive: [number, number, number] = [108, 122, 0]; // #6C7A00
  const darkText: [number, number, number] = [0, 0, 0]; // Black
  const grayTint: [number, number, number] = [128, 128, 128]; // Gray for footer

  // Currency formatting function
  const formatCurrency = (amount: number) => `RD$ ${amount.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Multi-page management functions
  const addNewPage = () => {
    pdf.addPage();
    currentPage++;
    currentY = marginTop;
    
    // Add page number in footer
    const pageText = `Página ${currentPage}`;
    pdf.setFontSize(8);
    pdf.setTextColor(...grayTint);
    pdf.text(pageText, pageWidth - marginRight - pdf.getTextWidth(pageText), pageHeight - 10);
    pdf.setTextColor(...darkText);
  };

  const drawTableHeader = () => {
    pdf.setFillColor(...grayLight);
    const tableWidth = pageWidth - marginLeft - marginRight;
    pdf.rect(marginLeft, currentY - 5, tableWidth, 10, 'F');
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...darkText);
    
    // Better column distribution: 50% - 15% - 17.5% - 17.5%
    const descColX = marginLeft + 8; // 0.3cm padding
    const qtyColX = marginLeft + (tableWidth * 0.50) + 10; // More space for description
    const priceColX = marginLeft + (tableWidth * 0.65) + 10; // Better separation
    const totalColX = marginLeft + (tableWidth * 0.825) + 10; // Centered in last column
    
    pdf.text('Descripción', descColX, currentY);
    pdf.text('Cant.', qtyColX, currentY, { align: 'center' });
    pdf.text('Precio Unit.', priceColX, currentY, { align: 'center' });
    pdf.text('Total', totalColX, currentY, { align: 'center' });

    currentY += 15;
  };

  const checkPageBreak = (requiredSpace: number) => {
    // Smart pagination: only break if content doesn't fit and we have multiple items
    const spaceForTotalsAndSignatures = 120; // Space needed for totals, notes, signatures
    if (currentY + requiredSpace + spaceForTotalsAndSignatures > pageHeight - marginBottom && data.items.length > 15) {
      addNewPage();
      drawTableHeader();
    }
  };

  // Company Header and Document info side by side - aligned at same height
  const companyStartY = currentY;
  const documentInfoStartY = currentY;
  
  // Try to add logo if available
  if (companyInfo.logoUrl) {
    try {
      // Create a temporary image element to load the logo
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          // Calculate logo dimensions preserving aspect ratio
          const maxLogoWidth = 50; // 5cm max width
          const maxLogoHeight = 20; // 2cm max height
          
          const aspectRatio = img.width / img.height;
          let logoWidth = maxLogoWidth;
          let logoHeight = maxLogoWidth / aspectRatio;
          
          // If calculated height exceeds max, adjust based on height
          if (logoHeight > maxLogoHeight) {
            logoHeight = maxLogoHeight;
            logoWidth = maxLogoHeight * aspectRatio;
          }
          
          try {
            pdf.addImage(img, 'PNG', marginLeft, currentY, logoWidth, logoHeight);
            currentY += logoHeight + 6; // Add space after logo
            resolve(true);
          } catch (error) {
            console.error('Error adding logo to PDF:', error);
            // Fallback to company name if logo fails
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...darkText);
            pdf.text(companyInfo.companyName, marginLeft, currentY);
            currentY += 8;
            resolve(true);
          }
        };
        img.onerror = () => {
          // Fallback to company name if logo fails to load
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...darkText);
          pdf.text(companyInfo.companyName, marginLeft, currentY);
          currentY += 8;
          resolve(true);
        };
        img.src = companyInfo.logoUrl;
      });
    } catch (error) {
      console.error('Error loading logo:', error);
      // Fallback to company name
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...darkText);
      pdf.text(companyInfo.companyName, marginLeft, currentY);
      currentY += 8;
    }
  } else {
    // No logo, use company name
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...darkText);
    pdf.text(companyInfo.companyName, marginLeft, currentY);
    currentY += 8;
  }
  
  // Company details
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Climatización / Aires Acondicionados', marginLeft, currentY);
  
  currentY += 4;
  pdf.text(companyInfo.address, marginLeft, currentY);
  
  currentY += 4;
  pdf.text(`Tel: ${companyInfo.phone} | Correo: ${companyInfo.email}`, marginLeft, currentY);

  // Document info block (right side) - positioned lower and more to the right
  const metadataX = pageWidth - marginRight - 50; // Moved more to the right
  let metadataY = companyStartY + 15; // Start lower to align with company details
  
  // Document type title above the details
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...greenOlive);
  pdf.text(data.title, metadataX, metadataY);
  metadataY += 8;
  
  // Document details with consistent spacing
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...darkText);
  
  pdf.text(`Número: ${data.number}`, metadataX, metadataY);
  metadataY += 5;
  pdf.text(`Fecha: ${data.date}`, metadataX, metadataY);
  metadataY += 5;
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Cliente: ${data.clientName.toUpperCase()}`, metadataX, metadataY);
  pdf.setFont('helvetica', 'normal');

  currentY += 22; // Space before table

  // Draw initial table header
  drawTableHeader();

  // Table width for consistent calculations

  // Items with professional formatting and proper spacing
  pdf.setFont('helvetica', 'normal');
  data.items.forEach((item, index) => {
    const itemTotal = item.quantity * item.unitPrice;
    const discountAmount = item.itemDiscount ? (itemTotal * item.itemDiscount / 100) : 0;
    const finalItemTotal = itemTotal - discountAmount;

    // Check if we need a page break
    const estimatedRowHeight = 15; // Estimate for the item
    checkPageBreak(estimatedRowHeight);

    // Matching column distribution: 50% - 15% - 17.5% - 17.5%
    const tableWidthLocal = pageWidth - marginLeft - marginRight;
    const descColX = marginLeft + 8; // 0.3cm padding
    const descColWidth = tableWidthLocal * 0.50 - 16; // Width minus padding
    const qtyColX = marginLeft + (tableWidthLocal * 0.50) + 10; // Match header
    const priceColX = marginLeft + (tableWidthLocal * 0.65) + 10; // Match header
    const totalColX = marginLeft + (tableWidthLocal * 0.825) + 10; // Match header

    // Minimum row height reduced for better spacing
    const minRowHeight = 9; // Reduced from 11
    const rowPadding = 5; // Reduced from 6
    const rowStartY = currentY;

    // Handle multiline descriptions with proper width constraint
    const descriptionLines = pdf.splitTextToSize(item.description, descColWidth);
    const lineHeight = 4.5;
    
    // Add subtle horizontal line between items for professional separation
    if (index > 0) {
      pdf.setDrawColor(220, 220, 220); // Light gray line
      pdf.line(marginLeft, currentY - 3, marginLeft + tableWidthLocal, currentY - 3);
    }
    
    // Description with proper positioning
    pdf.setFontSize(10); // Arial 10 pt equivalent
    descriptionLines.forEach((line: string, lineIndex: number) => {
      // Highlight important items in bold if they contain key words
      if (line.toUpperCase().includes('INSTALACIÓN') || line.toUpperCase().includes('AIRE')) {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      pdf.text(line, descColX, currentY + (lineIndex * lineHeight) + rowPadding);
    });

    // Centered numerical values matching header alignment
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9.5); // Slightly smaller for numbers
    pdf.text(item.quantity.toString(), qtyColX, currentY + rowPadding, { align: 'center' });
    pdf.text(formatCurrency(item.unitPrice), priceColX, currentY + rowPadding, { align: 'center' });
    pdf.text(formatCurrency(finalItemTotal), totalColX, currentY + rowPadding, { align: 'center' });

    // Calculate actual row height and ensure minimum height
    const actualRowHeight = Math.max(descriptionLines.length * lineHeight + (rowPadding * 2), minRowHeight);
    currentY += actualRowHeight;
  });

  // Ensure we're on the final page for totals
  checkPageBreak(80); // Reserve space for totals, notes and signatures

  currentY += 12; // 1.2 cm separation from last item

  // Professional Totals Block with better separation
  const tableWidth = pageWidth - marginLeft - marginRight;
  const totalsLabelX = marginLeft + (tableWidth * 0.60); // Move labels more to the left
  const totalsValueX = marginLeft + (tableWidth * 0.82); // Separate values more to the right
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  
  // Totals with better separation to avoid overlapping
  pdf.text('Subtotal:', totalsLabelX, currentY);
  pdf.text(formatCurrency(data.subtotal), totalsValueX, currentY, { align: 'left' });
  currentY += 7;

  if (data.globalDiscount > 0) {
    const discountAmount = data.subtotal * data.globalDiscount / 100;
    pdf.text('Descuento:', totalsLabelX, currentY);
    pdf.text(formatCurrency(discountAmount), totalsValueX, currentY, { align: 'left' });
    currentY += 7;
  }

  if (data.includeITBIS) {
    const subtotalAfterDiscount = data.subtotal - (data.globalDiscount > 0 ? data.subtotal * data.globalDiscount / 100 : 0);
    const itbisAmount = subtotalAfterDiscount * 0.18;
    pdf.text('ITBIS (18%):', totalsLabelX, currentY);
    pdf.text(formatCurrency(itbisAmount), totalsValueX, currentY, { align: 'left' });
    currentY += 7;
  }

  // Total General with bold formatting and olive green color
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(...greenOlive); // Olive green for total
  pdf.text('Total General:', totalsLabelX, currentY);
  pdf.text(formatCurrency(data.total), totalsValueX, currentY, { align: 'left' });
  pdf.setTextColor(...darkText); // Reset to black

  currentY += 20;

  // Notes with professional formatting
  if (data.notes) {
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...darkText);
    currentY += 10; // 1cm separation from totals
    
    // Split notes for multiline display with key phrases in bold
    const notesLines = pdf.splitTextToSize(data.notes, pageWidth - marginLeft - marginRight);
    notesLines.forEach((line: string, index: number) => {
      // Highlight key phrases in bold
      if (line.includes('Tiempo de entrega') || line.includes('Cotización válida') || 
          line.includes('EXCLUSIONES') || line.includes('DEJAR MONTAR')) {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      pdf.text(line, marginLeft, currentY + (index * 4));
    });
    currentY += notesLines.length * 4 + 20; // More space after notes since no signatures
  } else {
    currentY += 20; // Add space even without notes
  }

  // Footer with gray tint and improved positioning (only on final page)
  const footerY = pageHeight - marginBottom + 5;
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...grayTint); // Gray tint for footer
  
  const footerText1 = 'Banco Popular #814834933 | Banco Reservas #9603657898 | RNC 131947532';
  const footerText2 = `Teléfono: ${companyInfo.phone} | Correo: ${companyInfo.email} | Página ${currentPage} / ${currentPage}`;
  
  // Center the footer text
  const text1Width = pdf.getTextWidth(footerText1);
  const text2Width = pdf.getTextWidth(footerText2);
  
  pdf.text(footerText1, (pageWidth - text1Width) / 2, footerY - 5);
  pdf.text(footerText2, (pageWidth - text2Width) / 2, footerY);

  // Generate filename based on document type
  let filename = '';
  const clientNameClean = data.clientName.replace(/[^a-zA-Z0-9]/g, '_');
  
  switch (data.type) {
    case 'quotation':
      filename = `Cotizacion_Profesional_2025_${data.number}_${companyInfo.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${clientNameClean}.pdf`;
      break;
    case 'proforma':
      filename = `Factura_Proforma_2025_${data.number}_${companyInfo.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${clientNameClean}.pdf`;
      break;
    case 'invoice':
      filename = `Factura_Profesional_2025_${data.number}_${companyInfo.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${clientNameClean}.pdf`;
      break;
  }

  // Save the PDF
  pdf.save(filename);
};