
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Mail, X } from 'lucide-react';
import DocumentPreview from '../settings/DocumentPreview';

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentType: 'invoice' | 'quotation' | 'delivery_note' | 'purchase_order';
  documentData?: any;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  isOpen,
  onClose,
  documentId,
  documentType,
  documentData
}) => {
  const handleDownload = () => {
    console.log(`Downloading ${documentType} ${documentId}`);
    // Implementar lógica de descarga PDF
  };

  const handleEmail = () => {
    console.log(`Emailing ${documentType} ${documentId}`);
    // Implementar lógica de envío por correo
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Vista Previa - {documentId}</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download size={16} className="mr-2" />
                Descargar PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleEmail}>
                <Mail size={16} className="mr-2" />
                Enviar por Correo
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X size={16} />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="bg-gray-100 p-6 rounded-lg">
          <DocumentPreview 
            type={documentType}
            templateId="modern"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
