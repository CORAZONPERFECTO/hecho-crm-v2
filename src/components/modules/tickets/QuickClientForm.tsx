
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickClientFormProps {
  onClose: () => void;
  onSave: (clientData: any) => void;
}

const QuickClientForm: React.FC<QuickClientFormProps> = ({ onClose, onSave }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    type: 'cliente',
    clientType: 'consumidor-final', // Nueva opción para consumidor final o crédito fiscal
    identificationType: 'cedula',
    identificationNumber: '',
    phone1: '',
    email: '',
    address: '',
    province: '',
    municipality: '',
    country: 'República Dominicana'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del cliente es requerido.",
        variant: "destructive",
      });
      return;
    }

    const clientData = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone1: formData.phone1.trim(),
      address: formData.address.trim(),
      province: formData.province.trim(),
      municipality: formData.municipality.trim(),
      paymentTerms: '30 días',
      priceList: 'Estándar',
      assignedSalesperson: '',
      creditLimit: 0,
      accountsReceivable: 0,
      accountsPayable: 0,
      internalNotes: '',
      status: 'activo'
    };

    onSave(clientData);
    toast({
      title: "Cliente creado",
      description: `${formData.name} ha sido agregado exitosamente.`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Crear Cliente Rápido</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={16} />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Nombre del Cliente *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre completo o razón social"
                  required
                />
              </div>

              <div>
                <Label htmlFor="clientType">Tipo de Cliente *</Label>
                <Select value={formData.clientType} onValueChange={(value) => setFormData(prev => ({ ...prev, clientType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consumidor-final">Consumidor Final</SelectItem>
                    <SelectItem value="credito-fiscal">Crédito Fiscal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="identificationType">Tipo de Identificación</Label>
                <Select value={formData.identificationType} onValueChange={(value) => setFormData(prev => ({ ...prev, identificationType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cedula">Cédula</SelectItem>
                    <SelectItem value="rnc">RNC</SelectItem>
                    <SelectItem value="pasaporte">Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="identificationNumber">Número de Identificación</Label>
                <Input
                  id="identificationNumber"
                  value={formData.identificationNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, identificationNumber: e.target.value }))}
                  placeholder="000-0000000-0"
                />
              </div>

              <div>
                <Label htmlFor="phone1">Teléfono</Label>
                <Input
                  id="phone1"
                  value={formData.phone1}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone1: e.target.value }))}
                  placeholder="+1 (XXX) XXX-XXXX"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="cliente@ejemplo.com"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Dirección completa"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="province">Provincia</Label>
                <Input
                  id="province"
                  value={formData.province}
                  onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                  placeholder="Provincia"
                />
              </div>

              <div>
                <Label htmlFor="municipality">Municipio</Label>
                <Input
                  id="municipality"
                  value={formData.municipality}
                  onChange={(e) => setFormData(prev => ({ ...prev, municipality: e.target.value }))}
                  placeholder="Municipio"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save size={16} className="mr-2" />
                Crear Cliente
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickClientForm;
