
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Camera, Upload } from 'lucide-react';
import { ServiceRecord, Ticket } from './types';
import { serviceTypes } from './utils';

interface AddServiceFormProps {
  ticket: Ticket;
  currentUser: string;
  onClose: () => void;
  onAddService: (ticketId: string, serviceData: Omit<ServiceRecord, 'id'>) => void;
}

const AddServiceForm: React.FC<AddServiceFormProps> = ({ 
  ticket, 
  currentUser,
  onClose,
  onAddService
}) => {
  const [serviceType, setServiceType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<Array<{type: 'antes' | 'despues' | 'proceso', description: string}>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceType) return;

    setIsSubmitting(true);

    const serviceData: Omit<ServiceRecord, 'id'> = {
      type: serviceType as any,
      quantity,
      description,
      date: new Date().toISOString(),
      technician: currentUser,
      photos: photos.map((photo, index) => ({
        id: `photo-${Date.now()}-${index}`,
        url: `uploaded-photo-${index + 1}.jpg`,
        description: photo.description,
        type: photo.type
      }))
    };

    onAddService(ticket.id, serviceData);
    onClose();
  };

  const addPhoto = () => {
    setPhotos([...photos, { type: 'proceso', description: '' }]);
  };

  const updatePhoto = (index: number, field: 'type' | 'description', value: string) => {
    const updated = photos.map((photo, i) => 
      i === index ? { ...photo, [field]: value } : photo
    );
    setPhotos(updated);
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-gray-800">
            Agregar Servicio - {ticket.ticketNumber}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Servicio *</Label>
              <Select onValueChange={setServiceType} value={serviceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo de servicio" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Cantidad *</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                placeholder="Cantidad realizada"
              />
            </div>
          </div>

          <div>
            <Label>Descripción del Servicio</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe los detalles del servicio realizado..."
              rows={3}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <Label>Evidencias Fotográficas</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPhoto}>
                <Camera size={16} className="mr-1" />
                Agregar Foto
              </Button>
            </div>

            {photos.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto mb-2 text-gray-400" size={24} />
                <p className="text-sm text-gray-500">
                  Agrega fotos del servicio realizado (antes, durante y después)
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {photos.map((photo, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        <Select
                          value={photo.type}
                          onValueChange={(value) => updatePhoto(index, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="antes">Antes</SelectItem>
                            <SelectItem value="proceso">Durante</SelectItem>
                            <SelectItem value="despues">Después</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Descripción de la foto"
                          value={photo.description}
                          onChange={(e) => updatePhoto(index, 'description', e.target.value)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePhoto(index)}
                        className="ml-2"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500">
                      📷 Foto {index + 1} - {photo.type}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={isSubmitting || !serviceType}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isSubmitting ? 'Guardando...' : 'Registrar Servicio'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddServiceForm;
