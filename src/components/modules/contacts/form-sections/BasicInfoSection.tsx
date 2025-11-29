
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BasicInfoSectionProps {
  formData: {
    name: string;
    type: 'cliente' | 'proveedor' | 'ambos';
  };
  onInputChange: (field: string, value: string) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Información Básica</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nombre / Razón Social *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            placeholder="Ingrese el nombre del cliente"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="type">Tipo de Contacto *</Label>
          <Select value={formData.type} onValueChange={(value) => onInputChange('type', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cliente">Cliente</SelectItem>
              <SelectItem value="proveedor">Proveedor</SelectItem>
              <SelectItem value="ambos">Ambos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;
