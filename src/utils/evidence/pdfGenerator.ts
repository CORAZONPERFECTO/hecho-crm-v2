
import jsPDF from 'jspdf';
import { getImageOrientationFromUrl, getRotationFromOrientation } from './imageOrientation';
import { supabase } from '@/integrations/supabase/client';

export interface Evidence {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  description?: string;
  uploaded_by: string;
  created_at: string;
  sync_status?: 'pending' | 'synced' | 'failed';
  manual_rotation?: number;
}

export const loadImageAsBase64 = async (imageUrl: string): Promise<{ base64: string | null, width: number, height: number, mimeType: string | null }> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const mimeType = blob.type || null;
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      const img = new Image();
      
      reader.onload = () => {
        const base64 = reader.result as string;
        img.onload = () => {
          resolve({
            base64,
            width: img.naturalWidth,
            height: img.naturalHeight,
            mimeType
          });
        };
        img.onerror = () => resolve({ base64: null, width: 0, height: 0, mimeType });
        img.src = base64;
      };
      reader.onerror = () => resolve({ base64: null, width: 0, height: 0, mimeType });
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading image:', error);
    return { base64: null, width: 0, height: 0, mimeType: null };
  }
};

// Función para obtener evidencias actualizadas de la base de datos
const getUpdatedEvidences = async (evidenceIds: string[], fallbackEvidences: Evidence[]): Promise<Evidence[]> => {
  try {
    const { data, error } = await supabase
      .from('ticket_evidences')
      .select('*')
      .in('id', evidenceIds)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(evidence => ({
      id: evidence.id,
      file_url: evidence.file_url,
      file_name: evidence.file_name,
      file_type: evidence.file_type,
      description: evidence.description,
      uploaded_by: evidence.uploaded_by,
      created_at: evidence.created_at,
      sync_status: (evidence.sync_status as 'pending' | 'synced' | 'failed') || 'synced',
      manual_rotation: evidence.manual_rotation || 0
    }));
  } catch (error) {
    console.error('Error fetching updated evidences:', error);
    return fallbackEvidences; // Fallback a las evidencias originales
  }
};

