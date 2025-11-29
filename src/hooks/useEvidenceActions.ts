import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Evidence, generatePDFReport } from '@/utils/evidence/pdfGenerator';
import { downloadEvidencesAsZip } from '@/utils/evidence/zipGenerator';
import { shareEvidence, shareMultipleEvidences } from '@/utils/evidence/shareUtils';
import { downloadSingleEvidence } from '@/utils/evidence/downloadUtils';
import { generateWordReport } from '@/utils/evidence/wordGenerator';
import { useCompanySettings } from '@/hooks/useCompanySettings';

export type { Evidence } from '@/utils/evidence/pdfGenerator';

// Type alias para compatibilidad con TicketEvidence
export type TicketEvidenceForPDF = Evidence;

interface ReportMetadata {
  ticketNumber?: string;
  ticketTitle?: string;
  clientName?: string;
  description?: string;
}

export const useEvidenceActions = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportMetadata, setReportMetadata] = useState<ReportMetadata>({});
  const { toast } = useToast();
  const { settings: companySettings } = useCompanySettings();

  const handleDownloadSingle = async (evidence: Evidence) => {
    try {
      await downloadSingleEvidence(evidence);
      toast({
        title: "Descarga iniciada",
        description: `${evidence.file_name} se está descargando`
      });
    } catch (error) {
      console.error('Error downloading evidence:', error);
      toast({
        title: "Error",
        description: "No se pudo descargar la evidencia",
        variant: "destructive"
      });
    }
  };

  const handleDownloadZip = async (evidences: Evidence[], ticketNumber?: string) => {
    if (evidences.length === 0) return;

    setIsGenerating(true);
    try {
      await downloadEvidencesAsZip(evidences, ticketNumber);
      toast({
        title: "ZIP generado",
        description: `${evidences.length} evidencias descargadas en ZIP`
      });
    } catch (error) {
      console.error('Error creating ZIP:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el archivo ZIP",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePDF = async (
    evidences: Evidence[], 
    metadata?: ReportMetadata,
    ticketId?: string,
    saveToSystem = false
  ) => {
    setIsGenerating(true);
    try {
      const finalMetadata = metadata || reportMetadata;
      
      // Asegurar que tenemos la información más actualizada de las evidencias
      console.log('Generating PDF with evidences:', evidences.map(e => ({ 
        id: e.id, 
        file_name: e.file_name, 
        description: e.description 
      })));

      const companyInfo = companySettings ? {
        companyName: companySettings.companyName,
        logoUrl: companySettings.logoUrl,
        clientName: finalMetadata.clientName,
        description: finalMetadata.description
      } : undefined;

      const result = await generatePDFReport(
        evidences, 
        finalMetadata,
        ticketId,
        saveToSystem
      );

      // Retornar el resultado para manejo externo
      if (saveToSystem && ticketId) {
        return { ...result, metadata: finalMetadata };
      }

      if (!saveToSystem) {
        toast({
          title: "Reporte generado",
          description: "PDF descargado correctamente con logo y información de la empresa"
        });
      }

      return result;
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el reporte PDF",
        variant: "destructive"
      });
      return {};
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareSingle = async (evidence: Evidence) => {
    try {
      const result = await shareEvidence(evidence);
      
      if (result.success) {
        toast({
          title: result.fallback ? "URL copiada" : "Compartido",
          description: result.fallback 
            ? "El enlace de la evidencia se copió al portapapeles"
            : "Evidencia compartida correctamente"
        });
      } else {
        toast({
          title: "Información",
          description: "Puedes copiar manualmente el enlace de la evidencia",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Error",
        description: "No se pudo compartir la evidencia",
        variant: "destructive"
      });
    }
  };

  const handleGenerateWord = async (
    evidences: Evidence[], 
    metadata?: ReportMetadata,
    ticketId?: string,
    saveToSystem?: boolean
  ): Promise<{ blob?: Blob; fileName?: string }> => {
    setIsGenerating(true);
    try {
      const finalMetadata = metadata || reportMetadata;
      const companyInfo = companySettings ? {
        companyName: companySettings.companyName,
        logoUrl: companySettings.logoUrl,
        clientName: finalMetadata.clientName,
        description: finalMetadata.description
      } : undefined;

      const result = await generateWordReport(
        evidences, 
        finalMetadata,
        ticketId,
        saveToSystem
      );

      if (!saveToSystem) {
        toast({
          title: "Documento generado",
          description: "Archivo Word descargado correctamente"
        });
      }

      return result;
    } catch (error) {
      console.error('Error generating Word document:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el documento Word",
        variant: "destructive"
      });
      return {};
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareMultiple = async (evidences: Evidence[], ticketNumber?: string) => {
    try {
      const result = await shareMultipleEvidences(evidences, ticketNumber);
      
      if (result.success) {
        toast({
          title: result.fallback ? "Texto copiado" : "Compartido",
          description: result.fallback
            ? "La información se copió al portapapeles"
            : "Lista de evidencias compartida correctamente"
        });
      } else {
        toast({
          title: "Información preparada",
          description: "La información está lista para ser copiada manualmente"
        });
      }
    } catch (error) {
      console.error('Error sharing multiple evidences:', error);
      toast({
        title: "Error",
        description: "No se pudo compartir las evidencias",
        variant: "destructive"
      });
    }
  };

  const updateReportMetadata = (metadata: ReportMetadata) => {
    setReportMetadata(metadata);
  };

  return {
    isGenerating,
    reportMetadata,
    downloadSingleEvidence: handleDownloadSingle,
    downloadEvidencesAsZip: handleDownloadZip,
    generatePDFReport: handleGeneratePDF,
    generateWordReport: handleGenerateWord,
    shareEvidence: handleShareSingle,
    shareMultipleEvidences: handleShareMultiple,
    updateReportMetadata
  };
};
