
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { TicketCategory } from './CategoryManager';

interface CategoryService {
  categoryId: string;
  categoryName: string;
  quantity: number;
  description?: string;
  area: string;
}

interface AddCategoryServiceFormProps {
  categories: TicketCategory[];
  onAddService: (service: CategoryService) => void;
  onClose: () => void;
}

const AddCategoryServiceForm: React.FC<AddCategoryServiceFormProps> = ({
  categories,
  onAddService,
  onClose
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');

  const activeCategories = categories.filter(cat => cat.isActive);
  const selectedCategory = activeCategories.find(cat => cat.id === selectedCategoryId);

  const categoriesByArea = activeCategories.reduce((acc, cat) => {
    if (!acc[cat.area]) acc[cat.area] = [];
    acc[cat.area].push(cat);
    return acc;
  }, {} as Record<string, TicketCategory[]>);

  const handleSubmit = () => {
    if (!selectedCategory || quantity <= 0) return;

    const service: CategoryService = {
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name,
      quantity,
      description,
      area: selectedCategory.area
    };

    onAddService(service);
    onClose();
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-gray-800">
            Agregar Servicio por Categoría
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <Label>Seleccionar Categoría de Servicio *</Label>
          <Select onValueChange={setSelectedCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Buscar categoría..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoriesByArea).map(([area, areaCategories]) => (
                <div key={area}>
                  <div className="px-2 py-1 text-sm font-semibold text-gray-600 bg-gray-100">
                    {area}
                  </div>
                  {areaCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex flex-col">
                        <span>{category.name}</span>
                        <span className="text-xs text-gray-500">
                          ${category.basePrice || 0} por {category.unit}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCategory && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Información de la Categoría</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Área:</span>
                <span className="ml-2 font-medium">{selectedCategory.area}</span>
              </div>
              <div>
                <span className="text-gray-600">Precio base:</span>
                <span className="ml-2 font-medium">${selectedCategory.basePrice || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Unidad:</span>
                <span className="ml-2 font-medium">{selectedCategory.unit}</span>
              </div>
              {selectedCategory.description && (
                <div className="col-span-2">
                  <span className="text-gray-600">Descripción:</span>
                  <span className="ml-2">{selectedCategory.description}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <Label>Cantidad Realizada *</Label>
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            placeholder="Ingrese la cantidad"
          />
          {selectedCategory && (
            <p className="text-sm text-gray-600 mt-1">
              Total estimado: ${(selectedCategory.basePrice || 0) * quantity}
            </p>
          )}
        </div>

        <div>
          <Label>Descripción Adicional</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalles específicos del servicio realizado..."
            rows={3}
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!selectedCategory || quantity <= 0}
            className="bg-gradient-to-r from-green-600 to-emerald-600"
          >
            Agregar Servicio
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddCategoryServiceForm;
