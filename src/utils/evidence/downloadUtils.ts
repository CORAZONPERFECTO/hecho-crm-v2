
import { Evidence } from './pdfGenerator';

export const downloadSingleEvidence = async (evidence: Evidence) => {
  const response = await fetch(evidence.file_url);
  const blob = await response.blob();
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = evidence.file_name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
