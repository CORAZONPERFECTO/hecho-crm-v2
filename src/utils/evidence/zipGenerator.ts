
import JSZip from 'jszip';
import { Evidence } from './pdfGenerator';

export const downloadEvidencesAsZip = async (evidences: Evidence[], ticketNumber?: string) => {
  if (evidences.length === 0) return;

  const zip = new JSZip();
  const folder = zip.folder(`evidencias_${ticketNumber || 'todas'}`);

  // Descargar y agregar cada evidencia al ZIP
  for (const evidence of evidences) {
    try {
      const response = await fetch(evidence.file_url);
      const blob = await response.blob();
      folder?.file(evidence.file_name, blob);
    } catch (error) {
      console.error(`Error downloading ${evidence.file_name}:`, error);
    }
  }

  // Generar y descargar el ZIP
  const content = await zip.generateAsync({ type: 'blob' });
  const url = window.URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = `evidencias_${ticketNumber || 'todas'}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
