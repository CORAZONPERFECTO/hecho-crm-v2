
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, X } from 'lucide-react';
import { useProjectDocuments, ProjectDocumentType } from '@/hooks/useProjectDocuments';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadDialogProps {
  projectId: string;
  documentTypes: ProjectDocumentType[];
  onClose: () => void;
}

const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  projectId,
  documentTypes,
  onClose
}) => {
  const { uploadDocument } = useProjectDocuments(projectId);
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [documentTypeId, setDocumentTypeId] = useState('');
  const [isKeyDocument, setIsKeyDocument] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
    
    // Auto-completar el nombre si solo hay un archivo
    if (selectedFiles.length === 1 && !name) {
      setName(selectedFiles[0].name.split('.')[0]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Selecciona al menos un archivo",
        variant: "destructive"
      });
      return;
    }

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Ingresa un nombre para el documento",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      
      for (const file of files) {
        const documentName = files.length === 1 ? name : `${name} - ${file.name}`;
        await uploadDocument(
          file,
          documentName,
          description || undefined,
          documentTypeId || undefined,
          isKeyDocument
        );
      }

      toast({
        title: "Éxito",
        description: `${files.length} documento(s) subido(s) correctamente`
      });
      
      onClose();
    } catch (error) {
      console.error('Error uploading documents:', error);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getFileTypeColor = (fileType: string) => {
    if (fileType.includes('pdf')) return 'text-red-600';
    if (fileType.includes('image')) return 'text-blue-600';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subir Documentos Escaneados</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selector de archivos */}
          <div>
            <Label htmlFor="file-upload">Seleccionar Archivos</Label>
            <div className="mt-2">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Clic para subir</span> o arrastra archivos aquí
                  </p>
                  <p className="text-xs text-gray-500">PDF, PNG, JPG, XLS, DOC (MAX. 500MB)</p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.xls,.xlsx,.doc,.docx,.dwg"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Lista de archivos seleccionados */}
          {files.length > 0 && (
            <div>
              <Label>Archivos Seleccionados ({files.length})</Label>
              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${getFileTypeColor(file.type)}`}>
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Información del documento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre del Documento *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Planos Eléctricos Principal"
              />
            </div>

            <div>
              <Label htmlFor="document-type">Tipo de Documento</Label>
              <Select value={documentTypeId} onValueChange={setDocumentTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional del documento..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="key-document"
              checked={isKeyDocument}
              onCheckedChange={(checked) => setIsKeyDocument(checked === true)}
            />
            <Label htmlFor="key-document" className="text-sm">
              Marcar como documento clave del proyecto
            </Label>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={uploading}>
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? 'Subiendo...' : 'Subir Documentos'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadDialog;
