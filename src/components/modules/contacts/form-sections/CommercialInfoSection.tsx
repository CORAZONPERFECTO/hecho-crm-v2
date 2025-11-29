
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

interface CommercialInfoSectionProps {
  formData: {
    paymentTerms: string;
    priceList: string;
    assignedSalesperson: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const CommercialInfoSection: React.FC<CommercialInfoSectionProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Información Comercial</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="paymentTerms">Términos de Pago</Label>
          <Select value={formData.paymentTerms} onValueChange={(value) => onInputChange('paymentTerms', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Contado">Contado</SelectItem>
              <SelectItem value="15 días">15 días</SelectItem>
              <SelectItem value="30 días">30 días</SelectItem>
              <SelectItem value="45 días">45 días</SelectItem>
              <SelectItem value="60 días">60 días</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="priceList">Lista de Precios</Label>
          <Select value={formData.priceList} onValueChange={(value) => onInputChange('priceList', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Estándar">Estándar</SelectItem>
              <SelectItem value="VIP">VIP</SelectItem>
              <SelectItem value="Mayorista">Mayorista</SelectItem>
              <SelectItem value="Especial">Especial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="assignedSalesperson">Vendedor Asignado</Label>
        <Input
          id="assignedSalesperson"
          value={formData.assignedSalesperson}
          onChange={(e) => onInputChange('assignedSalesperson', e.target.value)}
          placeholder="Nombre del vendedor"
        />
      </div>
    </div>
  );
};

export default CommercialInfoSection;
