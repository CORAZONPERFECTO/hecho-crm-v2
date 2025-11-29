
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Download, Mail, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateSalesPDF } from './utils/salesPDFGenerator';

interface DocumentActionsProps {
  documentId: string;
  documentType: 'invoice' | 'quotation' | 'delivery_note' | 'recurring' | 'payment' | 'credit';
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const DocumentActions: React.FC<DocumentActionsProps> = ({ 
  documentId, 
  documentType, 
  onView, 
  onEdit 
}) => {
  const { toast } = useToast();

  const handleView = () => {
    if (onView) {
      onView(documentId);
    } else {
      toast({
        title: "Vista previa",
        description: `Abriendo vista previa del documento ${documentId}`,
      });
    }
  };

  const handleDownload = async () => {
    toast({
      title: "Generando PDF",
      description: `Generando PDF del documento ${documentId}`,
    });
    
    try {
      // Create sample data for PDF generation
      const sampleData = {
        type: documentType as 'quotation' | 'invoice' | 'receipt',
        title: documentType === 'quotation' ? 'Cotización' : 
               documentType === 'invoice' ? 'Factura' : 'Recibo',
        number: documentId,
        clientName: 'Cliente de Ejemplo',
        items: [
          {
            id: '1',
            description: 'Servicio de ejemplo',
            quantity: 1,
            unitPrice: 1000,
          }
        ],
        subtotal: 1000,
        discount: 0,
        tax: 180,
        total: 1180,
        notes: 'Documento generado desde el módulo de ventas',
        date: new Date().toLocaleDateString('es-DO'),
      };
      
      await generateSalesPDF(sampleData);
      
      toast({
        title: "PDF generado",
        description: "El documento PDF ha sido descargado exitosamente",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      });
    }
  };

  const handleEmail = () => {
    toast({
      title: "Enviando por correo",
      description: `Enviando documento ${documentId} por correo electrónico`,
    });
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(documentId);
    } else {
      toast({
        title: "Editar documento",
        description: `Abriendo editor para el documento ${documentId}`,
      });
    }
  };

  return (
    <div className="flex space-x-1">
      <Button variant="ghost" size="sm" onClick={handleView} title="Ver documento">
        <Eye size={16} />
      </Button>
      <Button variant="ghost" size="sm" onClick={handleDownload} title="Descargar PDF">
        <Download size={16} />
      </Button>
      <Button variant="ghost" size="sm" onClick={handleEmail} title="Enviar por correo">
        <Mail size={16} />
      </Button>
      <Button variant="ghost" size="sm" onClick={handleEdit} title="Editar documento">
        <Edit size={16} />
      </Button>
    </div>
  );
};

export default DocumentActions;
