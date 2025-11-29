
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  User, 
  Calendar,
  Upload,
  Eye,
  Play,
  Pause,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useProjectTechnicalProcesses } from '@/hooks/useProjectTechnicalProcesses';
import { useTechnicalConfiguration } from '@/hooks/useTechnicalConfiguration';
import { useIsMobile } from '@/hooks/use-mobile';
import CreateProcessDialog from './CreateProcessDialog';
import StepProgressCard from './StepProgressCard';
import StepEvidenceDialog from './StepEvidenceDialog';

interface TechnicalProcessLineProps {
  projectId: string;
  userRole: 'admin' | 'manager' | 'technician';
  currentUser: string;
}

const TechnicalProcessLine: React.FC<TechnicalProcessLineProps> = ({
  projectId,
  userRole,
  currentUser
}) => {
  const { 
    processes, 
    stepProgress, 
    stepEvidences,
    loading, 
    createProcess,
    updateStepProgress,
    uploadStepEvidence,
    fetchStepProgress,
    fetchStepEvidences
  } = useProjectTechnicalProcesses(projectId);
  
  const { categories } = useTechnicalConfiguration();
  const isMobile = useIsMobile();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedStepForEvidence, setSelectedStepForEvidence] = useState<string | null>(null);
  const [expandedProcesses, setExpandedProcesses] = useState<Set<string>>(new Set());

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

  const handleProcessExpand = async (processId: string) => {
    const newExpanded = new Set(expandedProcesses);
    if (expandedProcesses.has(processId)) {
      newExpanded.delete(processId);
    } else {
      newExpanded.add(processId);
      // Cargar pasos si no están cargados
      if (!stepProgress[processId]) {
        await fetchStepProgress(processId);
      }
    }
    setExpandedProcesses(newExpanded);
  };

  const canEditStep = (step: any): boolean => {
    if (userRole === 'admin' || userRole === 'manager') return true;
    return step.assigned_technician === currentUser;
  };

  const handleStepStatusChange = async (stepId: string, newStatus: string) => {
    try {
      await updateStepProgress(stepId, {
        status: newStatus as any,
        completed_by: newStatus === 'completado' ? currentUser : undefined
      });
    } catch (error) {
      console.error('Error updating step:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="space-y-4 p-4">
        {/* Header - Mobile First */}
        <div className="space-y-3">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold leading-tight text-foreground sm:text-xl">
              Procesos Técnicos
            </h3>
            <p className="text-sm text-muted-foreground">
              Gestión y seguimiento por categoría
            </p>
          </div>
          {(userRole === 'admin' || userRole === 'manager') && (
            <Button 
              onClick={() => setShowCreateDialog(true)} 
              className="w-full h-12 gap-2 font-medium text-base sm:h-10 sm:text-sm md:w-auto"
              size="lg"
            >
              <Plus className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Nuevo Proceso</span>
            </Button>
          )}
        </div>

        {/* Processes List - Mobile First */}
        {processes.length === 0 ? (
          <Card className="w-full">
            <CardContent className="p-6 text-center">
              <div className="space-y-4">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <div className="space-y-2">
                  <h4 className="text-base font-medium text-foreground">No hay procesos técnicos</h4>
                  <p className="text-sm text-muted-foreground">Comienza agregando un proceso técnico</p>
                </div>
                {(userRole === 'admin' || userRole === 'manager') && (
                  <Button 
                    onClick={() => setShowCreateDialog(true)} 
                    className="w-full h-12 gap-2 font-medium text-base sm:h-10 sm:text-sm md:w-auto"
                    size="lg"
                  >
                    <Plus className="h-5 w-5 flex-shrink-0" />
                    Crear Primer Proceso
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="w-full space-y-4">
            {processes.map((process) => (
              <Card key={process.id} className="w-full overflow-hidden border-l-4 border-l-primary/30">
                <CardHeader className="p-4">
                  <div className="space-y-4">
                    {/* Process Header - Mobile First */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getStatusIcon(process.status)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base font-medium leading-tight sm:text-lg">
                            {process.technical_service_categories?.name || 'Categoría desconocida'}
                          </CardTitle>
                          
                          {/* Info Section - Stack on small screens */}
                          <div className="mt-2 space-y-2">
                            {process.assigned_technician && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{process.assigned_technician}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span>{new Date(process.created_at).toLocaleDateString('es-DO')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions Row - Mobile First */}
                      <div className="flex items-center justify-between gap-3">
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(process.status)} text-white border-0 text-sm px-3 py-1`}
                        >
                          {getStatusText(process.status)}
                        </Badge>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleProcessExpand(process.id)}
                          className="h-9 px-3 gap-2 text-sm"
                        >
                          {expandedProcesses.has(process.id) ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              <span>Ocultar</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              <span>Ver Pasos</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Progress Bar - Full width */}
                    <div className="w-full">
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="font-medium text-foreground">{process.progress_percentage}%</span>
                      </div>
                      <Progress value={process.progress_percentage} className="h-2 w-full" />
                    </div>
                  </div>
                </CardHeader>

                {/* Steps Details - Mobile First */}
                {expandedProcesses.has(process.id) && (
                  <CardContent className="p-4 pt-0">
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                        Pasos del Proceso
                      </h4>
                      {stepProgress[process.id] ? (
                        <div className="space-y-3">
                          {stepProgress[process.id]
                            .sort((a, b) => (a.technical_steps?.step_order || 0) - (b.technical_steps?.step_order || 0))
                            .map((step) => (
                            <StepProgressCard
                              key={step.id}
                              step={step}
                              canEdit={canEditStep(step)}
                              onStatusChange={handleStepStatusChange}
                              onViewEvidence={() => {
                                setSelectedStepForEvidence(step.id);
                                fetchStepEvidences(step.id);
                              }}
                              onUploadEvidence={() => setSelectedStepForEvidence(step.id)}
                              evidenceCount={stepEvidences[step.id]?.length || 0}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                          Cargando pasos...
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

      {/* Dialogs */}
      {showCreateDialog && (
        <CreateProcessDialog
          projectId={projectId}
          categories={categories}
          onClose={() => setShowCreateDialog(false)}
          onCreateProcess={createProcess}
        />
      )}

      {selectedStepForEvidence && (
        <StepEvidenceDialog
          stepProgressId={selectedStepForEvidence}
          evidences={stepEvidences[selectedStepForEvidence] || []}
          onClose={() => setSelectedStepForEvidence(null)}
          onUploadEvidence={(file, description) => 
            uploadStepEvidence(selectedStepForEvidence, file, description, currentUser)
          }
          canUpload={true}
        />
      )}
      </div>
    </div>
  );
};

export default TechnicalProcessLine;
