
import { Evidence } from './pdfGenerator';

export const shareEvidence = async (evidence: Evidence): Promise<{ success: boolean; fallback?: boolean }> => {
  if (navigator.share) {
    try {
      // Para dispositivos móviles con Web Share API
      const response = await fetch(evidence.file_url);
      const blob = await response.blob();
      const file = new File([blob], evidence.file_name, { type: evidence.file_type });

      await navigator.share({
        title: `Evidencia: ${evidence.file_name}`,
        text: evidence.description || 'Evidencia del ticket',
        files: [file]
      });

      return { success: true };
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback a copiar URL
      return fallbackShare(evidence);
    }
  } else {
    // Fallback para navegadores que no soportan Web Share API
    return fallbackShare(evidence);
  }
};

const fallbackShare = (evidence: Evidence): { success: boolean; fallback: boolean } => {
  try {
    navigator.clipboard.writeText(evidence.file_url);
    return { success: true, fallback: true };
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return { success: false, fallback: true };
  }
};

export const shareMultipleEvidences = async (evidences: Evidence[], ticketNumber?: string): Promise<{ success: boolean; fallback?: boolean }> => {
  const evidenceList = evidences.map((e, index) => 
    `${index + 1}. ${e.file_name}${e.description ? ` - ${e.description}` : ''}\n   ${e.file_url}`
  ).join('\n\n');

  const shareText = `Evidencias${ticketNumber ? ` del Ticket #${ticketNumber}` : ''}:\n\n${evidenceList}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `Evidencias${ticketNumber ? ` - Ticket #${ticketNumber}` : ''}`,
        text: shareText
      });

      return { success: true };
    } catch (error) {
      console.error('Error sharing:', error);
      return fallbackShareText(shareText);
    }
  } else {
    return fallbackShareText(shareText);
  }
};

const fallbackShareText = (text: string): { success: boolean; fallback: boolean } => {
  try {
    navigator.clipboard.writeText(text);
    return { success: true, fallback: true };
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return { success: false, fallback: true };
  }
};
