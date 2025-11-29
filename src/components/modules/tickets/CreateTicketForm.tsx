
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Hash } from 'lucide-react';
import { Ticket } from './types';
import { useTicketTechnicians } from '@/hooks/useTicketTechnicians';

interface CreateTicketFormProps {
  tickets: Ticket[];
  userRole: 'admin' | 'technician' | 'manager';
  duplicateData?: any;
  onClose: () => void;
  onCreateTicket: (ticketData: any) => void;
}

interface FormData {
  title: string;
  description: string;
  priority: 'baja' | 'media' | 'alta';
  assignedTo: string;
  client: string;
  location: string;
  category: string;
  internalNotes?: string;
}

const CreateTicketForm: React.FC<CreateTicketFormProps> = ({ 
  tickets, 
  userRole,
  duplicateData,
  onClose,
  onCreateTicket
}) => {
  const { getActiveTechnicians, loading: techniciansLoading, refetch } = useTicketTechnicians();
  const activeTechnicians = getActiveTechnicians();
  
  // Refetch technicians when component mounts to ensure fresh data
  React.useEffect(() => {
    refetch();
  }, [refetch]);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormData>();

  // Pre-fill form when duplicating
  React.useEffect(() => {
    if (duplicateData) {
      setValue('title', duplicateData.title || '');
      setValue('description', duplicateData.description || '');
      setValue('priority', duplicateData.priority || 'media');
      setValue('assignedTo', duplicateData.assignedTo || '');
      setValue('client', duplicateData.client || '');
      setValue('location', duplicateData.location || '');
      setValue('category', duplicateData.category || '');
      setValue('internalNotes', duplicateData.internalNotes || '');
    }
  }, [duplicateData, setValue]);

  // Generate next ticket number
  const generateTicketNumber = () => {
    if (duplicateData?.ticketNumber) {
      return duplicateData.ticketNumber;
    }
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    const existingTickets = tickets.filter(t => 
      t.ticketNumber.startsWith(`TICK-${currentYear}${currentMonth}`)
    );
    const nextNumber = String(existingTickets.length + 1).padStart(3, '0');
    return `TICK-${currentYear}${currentMonth}-${nextNumber}`;
  };

  const [ticketNumber] = useState(generateTicketNumber());

  const onSubmit = async (data: FormData) => {
    const ticketData = {
      ticketNumber,
      ...data,
      status: 'abierto' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onCreateTicket(ticketData);
    onClose();
  };

  if (techniciansLoading) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
            <Hash size={20} className="mr-2" />
            {duplicateData ? 'Duplicar Ticket' : 'Crear Nuevo Ticket'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <Hash size={16} className="mr-2 text-blue-600" />
              <span className="font-mono text-sm font-medium text-blue-800">
                Número de Ticket: {ticketNumber}
              </span>
            </div>
          </div>
          
          <div>
            <Label>Título *</Label>
            <Input 
              placeholder="Título del ticket" 
              {...register('title', { required: 'Título es requerido' })}
            />
            {errors.title && <span className="text-red-500 text-sm">{errors.title.message}</span>}
          </div>
          
          <div>
            <Label>Descripción *</Label>
            <Textarea 
              placeholder="Describe el problema o solicitud..." 
              rows={4}
              {...register('description', { required: 'Descripción es requerida' })}
            />
            {errors.description && <span className="text-red-500 text-sm">{errors.description.message}</span>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Prioridad *</Label>
              <Select onValueChange={(value) => setValue('priority', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && <span className="text-red-500 text-sm">Prioridad es requerida</span>}
            </div>
            
            <div>
              <Label>Asignado a *</Label>
              <Select onValueChange={(value) => setValue('assignedTo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar técnico" />
                </SelectTrigger>
                <SelectContent>
                  {activeTechnicians.map(technician => (
                    <SelectItem key={technician.id} value={technician.name}>
                      {technician.name} ({technician.role === 'manager' ? 'Gerente' : technician.role === 'supervisor' ? 'Supervisor' : 'Técnico'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.assignedTo && <span className="text-red-500 text-sm">Técnico asignado es requerido</span>}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cliente *</Label>
              <Input 
                placeholder="Nombre del cliente" 
                {...register('client', { required: 'Cliente es requerido' })}
              />
              {errors.client && <span className="text-red-500 text-sm">{errors.client.message}</span>}
            </div>
            
            <div>
              <Label>Categoría *</Label>
              <Select onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Instalacion">Instalación</SelectItem>
                  <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                  <SelectItem value="Reparacion">Reparación</SelectItem>
                  <SelectItem value="Visita">Visita</SelectItem>
                  <SelectItem value="Verificacion">Verificación</SelectItem>
                  <SelectItem value="Trabajos Varios">Trabajos Varios</SelectItem>
                  <SelectItem value="Otros">Otros</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <span className="text-red-500 text-sm">Categoría es requerida</span>}
            </div>
          </div>
          
          <div>
            <Label>Ubicación *</Label>
            <Input 
              placeholder="Dirección o ubicación" 
              {...register('location', { required: 'Ubicación es requerida' })}
            />
            {errors.location && <span className="text-red-500 text-sm">{errors.location.message}</span>}
          </div>
          
          <div>
            <Label>Observaciones Internas</Label>
            <Textarea 
              placeholder="Notas internas del ticket..." 
              rows={3}
              {...register('internalNotes')}
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? 'Creando...' : 'Crear Ticket'}
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

export default CreateTicketForm;
