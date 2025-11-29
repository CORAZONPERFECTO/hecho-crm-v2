import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useTechnicalReports } from '@/hooks/useTechnicalReports';

interface ViewReportDialogProps {
  reportId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewReportDialog: React.FC<ViewReportDialogProps> = ({
  reportId,
  open,
  onOpenChange
}) => {
  const { reports } = useTechnicalReports();
  const report = reports.find(r => r.id === reportId);

  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{report.title}</DialogTitle>
            <Badge>{report.status}</Badge>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Número de Reporte</h3>
            <p className="text-muted-foreground">{report.report_number}</p>
          </div>

          {report.general_description && (
            <div>
              <h3 className="font-semibold">Descripción General</h3>
              <p className="text-muted-foreground">{report.general_description}</p>
            </div>
          )}

          {report.technical_description && (
            <div>
              <h3 className="font-semibold">Descripción Técnica</h3>
              <p className="text-muted-foreground">{report.technical_description}</p>
            </div>
          )}

          {report.observations && (
            <div>
              <h3 className="font-semibold">Observaciones</h3>
              <p className="text-muted-foreground">{report.observations}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};