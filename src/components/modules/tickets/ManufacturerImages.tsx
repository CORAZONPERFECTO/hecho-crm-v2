
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  Image, 
  Plus,
  Trash2,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface ManufacturerImage {
  id: string;
  manufacturer: string;
  imageUrl: string;
  description: string;
  boardType: string;
}

interface ManufacturerImagesProps {
  onClose: () => void;
  onImport: (images: ManufacturerImage[]) => void;
  manufacturers: string[];
  existingImages: ManufacturerImage[];
}

const ManufacturerImages: React.FC<ManufacturerImagesProps> = ({
  onClose,
  onImport,
  manufacturers,
  existingImages
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [description, setDescription] = useState('');
  const [boardType, setBoardType] = useState('');
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [images, setImages] = useState<ManufacturerImage[]>(existingImages);

  const boardTypes = [
    'Principal',
    'Controladora', 
    'Inverter',
    'Display',
    'Sensores',
    'Alimentación',
    'Comunicación',
    'Otros'
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} no es una imagen válida`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} es demasiado grande. Máximo 5MB por imagen.`);
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
    
    // Crear previsualizaciones
    const previews: string[] = [];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push(e.target?.result as string);
        if (previews.length === validFiles.length) {
          setPreviewImages(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddImages = () => {
    if (!selectedManufacturer) {
      toast.error('Selecciona un fabricante');
      return;
    }
    
    if (selectedFiles.length === 0) {
      toast.error('Selecciona al menos una imagen');
      return;
    }

    if (!description.trim()) {
      toast.error('Ingresa una descripción');
      return;
    }

    if (!boardType) {
      toast.error('Selecciona el tipo de tarjeta');
      return;
    }

    // En una aplicación real, aquí subirías las imágenes a un servicio de almacenamiento
    // Por ahora, usamos las URLs de previsualización
    const newImages: ManufacturerImage[] = previewImages.map((previewUrl, index) => ({
      id: `img-${Date.now()}-${index}`,
      manufacturer: selectedManufacturer,
      imageUrl: previewUrl,
      description: description.trim(),
      boardType: boardType
    }));

    setImages(prev => [...prev, ...newImages]);
    
    // Limpiar formulario
    setSelectedFiles([]);
    setPreviewImages([]);
    setDescription('');
    setBoardType('');
    
    toast.success(`${newImages.length} imagen(es) agregada(s) exitosamente`);
  };

  const handleRemoveImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    toast.success('Imagen eliminada');
  };

  const handleSaveChanges = () => {
    const newImages = images.filter(img => 
      !existingImages.some(existing => existing.id === img.id)
    );
    
    if (newImages.length > 0) {
      onImport(newImages);
      toast.success(`${newImages.length} nueva(s) imagen(es) guardada(s)`);
    } else {
      toast.info('No hay cambios para guardar');
    }
  };

  const getImagesByManufacturer = (manufacturer: string) => {
    return images.filter(img => img.manufacturer === manufacturer);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Image size={20} className="text-blue-600" />
            Gestionar Fotos de Tarjetas Electrónicas
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={16} />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Formulario para agregar nuevas imágenes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-4">Agregar Nuevas Fotos</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Fabricante</label>
                <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar fabricante" />
                  </SelectTrigger>
                  <SelectContent>
                    {manufacturers.map(manufacturer => (
                      <SelectItem key={manufacturer} value={manufacturer}>
                        {manufacturer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Tarjeta</label>
                <Select value={boardType} onValueChange={setBoardType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de tarjeta" />
                  </SelectTrigger>
                  <SelectContent>
                    {boardTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <Input
                  placeholder="Ej: Tarjeta principal modelo X123"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Plus size={16} className="mr-2" />
                  Seleccionar Imágenes
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Máximo 5MB por imagen. Formatos: JPG, PNG, WebP
                </p>
              </div>

              {/* Vista previa de imágenes seleccionadas */}
              {previewImages.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Vista Previa:</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {previewImages.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleAddImages}
                disabled={!selectedManufacturer || selectedFiles.length === 0 || !description.trim() || !boardType}
                className="w-full"
              >
                <Plus size={16} className="mr-2" />
                Agregar Imágenes
              </Button>
            </div>
          </div>

          {/* Lista de imágenes por fabricante */}
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Imágenes Existentes</h4>
            
            {manufacturers.map(manufacturer => {
              const manufacturerImages = getImagesByManufacturer(manufacturer);
              
              if (manufacturerImages.length === 0) return null;
              
              return (
                <div key={manufacturer} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-blue-700">{manufacturer}</h5>
                    <Badge variant="outline">
                      {manufacturerImages.length} imagen(es)
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {manufacturerImages.map(img => (
                      <div key={img.id} className="relative group">
                        <img
                          src={img.imageUrl}
                          alt={img.description}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg transition-all flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => window.open(img.imageUrl, '_blank')}
                            >
                              <Eye size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemoveImage(img.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs mb-1">
                            {img.boardType}
                          </Badge>
                          <p className="text-xs text-gray-600 truncate">
                            {img.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {images.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Image size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No hay imágenes agregadas aún</p>
                <p className="text-sm">Agrega fotos de tarjetas electrónicas para ayudar a los técnicos</p>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            
            <Button
              onClick={handleSaveChanges}
              disabled={images.length === existingImages.length}
              className="bg-green-600 hover:bg-green-700"
            >
              <Upload size={16} className="mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManufacturerImages;
