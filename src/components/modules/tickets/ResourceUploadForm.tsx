
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Upload, FileImage, FileText } from 'lucide-react';
import { ResourceCategory, ResourceFile } from './ResourcesTypes';

interface ResourceUploadFormProps {
  categories: ResourceCategory[];
  currentUser: string;
  onClose: () => void;
  onUpload: (categoryId: string, file: Omit<ResourceFile, 'id'>) => void;
}

const ResourceUploadForm: React.FC<ResourceUploadFormProps> = ({
  categories,
  currentUser,
  onClose,
  onUpload
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<'image' | 'pdf' | 'guide'>('guide');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategoryId || !fileName || !fileUrl) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const newFile: Omit<ResourceFile, 'id'> = {
      name: fileName,
      url: fileUrl,
      type: fileType,
      description,
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser
    };

    onUpload(selectedCategoryId, newFile);
    onClose();
  };

  return (
    <Card className="max-w-2xl mx-auto border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
            <Upload size={24} className="mr-2" />
            Subir Nuevo Recurso
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="category">Categoría de Recurso *</Label>
            <Select onValueChange={setSelectedCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex flex-col">
                      <span>{category.name}</span>
                      <span className="text-xs text-gray-500">
                        {category.manufacturer} - {category.brand}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fileName">Nombre del Archivo *</Label>
            <Input
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Ej: Manual de reparación modelo X200"
              required
            />
          </div>

          <div>
            <Label htmlFor="fileType">Tipo de Archivo *</Label>
            <Select onValueChange={(value: 'image' | 'pdf' | 'guide') => setFileType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="guide">
                  <div className="flex items-center">
                    <FileText size={16} className="mr-2" />
                    Guía/Manual (PDF)
                  </div>
                </SelectItem>
                <SelectItem value="image">
                  <div className="flex items-center">
                    <FileImage size={16} className="mr-2" />
                    Imagen/Diagrama
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center">
                    <FileText size={16} className="mr-2" />
                    Documento PDF
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fileUrl">URL del Archivo *</Label>
            <Input
              id="fileUrl"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="/resources/archivo.pdf"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Introduce la ruta del archivo subido al servidor
            </p>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional del contenido del archivo..."
              rows={3}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Upload size={16} className="mr-2" />
              Subir Recurso
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ResourceUploadForm;
