
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, AlertTriangle, Wrench, X, RefreshCw, Database, Settings, ExternalLink } from 'lucide-react';
import { useTechnicalResources } from '@/hooks/useTechnicalResources';

interface ResourcesSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ticketCategory?: string;
}

const ResourcesSearchDialog: React.FC<ResourcesSearchDialogProps> = ({
  isOpen,
  onClose,
  ticketCategory
}) => {
  const {
    resources,
    manufacturerImages,
    loading,
    loadResources,
    getUniqueManufacturers,
    getUniqueCategories
  } = useTechnicalResources();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(ticketCategory || '');
  const [hasInitialized, setHasInitialized] = useState(false);

  // Cargar datos cuando se abre el dialog
  useEffect(() => {
    if (isOpen && !hasInitialized) {
      console.log('🔄 [RESOURCES] Cargando recursos técnicos...');
      loadResources();
      setHasInitialized(true);
    }
  }, [isOpen, hasInitialized, loadResources]);

  // Reinicializar filtros cuando se abre el dialog
  useEffect(() => {
    if (isOpen) {
      setSelectedCategory(ticketCategory || '');
    }
  }, [isOpen, ticketCategory]);

  // Filtrar recursos en tiempo real
  const filteredResources = React.useMemo(() => {
    console.log('🔍 [RESOURCES] Filtrando recursos - Total disponibles:', resources.length);
    
    let filtered = [...resources];

    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      console.log('🔎 [RESOURCES] Aplicando filtro de búsqueda:', searchLower);
      
      filtered = filtered.filter(resource => {
        const matchesCode = resource.error_code?.toLowerCase().includes(searchLower);
        const matchesDescription = resource.error_description?.toLowerCase().includes(searchLower);
        const matchesCause = resource.cause?.toLowerCase().includes(searchLower);
        const matchesSolution = resource.solution?.toLowerCase().includes(searchLower);
        const matchesManufacturer = resource.manufacturer?.toLowerCase().includes(searchLower);
        
        return matchesCode || matchesDescription || matchesCause || matchesSolution || matchesManufacturer;
      });
      
      console.log('📋 [RESOURCES] Después del filtro de búsqueda:', filtered.length);
    }

    if (selectedManufacturer && selectedManufacturer !== 'all') {
      console.log('🏭 [RESOURCES] Aplicando filtro de fabricante:', selectedManufacturer);
      filtered = filtered.filter(resource => resource.manufacturer === selectedManufacturer);
      console.log('📋 [RESOURCES] Después del filtro de fabricante:', filtered.length);
    }

    if (selectedCategory && selectedCategory !== 'all') {
      console.log('📂 [RESOURCES] Aplicando filtro de categoría:', selectedCategory);
      filtered = filtered.filter(resource => resource.category === selectedCategory);
      console.log('📋 [RESOURCES] Después del filtro de categoría:', filtered.length);
    }

    console.log('✅ [RESOURCES] Resultado final del filtrado:', filtered.length);
    return filtered;
  }, [searchTerm, selectedManufacturer, selectedCategory, resources]);

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
      default: return difficulty;
    }
  };

  // Obtener listas únicas de fabricantes y categorías
  const manufacturers = getUniqueManufacturers();
  const categories = getUniqueCategories();

  const handleManufacturerChange = (value: string) => {
    console.log('🔄 [RESOURCES] Cambio de fabricante:', value);
    if (value === 'all') {
      setSelectedManufacturer('');
    } else {
      setSelectedManufacturer(value);
    }
  };

  const handleCategoryChange = (value: string) => {
    console.log('🔄 [RESOURCES] Cambio de categoría:', value);
    if (value === 'all') {
      setSelectedCategory('');
    } else {
      setSelectedCategory(value);
    }
  };

  const getManufacturerImages = (manufacturer: string) => {
    return manufacturerImages.filter(img => img.manufacturer === manufacturer);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedManufacturer('');
    setSelectedCategory('');
  };

  const handleRefresh = async () => {
    console.log('🔄 [RESOURCES] Actualizando datos...');
    setHasInitialized(false);
    await loadResources();
    setHasInitialized(true);
  };

  const navigateToSettings = () => {
    onClose();
    // En el contexto real, esto debería navegar a la sección de configuración
    if (window.location.hash !== '#settings') {
      window.location.hash = 'settings';
      window.location.reload(); // Forzar recarga para cambiar de módulo
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Cargando base de datos de errores técnicos...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <BookOpen size={20} className="text-blue-600" />
              Base de Datos de Errores Técnicos
              {ticketCategory && (
                <Badge variant="outline" className="ml-2">
                  Filtrado por: {ticketCategory}
                </Badge>
              )}
            </DialogTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                className="flex items-center gap-2"
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Actualizar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={navigateToSettings}
                className="flex items-center gap-2"
              >
                <Settings size={16} />
                Gestionar
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Panel de información mejorado */}
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
                <span className="text-2xl font-bold text-blue-800">{manufacturers.length}</span>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <span className="text-blue-600 block font-medium">Categorías:</span>
                <span className="text-2xl font-bold text-blue-800">{categories.length}</span>
              </div>
            </div>
            
            {resources.length === 0 && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800 text-sm">
                  <strong>📝 Nota:</strong> No hay errores técnicos en la base de datos. 
                  Ve a <strong>Configuración → Errores Técnicos</strong> para importar o crear recursos.
                </p>
              </div>
            )}
          </div>

          {/* Filtros mejorados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                🔍 Buscar Error o Fabricante
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Ej: E1, Samsung, no enfría..."
                  value={searchTerm}
                  onChange={(e) => {
                    console.log('🔍 [RESOURCES] Cambio en búsqueda:', e.target.value);
                    setSearchTerm(e.target.value);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                🏭 Fabricante ({manufacturers.length})
              </label>
              <Select value={selectedManufacturer || 'all'} onValueChange={handleManufacturerChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los fabricantes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los fabricantes</SelectItem>
                  {manufacturers.map(manufacturer => (
                    <SelectItem key={manufacturer} value={manufacturer}>
                      {manufacturer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                📂 Categoría ({categories.length})
              </label>
              <Select value={selectedCategory || 'all'} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Resultados mejorados */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                📋 Resultados ({filteredResources.length})
                {(searchTerm || selectedManufacturer || selectedCategory) && (
                  <Badge variant="secondary" className="text-xs">
                    Filtrado
                  </Badge>
                )}
              </h3>
              {(searchTerm || selectedManufacturer || selectedCategory) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-1"
                >
                  <X size={14} />
                  Limpiar filtros
                </Button>
              )}
            </div>

            {filteredResources.length === 0 ? (
              <div className="text-center py-8">
                {resources.length === 0 ? (
                  <>
                    <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Base de datos vacía
                    </h3>
                    <p className="text-gray-500 mb-4">
                      No hay errores técnicos en la base de datos.
                    </p>
                    <Button onClick={navigateToSettings} className="mt-2">
                      <Settings size={16} className="mr-2" />
                      Ir a Configuración
                    </Button>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No se encontraron errores
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Intenta con otros términos de búsqueda o ajusta los filtros
                    </p>
                    <Button variant="outline" onClick={clearFilters} className="mt-2">
                      <X size={16} className="mr-2" />
                      Limpiar filtros
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredResources.map((resource) => {
                  const manufacturerImages = getManufacturerImages(resource.manufacturer);
                  
                  return (
                    <Card key={resource.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg flex items-center gap-2 flex-wrap mb-2">
                              <Badge variant="outline" className="text-blue-600 border-blue-200">
                                {resource.manufacturer}
                              </Badge>
                              <span className="font-mono text-red-600 text-xl font-bold">
                                {resource.error_code}
                              </span>
                            </CardTitle>
                            <p className="text-gray-800 font-medium text-base">
                              {resource.error_description}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-col items-end">
                            <Badge className={getDifficultyColor(resource.difficulty)}>
                              {getDifficultyText(resource.difficulty)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {resource.category}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Fotos de tarjetas del fabricante */}
                        {manufacturerImages.length > 0 && (
                          <div>
                            <h4 className="font-medium text-blue-700 flex items-center gap-2 mb-3">
                              <Database size={16} />
                              Tarjetas Electrónicas - {resource.manufacturer}:
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {manufacturerImages.map((img) => (
                                <div key={img.id} className="relative group cursor-pointer">
                                  <img 
                                    src={img.image_url} 
                                    alt={img.description}
                                    className="w-full h-24 object-cover rounded-lg border border-gray-200 group-hover:border-blue-300 transition-colors"
                                    onClick={() => window.open(img.image_url, '_blank')}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                                    <ExternalLink className="text-white opacity-0 group-hover:opacity-100" size={16} />
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1 truncate">
                                    {img.description || img.board_type}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="font-medium text-orange-700 flex items-center gap-2 mb-2">
                            <AlertTriangle size={16} />
                            Causa probable:
                          </h4>
                          <p className="text-gray-700 bg-orange-50 p-3 rounded-lg border border-orange-100">
                            {resource.cause}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-green-700 flex items-center gap-2 mb-2">
                            <Wrench size={16} />
                            Soluciones:
                          </h4>
                          <div className="text-gray-700 bg-green-50 p-3 rounded-lg border border-green-100">
                            {resource.solution.split('\n').map((line, index) => (
                              <p key={index} className="mb-1 last:mb-0">
                                {line}
                              </p>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResourcesSearchDialog;
