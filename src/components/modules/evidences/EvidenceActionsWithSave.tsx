import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, FileImage, Settings, Share2, Archive, Sparkles } from 'lucide-react';
import { useEvidenceActions, Evidence } from '@/hooks/useEvidenceActions';
import { EditReportMetadataDialog } from './EditReportMetadataDialog';
import { PDFPreviewEditor } from './pdf-editor/PDFPreviewEditor';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { saveExportedReport, downloadBlob, notifyReportsUpdated } from '@/utils/evidence/exportManager';

interface EvidenceActionsWithSaveProps {
  evidences: Evidence[];
  selectedEvidences: Evidence[];
  ticketNumber?: string;
  ticketId?: string;
  clientName?: string;
  ticketTitle?: string;
  reportDescription?: string;
  useBullets?: boolean;
  bulletStyle?: string;
  textColor?: string;
}

interface ReportMetadata {
  ticketNumber?: string;
  ticketTitle?: string;
  clientName?: string;
  description?: string;
  useBullets?: boolean;
  bulletStyle?: string;
  textColor?: string;
}

const EvidenceActionsWithSave: React.FC<EvidenceActionsWithSaveProps> = ({
  evidences,
  selectedEvidences,
  ticketNumber,
  ticketId,
  clientName,
  ticketTitle,
  reportDescription,
  useBullets = false,
  bulletStyle = '•',
  textColor = '#000000'
}) => {
  const [showMetadataDialog, setShowMetadataDialog] = useState(false);
  const [showPDFEditor, setShowPDFEditor] = useState(false);
  const [pendingAction, setPendingAction] = useState<'pdf' | 'word' | null>(null);
  const [pendingMetadata, setPendingMetadata] = useState<ReportMetadata | null>(null);
  const [pendingEvidences, setPendingEvidences] = useState<Evidence[]>([]);
  const [exportedPDF, setExportedPDF] = useState<{ blob: Blob; fileName: string } | null>(null);
  const { 
    isGenerating, 
    downloadEvidencesAsZip, 
    generatePDFReport, 
    generateWordReport,
    shareMultipleEvidences
  } = useEvidenceActions();
  const { user } = useAuth();
  const { toast } = useToast();

  const targetEvidences = selectedEvidences.length > 0 ? selectedEvidences : evidences;

  const handleMetadataSubmit = async (metadata: ReportMetadata) => {
    if (!pendingAction) return;

    try {
      const generatedBy = user?.user_metadata?.name || user?.email || 'Usuario';
      
      // Obtener las evidencias más actualizadas de la base de datos
      let evidenceIds: string[] = [];
      if (selectedEvidences.length > 0) {
        evidenceIds = selectedEvidences.map(e => e.id);
      } else {
        evidenceIds = evidences.map(e => e.id);
      }

      // Fetch fresh evidence data from database
      const { data: freshEvidences, error } = await supabase
        .from('ticket_evidences')
        .select('*')
        .in('id', evidenceIds)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching fresh evidence data:', error);
        throw new Error('No se pudieron obtener los datos actualizados de las evidencias');
      }

      // Transformar los datos de Supabase al formato Evidence requerido
      const evidencesToUse: Evidence[] = freshEvidences ? freshEvidences.map(e => ({
        id: e.id,
        ticket_id: e.ticket_id,
        file_url: e.file_url,
        file_name: e.file_name,
        file_type: e.file_type,
        description: e.description,
        uploaded_by: e.uploaded_by,
        created_at: e.created_at,
        sync_status: (e.sync_status as 'pending' | 'synced' | 'failed') || 'synced',
        manual_rotation: e.manual_rotation || 0,
        display_order: e.display_order
      })) : [];

      // Guardar metadata y evidencias para el editor
      setPendingMetadata(metadata);
      setPendingEvidences(evidencesToUse);
      
      // Cerrar diálogo de metadata y abrir editor
      setShowMetadataDialog(false);
      setShowPDFEditor(true);
      
    } catch (error) {
      console.error('Error preparing report:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al preparar el reporte",
        variant: "destructive"
      });
      setShowMetadataDialog(false);
      setPendingAction(null);
    }
  };

  const handleEditorExport = async (
    editedEvidences: Evidence[],
    editedMetadata: any,
    annotations: any[]
  ): Promise<{ blob?: Blob; fileName?: string } | void> => {
    if (!pendingAction || !pendingMetadata) return;

    try {
      const generatedBy = user?.user_metadata?.name || user?.email || 'Usuario';
      
      if (pendingAction === 'pdf') {
        const metadataWithFormat = {
          ...editedMetadata,
          useBullets,
          bulletStyle,
          textColor
        };

        // Generar PDF como blob
        const result = await generatePDFReport(editedEvidences, metadataWithFormat, ticketId, true);

        if (!result.blob || !result.fileName) {
          throw new Error('No se pudo generar el PDF');
        }

        // Guardar en exportedPDF para descarga inmediata
        setExportedPDF({ blob: result.blob, fileName: result.fileName });

        // Guardar en sistema si hay ticketId
        if (ticketId) {
          const saved = await saveExportedReport(
            ticketId,
            'pdf',
            result.fileName,
            result.blob,
            generatedBy,
            editedMetadata.description,
            {
              ticketNumber: editedMetadata.ticketNumber,
              ticketTitle: editedMetadata.ticketTitle,
              clientName: editedMetadata.clientName,
              evidencesCount: editedEvidences.length,
              annotations: annotations
            }
          );

          if (saved) {
            notifyReportsUpdated(ticketId);
            toast({
              title: '✅ PDF Exportado',
              description: 'Guardado en Reportes Exportados y listo para descargar'
            });
          } else {
            toast({
              title: '⚠️ PDF Generado',
              description: 'No se pudo guardar en sistema, pero puedes descargarlo',
              variant: 'default'
            });
          }
        }

        return { blob: result.blob, fileName: result.fileName };

      } else if (pendingAction === 'word') {
        const metadataWithFormat = {
          ...editedMetadata,
          useBullets,
          bulletStyle,
          textColor
        };

        const result = await generateWordReport(
          editedEvidences,
          metadataWithFormat,
          ticketId,
          Boolean(ticketId)
        );

        if (!result.blob || !result.fileName) {
          throw new Error('No se pudo generar el documento Word');
        }

        // Guardar en sistema si hay ticketId
        if (ticketId) {
          const saved = await saveExportedReport(
            ticketId,
            'word',
            result.fileName,
            result.blob,
            generatedBy,
            editedMetadata.description,
            {
              ticketNumber: editedMetadata.ticketNumber,
              ticketTitle: editedMetadata.ticketTitle,
              clientName: editedMetadata.clientName,
              evidencesCount: editedEvidences.length,
              annotations: annotations
            }
          );

          if (saved) {
            notifyReportsUpdated(ticketId);
            toast({
              title: '✅ Word Exportado',
              description: 'Guardado en Reportes Exportados'
            });
          }
        }

        return { blob: result.blob, fileName: result.fileName };
      }
    } catch (error) {
      console.error('❌ Error en handleEditorExport:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el reporte",
        variant: "destructive"
      });
      return undefined;
    }
  };

  const initiateReportGeneration = (type: 'pdf' | 'word') => {
    if (targetEvidences.length === 0) return;
    
    setPendingAction(type);
    setShowMetadataDialog(true);
  };

  const handleDirectActions = {
    downloadZip: () => downloadEvidencesAsZip(targetEvidences, ticketNumber),
    shareMultiple: () => shareMultipleEvidences(targetEvidences, ticketNumber)
  };

  const handleDownloadExportedPDF = (blob?: Blob, fileName?: string) => {
    console.log('📥 EvidenceActionsWithSave: handleDownloadExportedPDF llamado');
    console.log('📊 Parámetros recibidos:', { 
      blobParam: !!blob, 
      blobParamSize: blob?.size,
      fileNameParam: fileName,
      exportedPDFBlob: !!exportedPDF?.blob,
      exportedPDFSize: exportedPDF?.blob?.size,
      exportedPDFFileName: exportedPDF?.fileName
    });
    
    const blobToDownload = blob || exportedPDF?.blob;
    const fileNameToUse = fileName || exportedPDF?.fileName;

    console.log('🔍 Datos finales para descarga:', {
      hasBlobToDownload: !!blobToDownload,
      blobSize: blobToDownload?.size,
      hasFileName: !!fileNameToUse,
      fileName: fileNameToUse
    });

    if (!blobToDownload || !fileNameToUse) {
      console.error('❌ Falta blob o fileName para descarga');
      toast({ 
        title: 'No hay PDF', 
        description: 'Primero exporta el PDF antes de descargar.',
        variant: 'destructive'
      });
      return;
    }

    console.log('🚀 Iniciando downloadBlob...');
    downloadBlob(blobToDownload, fileNameToUse);
    
    toast({ 
      title: '⬇️ Descargando', 
      description: `${fileNameToUse}` 
    });
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={handleDirectActions.downloadZip}
          disabled={targetEvidences.length === 0 || isGenerating}
          variant="outline"
          size="sm"
          className="h-8"
        >
          <Archive size={14} className="mr-1" />
          ZIP ({targetEvidences.length})
        </Button>

        <Button
          onClick={() => initiateReportGeneration('pdf')}
          disabled={targetEvidences.length === 0 || isGenerating}
          variant="default"
          size="sm"
          className="h-8 bg-gradient-to-r from-primary to-primary/80"
        >
          <Sparkles size={14} className="mr-1" />
          PDF con Editor
        </Button>

        <Button
          onClick={() => initiateReportGeneration('word')}
          disabled={targetEvidences.length === 0 || isGenerating}
          variant="outline"
          size="sm"
          className="h-8"
        >
          <FileImage size={14} className="mr-1" />
          Word + Guardar
        </Button>

        <Button
          onClick={handleDirectActions.shareMultiple}
          disabled={targetEvidences.length === 0}
          variant="outline"
          size="sm"
          className="h-8"
        >
          <Share2 size={14} className="mr-1" />
          Compartir
        </Button>

        {selectedEvidences.length > 0 && (
          <Badge variant="secondary" className="h-8 px-2 flex items-center">
            {selectedEvidences.length} seleccionadas
          </Badge>
        )}

        {isGenerating && (
          <Badge variant="outline" className="h-8 px-2 flex items-center animate-pulse">
            Generando...
          </Badge>
        )}
      </div>

      <EditReportMetadataDialog
        open={showMetadataDialog}
        onClose={() => {
          setShowMetadataDialog(false);
          setPendingAction(null);
        }}
        onSave={handleMetadataSubmit}
        evidencesCount={targetEvidences.length}
        initialData={{
          ticketNumber: ticketNumber || '',
          ticketTitle: ticketTitle || '',
          clientName: clientName || '',
          description: reportDescription || ''
        }}
      />

      {showPDFEditor && pendingMetadata && (
        <PDFPreviewEditor
          open={showPDFEditor}
          onClose={() => {
            setShowPDFEditor(false);
            setPendingAction(null);
            setPendingMetadata(null);
            setPendingEvidences([]);
            setExportedPDF(null);
          }}
          evidences={pendingEvidences}
          metadata={pendingMetadata}
          onExport={handleEditorExport}
          exportedPDF={exportedPDF}
          onDownloadPDF={handleDownloadExportedPDF}
        />
      )}
    </>
  );
};

export default EvidenceActionsWithSave;