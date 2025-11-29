import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTechnicalReports } from '@/hooks/useTechnicalReports';

interface CreateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateReportDialog: React.FC<CreateReportDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { createReport } = useTechnicalReports();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    general_description: '',
    technical_description: '',
    observations: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createReport({
        ...formData,
        evidences: [],
        status: 'borrador'
      });
      
      onOpenChange(false);
      setFormData({
        title: '',
        general_description: '',
        technical_description: '',
        observations: ''
      });
    } catch (error) {
      console.error('Error creating report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Reporte Técnico</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ej: Instalación de sistema de aire acondicionado"
              required
            />
          </div>

          <div>
            <Label htmlFor="general_description">Descripción General</Label>
            <Textarea
              id="general_description"
              value={formData.general_description}
              onChange={(e) => setFormData(prev => ({ ...prev, general_description: e.target.value }))}
              placeholder="Descripción general del trabajo realizado..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="technical_description">Descripción Técnica</Label>
            <Textarea
              id="technical_description"
              value={formData.technical_description}
              onChange={(e) => setFormData(prev => ({ ...prev, technical_description: e.target.value }))}
              placeholder="Detalles técnicos del trabajo..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="observations">Observaciones</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
              placeholder="Observaciones adicionales..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.title.trim()}>
              {loading ? 'Creando...' : 'Crear Reporte'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};