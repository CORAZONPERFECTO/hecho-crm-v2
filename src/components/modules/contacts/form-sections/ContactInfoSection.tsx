
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ContactInfoSectionProps {
  formData: {
    phone1: string;
    phone2: string;
    mobile: string;
    fax: string;
    email: string;
    address: string;
    province: string;
    municipality: string;
    country: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Información de Contacto</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <Label htmlFor="phone1">Teléfono 1</Label>
          <Input
            id="phone1"
            value={formData.phone1}
            onChange={(e) => onInputChange('phone1', e.target.value)}
            placeholder="(809) 000-0000"
          />
        </div>
        
        <div>
          <Label htmlFor="phone2">Teléfono 2</Label>
          <Input
            id="phone2"
            value={formData.phone2}
            onChange={(e) => onInputChange('phone2', e.target.value)}
            placeholder="(809) 000-0000"
          />
        </div>
        
        <div>
          <Label htmlFor="mobile">Celular</Label>
          <Input
            id="mobile"
            value={formData.mobile}
            onChange={(e) => onInputChange('mobile', e.target.value)}
            placeholder="(829) 000-0000"
          />
        </div>
        
        <div>
          <Label htmlFor="fax">Fax</Label>
          <Input
            id="fax"
            value={formData.fax}
            onChange={(e) => onInputChange('fax', e.target.value)}
            placeholder="(809) 000-0000"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            placeholder="contacto@empresa.com"
          />
        </div>
        
        <div>
          <Label htmlFor="address">Dirección Completa</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => onInputChange('address', e.target.value)}
            placeholder="Calle, número, sector"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="province">Provincia</Label>
            <Input
              id="province"
              value={formData.province}
              onChange={(e) => onInputChange('province', e.target.value)}
              placeholder="Ej: Santo Domingo"
            />
          </div>
          
          <div>
            <Label htmlFor="municipality">Municipio</Label>
            <Input
              id="municipality"
              value={formData.municipality}
              onChange={(e) => onInputChange('municipality', e.target.value)}
              placeholder="Ej: Distrito Nacional"
            />
          </div>
          
          <div>
            <Label htmlFor="country">País</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => onInputChange('country', e.target.value)}
              placeholder="República Dominicana"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoSection;
