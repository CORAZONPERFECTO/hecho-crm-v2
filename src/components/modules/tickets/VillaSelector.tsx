
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ClientVilla } from '@/hooks/useClientVillas';

interface VillaSelectorProps {
  villas: ClientVilla[];
  selectedVilla: string;
  onVillaChange: (villaId: string) => void;
  clientSelected: boolean;
}

const VillaSelector: React.FC<VillaSelectorProps> = ({
  villas,
  selectedVilla,
  onVillaChange,
  clientSelected
}) => {
  if (!clientSelected) return null;

  return (
    <div>
      <Label htmlFor="villa">Villa (Opcional)</Label>
      <Select value={selectedVilla} onValueChange={onVillaChange}>
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar villa o N/A" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="n/a">N/A - No aplica</SelectItem>
          {villas.map((villa) => (
            <SelectItem key={villa.id} value={villa.id}>
              {villa.villa_name} {villa.villa_code && `(${villa.villa_code})`} - {villa.address}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default VillaSelector;
