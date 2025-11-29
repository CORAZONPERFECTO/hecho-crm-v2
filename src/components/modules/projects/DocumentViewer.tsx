
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ExternalLink, Star } from 'lucide-react';
import { ProjectDocument } from '@/hooks/useProjectDocuments';

interface DocumentViewerProps {
  document: ProjectDocument;
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, onClose }) => {
  const documentUrl = `https://vwyquuwxhwgvzageqkww.supabase.co/storage/v1/object/public/project-scanned-documents/${document.file_path}`;

  const handleDownload = () => {
    const link = window.document.createElement('a');
    link.href = documentUrl;
    link.download = document.name;
    link.click();
  };

  const handleOpenExternal = () => {
    window.open(documentUrl, '_blank');
  };

  const isImage = document.file_type.startsWith('image/');
  const isPdf = document.file_type === 'application/pdf';

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DialogTitle className="truncate">{document.name}</DialogTitle>
              {document.is_key_document && (
                <Star className="h-4 w-4 text-yellow-500" />
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
              <Button variant="outline" size="sm" onClick={handleOpenExternal}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Metadatos del documento */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
            {document.document_type && (
              <div>
                <span className="font-medium text-gray-600">Tipo:</span>
                <Badge 
                  variant="outline" 
                  className="ml-2"
                  style={{ borderColor: document.document_type.color }}
                >
                  {document.document_type.name}
                </Badge>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-600">Tamaño:</span>
              <span className="ml-2">{formatFileSize(document.file_size)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Subido:</span>
              <span className="ml-2">{new Date(document.created_at).toLocaleDateString('es-DO')}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Formato:</span>
              <span className="ml-2 uppercase">{document.file_type.split('/').pop()}</span>
            </div>
          </div>

          {/* Descripción */}
          {document.description && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Descripción</h4>
              <p className="text-blue-800 text-sm">{document.description}</p>
            </div>
          )}

          {/* Vista previa del documento */}
          <div className="border rounded-lg overflow-hidden">
            {isImage && (
              <div className="flex justify-center p-4">
                <img
                  src={documentUrl}
                  alt={document.name}
                  className="max-w-full max-h-96 object-contain"
                />
              </div>
            )}

            {isPdf && (
              <div className="h-96">
                <iframe
                  src={`${documentUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                  className="w-full h-full"
                  title={document.name}
                />
              </div>
            )}

            {!isImage && !isPdf && (
              <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                <p className="text-lg font-medium">Vista previa no disponible</p>
                <p className="text-sm">Usa los botones "Descargar" o "Abrir" para ver el documento</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
