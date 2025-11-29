import { Document, Packer, Paragraph, ImageRun, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { Evidence } from './pdfGenerator';
import { getImageOrientationFromUrl, getRotationFromOrientation } from './imageOrientation';

interface CompanyInfo {
  companyName: string;
  logoUrl?: string;
  clientName?: string;
  description?: string;
}

const loadImageAsArrayBuffer = async (imageUrl: string, manualRotation: number = 0): Promise<ArrayBuffer | null> => {
  try {
    // Get image orientation
    const orientation = await getImageOrientationFromUrl(imageUrl);
    const autoRotation = getRotationFromOrientation(orientation);
    const totalRotation = (autoRotation + manualRotation) % 360;
    
    const response = await fetch(imageUrl);
    if (!response.ok) return null;
    
    // If no rotation needed, return original
    if (totalRotation === 0) {
      return await response.arrayBuffer();
    }
    
    // Apply rotation using canvas
    const blob = await response.blob();
    const img = new Image();
    
    return new Promise((resolve) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(null);
          return;
        }
        
        // Set canvas dimensions based on rotation
        if (totalRotation === 90 || totalRotation === 270) {
          canvas.width = img.naturalHeight;
          canvas.height = img.naturalWidth;
        } else {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
        }
        
        // Apply rotation transformation
        ctx.save();
        switch (totalRotation) {
          case 90:
            ctx.translate(canvas.width, 0);
            ctx.rotate(Math.PI / 2);
            break;
          case 180:
            ctx.translate(canvas.width, canvas.height);
            ctx.rotate(Math.PI);
            break;
          case 270:
            ctx.translate(0, canvas.height);
            ctx.rotate(-Math.PI / 2);
            break;
        }
        
        ctx.drawImage(img, 0, 0);
        ctx.restore();
        
        canvas.toBlob((correctedBlob) => {
          if (correctedBlob) {
            correctedBlob.arrayBuffer().then(resolve).catch(() => resolve(null));
          } else {
            resolve(null);
          }
        }, 'image/jpeg', 0.8);
      };
      
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(blob);
    });
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
};

