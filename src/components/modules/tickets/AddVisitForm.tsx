
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Camera, Wifi, WifiOff, Clock } from 'lucide-react';
import { Ticket, TicketVisit } from './types';
import { useOfflineSync } from '@/hooks/useOfflineSync';

interface AddVisitFormProps {
  ticket: Ticket;
  userRole: string;
  currentUser: string;
  onClose: () => void;
  onAddVisit: (ticketId: string, visitData: Omit<TicketVisit, 'id'>) => void;
}

const AddVisitForm: React.FC<AddVisitFormProps> = ({ 
  ticket, 
  userRole, 
  currentUser, 
  onClose, 
  onAddVisit 
}) => {
  const [observation, setObservation] = useState('');
  const [resolved, setResolved] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addToSyncQueue, isOnline } = useOfflineSync();

  // Cargar datos guardados localmente
  useEffect(() => {
    const savedData = localStorage.getItem(`visit-draft-${ticket.id}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setObservation(parsed.observation || '');
      setResolved(parsed.resolved || false);
      setPhotos(parsed.photos || []);
    }
  }, [ticket.id]);

  // Auto-guardar borrador
  useEffect(() => {
    if (observation || photos.length > 0) {
      const draftData = { observation, resolved, photos };
      localStorage.setItem(`visit-draft-${ticket.id}`, JSON.stringify(draftData));
    }
  }, [observation, resolved, photos, ticket.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const visitData: Omit<TicketVisit, 'id'> = {
      date: new Date().toISOString(),
      technician: currentUser,
      observation,
      resolved,
      photos,
      services: []
    };

    try {
      if (isOnline) {
        // Enviar directamente si hay conexión
        await onAddVisit(ticket.id, visitData);
        
        // Limpiar borrador
        localStorage.removeItem(`visit-draft-${ticket.id}`);
        onClose();
      } else {
        // Guardar para sincronizar después
        addToSyncQueue('ticket_visits', 'create', {
          ticketId: ticket.id,
          visitData
        });
        
        // Limpiar borrador
        localStorage.removeItem(`visit-draft-${ticket.id}`);
        onClose();
      }
    } catch (error) {
      console.error('Error guardando visita:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPhoto = () => {
    // Simular captura de foto
    const newPhoto = `photo_${Date.now()}.jpg`;
    setPhotos(prev => [...prev, newPhoto]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className="max-w-2xl mx-auto border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold text-gray-800">
              Agregar Visita Técnica
            </CardTitle>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="outline" className="text-blue-600">
                {ticket.ticketNumber}
              </Badge>
              <div className="flex items-center space-x-1">
                {isOnline ? (
                  <Wifi size={16} className="text-green-600" />
                ) : (
                  <WifiOff size={16} className="text-red-600" />
                )}
                <span className="text-xs text-gray-600">
                  {isOnline ? 'En línea' : 'Modo offline - Sincronización automática'}
                </span>
              </div>
              {!isOnline && (
                <Badge variant="secondary" className="text-xs">
                  <Clock size={12} className="mr-1" />
                  Auto-guardado activo
                </Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="technician">Técnico Asignado</Label>
            <Input
              id="technician"
              value={currentUser}
              disabled
              className="bg-gray-100"
            />
          </div>

          <div>
            <Label htmlFor="observation">Observaciones de la Visita *</Label>
            <Textarea
              id="observation"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Describe el trabajo realizado, problemas encontrados, etc..."
              rows={4}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="resolved"
              checked={resolved}
              onCheckedChange={setResolved}
            />
            <Label htmlFor="resolved">Problema resuelto en esta visita</Label>
          </div>

          <div>
            <Label>Evidencias Fotográficas</Label>
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddPhoto}
                className="w-full border-dashed border-2 border-gray-300 hover:border-blue-400"
              >
                <Camera size={20} className="mr-2" />
                Tomar/Agregar Foto
              </Button>
              
              {photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative bg-gray-100 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm truncate">{photo}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePhoto(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isSubmitting 
                ? 'Guardando...' 
                : isOnline 
                  ? 'Guardar Visita' 
                  : 'Guardar (Sincronizará automáticamente)'
              }
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

export default AddVisitForm;
