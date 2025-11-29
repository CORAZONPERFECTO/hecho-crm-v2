import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building2, Plus, MapPin, Phone, User, Camera, Edit2, Trash2 } from 'lucide-react';
import { useClientVillas, ClientVilla } from '@/hooks/useClientVillas';

interface VillasSectionProps {
  clientId: string;
  clientName: string;
}

const VillasSection: React.FC<VillasSectionProps> = ({ clientId, clientName }) => {
  const { villas, loading, uploading, fetchVillas, createVilla, updateVilla, uploadExteriorPhoto, deleteVilla } = useClientVillas();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingVilla, setEditingVilla] = useState<ClientVilla | null>(null);
  const [formData, setFormData] = useState({
    villa_name: '',
    villa_code: '',
    address: '',
    gps_location: '',
    contact_person: '',
    contact_phone: ''
  });

  useEffect(() => {
    fetchVillas(clientId);
  }, [clientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVilla) {
        await updateVilla(editingVilla.id, formData);
        setEditingVilla(null);
      } else {
        await createVilla({
          ...formData,
          client_id: clientId
        });
        setShowCreateForm(false);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving villa:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      villa_name: '',
      villa_code: '',
      address: '',
      gps_location: '',
      contact_person: '',
      contact_phone: ''
    });
  };

  const handleEdit = (villa: ClientVilla) => {
    setFormData({
      villa_name: villa.villa_name,
      villa_code: villa.villa_code || '',
      address: villa.address,
      gps_location: villa.gps_location || '',
      contact_person: villa.contact_person || '',
      contact_phone: villa.contact_phone || ''
    });
    setEditingVilla(villa);
  };

  const handlePhotoUpload = async (villaId: string, file: File) => {
    try {
      await uploadExteriorPhoto(villaId, file);
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando villas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Building2 size={20} />
            Villas de {clientName}
          </CardTitle>
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                Nueva Villa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nueva Villa</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="villa_name">Nombre de la Villa *</Label>
                  <Input
                    id="villa_name"
                    value={formData.villa_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, villa_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="villa_code">Código de Villa</Label>
                  <Input
                    id="villa_code"
                    value={formData.villa_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, villa_code: e.target.value }))}
                    placeholder="Ej: VL001"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Dirección *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    required
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="gps_location">Ubicación GPS</Label>
                  <Input
                    id="gps_location"
                    value={formData.gps_location}
                    onChange={(e) => setFormData(prev => ({ ...prev, gps_location: e.target.value }))}
                    placeholder="Lat, Lng"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_person">Persona de Contacto</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Teléfono de Contacto</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Crear Villa
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {villas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay villas registradas para este cliente
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {villas.map((villa) => (
                <Card key={villa.id} className="overflow-hidden">
                  <div className="aspect-video relative bg-gray-100">
                    {villa.exterior_photo_url ? (
                      <img
                        src={villa.exterior_photo_url}
                        alt={`Villa ${villa.villa_name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Building2 size={48} />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoUpload(villa.id, file);
                          }}
                        />
                        <Button size="sm" variant="secondary" disabled={uploading}>
                          <Camera size={14} />
                        </Button>
                      </label>
                    </div>
                  </div>
                  
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{villa.villa_name}</h3>
                        {villa.villa_code && (
                          <Badge variant="outline" className="text-xs">
                            {villa.villa_code}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(villa)}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteVilla(villa.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{villa.address}</span>
                      </div>
                      
                      {villa.contact_person && (
                        <div className="flex items-center gap-2">
                          <User size={14} />
                          <span className="text-gray-600">{villa.contact_person}</span>
                        </div>
                      )}
                      
                      {villa.contact_phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={14} />
                          <span className="text-gray-600">{villa.contact_phone}</span>
                        </div>
                      )}
                      
                      {villa.gps_location && (
                        <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          <span className="text-xs text-blue-600">GPS: {villa.gps_location}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Edit Villa Dialog */}
        <Dialog open={!!editingVilla} onOpenChange={(open) => !open && setEditingVilla(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Villa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit_villa_name">Nombre de la Villa *</Label>
                <Input
                  id="edit_villa_name"
                  value={formData.villa_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, villa_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_villa_code">Código de Villa</Label>
                <Input
                  id="edit_villa_code"
                  value={formData.villa_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, villa_code: e.target.value }))}
                  placeholder="Ej: VL001"
                />
              </div>
              <div>
                <Label htmlFor="edit_address">Dirección *</Label>
                <Textarea
                  id="edit_address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  required
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="edit_gps_location">Ubicación GPS</Label>
                <Input
                  id="edit_gps_location"
                  value={formData.gps_location}
                  onChange={(e) => setFormData(prev => ({ ...prev, gps_location: e.target.value }))}
                  placeholder="Lat, Lng"
                />
              </div>
              <div>
                <Label htmlFor="edit_contact_person">Persona de Contacto</Label>
                <Input
                  id="edit_contact_person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit_contact_phone">Teléfono de Contacto</Label>
                <Input
                  id="edit_contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Actualizar Villa
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditingVilla(null);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default VillasSection;
