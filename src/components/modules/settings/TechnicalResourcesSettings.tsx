import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, Edit, Trash2, Save, X, AlertTriangle, Wrench, RefreshCw, Database, Upload, FileSpreadsheet } from 'lucide-react';
import { useTechnicalResources, TechnicalResource, ManufacturerImage } from '@/hooks/useTechnicalResources';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const TechnicalResourcesSettings: React.FC = () => {
  const {
    resources,
    manufacturerImages,
    loading,
    createResource,
    updateResource,
    deleteResource,
    createManufacturerImage,
    updateManufacturerImage,
    deleteManufacturerImage,
    getUniqueManufacturers,
    getUniqueCategories,
    loadResources
  } = useTechnicalResources();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<TechnicalResource | null>(null);
  const [importData, setImportData] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [formData, setFormData] = useState({
    manufacturer: '',
    error_code: '',
    error_description: '',
    cause: '',
    solution: '',
    category: '',
    difficulty: 'medio' as 'facil' | 'medio' | 'dificil'
  });
  const [imageFormData, setImageFormData] = useState({
    manufacturer: '',
    image_url: '',
    description: '',
    board_type: ''
  });

  // Filtrar recursos
  const filteredResources = React.useMemo(() => {
    console.log('🔍 Filtrando recursos - Total disponibles:', resources.length);
    console.log('📋 Lista completa de recursos:', resources.map(r => ({ manufacturer: r.manufacturer, code: r.error_code })));
    
    let filtered = [...resources];

    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      console.log('🔎 Aplicando filtro de búsqueda:', searchLower);
      
      filtered = filtered.filter(resource => {
        const matchesCode = resource.error_code?.toLowerCase().includes(searchLower);
        const matchesDescription = resource.error_description?.toLowerCase().includes(searchLower);
        const matchesManufacturer = resource.manufacturer?.toLowerCase().includes(searchLower);
        const matchesCause = resource.cause?.toLowerCase().includes(searchLower);
        const matchesSolution = resource.solution?.toLowerCase().includes(searchLower);
        return matchesCode || matchesDescription || matchesManufacturer || matchesCause || matchesSolution;
      });
      
      console.log('📋 Después del filtro de búsqueda:', filtered.length);
    }

    if (selectedManufacturer && selectedManufacturer !== 'all') {
      console.log('🏭 Aplicando filtro de fabricante:', selectedManufacturer);
      filtered = filtered.filter(resource => resource.manufacturer === selectedManufacturer);
      console.log('📋 Después del filtro de fabricante:', filtered.length);
    }

    console.log('✅ Recursos filtrados finales:', filtered.map(r => ({ manufacturer: r.manufacturer, code: r.error_code })));
    return filtered;
  }, [searchTerm, selectedManufacturer, resources]);

  const handleCreateResource = async () => {
    try {
      if (!formData.manufacturer || !formData.error_code || !formData.error_description) {
        toast.error('Por favor completa los campos obligatorios');
        return;
      }
      await createResource(formData);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating resource:', error);
    }
  };

  const handleEditResource = async () => {
    if (!editingResource) return;
    
    try {
      await updateResource(editingResource.id, formData);
      setIsEditDialogOpen(false);
      setEditingResource(null);
      resetForm();
    } catch (error) {
      console.error('Error updating resource:', error);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este error técnico?')) {
      try {
        await deleteResource(id);
      } catch (error) {
        console.error('Error deleting resource:', error);
      }
    }
  };

  const handleCreateImage = async () => {
    try {
      if (!imageFormData.manufacturer || !imageFormData.image_url) {
        toast.error('Por favor completa los campos obligatorios');
        return;
      }
      await createManufacturerImage(imageFormData);
      setIsImageDialogOpen(false);
      resetImageForm();
    } catch (error) {
      console.error('Error creating image:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      manufacturer: '',
      error_code: '',
      error_description: '',
      cause: '',
      solution: '',
      category: '',
      difficulty: 'medio'
    });
  };

  const resetImageForm = () => {
    setImageFormData({
      manufacturer: '',
      image_url: '',
      description: '',
      board_type: ''
    });
  };

  const openEditDialog = (resource: TechnicalResource) => {
    setEditingResource(resource);
    setFormData({
      manufacturer: resource.manufacturer || '',
      error_code: resource.error_code || '',
      error_description: resource.error_description || '',
      cause: resource.cause || '',
      solution: resource.solution || '',
      category: resource.category || '',
      difficulty: resource.difficulty || 'medio'
    });
    setIsEditDialogOpen(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facil': return 'bg-green-100 text-green-800';
      case 'medio': return 'bg-yellow-100 text-yellow-800';
      case 'dificil': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'facil': return 'Fácil';
      case 'medio': return 'Medio';
      case 'dificil': return 'Difícil';
      default: return 'Medio';
    }
  };

  const handleRefresh = async () => {
    try {
      console.log('🔄 Actualizando datos desde la base de datos...');
      await loadResources();
      toast.success('Datos actualizados desde la base de datos');
    } catch (error) {
      console.error('❌ Error al actualizar:', error);
      toast.error('Error al actualizar los datos');
    }
  };

  // Debug: Log de fabricantes únicos
  const uniqueManufacturers = getUniqueManufacturers();
  console.log('🏭 Fabricantes únicos detectados:', uniqueManufacturers);

  // Función para manejar la importación de Excel con el nuevo formato
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📁 [IMPORT] Archivo seleccionado:', file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log('📊 [IMPORT] Datos extraídos del Excel:', jsonData);
        
        // Mapear los datos del Excel al formato esperado con el nuevo esquema
        const mappedData = jsonData.map((row: any, index: number) => {
          console.log(`📋 [IMPORT] Procesando fila ${index + 1}:`, row);
          
          // Buscar las columnas con el nuevo formato
          const tipo = row['TIPO'] || row['Tipo'] || row['tipo'] || '';
          const manufacturer = row['Fabricante'] || row['FABRICANTE'] || row['fabricante'] || row['Manufacturer'] || '';
          const error_code = row['Código de Error'] || row['CÓDIGO DE ERROR'] || row['codigo de error'] || row['Error Code'] || row['Code'] || '';
          const error_description = row['Descripción del Error'] || row['DESCRIPCIÓN DEL ERROR'] || row['descripcion del error'] || row['Description'] || '';
          const cause = row['Causas Posibles'] || row['CAUSAS POSIBLES'] || row['causas posibles'] || row['Cause'] || '';
          
          // Combinar las tres columnas de solución en una sola
          const solution1 = row['Cómo Solucionarlo (1)'] || row['CÓMO SOLUCIONARLO (1)'] || row['como solucionarlo (1)'] || '';
          const solution2 = row['Cómo Solucionarlo (2)'] || row['CÓMO SOLUCIONARLO (2)'] || row['como solucionarlo (2)'] || '';
          const solution3 = row['Cómo Solucionarlo (3)'] || row['CÓMO SOLUCIONARLO (3)'] || row['como solucionarlo (3)'] || '';
          
          // Crear una solución combinada, filtrando valores vacíos
          const solutions = [solution1, solution2, solution3]
            .filter(sol => sol && String(sol).trim())
            .map((sol, idx) => `${idx + 1}. ${String(sol).trim()}`)
            .join('\n');
          
          return {
            manufacturer: String(manufacturer).trim(),
            error_code: String(error_code).trim(),
            error_description: String(error_description).trim(),
            cause: String(cause).trim(),
            solution: solutions || 'No especificado',
            category: String(tipo).trim() || 'General',
            difficulty: 'medio' as const
          };
        }).filter(item => 
          item.manufacturer && 
          item.error_code && 
          item.error_description
        );
        
        console.log('✅ [IMPORT] Datos mapeados y filtrados:', mappedData);
        setImportData(mappedData);
        setIsImportDialogOpen(true);
        
        toast.success(`${mappedData.length} registros listos para importar`);
        
      } catch (error) {
        console.error('❌ [IMPORT] Error procesando Excel:', error);
        toast.error('Error al procesar el archivo Excel');
      }
    };
    
    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };

  // Función para confirmar la importación
  const handleConfirmImport = async () => {
    if (importData.length === 0) return;
    
    setImporting(true);
    console.log('🚀 [IMPORT] Iniciando importación de', importData.length, 'registros...');
    
    try {
      let successCount = 0;
      let errorCount = 0;
      
      for (const item of importData) {
        try {
          await createResource(item);
          successCount++;
          console.log(`✅ [IMPORT] Registro ${successCount} importado:`, item.error_code);
        } catch (error) {
          errorCount++;
          console.error(`❌ [IMPORT] Error importando registro:`, item.error_code, error);
        }
      }
      
      console.log('📊 [IMPORT] Resumen:', { successCount, errorCount });
      
      if (successCount > 0) {
        toast.success(`${successCount} errores técnicos importados exitosamente`);
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} registros no se pudieron importar (posiblemente duplicados)`);
      }
      
      setIsImportDialogOpen(false);
      setImportData([]);
      
    } catch (error) {
      console.error('❌ [IMPORT] Error general en la importación:', error);
      toast.error('Error durante la importación');
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando errores técnicos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Base de Datos de Errores Técnicos</h2>
          <p className="text-gray-600">Gestiona la base de datos de errores, causas y soluciones por fabricante</p>
        </div>
        <div className="flex gap-2">
          {/* Botón de importar Excel */}
          <div className="relative">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="excel-upload"
            />
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <FileSpreadsheet className="w-4 h-4" />
              Importar Excel
            </Button>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sincronizar BD
          </Button>
          <Button onClick={() => setIsImageDialogOpen(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Imagen
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Error
          </Button>
        </div>
      </div>

      {/* Enhanced Info Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-800 mb-3">
          <Database size={16} />
          <span className="font-medium">Estado de la Base de Datos</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <span className="text-blue-600 block font-medium">Total en BD:</span>
            <span className="text-2xl font-bold text-blue-800">{resources.length}</span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <span className="text-blue-600 block font-medium">Mostrados:</span>
            <span className="text-2xl font-bold text-blue-800">{filteredResources.length}</span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <span className="text-blue-600 block font-medium">Fabricantes:</span>
            <span className="text-2xl font-bold text-blue-800">{uniqueManufacturers.length}</span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <span className="text-blue-600 block font-medium">Categorías:</span>
            <span className="text-2xl font-bold text-blue-800">{getUniqueCategories().length}</span>
          </div>
        </div>
        
        {/* Debug info para desarrolladores */}
        <details className="mt-3">
          <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
            Ver información de debug
          </summary>
          <div className="mt-2 p-2 bg-blue-100 rounded text-xs text-blue-800">
            <p><strong>Fabricantes en BD:</strong> {uniqueManufacturers.join(', ') || 'Ninguno'}</p>
            <p><strong>Última actualización:</strong> {new Date().toLocaleString()}</p>
            <p><strong>Filtros activos:</strong> {searchTerm ? `Búsqueda: "${searchTerm}"` : 'Ninguno'} {selectedManufacturer ? `| Fabricante: ${selectedManufacturer}` : ''}</p>
          </div>
        </details>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Buscar por código de error, descripción o fabricante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select 
              value={selectedManufacturer || 'all'} 
              onValueChange={(value) => setSelectedManufacturer(value === 'all' ? '' : value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por fabricante" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los fabricantes</SelectItem>
                {uniqueManufacturers.map(manufacturer => (
                  <SelectItem key={manufacturer} value={manufacturer}>
                    {manufacturer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de recursos */}
      <div className="space-y-4">
        {filteredResources.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {resources.length === 0 ? 'Base de datos vacía' : 'No se encontraron errores'}
              </h3>
              <p className="text-gray-500 mb-4">
                {resources.length === 0 
                  ? 'La base de datos no contiene errores técnicos. Asegúrate de haber importado los datos desde Recursos.'
                  : 'Intenta con otros términos de búsqueda o borra los filtros'
                }
              </p>
              {resources.length === 0 ? (
                <div className="space-y-2">
                  <Button onClick={handleRefresh} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sincronizar con Base de Datos
                  </Button>
                  <p className="text-xs text-gray-400">
                    Si has subido datos en Recursos pero no aparecen aquí, usa el botón de sincronización
                  </p>
                </div>
              ) : (
                (searchTerm || selectedManufacturer) && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedManufacturer('');
                    }}
                    className="mt-2"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpiar filtros
                  </Button>
                )
              )}
            </CardContent>
          </Card>
        ) : (
          filteredResources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge variant="outline" className="text-blue-600 border-blue-200">
                        {resource.manufacturer}
                      </Badge>
                      <span className="font-mono text-red-600 text-xl font-bold">
                        {resource.error_code}
                      </span>
                    </div>
                    <CardTitle className="text-lg text-gray-800">
                      {resource.error_description}
                    </CardTitle>
                  </div>
                  <div className="flex gap-2 flex-col items-end">
                    <Badge className={getDifficultyColor(resource.difficulty)}>
                      {getDifficultyText(resource.difficulty)}
                    </Badge>
                    <Badge variant="outline">
                      {resource.category}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(resource)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteResource(resource.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-orange-700 flex items-center gap-2 mb-2">
                    <AlertTriangle size={16} />
                    Causa probable:
                  </h4>
                  <p className="text-gray-700 bg-orange-50 p-3 rounded-lg">
                    {resource.cause}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-green-700 flex items-center gap-2 mb-2">
                    <Wrench size={16} />
                    Solución:
                  </h4>
                  <div className="text-gray-700 bg-green-50 p-3 rounded-lg">
                    {resource.solution.split('\n').map((line, index) => (
                      <p key={index} className="mb-1 last:mb-0">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog para crear/editar recurso */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setEditingResource(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreateDialogOpen ? 'Nuevo Error Técnico' : 'Editar Error Técnico'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manufacturer">Fabricante *</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  placeholder="Ej: Samsung, LG, Carrier..."
                />
              </div>
              <div>
                <Label htmlFor="error_code">Código de Error *</Label>
                <Input
                  id="error_code"
                  value={formData.error_code}
                  onChange={(e) => setFormData({ ...formData, error_code: e.target.value })}
                  placeholder="Ej: E1, CH05, F0..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="error_description">Descripción del Error *</Label>
              <Input
                id="error_description"
                value={formData.error_description}
                onChange={(e) => setFormData({ ...formData, error_description: e.target.value })}
                placeholder="Ej: Error de sensor de temperatura"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ej: Aire Acondicionado, Calentador..."
                />
              </div>
              <div>
                <Label htmlFor="difficulty">Dificultad</Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(value: 'facil' | 'medio' | 'dificil') => 
                    setFormData({ ...formData, difficulty: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar dificultad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facil">Fácil</SelectItem>
                    <SelectItem value="medio">Medio</SelectItem>
                    <SelectItem value="dificil">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="cause">Causa Probable</Label>
              <Textarea
                id="cause"
                value={formData.cause}
                onChange={(e) => setFormData({ ...formData, cause: e.target.value })}
                placeholder="Describe la causa probable del error..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="solution">Solución</Label>
              <Textarea
                id="solution"
                value={formData.solution}
                onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                placeholder="Describe los pasos para solucionar el error..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setIsEditDialogOpen(false);
                  setEditingResource(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button onClick={isCreateDialogOpen ? handleCreateResource : handleEditResource}>
                <Save className="w-4 h-4 mr-2" />
                {isCreateDialogOpen ? 'Crear' : 'Actualizar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para agregar imagen */}
      <Dialog open={isImageDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsImageDialogOpen(false);
          resetImageForm();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Imagen de Fabricante</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="img_manufacturer">Fabricante *</Label>
              <Input
                id="img_manufacturer"
                value={imageFormData.manufacturer}
                onChange={(e) => setImageFormData({ ...imageFormData, manufacturer: e.target.value })}
                placeholder="Nombre del fabricante"
              />
            </div>

            <div>
              <Label htmlFor="image_url">URL de la Imagen *</Label>
              <Input
                id="image_url"
                value={imageFormData.image_url}
                onChange={(e) => setImageFormData({ ...imageFormData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="img_description">Descripción</Label>
              <Input
                id="img_description"
                value={imageFormData.description}
                onChange={(e) => setImageFormData({ ...imageFormData, description: e.target.value })}
                placeholder="Descripción de la tarjeta o componente"
              />
            </div>

            <div>
              <Label htmlFor="board_type">Tipo de Tarjeta</Label>
              <Input
                id="board_type"
                value={imageFormData.board_type}
                onChange={(e) => setImageFormData({ ...imageFormData, board_type: e.target.value })}
                placeholder="Ej: Principal, Controladora, Sensor..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsImageDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateImage}>
                <Save className="w-4 h-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para importar Excel */}
      <Dialog open={isImportDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsImportDialogOpen(false);
          setImportData([]);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet size={20} className="text-green-600" />
              Importar Errores Técnicos desde Excel
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Vista previa de importación</h3>
              <p className="text-sm text-blue-700 mb-3">
                Se encontraron <strong>{importData.length}</strong> registros válidos para importar.
              </p>
              
              {importData.length > 0 && (
                <div className="bg-white rounded border max-h-60 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-2 py-1 text-left">Fabricante</th>
                        <th className="px-2 py-1 text-left">Código</th>
                        <th className="px-2 py-1 text-left">Descripción</th>
                        <th className="px-2 py-1 text-left">Categoría</th>
                        <th className="px-2 py-1 text-left">Soluciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importData.slice(0, 10).map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-2 py-1">{item.manufacturer}</td>
                          <td className="px-2 py-1 font-mono text-red-600">{item.error_code}</td>
                          <td className="px-2 py-1">{item.error_description}</td>
                          <td className="px-2 py-1">{item.category}</td>
                          <td className="px-2 py-1 text-xs">
                            {item.solution.split('\n').length} pasos
                          </td>
                        </tr>
                      ))}
                      {importData.length > 10 && (
                        <tr>
                          <td colSpan={5} className="px-2 py-2 text-center text-gray-500 text-xs">
                            ... y {importData.length - 10} registros más
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>Formato esperado:</strong> El Excel debe tener las columnas: 
                <br />
                <span className="font-mono text-xs">
                  TIPO | Fabricante | Código de Error | Descripción del Error | Causas Posibles | Cómo Solucionarlo (1) | Cómo Solucionarlo (2) | Cómo Solucionarlo (3)
                </span>
                <br />
                <small>Las columnas de solución se combinarán automáticamente en pasos numerados.</small>
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsImportDialogOpen(false);
                  setImportData([]);
                }}
                disabled={importing}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmImport}
                disabled={importing || importData.length === 0}
                className="flex items-center gap-2"
              >
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Confirmar Importación ({importData.length})
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TechnicalResourcesSettings;
