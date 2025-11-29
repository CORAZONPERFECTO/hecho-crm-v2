
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { X, CheckCircle } from 'lucide-react';
import { SupabaseTicket } from '@/hooks/useTickets';
import { useTicketTechnicians } from '@/hooks/useTicketTechnicians';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EditTicketFormProps {
  ticket: SupabaseTicket;
  onClose: () => void;
  onUpdateTicket: (ticketId: string, ticketData: any) => void;
}

interface FormData {
  title: string;
  description: string;
  priority: 'baja' | 'media' | 'alta';
  status: 'abierto' | 'en-progreso' | 'cerrado-pendiente-cotizar' | 'aprobado-factura' | 'facturado-finalizado' | 'finalizado-por-tecnico';
  assignedTo: string;
  client: string;
  project?: string;
  location: string;
  category: string;
  internalNotes?: string;
  excludeFromProfitLoss: boolean;
  lossObservation?: string;
}

const EditTicketForm: React.FC<EditTicketFormProps> = ({ 
  ticket, 
  onClose,
  onUpdateTicket
}) => {
  const { getActiveTechnicians, loading: techniciansLoading, refetch } = useTicketTechnicians();
  const activeTechnicians = getActiveTechnicians();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFinalizingTicket, setIsFinalizingTicket] = React.useState(false);
  
  // Check if current user is a technician
  const isTechnician = user?.role === 'technician';
  const isTicketFinalized = ticket.status === 'finalizado-por-tecnico';
  const canFinalize = isTechnician && !isTicketFinalized && 
    (ticket.status === 'en-progreso' || ticket.status === 'abierto');
  
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
  } = useForm<FormData>({
    defaultValues: {
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
      assignedTo: ticket.assigned_to,
      client: ticket.client,
      project: ticket.project || 'N/A',
      location: ticket.location,
      category: ticket.category,
      internalNotes: ticket.internal_notes || '',
      excludeFromProfitLoss: ticket.exclude_from_profit_loss,
      lossObservation: ticket.loss_observation || ''
    }
  });

  const excludeFromProfitLoss = watch('excludeFromProfitLoss');

  const onSubmit = async (data: FormData) => {
    onUpdateTicket(ticket.id, data);
    onClose();
  };

  const handleFinalizeTicket = async () => {
    if (!user?.id) return;
    
    setIsFinalizingTicket(true);
    
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          status: 'finalizado-por-tecnico',
          fecha_finalizacion_tecnico: new Date().toISOString(),
          id_tecnico_finalizador: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticket.id);

      if (error) throw error;

      toast({
        title: "Ticket finalizado exitosamente",
        description: "Esperando revisión del administrador.",
      });

      // Update the ticket status locally
      onUpdateTicket(ticket.id, { 
        status: 'finalizado-por-tecnico',
        fecha_finalizacion_tecnico: new Date().toISOString(),
        id_tecnico_finalizador: user.id
      });
      
      onClose();
    } catch (error) {
      console.error('Error finalizing ticket:', error);
      toast({
        title: "Error al finalizar ticket",
        description: "No se pudo finalizar el ticket. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsFinalizingTicket(false);
    }
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
          <CardTitle className="text-xl font-bold text-gray-800">
            Editar Ticket - {ticket.ticket_number}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <Select onValueChange={(value) => setValue('priority', value as any)} defaultValue={ticket.priority}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Estado *</Label>
              <Select onValueChange={(value) => setValue('status', value as any)} defaultValue={ticket.status}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="abierto">Abierto</SelectItem>
                  <SelectItem value="en-progreso">En Progreso</SelectItem>
                  <SelectItem value="cerrado-pendiente-cotizar">Cerrado - Pendiente Cotizar</SelectItem>
                  <SelectItem value="aprobado-factura">Aprobado para Factura</SelectItem>
                  <SelectItem value="facturado-finalizado">Facturado - Finalizado</SelectItem>
                  <SelectItem value="finalizado-por-tecnico">Finalizado por Técnico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Asignado a *</Label>
              <Select onValueChange={(value) => setValue('assignedTo', value)} defaultValue={ticket.assigned_to}>
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
            </div>
            
            <div>
              <Label>Categoría *</Label>
              <Select onValueChange={(value) => setValue('category', value)} defaultValue={ticket.category}>
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
            </div>
          </div>
          
          <div>
            <Label>Cliente *</Label>
            <Input 
              placeholder="Nombre del cliente" 
              {...register('client', { required: 'Cliente es requerido' })}
            />
            {errors.client && <span className="text-red-500 text-sm">{errors.client.message}</span>}
          </div>
          
          <div>
            <Label>Proyecto</Label>
            <Input 
              value="N/A" 
              disabled 
              className="bg-gray-50"
              {...register('project')}
            />
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

          {/* Nuevos campos para análisis de rentabilidad */}
          <div className="border-t pt-4 space-y-4">
            <h3 className="font-semibold text-gray-900">Análisis de Rentabilidad</h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="excludeFromProfitLoss"
                checked={excludeFromProfitLoss}
                onCheckedChange={(checked) => setValue('excludeFromProfitLoss', !!checked)}
              />
              <Label htmlFor="excludeFromProfitLoss">
                Excluir de análisis de ganancias y pérdidas (servicio de cortesía)
              </Label>
            </div>

            {excludeFromProfitLoss && (
              <div>
                <Label>Observación de pérdida</Label>
                <Textarea 
                  placeholder="Razón por la cual este ticket se considera una pérdida o servicio de cortesía..." 
                  rows={3}
                  {...register('lossObservation')}
                />
              </div>
            )}
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || isTicketFinalized}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>

          {/* Botón exclusivo para técnicos */}
          {canFinalize && (
            <div className="border-t pt-6 mt-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                  <CheckCircle className="mr-2" size={20} />
                  Finalización del Ticket
                </h3>
                <p className="text-sm text-green-700 mb-4">
                  Una vez finalizado, el ticket será enviado para revisión del administrador y no podrás editarlo.
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="default"
                      disabled={isFinalizingTicket}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isFinalizingTicket ? 'Finalizando...' : 'Finalizar Ticket'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Finalización</AlertDialogTitle>
                      <AlertDialogDescription>
                        ¿Confirmas que este ticket ha sido completado correctamente? 
                        Una vez finalizado, no podrás realizar más cambios y el ticket será enviado para revisión del administrador.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleFinalizeTicket}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Sí, Finalizar Ticket
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}

          {/* Mensaje informativo si el ticket ya está finalizado */}
          {isTicketFinalized && (
            <div className="border-t pt-6 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <CheckCircle className="mr-2 text-green-600" size={20} />
                  Ticket Finalizado
                </h3>
                <p className="text-sm text-gray-600">
                  Este ticket ha sido finalizado por el técnico y está esperando revisión del administrador.
                  {ticket.fecha_finalizacion_tecnico && (
                    <span className="block mt-1">
                      Finalizado el: {new Date(ticket.fecha_finalizacion_tecnico).toLocaleString('es-ES')}
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default EditTicketForm;
