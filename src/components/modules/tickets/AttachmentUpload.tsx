
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Upload, File } from 'lucide-react';
import { Ticket } from './types';

interface AttachmentUploadProps {
  ticket: Ticket;
  onClose: () => void;
  onAddAttachment: (ticketId: string, fileName: string) => void;
}

const AttachmentUpload: React.FC<AttachmentUploadProps> = ({ 
  ticket, 
  onClose,
  onAddAttachment
}) => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    
    // Simular subida de múltiples archivos
    setTimeout(() => {
      Array.from(selectedFiles).forEach(file => {
        onAddAttachment(ticket.id, file.name);
      });
      setIsUploading(false);
      onClose();
    }, 1500);
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-gray-800">
            Adjuntar Archivo - {ticket.ticketNumber}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <Label>Seleccionar Múltiples Archivos</Label>
            <Input 
              type="file" 
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.jpg,.png,.gif"
              className="cursor-pointer"
              multiple
            />
            <p className="text-sm text-gray-500 mt-1">
              Archivos permitidos: PDF, DOC, DOCX, TXT, JPG, PNG, GIF (Max: 500MB) - Mantén Ctrl/Cmd para seleccionar múltiples
            </p>
          </div>
          
          {selectedFiles && selectedFiles.length > 0 && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <Label className="text-sm font-medium mb-2 block">Archivos Seleccionados ({selectedFiles.length})</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {Array.from(selectedFiles).map((file, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <File size={16} className="text-gray-500" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {ticket.attachments.length > 0 && (
            <div>
              <Label>Archivos Existentes</Label>
              <div className="space-y-2 mt-2">
                {ticket.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <File size={16} className="text-gray-500" />
                    <span className="text-sm">{attachment}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex space-x-3 pt-4">
            <Button 
              onClick={handleUpload}
              disabled={!selectedFiles || selectedFiles.length === 0 || isUploading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Upload size={16} className="mr-2" />
              {isUploading ? 'Subiendo...' : `Subir ${selectedFiles?.length || 0} Archivo(s)`}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttachmentUpload;
