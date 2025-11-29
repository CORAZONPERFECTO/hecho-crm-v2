
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Search, 
  FileImage, 
  FileText, 
  Download,
  Plus,
  Upload,
  Trash2
} from 'lucide-react';
import { ResourceCategory, ResourceFile, ResourcesModuleProps } from './ResourcesTypes';
import ResourceUploadForm from './ResourceUploadForm';

const ResourcesArea: React.FC<ResourcesModuleProps> = ({ userRole, currentUser }) => {
  const [resources, setResources] = useState<ResourceCategory[]>([
    {
      id: '1',
      name: 'Errores Comunes',
      manufacturer: 'Samsung',
      brand: 'Aire Acondicionado',
      description: 'Guías para errores frecuentes en equipos Samsung',
      files: [
        {
          id: 'f1',
          name: 'Error E1 - Sensor de Temperatura',
          url: '/resources/samsung-e1.pdf',
          type: 'guide',
          description: 'Procedimiento para diagnosticar error E1',
          uploadedAt: '2025-06-15T10:00:00',
          uploadedBy: 'Admin'
        },
        {
          id: 'f2',
          name: 'Diagrama de Conexiones',
          url: '/resources/samsung-diagram.jpg',
          type: 'image',
          description: 'Diagrama eléctrico del modelo X200',
          uploadedAt: '2025-06-15T11:00:00',
          uploadedBy: 'Admin'
        }
      ],
      createdAt: '2025-06-15T09:00:00',
      isActive: true
    },
    {
      id: '2',
      name: 'Mantenimiento Preventivo',
      manufacturer: 'LG',
      brand: 'Refrigeración',
      description: 'Procedimientos de mantenimiento para equipos LG',
      files: [
        {
          id: 'f3',
          name: 'Limpieza de Evaporador',
          url: '/resources/lg-cleaning.pdf',
          type: 'guide',
          description: 'Proceso de limpieza paso a paso',
          uploadedAt: '2025-06-14T15:00:00',
          uploadedBy: 'Admin'
        }
      ],
      createdAt: '2025-06-14T14:00:00',
      isActive: true
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('all');
  const [showUploadForm, setShowUploadForm] = useState(false);

  const manufacturers = [...new Set(resources.map(r => r.manufacturer))];
  
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesManufacturer = selectedManufacturer === 'all' || resource.manufacturer === selectedManufacturer;
    return matchesSearch && matchesManufacturer && resource.isActive;
  });

  const handleUploadResource = (categoryId: string, file: Omit<ResourceFile, 'id'>) => {
    const newFile: ResourceFile = {
      ...file,
      id: Math.random().toString(36).substr(2, 9)
    };

    setResources(prev => 
      prev.map(category =>
        category.id === categoryId
          ? { ...category, files: [...category.files, newFile] }
          : category
      )
    );

    console.log('Archivo subido:', newFile);
  };

  const handleDeleteFile = (categoryId: string, fileId: string) => {
    setResources(prev =>
      prev.map(category =>
        category.id === categoryId
          ? { ...category, files: category.files.filter(f => f.id !== fileId) }
          : category
      )
    );
  };

  if (showUploadForm) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <ResourceUploadForm
          categories={resources}
          currentUser={currentUser}
          onClose={() => setShowUploadForm(false)}
          onUpload={handleUploadResource}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BookOpen size={32} className="mr-3 text-blue-600" />
            Área de Recursos Técnicos
          </h1>
          <p className="text-gray-600">
            Guías, diagramas y recursos para soporte técnico
          </p>
        </div>
        {userRole === 'admin' && (
          <Button 
            onClick={() => setShowUploadForm(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Plus size={20} className="mr-2" />
            Subir Recurso
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search size={20} className="mr-2" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                placeholder="Buscar por nombre, marca o fabricante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <select
                value={selectedManufacturer}
                onChange={(e) => setSelectedManufacturer(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los fabricantes</option>
                {manufacturers.map(manufacturer => (
                  <option key={manufacturer} value={manufacturer}>
                    {manufacturer}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(category => (
          <Card key={category.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <div className="flex space-x-2 mt-2">
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      {category.manufacturer}
                    </Badge>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      {category.brand}
                    </Badge>
                  </div>
                </div>
              </div>
              {category.description && (
                <p className="text-sm text-gray-600 mt-2">{category.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700">
                  Archivos disponibles ({category.files.length})
                </div>
                {category.files.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {file.type === 'image' ? (
                        <FileImage size={16} className="text-purple-600" />
                      ) : (
                        <FileText size={16} className="text-blue-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        {file.description && (
                          <p className="text-xs text-gray-500">{file.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="p-2">
                        <Download size={14} />
                      </Button>
                      {userRole === 'admin' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteFile(category.id, file.id)}
                          className="p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              No se encontraron recursos
            </h3>
            <p className="text-gray-500">
              Ajusta los filtros de búsqueda o contacta al administrador para agregar recursos.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResourcesArea;
