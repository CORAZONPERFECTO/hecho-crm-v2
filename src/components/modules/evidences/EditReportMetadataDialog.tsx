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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useReportConfigs } from '@/hooks/useReportConfigs';
import { RichTextEditor } from './RichTextEditor';
import { FileText, Save, X, Settings, BookOpen, Wand2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ReportMetadata {
  ticketNumber?: string;
  ticketTitle?: string;
  clientName?: string;
  description?: string;
}

interface EditReportMetadataDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (metadata: ReportMetadata) => void;
  initialData?: ReportMetadata;
  evidencesCount: number;
}

export const EditReportMetadataDialog: React.FC<EditReportMetadataDialogProps> = ({
  open,
  onClose,
  onSave,
  initialData = {},
  evidencesCount
}) => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticketTitle, setTicketTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const { toast } = useToast();
  const { getLastUsedConfig, saveConfig, updateConfig } = useReportConfigs();

  useEffect(() => {
    if (open) {
      // Cargar datos iniciales o última configuración usada
      if (initialData && (initialData.ticketNumber || initialData.ticketTitle || initialData.clientName || initialData.description)) {
        setTicketNumber(initialData.ticketNumber || '');
        setTicketTitle(initialData.ticketTitle || '');
        setClientName(initialData.clientName || '');
        setDescription(initialData.description || '');
      } else {
        // Cargar última configuración guardada
        const lastConfig = getLastUsedConfig();
        if (lastConfig) {
          setTicketNumber(lastConfig.ticketNumber || '');
          setTicketTitle(lastConfig.ticketTitle || '');
          setClientName(lastConfig.clientName || '');
          setDescription(lastConfig.description || '');
        }
      }
    }
  }, [initialData, open, getLastUsedConfig]);

  const handleSave = async () => {
    const metadata: ReportMetadata = {
      ticketNumber: ticketNumber.trim() || undefined,
      ticketTitle: ticketTitle.trim() || undefined,
      clientName: clientName.trim() || undefined,
      description: description.trim() || undefined
    };

    // Guardar en base de datos si hay información para guardar
    if (metadata.ticketNumber || metadata.ticketTitle || metadata.clientName || metadata.description) {
      try {
        await saveConfig({
          ticketNumber: metadata.ticketNumber,
          ticketTitle: metadata.ticketTitle,
          clientName: metadata.clientName,
          description: metadata.description
        }, saveAsDefault);
      } catch (error) {
        // Error ya manejado en el hook
        return;
      }
    }

    onSave(metadata);
    onClose();

    toast({
      title: "Reporte configurado",
      description: saveAsDefault ? "Configuración guardada como predeterminada" : "Configuración guardada para este reporte"
    });
  };

  const handleClose = () => {
    if (initialData) {
      setTicketNumber(initialData.ticketNumber || '');
      setTicketTitle(initialData.ticketTitle || '');
      setClientName(initialData.clientName || '');
      setDescription(initialData.description || '');
    }
    onClose();
  };

  const handleAutoFormat = async () => {
    if (!description || description.trim().length === 0) {
      toast({
        title: "Sin contenido",
        description: "Escribe una descripción antes de formatear",
        variant: "destructive"
      });
      return;
    }

    setIsFormatting(true);
    try {
      const { data, error } = await supabase.functions.invoke('format-technical-report', {
        body: { text: description }
      });

      if (error) throw error;

      if (data?.formattedText) {
        setDescription(data.formattedText);
        toast({
          title: "✨ Texto formateado",
          description: "Se aplicó el formato de reporte técnico profesional"
        });
      }
    } catch (error: any) {
      console.error('Error al formatear:', error);
      toast({
        title: "Error al formatear",
        description: error.message || "No se pudo aplicar el formato automático",
        variant: "destructive"
      });
    } finally {
      setIsFormatting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Configuración del Reporte de Evidencias
          </DialogTitle>
          <DialogDescription>
            Configure los detalles que aparecerán en su reporte profesional. Este documento incluirá {evidencesCount} evidencia{evidencesCount !== 1 ? 's' : ''} con formato optimizado para presentación y archivo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ticketNumber">Número de Ticket</Label>
              <Input
                id="ticketNumber"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                placeholder="Ej: TK-2024-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientName">Cliente</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nombre del cliente"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticketTitle">Nombre del Proyecto</Label>
            <Input
              id="ticketTitle"
              value={ticketTitle}
              onChange={(e) => setTicketTitle(e.target.value)}
              placeholder="Título o nombre del proyecto"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Descripción del Servicio Realizado</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoFormat}
                disabled={isFormatting || !description}
                className="h-8 gap-2"
              >
                <Wand2 className="w-3.5 h-3.5" />
                {isFormatting ? "Formateando..." : "Auto-Formato Reporte Técnico"}
              </Button>
            </div>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              onSave={() => handleSave()}
              placeholder="Describe el trabajo realizado, metodología empleada, resultados obtenidos..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="saveAsDefault"
              checked={saveAsDefault}
              onCheckedChange={(checked) => setSaveAsDefault(checked === true)}
            />
            <Label 
              htmlFor="saveAsDefault" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Guardar como configuración predeterminada
            </Label>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Vista previa del reporte:</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><span className="font-medium">Cliente:</span> {clientName || 'Sin especificar'}</p>
              <p><span className="font-medium">Proyecto:</span> {ticketTitle || 'Sin especificar'}</p>
              <p><span className="font-medium">Ticket:</span> {ticketNumber || 'Sin especificar'}</p>
              <p><span className="font-medium">Total evidencias:</span> {evidencesCount}</p>
              <p><span className="font-medium">Fecha del reporte:</span> {new Date().toLocaleDateString('es-ES')}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Generar Reporte
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};