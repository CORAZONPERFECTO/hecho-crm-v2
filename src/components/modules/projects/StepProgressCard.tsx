
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle2, 
  Circle, 
  Play, 
  Upload, 
  FileText,
  User,
  Calendar
} from 'lucide-react';
import { ProjectStepProgress } from '@/hooks/useProjectTechnicalProcesses';
import { useIsMobile } from '@/hooks/use-mobile';

interface StepProgressCardProps {
  step: ProjectStepProgress;
  canEdit: boolean;
  onStatusChange: (stepId: string, newStatus: string) => void;
  onViewEvidence: () => void;
  onUploadEvidence: () => void;
  evidenceCount: number;
}

const StepProgressCard: React.FC<StepProgressCardProps> = ({
  step,
  canEdit,
  onStatusChange,
  onViewEvidence,
  onUploadEvidence,
  evidenceCount
}) => {
  const isMobile = useIsMobile();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completado': return 'bg-green-500';
      case 'en_proceso': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completado': return 'Completado';
      case 'en_proceso': return 'En Proceso';
      default: return 'Pendiente';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completado': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'en_proceso': return <Play className="h-4 w-4 text-blue-600" />;
      default: return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <Card className="w-full border-l-4 border-l-primary/50">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header Section - Mobile First */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(step.status)}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-medium text-sm leading-tight sm:text-base">
                  Paso {step.technical_steps?.step_order}: {step.technical_steps?.description}
                </span>
              </div>
            </div>
            
            {/* Info Section - Vertical Stack */}
            <div className="space-y-2">
              {step.assigned_technician && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{step.assigned_technician}</span>
                </div>
              )}
              {step.completed_at && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>Completado: {new Date(step.completed_at).toLocaleDateString('es-DO')}</span>
                </div>
              )}
              {step.completed_by && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span>Por: {step.completed_by}</span>
                </div>
              )}
            </div>

            {/* Status and Actions Row */}
            <div className="flex items-center justify-between gap-3">
              <Badge 
                variant="outline" 
                className={`${getStatusColor(step.status)} text-white border-0 text-sm px-3 py-1`}
              >
                {getStatusText(step.status)}
              </Badge>
              
              {canEdit && (
                <Select 
                  value={step.status} 
                  onValueChange={(value) => onStatusChange(step.id, value)}
                >
                  <SelectTrigger className="w-32 h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="en_proceso">En Proceso</SelectItem>
                    <SelectItem value="completado">Completado</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Notes Section */}
          {step.notes && (
            <div className="text-sm text-foreground bg-muted p-3 rounded">
              <strong>Notas:</strong> {step.notes}
            </div>
          )}

          {/* Evidence Section - Mobile First */}
          <div className="pt-3 border-t border-border space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span>{evidenceCount} evidencia(s)</span>
            </div>
            
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {evidenceCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewEvidence}
                  className="w-full gap-2 h-10 text-sm"
                >
                  <FileText className="h-4 w-4" />
                  Ver Evidencias
                </Button>
              )}
              
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onUploadEvidence}
                  className="w-full gap-2 h-10 text-sm"
                >
                  <Upload className="h-4 w-4" />
                  Subir Evidencia
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepProgressCard;
