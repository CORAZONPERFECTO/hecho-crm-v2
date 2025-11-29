import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CategoryFormData } from '../hooks/useTechnicalStepsForm';

interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CategoryFormData;
  onFieldChange: (field: keyof CategoryFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
}

const CreateCategoryDialog: React.FC<CreateCategoryDialogProps> = ({
  open,
  onOpenChange,
  formData,
  onFieldChange,
  onSubmit,
  loading = false
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Nueva Categoría</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category_name">Nombre *</Label>
            <Input
              id="category_name"
              value={formData.name}
              onChange={(e) => onFieldChange('name', e.target.value)}
              placeholder="Nombre de la categoría"
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="category_description">Descripción</Label>
            <Textarea
              id="category_description"
              value={formData.description}
              onChange={(e) => onFieldChange('description', e.target.value)}
              placeholder="Descripción opcional de la categoría"
              rows={3}
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
              {loading ? 'Creando...' : 'Crear Categoría'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryDialog;