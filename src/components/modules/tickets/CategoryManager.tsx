
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit, X } from 'lucide-react';

export interface TicketCategory {
  id: string;
  name: string;
  area: string;
  basePrice?: number;
  unit: string;
  description?: string;
  isActive: boolean;
}

interface CategoryManagerProps {
  categories: TicketCategory[];
  onUpdateCategories: (categories: TicketCategory[]) => void;
  onClose?: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ 
  categories, 
  onUpdateCategories,
  onClose 
}) => {
  const [editingCategory, setEditingCategory] = useState<TicketCategory | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    area: '',
    basePrice: 0,
    unit: 'unidad',
    description: ''
  });

  const areas = [
    'Instalación',
    'Reparación', 
    'Mantenimiento',
    'Verificación',
    'Levantamiento',
    'Rastreo de Fuga',
    'Soporte Técnico',
    'Otros'
  ];

  const units = [
    'unidad',
    'metro',
    'hora',
    'pieza',
    'servicio',
    'punto',
    'equipo'
  ];

  const handleAddCategory = () => {
    if (!newCategory.name || !newCategory.area) return;

    const category: TicketCategory = {
      id: Math.random().toString(36).substr(2, 9),
      name: newCategory.name,
      area: newCategory.area,
      basePrice: newCategory.basePrice,
      unit: newCategory.unit,
      description: newCategory.description,
      isActive: true
    };

    onUpdateCategories([...categories, category]);
    setNewCategory({
      name: '',
      area: '',
      basePrice: 0,
      unit: 'unidad',
      description: ''
    });
  };

  const handleEditCategory = (category: TicketCategory) => {
    setEditingCategory(category);
  };

  const handleSaveEdit = () => {
    if (!editingCategory) return;

    const updatedCategories = categories.map(cat => 
      cat.id === editingCategory.id ? editingCategory : cat
    );
    onUpdateCategories(updatedCategories);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: string) => {
    const updatedCategories = categories.map(cat =>
      cat.id === id ? { ...cat, isActive: false } : cat
    );
    onUpdateCategories(updatedCategories);
  };

  const activCategories = categories.filter(cat => cat.isActive);
  const categoriesByArea = activCategories.reduce((acc, cat) => {
    if (!acc[cat.area]) acc[cat.area] = [];
    acc[cat.area].push(cat);
    return acc;
  }, {} as Record<string, TicketCategory[]>);

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-gray-800">
            Gestión de Categorías de Servicio
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Agregar nueva categoría */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">Agregar Nueva Categoría</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nombre de la Categoría *</Label>
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                placeholder="Ej. Instalación de Cámaras"
              />
            </div>
            <div>
              <Label>Área *</Label>
              <Select onValueChange={(value) => setNewCategory({...newCategory, area: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar área" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Precio Base</Label>
              <Input
                type="number"
                value={newCategory.basePrice}
                onChange={(e) => setNewCategory({...newCategory, basePrice: Number(e.target.value)})}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Unidad de Medida</Label>
              <Select onValueChange={(value) => setNewCategory({...newCategory, unit: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar unidad" />
                </SelectTrigger>
                <SelectContent>
                  {units.map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Descripción</Label>
              <Input
                value={newCategory.description}
                onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                placeholder="Descripción opcional de la categoría"
              />
            </div>
          </div>
          <Button 
            onClick={handleAddCategory} 
            className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600"
            disabled={!newCategory.name || !newCategory.area}
          >
            <Plus size={16} className="mr-2" />
            Agregar Categoría
          </Button>
        </div>

        {/* Lista de categorías por área */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Categorías Existentes</h3>
          {Object.entries(categoriesByArea).map(([area, areaCategories]) => (
            <div key={area} className="border rounded-lg p-4">
              <h4 className="font-medium text-md mb-3 text-blue-700">{area}</h4>
              <div className="space-y-2">
                {areaCategories.map(category => (
                  <div key={category.id} className="flex items-center justify-between bg-white p-3 rounded border">
                    {editingCategory?.id === category.id ? (
                      <div className="flex-1 grid grid-cols-4 gap-2">
                        <Input
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                        />
                        <Input
                          type="number"
                          value={editingCategory.basePrice}
                          onChange={(e) => setEditingCategory({...editingCategory, basePrice: Number(e.target.value)})}
                        />
                        <Select onValueChange={(value) => setEditingCategory({...editingCategory, unit: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map(unit => (
                              <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex space-x-1">
                          <Button size="sm" onClick={handleSaveEdit}>Guardar</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-gray-600">
                            ${category.basePrice || 0} por {category.unit}
                            {category.description && ` - ${category.description}`}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {activCategories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay categorías configuradas. Agrega tu primera categoría arriba.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryManager;