export const generatePDFReport = async (
  evidences: Evidence[], 
  reportMetadata?: {
    ticketNumber?: string;
    ticketTitle?: string;
    clientName?: string;
    description?: string;
  },
  ticketId?: string,
  saveToSystem?: boolean
): Promise<{ blob?: Blob; fileName?: string }> => {
  // Obtener evidencias actualizadas desde la base de datos
  const evidenceIds = evidences.map(e => e.id);
  const updatedEvidences = await getUpdatedEvidences(evidenceIds, evidences);
  
  console.log('🔄 PDF Generator: Usando evidencias actualizadas:', updatedEvidences.map(e => ({ 
    id: e.id, 
    file_name: e.file_name, 
    description: e.description 
  })));

  // Obtener información de la empresa desde la configuración
  let companyInfo: {
    companyName: string;
    logoUrl?: string;
    clientName?: string;
    description?: string;
  } | undefined;

  try {
    const { data: companySettings } = await supabase
      .from('company_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (companySettings) {
      companyInfo = {
        companyName: companySettings.company_name,
        logoUrl: companySettings.logo_url,
        clientName: reportMetadata?.clientName,
        description: reportMetadata?.description
      };
    }
  } catch (error) {
    console.log('No company settings found, using defaults');
  }

  const pdf = new jsPDF({
    putOnlyUsedFonts: true,
    compress: true
  });
  
  // Habilitar soporte UTF-8 para emojis y caracteres especiales
  pdf.setLanguage("es");
  
  // Función para preservar emojis y caracteres especiales
  const preserveSpecialChars = (text: string) => {
    try {
      // jsPDF maneja mejor el texto si usamos el formato correcto
      return decodeURIComponent(encodeURIComponent(text));
    } catch {
      return text;
    }
  };
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20; // Márgenes uniformes y seguros
  let yPosition = margin;

  // Agregar encabezado profesional con fondo
  const addHeader = () => {
    // Fondo del encabezado
    pdf.setFillColor(41, 37, 36); // Color oscuro profesional
    pdf.rect(0, 0, pageWidth, 35, 'F');
    
    // Línea decorativa
    pdf.setDrawColor(234, 179, 8); // Color dorado
    pdf.setLineWidth(2);
    pdf.line(0, 35, pageWidth, 35);
  };

  // Función para agregar pie de página
  const addFooter = (pageNumber: number) => {
    const footerY = pageHeight - 15;
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`, margin, footerY);
    pdf.text(`Página ${pageNumber}`, pageWidth - margin - 20, footerY);
    pdf.setTextColor(0, 0, 0); // Resetear color
  };

  // 📌 1. PORTADA CENTRALIZADA
  // Fondo del encabezado más sutil para la portada
  pdf.setFillColor(41, 37, 36);
  pdf.rect(0, 0, pageWidth, 25, 'F');
  
  // Línea decorativa
  pdf.setDrawColor(234, 179, 8);
  pdf.setLineWidth(1);
  pdf.line(0, 25, pageWidth, 25);

  // Logo centrado verticalmente y horizontalmente
  if (companyInfo?.logoUrl) {
    try {
      const logoData = await loadImageAsBase64(companyInfo.logoUrl);
      if (logoData.base64) {
        const maxLogoSize = 60; // Logo más grande para portada
        let logoWidth = maxLogoSize;
        let logoHeight = maxLogoSize;
        
        const logoAspectRatio = logoData.width / logoData.height;
        if (logoAspectRatio > 1) {
          logoHeight = maxLogoSize / logoAspectRatio;
        } else {
          logoWidth = maxLogoSize * logoAspectRatio;
        }
        
        // Centrar logo horizontal y verticalmente
        const logoX = (pageWidth - logoWidth) / 2;
        const logoY = pageHeight / 2 - 80;
        
        const logoImgType = logoData.mimeType?.includes('png') ? 'PNG' : 'JPEG';
        pdf.addImage(logoData.base64, logoImgType, logoX, logoY, logoWidth, logoHeight, undefined, 'NONE');
        
        // Nombre de empresa centrado debajo del logo
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(18);
        pdf.setFont(undefined, 'bold');
        pdf.text(companyInfo.companyName, pageWidth / 2, logoY + logoHeight + 20, { align: 'center' });
        
        yPosition = logoY + logoHeight + 50;
      }
    } catch (error) {
      console.error('Error loading company logo:', error);
      yPosition = pageHeight / 2 - 40;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.text(companyInfo?.companyName || 'HECHO SERVICIOS GENERALES', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 30;
    }
  } else {
    yPosition = pageHeight / 2 - 40;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    pdf.text('HECHO SERVICIOS GENERALES', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 30;
  }

  // Título principal completamente centrado
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(24);
  pdf.setFont(undefined, 'bold');
  const mainTitle = 'REPORTE TÉCNICO DE EVIDENCIAS';
  pdf.text(mainTitle, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 25;

  // Subtítulo con información del ticket - centrado
  if (reportMetadata?.ticketNumber) {
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(59, 130, 246);
    pdf.text(`Ticket #${reportMetadata.ticketNumber}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;
  }

  if (reportMetadata?.ticketTitle) {
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'italic');
    pdf.setTextColor(107, 114, 128);
    const titleLines = pdf.splitTextToSize(reportMetadata.ticketTitle, pageWidth - 2 * margin);
    titleLines.forEach((line: string) => {
      pdf.text(line, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
    });
  }

  // Información del proyecto en secciones individualizadas
  pdf.setTextColor(0, 0, 0);
  
  // Sección 1: Información del cliente
  if (companyInfo?.clientName) {
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 20, 'F');
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 20);
    
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(37, 99, 235);
    pdf.text('INFORMACIÓN DEL CLIENTE', margin + 5, yPosition + 7);
    
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(companyInfo.clientName, margin + 5, yPosition + 15);
    yPosition += 30;
  }

  // Sección 2: Nombre del proyecto
  if (reportMetadata?.ticketTitle) {
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 20, 'F');
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 20);
    
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(37, 99, 235);
    pdf.text('DETALLES DEL PROYECTO', margin + 5, yPosition + 7);
    
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(0, 0, 0);
    const projectLines = pdf.splitTextToSize(reportMetadata.ticketTitle, pageWidth - 2 * margin - 10);
    pdf.text(projectLines[0], margin + 5, yPosition + 15);
    yPosition += 30;
  }

  // Sección 3: Información del reporte
  pdf.setFillColor(240, 253, 244);
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, 25, 'F');
  pdf.setDrawColor(187, 247, 208);
  pdf.setLineWidth(0.5);
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, 25);

  pdf.setFontSize(10);
  pdf.setFont(undefined, 'bold');
  pdf.setTextColor(22, 163, 74);
  pdf.text('FECHA DE GENERACIÓN:', margin + 5, yPosition + 10);
  pdf.setFont(undefined, 'normal');
  pdf.text(new Date().toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }), margin + 5, yPosition + 18);

  pdf.setFont(undefined, 'bold');
  pdf.text('EVIDENCIAS INCLUIDAS:', pageWidth - margin - 80, yPosition + 10);
  pdf.setFont(undefined, 'normal');
  pdf.text(updatedEvidences.length.toString(), pageWidth - margin - 20, yPosition + 18);

  yPosition += 35;

    // Sección de descripción general del reporte (si existe)
    if (reportMetadata?.description && reportMetadata.description.trim()) {
      // Función para parsear HTML y renderizar con formato en PDF
      const renderHTMLContent = (htmlContent: string, startY: number): number => {
        let currentY = startY;
        const maxWidth = pageWidth - 2 * margin - 20;
        const lineHeight = 6;
        
        // Parser simple para HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        
        const renderNode = (node: Node, indentLevel: number = 0): void => {
          const indent = margin + 10 + (indentLevel * 10);
          
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim();
            if (text) {
              const lines = pdf.splitTextToSize(text, maxWidth - (indentLevel * 10));
              lines.forEach((line: string) => {
                pdf.text(line, indent, currentY);
                currentY += lineHeight;
              });
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            switch (element.tagName.toLowerCase()) {
              case 'strong':
              case 'b':
                pdf.setFont(undefined, 'bold');
                Array.from(element.childNodes).forEach(child => renderNode(child, indentLevel));
                pdf.setFont(undefined, 'normal');
                break;
                
              case 'p':
                Array.from(element.childNodes).forEach(child => renderNode(child, indentLevel));
                currentY += 4; // Espacio después de párrafo
                break;
                
              case 'br':
                currentY += lineHeight;
                break;
                
              case 'ul':
                Array.from(element.childNodes).forEach(child => {
                  if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName.toLowerCase() === 'li') {
                    renderNode(child, indentLevel);
                  }
                });
                currentY += 4; // Espacio después de lista
                break;
                
              case 'li':
                // Añadir viñeta
                pdf.text('•', indent - 5, currentY);
                
                // Procesar contenido del li
                let hasNestedList = false;
                Array.from(element.childNodes).forEach(child => {
                  if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName.toLowerCase() === 'ul') {
                    hasNestedList = true;
                    currentY += 2;
                    renderNode(child, indentLevel + 1);
                  } else if (child.nodeType === Node.TEXT_NODE) {
                    const text = child.textContent?.trim();
                    if (text) {
                      const lines = pdf.splitTextToSize(text, maxWidth - ((indentLevel + 1) * 10));
                      lines.forEach((line: string, idx: number) => {
                        pdf.text(line, indent, currentY);
                        currentY += lineHeight;
                      });
                    }
                  } else if (child.nodeType === Node.ELEMENT_NODE) {
                    renderNode(child, indentLevel);
                  }
                });
                
                if (!hasNestedList) {
                  currentY += 2; // Espacio entre items de lista
                }
                break;
                
              default:
                Array.from(element.childNodes).forEach(child => renderNode(child, indentLevel));
                break;
            }
          }
        };
        
        // Renderizar todo el contenido
        Array.from(doc.body.childNodes).forEach(node => renderNode(node, 0));
        
        return currentY;
      };
      
      // Calcular altura aproximada del contenido
      const tempY = yPosition + 24;
      const contentHeight = Math.max(50, (reportMetadata.description.length / 80) * 8 + 40);
      
      pdf.setFillColor(255, 248, 220); // Fondo amarillo claro
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, contentHeight, 'F');
      pdf.setDrawColor(251, 191, 36);
      pdf.setLineWidth(0.5);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, contentHeight);

      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(146, 64, 14);
      pdf.text('RESUMEN EJECUTIVO DEL TRABAJO REALIZADO:', margin + 5, yPosition + 12);
      
      // Renderizar contenido HTML con formato
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(0, 0, 0);
      
      const finalY = renderHTMLContent(reportMetadata.description, yPosition + 24);
      
      // Ajustar altura real del cuadro
      const actualHeight = Math.max(contentHeight, finalY - yPosition + 10);
      
      yPosition += actualHeight + 10;
    }

  // Separador elegante
  pdf.setDrawColor(234, 179, 8);
  pdf.setLineWidth(1);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 20;

  // Procesar evidencias por tipo respetando orden de carga (usando evidencias actualizadas)
  const imageEvidences = updatedEvidences
    .filter(e => e.file_type.startsWith('image/'))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const videoEvidences = updatedEvidences
    .filter(e => e.file_type.startsWith('video/'))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  let pageNumber = 1;

  // Sección de imágenes
  if (imageEvidences.length > 0) {
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(37, 99, 235);
    pdf.text('DOCUMENTACIÓN FOTOGRÁFICA TÉCNICA', margin, yPosition);
    yPosition += 20;

  // 🔹 PRIMERA PARTE: DESCRIPCIÓN GENERAL COMPLETA
    // Agregar página para descripción general
    pdf.addPage();
    pageNumber++;
    addHeader();
    addFooter(pageNumber);
    yPosition = 55;

    // Título de la sección descriptiva
    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(37, 99, 235);
    pdf.text('DESCRIPCIÓN GENERAL DEL SERVICIO', margin, yPosition);
    yPosition += 25;

    // Descripción del servicio realizado - texto completo sin numeración automática
    if (companyInfo?.description) {
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'normal');
      
      // Dividir la descripción en secciones respetando el formato original
      const sections = companyInfo.description.split('\n').filter(section => section.trim());
      
      sections.forEach((section, index) => {
        // Verificar si necesitamos nueva página
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          pageNumber++;
          addHeader();
          addFooter(pageNumber);
          yPosition = 55;
        }
        
        // Preservar caracteres especiales y emojis en las secciones
        const processedSection = preserveSpecialChars(section);
        
        // 📌 2. FORMATO LIMPIO PARA TEXTO DESCRIPTIVO SIN NUMERACIÓN
        // Evitar formatear texto corto como encabezado si contiene información técnica
        const isLikelyTechnicalText = section.toLowerCase().includes('equipo') || 
                                     section.toLowerCase().includes('condensador') || 
                                     section.toLowerCase().includes('error') ||
                                     section.toLowerCase().includes('falla') ||
                                     section.toLowerCase().includes('reparar') ||
                                     /\d+/.test(section); // Contiene números
        
        // Solo formatear como encabezado si es realmente corto Y no es texto técnico
        if (section.length < 50 && !section.includes('.') && sections.length > 1 && !isLikelyTechnicalText) {
          pdf.setFontSize(12);
          pdf.setFont(undefined, 'bold');
          pdf.setTextColor(37, 99, 235);
          pdf.text(processedSection, margin + 5, yPosition);
          yPosition += 18;
        } else {
          // Texto normal del contenido con márgenes apropiados
          pdf.setFontSize(11);
          pdf.setFont(undefined, 'normal');
          pdf.setTextColor(0, 0, 0);
          
          const lines = pdf.splitTextToSize(processedSection, pageWidth - 2 * margin - 10);
          lines.forEach((line: string) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              pageNumber++;
              addHeader();
              addFooter(pageNumber);
              yPosition = 55;
            }
            pdf.text(preserveSpecialChars(line), margin + 5, yPosition);
            yPosition += 7; // Espaciado normal entre líneas
          });
          yPosition += 8; // Espacio reducido entre párrafos
        }
      });
      
      // Espacio antes de la siguiente sección
      yPosition += 20;
    }

    // Separador antes de las evidencias
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      pageNumber++;
      addHeader();
      addFooter(pageNumber);
      yPosition = 55;
    }
    
    pdf.setDrawColor(234, 179, 8);
    pdf.setLineWidth(2);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 30;

    // 🔹 SEGUNDA PARTE: EVIDENCIAS FOTOGRÁFICAS - UNA FOTO POR PÁGINA
    // Título de la sección de evidencias
    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(37, 99, 235);
    pdf.text('EVIDENCIAS FOTOGRÁFICAS', margin, yPosition);
    yPosition += 20;

    // Procesar cada imagen en su propia página
    for (let i = 0; i < imageEvidences.length; i++) {
      // Nueva página para cada foto
      pdf.addPage();
      pageNumber++;
      addHeader();
      addFooter(pageNumber);
      const standardYPosition = 55; // Posición Y estándar para todas las imágenes

      const evidence = imageEvidences[i];
      await processImageEvidenceFull(evidence, i + 1, standardYPosition);
    }
  }

  // 📌 3. EVIDENCIAS FOTOGRÁFICAS - CENTRADAS CON TEXTO OPTIMIZADO
  async function processImageEvidenceFull(evidence: Evidence, imageNumber: number, startY: number) {
    // Título principal más grande
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    
    const mainTitle = `Foto ${imageNumber}: ${evidence.file_name}`;
    pdf.text(mainTitle, pageWidth / 2, startY + 15, { align: 'center' });
    
    // Descripción secundaria más pequeña (máximo 2 líneas)
    if (evidence.description) {
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(75, 85, 99);
      
      // Dividir descripción en máximo 2 líneas con espaciado mejorado
      const descLines = pdf.splitTextToSize(evidence.description, pageWidth - 2 * margin - 40);
      const maxDescLines = Math.min(descLines.length, 2);
      
      for (let i = 0; i < maxDescLines; i++) {
        pdf.text(descLines[i], pageWidth / 2, startY + 30 + (i * 6), { align: 'center' });
      }
    }
    
    const titleHeight = evidence.description ? 50 : 35;
    
    // Cargar y centrar imagen vertical y horizontalmente
    const imageData = await loadImageAsBase64(evidence.file_url);
    if (imageData.base64) {
      try {
        // Solo usar rotación manual si está disponible, sin rotación automática por EXIF
        const manualRotation = evidence.manual_rotation || 0;
        
         // Márgenes más conservadores para asegurar que las imágenes estén dentro de la página
        const safeMargin = 40; // Margen de seguridad aumentado
        const maxWidth = pageWidth - 2 * safeMargin; 
        const maxHeight = pageHeight - startY - titleHeight - 120; // Más espacio reservado
        
        // Obtener dimensiones originales de la imagen
        let originalWidth = imageData.width;
        let originalHeight = imageData.height;
        
        // Si la imagen tiene rotación manual de 90° o 270°, intercambiar dimensiones para el cálculo
        if (manualRotation === 90 || manualRotation === 270) {
          [originalWidth, originalHeight] = [originalHeight, originalWidth];
        }
        
        const aspectRatio = originalWidth / originalHeight;
        
        // Calcular dimensiones finales con escalado más conservador
        let imgWidth, imgHeight;
        
        // Factor de reducción más conservador para asegurar márgenes amplios
        const scaleFactor = 0.7; // Reducir al 70% para márgenes más amplios
        const effectiveMaxWidth = maxWidth * scaleFactor;
        const effectiveMaxHeight = maxHeight * scaleFactor;
        
        if (aspectRatio > effectiveMaxWidth / effectiveMaxHeight) {
          // La imagen es más ancha proporcionalmente - ajustar por ancho
          imgWidth = effectiveMaxWidth;
          imgHeight = imgWidth / aspectRatio;
        } else {
          // La imagen es más alta proporcionalmente - ajustar por alto
          imgHeight = effectiveMaxHeight;
          imgWidth = imgHeight * aspectRatio;
        }
        
        // Asegurar que las dimensiones finales no excedan los límites absolutos
        imgWidth = Math.min(imgWidth, maxWidth);
        imgHeight = Math.min(imgHeight, maxHeight);
        
        // Centrar imagen perfectamente en la página
        const imgX = (pageWidth - imgWidth) / 2;
        const availableImageSpace = pageHeight - startY - titleHeight - 100;
        const imgY = startY + titleHeight + ((availableImageSpace - imgHeight) / 2);
        
        // Verificar que la imagen esté completamente dentro de los márgenes
        const finalImgX = Math.max(safeMargin, Math.min(imgX, pageWidth - safeMargin - imgWidth));
        const finalImgY = Math.max(startY + titleHeight + 20, Math.min(imgY, pageHeight - 100 - imgHeight));
        
        const imgType = imageData.mimeType?.includes('png') ? 'PNG' : 'JPEG';
        // Agregar imagen con rotación manual únicamente
        pdf.addImage(imageData.base64, imgType, finalImgX, finalImgY, imgWidth, imgHeight, 
                    undefined, 'NONE', manualRotation);
        
        // Información reducida al pie de página - texto más pequeño
        const infoStartY = pageHeight - 25;
        pdf.setFontSize(8); // Texto más pequeño
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(128, 128, 128); // Color más sutil
        
        // Información básica centrada
        pdf.text(`${evidence.uploaded_by} • ${new Date(evidence.created_at).toLocaleDateString('es-ES')}`, 
                 pageWidth / 2, infoStartY, { align: 'center' });
        
      } catch (error) {
        console.error('Error adding image to PDF:', error);
        pdf.setTextColor(220, 38, 38);
        pdf.setFontSize(12);
        pdf.text(`Error al cargar imagen: ${evidence.file_name}`, pageWidth / 2, startY + titleHeight + 50, { align: 'center' });
        
        // Placeholder centrado para imagen no disponible
        const placeholderWidth = 200;
        const placeholderHeight = 150;
        const placeholderX = (pageWidth - placeholderWidth) / 2;
        const placeholderY = startY + titleHeight + 20;
        
        pdf.setDrawColor(220, 38, 38);
        pdf.setLineWidth(1);
        pdf.rect(placeholderX, placeholderY, placeholderWidth, placeholderHeight);
        pdf.setTextColor(220, 38, 38);
        pdf.text('Imagen no disponible', pageWidth / 2, placeholderY + placeholderHeight / 2, { align: 'center' });
      }
    }
  }

  // Sección de videos
  if (videoEvidences.length > 0) {
    pdf.addPage();
    pageNumber++;
    addHeader();
    addFooter(pageNumber);
    yPosition = 55;
    
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(37, 99, 235);
    pdf.text('EVIDENCIAS DE VIDEO', margin, yPosition);
    yPosition += 20;

    videoEvidences.forEach((evidence, index) => {
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        pageNumber++;
        addHeader();
        addFooter(pageNumber);
        yPosition = 55;
      }

      // Marco para cada video
      pdf.setFillColor(249, 250, 251);
      pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 45, 'F');
      pdf.setDrawColor(209, 213, 219);
      pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 45);

      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text(`${index + imageEvidences.length + 1}. ${evidence.file_name}`, margin + 5, yPosition + 5);
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(75, 85, 99);
      pdf.text(`Tipo: ${evidence.file_type}`, margin + 5, yPosition + 15);
      pdf.text(`Subido por: ${evidence.uploaded_by}`, margin + 5, yPosition + 25);
      pdf.text(`Fecha: ${new Date(evidence.created_at).toLocaleDateString('es-ES')}`, 
               margin + 5, yPosition + 35);
      
      if (evidence.description) {
        pdf.text(`Descripción: ${evidence.description}`, pageWidth / 2, yPosition + 15);
      }
      
      yPosition += 55;
    });
  }

  // Agregar pie de página a la última página
  addFooter(pageNumber);

  // Generar nombre de archivo
  const fileName = `Reporte_Evidencias_${reportMetadata?.ticketNumber || 'General'}_${new Date().toISOString().split('T')[0]}.pdf`;

  // Si se debe guardar en el sistema, retornar el blob
  if (saveToSystem) {
    const pdfBlob = pdf.output('blob');
    return { blob: pdfBlob, fileName };
  }

  // Descargar PDF normalmente
  pdf.save(fileName);
  return {};
};
