
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseTechnicians } from '@/hooks/useSupabaseTechnicians';
import { useIsMobile } from '@/hooks/use-mobile';

interface CreateProcessDialogProps {
  projectId: string;
  categories: any[];
  onClose: () => void;
  onCreateProcess: (categoryId: string, assignedTechnician?: string) => Promise<any>;
}

const CreateProcessDialog: React.FC<CreateProcessDialogProps> = ({
  projectId,
  categories,
  onClose,
  onCreateProcess
}) => {
  const { getActiveTechnicians } = useSupabaseTechnicians();
  const activeTechnicians = getActiveTechnicians();
  const isMobile = useIsMobile();
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [assignedTechnician, setAssignedTechnician] = useState('');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory) return;

    try {
      setCreating(true);
      await onCreateProcess(selectedCategory, assignedTechnician || undefined);
      onClose();
    } catch (error) {
      console.error('Error creating process:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-16px)] max-w-none m-2 sm:w-auto sm:max-w-md sm:m-4">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium sm:text-base">Crear Nuevo Proceso Técnico</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="category" className="text-xs font-medium">Categoría de Labor *</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="mt-1 h-8 text-xs">
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
            <Label htmlFor="technician" className="text-xs font-medium">Técnico Asignado</Label>
            <Select value={assignedTechnician} onValueChange={setAssignedTechnician}>
              <SelectTrigger className="mt-1 h-8 text-xs">
                <SelectValue placeholder="Seleccionar técnico (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {activeTechnicians.map(technician => (
                  <SelectItem key={technician.id} value={technician.name}>
                    {technician.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-2 pt-3">
            <Button 
              type="submit" 
              disabled={!selectedCategory || creating}
              className="w-full h-8 text-xs"
              size="sm"
            >
              {creating ? 'Creando...' : 'Crear Proceso'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={creating}
              className="w-full h-8 text-xs"
              size="sm"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProcessDialog;
