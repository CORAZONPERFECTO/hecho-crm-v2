
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface FinancialInfoSectionProps {
  formData: {
    creditLimit: number;
    accountsReceivable: number;
    accountsPayable: number;
  };
  onInputChange: (field: string, value: string | number) => void;
}

const FinancialInfoSection: React.FC<FinancialInfoSectionProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Información Financiera</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="creditLimit">Límite de Crédito (DOP)</Label>
          <Input
            id="creditLimit"
            type="number"
            min="0"
            step="0.01"
            value={formData.creditLimit}
            onChange={(e) => onInputChange('creditLimit', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>
        
        <div>
          <Label htmlFor="accountsReceivable">Cuentas por Cobrar (DOP)</Label>
          <Input
            id="accountsReceivable"
            type="number"
            min="0"
            step="0.01"
            value={formData.accountsReceivable}
            onChange={(e) => onInputChange('accountsReceivable', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>
        
        <div>
          <Label htmlFor="accountsPayable">Cuentas por Pagar (DOP)</Label>
          <Input
            id="accountsPayable"
            type="number"
            min="0"
            step="0.01"
            value={formData.accountsPayable}
            onChange={(e) => onInputChange('accountsPayable', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  );
};

export default FinancialInfoSection;
