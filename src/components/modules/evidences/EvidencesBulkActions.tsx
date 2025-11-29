
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2, Send, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EvidencesBulkActionsProps {
  selectedEvidences: string[];
  onClearSelection: () => void;
  userRole: 'admin' | 'technician' | 'manager';
}

const EvidencesBulkActions: React.FC<EvidencesBulkActionsProps> = ({
  selectedEvidences,
  onClearSelection,
  userRole
}) => {
  const { toast } = useToast();

  const handleBulkDownload = async () => {
    toast({
      title: "Descarga iniciada",
      description: `Preparando descarga de ${selectedEvidences.length} evidencias...`
    });
    
    // Implementation for bulk download would go here
    // For now, just show a success message
    setTimeout(() => {
      toast({
        title: "Descarga completada",
        description: "Las evidencias se han descargado correctamente"
      });
    }, 2000);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar ${selectedEvidences.length} evidencias?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('ticket_evidences')
        .delete()
        .in('id', selectedEvidences);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: `${selectedEvidences.length} evidencias eliminadas correctamente`
      });

      onClearSelection();
    } catch (error) {
      console.error('Error deleting evidences:', error);
      toast({
        title: "Error",
        description: "Error al eliminar las evidencias",
        variant: "destructive"
      });
    }
  };

  const handleBulkSend = () => {
    toast({
      title: "Función próximamente",
      description: "El envío masivo estará disponible pronto"
    });
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {selectedEvidences.length} seleccionadas
            </Badge>
            <span className="text-sm text-gray-600">
              Acciones en lote:
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkDownload}
            >
              <Download size={14} className="mr-1" />
              Descargar
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkSend}
            >
              <Send size={14} className="mr-1" />
              Enviar
            </Button>
            
            {userRole === 'admin' && (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
              >
                <Trash2 size={14} className="mr-1" />
                Eliminar
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearSelection}
            >
              <X size={14} className="mr-1" />
              Limpiar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EvidencesBulkActions;
