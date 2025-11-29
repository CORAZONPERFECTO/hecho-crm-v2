import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TicketCategory } from '@/hooks/useTicketCategories';

import { StepFormData } from '../hooks/useTechnicalStepsForm';

interface CreateStepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: StepFormData;
  onFieldChange: (field: keyof StepFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  categories: TicketCategory[];
  loading?: boolean;
}

const CreateStepDialog: React.FC<CreateStepDialogProps> = ({
  open,
  onOpenChange,
  formData,
  onFieldChange,
  onSubmit,
  categories,
  loading = false
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Paso Técnico</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="step_category">Categoría *</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => onFieldChange('category_id', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="step_description">Descripción del Paso *</Label>
            <Textarea
              id="step_description"
              value={formData.description}
              onChange={(e) => onFieldChange('description', e.target.value)}
              placeholder="Descripción detallada del paso técnico"
              rows={3}
              required
              disabled={loading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Paso'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStepDialog;