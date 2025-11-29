
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

interface IdentificationSectionProps {
  formData: {
    identificationType: 'rnc' | 'cedula' | 'pasaporte';
    identificationNumber: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const IdentificationSection: React.FC<IdentificationSectionProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Identificación</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="identificationType">Tipo de Identificación *</Label>
          <Select value={formData.identificationType} onValueChange={(value) => onInputChange('identificationType', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rnc">RNC</SelectItem>
              <SelectItem value="cedula">Cédula</SelectItem>
              <SelectItem value="pasaporte">Pasaporte</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="identificationNumber">Número de Identificación *</Label>
          <Input
            id="identificationNumber"
            value={formData.identificationNumber}
            onChange={(e) => onInputChange('identificationNumber', e.target.value)}
            placeholder="Ingrese el número"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default IdentificationSection;
