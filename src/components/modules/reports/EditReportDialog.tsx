import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, Clock, Wifi, WifiOff } from 'lucide-react';
import { useTechnicalReports } from '@/hooks/useTechnicalReports';
import { useReportAutoSave } from '@/hooks/useReportAutoSave';

interface EditReportDialogProps {
  reportId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditReportDialog: React.FC<EditReportDialogProps> = ({
  reportId,
  open,
  onOpenChange
}) => {
  const { reports, updateReport } = useTechnicalReports();
  const { 
    startAutoSave, 
    stopAutoSave, 
    saveNow, 
    getSavedData, 
    isOnline, 
    lastSaveTime,
    hasPendingChanges 
  } = useReportAutoSave(reportId);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    general_description: '',
    technical_description: '',
    observations: '',
    evidences: []
  });

  const report = reports.find(r => r.id === reportId);

  useEffect(() => {
    if (report) {
      // Verificar si hay datos guardados localmente
      const savedData = getSavedData(reportId);
      if (savedData) {
        setFormData(savedData.formData);
      } else {
        setFormData({
          title: report.title,
          general_description: report.general_description || '',
          technical_description: report.technical_description || '',
          observations: report.observations || '',
          evidences: report.evidences || []
        });
      }
    }
  }, [report, reportId, getSavedData]);

  useEffect(() => {
    if (open && reportId) {
      // Iniciar autoguardado cuando se abre el diálogo
      startAutoSave(reportId, formData);
    } else {
      // Detener autoguardado cuando se cierra
      stopAutoSave();
    }

    return () => stopAutoSave();
  }, [open, reportId, formData, startAutoSave, stopAutoSave]);

  const handleFormChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Actualizar autoguardado con nuevos datos
    if (reportId) {
      startAutoSave(reportId, newFormData);
    }
  };

  const handleSaveNow = async () => {
    if (!reportId) return;
    
    setLoading(true);
    const success = await saveNow(reportId, formData);
    
    if (success) {
      await updateReport(reportId, {
        ...formData,
        status: 'finalizado'
      });
    }
    
    setLoading(false);
  };

  const handleClose = () => {
    stopAutoSave();
    onOpenChange(false);
  };

  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Editar Reporte: {report.report_number}</DialogTitle>
            <div className="flex items-center space-x-2">
              {/* Indicador de conexión */}
              {isOnline ? (
                <Badge variant="outline" className="text-green-600">
                  <Wifi className="w-3 h-3 mr-1" />
                  En línea
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Sin conexión
                </Badge>
              )}
              
              {/* Indicador de guardado */}
              {hasPendingChanges && (
                <Badge variant="outline" className="text-yellow-600">
                  <Clock className="w-3 h-3 mr-1" />
                  Sin guardar
                </Badge>
              )}
              
              {lastSaveTime && (
                <span className="text-xs text-muted-foreground">
                  Guardado: {lastSaveTime.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
              placeholder="Título del reporte"
            />
          </div>

          <div>
            <Label htmlFor="general_description">Descripción General</Label>
            <Textarea
              id="general_description"
              value={formData.general_description}
              onChange={(e) => handleFormChange('general_description', e.target.value)}
              placeholder="Descripción general del trabajo realizado..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="technical_description">Descripción Técnica</Label>
            <Textarea
              id="technical_description"
              value={formData.technical_description}
              onChange={(e) => handleFormChange('technical_description', e.target.value)}
              placeholder="Detalles técnicos del trabajo..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="observations">Observaciones</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => handleFormChange('observations', e.target.value)}
              placeholder="Observaciones adicionales..."
              rows={3}
            />
          </div>

          {/* Info sobre autoguardado */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <Clock className="w-4 h-4 inline mr-1" />
              Los cambios se guardan automáticamente cada 30 segundos cuando hay conexión
            </p>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Cerrar
            </Button>
            
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={handleSaveNow}
                disabled={loading || !isOnline}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Guardando...' : 'Guardar Ahora'}
              </Button>
              
              <Button
                onClick={async () => {
                  await handleSaveNow();
                  handleClose();
                }}
                disabled={loading || !formData.title.trim()}
              >
                Finalizar y Cerrar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};