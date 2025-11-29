import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, X } from 'lucide-react';

interface Evidence {
  id: string;
  ticket_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  description?: string;
  uploaded_by: string;
  created_at: string;
  sync_status: 'pending' | 'synced' | 'failed';
  villa_id?: string;
  tickets?: {
    id: string;
    ticket_number: string;
    title: string;
    status: string;
  };
}

interface EditEvidenceDialogProps {
  evidence: Evidence | null;
  open: boolean;
  onClose: () => void;
  onSave: (updatedEvidence: Evidence) => void;
}

export const EditEvidenceDialog: React.FC<EditEvidenceDialogProps> = ({
  evidence,
  open,
  onClose,
  onSave
}) => {
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (evidence) {
      setFileName(evidence.file_name);
      setDescription(evidence.description || '');
    }
  }, [evidence]);

  const handleSave = async () => {
    if (!evidence) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('ticket_evidences')
        .update({
          file_name: fileName,
          description: description || null
        })
        .eq('id', evidence.id)
        .select()
        .single();

      if (error) throw error;

      const updatedEvidence = {
        ...evidence,
        file_name: fileName,
        description: description || undefined
      };

      onSave(updatedEvidence);
      onClose();

      toast({
        title: "Éxito",
        description: "Evidencia actualizada correctamente"
      });
    } catch (error) {
      console.error('Error updating evidence:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la evidencia",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (evidence) {
      setFileName(evidence.file_name);
      setDescription(evidence.description || '');
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Evidencia</DialogTitle>
          <DialogDescription>
            Modifica la información de la evidencia. Los cambios se reflejarán en futuros reportes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fileName">Nombre del archivo</Label>
            <Input
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Ingresa el nombre del archivo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el contenido de la evidencia..."
              rows={4}
            />
          </div>

          {evidence && (
            <div className="bg-muted p-3 rounded-lg space-y-1">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Tipo:</span> {evidence.file_type}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Subido por:</span> {evidence.uploaded_by}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Fecha:</span> {new Date(evidence.created_at).toLocaleDateString('es-ES')}
              </p>
              {evidence.tickets && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Ticket:</span> #{evidence.tickets.ticket_number}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || !fileName.trim()}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};