export const generateWordReport = async (
  evidences: Evidence[],
  reportMetadata?: any,
  ticketId?: string,
  saveToSystem?: boolean
): Promise<{ blob?: Blob; fileName?: string }> => {
  const ticketNumber = reportMetadata?.ticketNumber;
  const ticketTitle = reportMetadata?.ticketTitle;
  const companyInfo = {
    companyName: 'HECHO SERVICIOS GENERALES',
    clientName: reportMetadata?.clientName,
    description: reportMetadata?.description
  };
  const useBullets = reportMetadata?.useBullets || false;
  const bulletStyle = reportMetadata?.bulletStyle || '•';
  const textColor = reportMetadata?.textColor || '#000000';
  const children: (Paragraph)[] = [];

  // Header with company info
  if (companyInfo?.companyName) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: companyInfo.companyName,
            bold: true,
            size: 32,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  // Ticket info
  if (ticketNumber) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Ticket: #${ticketNumber}`,
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200 },
      })
    );
  }

  if (ticketTitle) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: ticketTitle,
            size: 20,
          }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  // Client name
  if (companyInfo?.clientName) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Cliente: ${companyInfo.clientName}`,
            bold: true,
            size: 20,
          }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  // 🔹 PRIMERA PARTE: DESCRIPCIÓN GENERAL COMPLETA
  if (companyInfo?.description) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'DESCRIPCIÓN GENERAL DEL SERVICIO',
            bold: true,
            size: 28,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 300 },
      })
    );

    // Función para parsear HTML y convertir a elementos de Word
    const parseHTMLToWordElements = (htmlContent: string): Paragraph[] => {
      const paragraphs: Paragraph[] = [];
      
      // Parser HTML simple
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      const processNode = (node: Node, level: number = 0): { runs: TextRun[], needsNewParagraph: boolean } => {
        const runs: TextRun[] = [];
        let needsNewParagraph = false;
        
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim();
          if (text) {
            runs.push(new TextRun({
              text: text,
              size: 20,
              color: textColor.replace('#', ''),
            }));
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          switch (element.tagName.toLowerCase()) {
            case 'strong':
            case 'b':
              const boldText = element.textContent?.trim();
              if (boldText) {
                runs.push(new TextRun({
                  text: boldText,
                  bold: true,
                  size: 22,
                  color: '2563eb',
                }));
              }
              break;
              
            case 'p':
              Array.from(element.childNodes).forEach(child => {
                const result = processNode(child, level);
                runs.push(...result.runs);
              });
              needsNewParagraph = true;
              break;
              
            case 'br':
              needsNewParagraph = true;
              break;
              
            case 'ul':
              Array.from(element.childNodes).forEach(child => {
                if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName.toLowerCase() === 'li') {
                  const liResult = processNode(child, level);
                  
                  paragraphs.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: '• ',
                          size: 20,
                          color: textColor.replace('#', ''),
                        }),
                        ...liResult.runs
                      ],
                      spacing: { before: 100, after: 100 },
                      indent: { left: 400 + (level * 400) },
                    })
                  );
                }
              });
              break;
              
            case 'li':
              Array.from(element.childNodes).forEach(child => {
                if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName.toLowerCase() === 'ul') {
                  // Lista anidada
                  const nestedResult = processNode(child, level + 1);
                } else {
                  const result = processNode(child, level);
                  runs.push(...result.runs);
                }
              });
              break;
              
            default:
              Array.from(element.childNodes).forEach(child => {
                const result = processNode(child, level);
                runs.push(...result.runs);
              });
              break;
          }
        }
        
        return { runs, needsNewParagraph };
      };
      
      // Procesar todos los nodos del body
      Array.from(doc.body.childNodes).forEach(node => {
        const result = processNode(node, 0);
        
        if (result.runs.length > 0) {
          paragraphs.push(
            new Paragraph({
              children: result.runs,
              spacing: { before: 100, after: 200 },
            })
          );
        }
      });
      
      return paragraphs;
    };
    
    // Parsear y agregar el contenido HTML formateado
    const formattedParagraphs = parseHTMLToWordElements(companyInfo.description);
    children.push(...formattedParagraphs);

    // Separador antes de las evidencias
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '═'.repeat(60),
            color: 'eab308', // Dorado
            bold: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 400 },
      })
    );
  }

  // 🔹 SEGUNDA PARTE: EVIDENCIAS FOTOGRÁFICAS
  const imageEvidences = evidences.filter(e => e.file_type?.startsWith('image/'));
  const videoEvidences = evidences.filter(e => e.file_type?.startsWith('video/'));

  if (imageEvidences.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'EVIDENCIAS FOTOGRÁFICAS',
            bold: true,
            size: 28,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 300 },
      })
    );

    // Procesar cada imagen en su propia sección
    for (let i = 0; i < imageEvidences.length; i++) {
      const evidence = imageEvidences[i];
      
      // Título de la evidencia - formato: "Foto X: Nombre - Descripción"
      let title = `Foto ${i + 1}: ${evidence.file_name}`;
      if (evidence.description) {
        title += ` - ${evidence.description}`;
      }
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: title,
              bold: true,
              size: 22,
              color: '2563eb', // Azul
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        })
      );

      // Agregar imagen centrada y con buen tamaño (con rotación manual si aplica)
      try {
        const imageBuffer = await loadImageAsArrayBuffer(evidence.file_url, evidence.manual_rotation || 0);
        if (imageBuffer) {
          children.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageBuffer,
                  transformation: {
                    width: 500, // Tamaño más grande para mejor visibilidad
                    height: 375,
                  },
                  type: 'png',
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 300 },
            })
          );
        }
      } catch (error) {
        console.error('Error adding image to Word document:', error);
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Error al cargar la imagen',
                italics: true,
                color: 'dc2626', // Rojo
                size: 16,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          })
        );
      }

      // Información técnica de la evidencia
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Subido por: ${evidence.uploaded_by} | `,
              size: 16,
              color: '6b7280', // Gris
            }),
            new TextRun({
              text: `Fecha: ${new Date(evidence.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}`,
              size: 16,
              color: '6b7280', // Gris
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 300 },
        })
      );

      // Separador elegante entre fotos (excepto la última)
      if (i < imageEvidences.length - 1) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '─'.repeat(40),
                color: 'd1d5db', // Gris claro
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
          })
        );
      }
    }
  }

  // Sección de videos (si existen)
  if (videoEvidences.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'EVIDENCIAS DE VIDEO',
            bold: true,
            size: 28,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 300 },
      })
    );

    videoEvidences.forEach((evidence, index) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Video ${index + 1}: ${evidence.file_name}`,
              bold: true,
              size: 20,
            }),
          ],
          spacing: { before: 300, after: 100 },
        })
      );

      if (evidence.description) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: evidence.description,
                size: 18,
              }),
            ],
            spacing: { after: 200 },
          })
        );
      }

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Tipo de archivo: ${evidence.file_type}`,
              italics: true,
              size: 16,
              color: '6b7280', // Gris
            }),
          ],
          spacing: { after: 200 },
        })
      );
    });
  }

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  // Generate blob
  const blob = await Packer.toBlob(doc);
  const fileName = `reporte_evidencias_${ticketNumber || 'todas'}.docx`;
  
  if (saveToSystem) {
    // Return blob and filename for saving in system
    return { blob, fileName };
  } else {
    // Download directly
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return {};
  }
};