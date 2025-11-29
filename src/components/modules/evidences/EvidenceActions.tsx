
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileImage, Download, Share2, X, FileText, Settings } from 'lucide-react';
import { useEvidenceActions } from '@/hooks/useEvidenceActions';
import { EditReportMetadataDialog } from './EditReportMetadataDialog';

import type { Evidence } from '@/hooks/useEvidenceActions';

interface EvidenceActionsProps {
  evidences: Evidence[];
  selectedEvidences: string[];
  ticketNumber?: string;
  ticketTitle?: string;
  clientName?: string;
  description?: string;
  onClearSelection?: () => void;
}

const EvidenceActions: React.FC<EvidenceActionsProps> = ({
  evidences,
  selectedEvidences,
  ticketNumber,
  ticketTitle,
  clientName,
  description,
  onClearSelection
}) => {
  const [metadataDialogOpen, setMetadataDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'pdf' | 'word' | null>(null);
  
  const {
    isGenerating,
    reportMetadata,
    downloadEvidencesAsZip,
    generatePDFReport,
    generateWordReport,
    shareMultipleEvidences,
    updateReportMetadata
  } = useEvidenceActions();

  const selectedEvidenceObjects = evidences.filter(e => selectedEvidences.includes(e.id));
  const hasSelection = selectedEvidences.length > 0;
  const evidencesToProcess = hasSelection ? selectedEvidenceObjects : evidences;

  const handleDownloadZip = () => {
    downloadEvidencesAsZip(evidencesToProcess, ticketNumber);
  };

  const handleGenerateReport = () => {
    setPendingAction('pdf');
    setMetadataDialogOpen(true);
  };

  const handleGenerateWord = () => {
    setPendingAction('word');
    setMetadataDialogOpen(true);
  };

  const handleMetadataSave = async (metadata: any) => {
    updateReportMetadata(metadata);
    const evidencesToProcess = hasSelection ? selectedEvidenceObjects : evidences;
    
    if (pendingAction === 'pdf') {
      await generatePDFReport(evidencesToProcess, metadata);
    } else if (pendingAction === 'word') {
      await generateWordReport(evidencesToProcess, metadata);
    }
    
    setPendingAction(null);
  };

  const handleShare = async () => {
    const evidencesToProcess = hasSelection ? selectedEvidenceObjects : evidences;
    await shareMultipleEvidences(evidencesToProcess, ticketNumber);
  };

  if (evidences.length === 0) return null;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileImage className="h-5 w-5 text-primary" />
            <span className="font-medium">Acciones de Evidencias</span>
            <Badge variant={hasSelection ? "default" : "secondary"}>
              {hasSelection ? `${selectedEvidences.length} seleccionadas` : `${evidences.length} evidencias`}
            </Badge>
          </div>
          
          {hasSelection && onClearSelection && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="mr-1 h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadZip}
            disabled={isGenerating}
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            {isGenerating ? 'Generando...' : 'ZIP'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="flex-1"
          >
            <FileImage className="mr-2 h-4 w-4" />
            {isGenerating ? 'Generando...' : 'PDF'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleGenerateWord}
            disabled={isGenerating}
            className="flex-1"
          >
            <FileText className="mr-2 h-4 w-4" />
            {isGenerating ? 'Generando...' : 'Word'}
          </Button>

          <Button
            variant="outline"
            onClick={handleShare}
            disabled={isGenerating}
            className="flex-1"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Compartir
          </Button>

          <Button
            variant="outline"
            onClick={() => setMetadataDialogOpen(true)}
            disabled={isGenerating}
            className="flex-1"
            title="Configurar información del reporte"
          >
            <Settings className="mr-2 h-4 w-4" />
            Config
          </Button>
        </div>

        {/* Edit Report Metadata Dialog */}
        <EditReportMetadataDialog
          open={metadataDialogOpen}
          onClose={() => {
            setMetadataDialogOpen(false);
            setPendingAction(null);
          }}
          onSave={handleMetadataSave}
          initialData={{
            ticketNumber: reportMetadata.ticketNumber || ticketNumber,
            ticketTitle: reportMetadata.ticketTitle || ticketTitle,
            clientName: reportMetadata.clientName || clientName,
            description: reportMetadata.description || description
          }}
          evidencesCount={evidencesToProcess.length}
        />
      </CardContent>
    </Card>
  );
};

export default EvidenceActions;
