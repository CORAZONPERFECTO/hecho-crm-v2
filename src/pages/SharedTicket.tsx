
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Phone, Clock, User, AlertTriangle, Camera, Image, BookOpen } from 'lucide-react';
import { useSharedLinks } from '@/hooks/useSharedLinks';
import EvidenceUpload from '@/components/modules/tickets/EvidenceUpload';
import TechnicalStepsSection from '@/components/modules/tickets/TechnicalStepsSection';
import ResourcesSearchDialog from '@/components/modules/tickets/ResourcesSearchDialog';
import { useToast } from '@/hooks/use-toast';

const SharedTicket: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [ticketData, setTicketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEvidences, setShowEvidences] = useState(false);
  const [showResourcesDialog, setShowResourcesDialog] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { getSharedTicket } = useSharedLinks();
  const { toast } = useToast();

  const loadTicket = async (isRetry = false) => {
    if (!token) {
      setError('Token inválido');
      setLoading(false);
      return;
    }

    if (isRetry) {
      setLoading(true);
      setError(null);
    }

    try {
      console.log(`🔄 Intento ${isRetry ? retryCount + 1 : 1} de cargar ticket compartido`);
      const data = await getSharedTicket(token);
      setTicketData(data);
      setError(null);
      console.log('✅ Ticket cargado exitosamente');
    } catch (error) {
      console.error('❌ Error loading shared ticket:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      // Intentos automáticos solo en el primer fallo (no en reintentos manuales)
      if (!isRetry && retryCount < 2) {
        console.log(`🔄 Reintentando automáticamente en 2 segundos... (intento ${retryCount + 1}/2)`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => loadTicket(true), 2000);
        return;
      }
      
      setError(`No se pudo cargar el ticket: ${errorMessage}`);
      toast({
        title: "Error",
        description: isRetry ? "El reintento falló" : "No se pudo acceder al ticket compartido",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticketData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
            <p className="text-gray-600 mb-4">
              {error || 'No se pudo acceder al ticket'}
            </p>
            <div className="space-y-2">
              <Button onClick={() => loadTicket(true)} className="w-full">
                🔄 Reintentar
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                Ir a Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ticket = ticketData.tickets;
  const priorityColor = 
    ticket.priority === 'alta' ? 'text-red-500' :
    ticket.priority === 'media' ? 'text-yellow-500' :
    'text-green-500';

  const statusColor =
    ticket.status === 'abierto' ? 'text-red-500' :
    ticket.status === 'en-progreso' ? 'text-yellow-500' :
    'text-green-500';

  const handleCameraCapture = () => {
    // Crear un input file con configuración específica para cámara
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Usar cámara trasera por defecto
    input.multiple = true;
    
    input.onchange = (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        // Activar la vista de evidencias para que el técnico pueda subir las fotos
        console.log('Fotos capturadas:', files);
        setShowEvidences(true);
      }
    };
    
    input.click();
  };

  if (showEvidences) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => setShowEvidences(false)}
            >
              ← Volver a Detalles
            </Button>
          </div>
          <EvidenceUpload 
            ticketId={ticket.id} 
            currentUser={ticket.assigned_to}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-800">
                Ticket #{ticket.ticket_number}
              </CardTitle>
              <p className="text-gray-600 mt-2">{ticket.title}</p>
            </div>
          </CardHeader>
        </Card>

        {/* Ticket Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={20} />
              Información del Servicio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Cliente</label>
                <p className="text-lg">{ticket.client}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Categoría</label>
                <p className="text-lg">{ticket.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Prioridad</label>
                <Badge className={`${priorityColor} border-0`}>
                  {ticket.priority}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Estado</label>
                <Badge className={`${statusColor} border-0`}>
                  {ticket.status}
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <label className="text-sm font-medium text-gray-600">Descripción del Problema</label>
              <p className="text-gray-800 mt-1">{ticket.description}</p>
            </div>
            
            <Separator />
            
            <div>
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <MapPin size={16} />
                Ubicación del Servicio
              </label>
              <p className="text-lg font-medium">{ticket.location}</p>
              <p className="text-sm text-gray-500 mt-1">
                Toca en el mapa para obtener direcciones
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Técnico Asignado</label>
                <p className="text-lg">{ticket.assigned_to}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Clock size={16} />
                  Creado
                </label>
                <p className="text-lg">{new Date(ticket.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Steps */}
        <TechnicalStepsSection 
          ticketId={ticket.id}
          serviceType={ticket.category.toLowerCase()}
        />

        {/* Quick Actions - Mobile Optimized */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCameraCapture}
                className="flex flex-col items-center gap-1 h-auto py-3 px-2"
              >
                <Camera size={18} />
                <span className="text-xs">Cámara</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowEvidences(true)}
                className="flex flex-col items-center gap-1 h-auto py-3 px-2"
              >
                <Image size={18} />
                <span className="text-xs">Fotos</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowResourcesDialog(true)}
                className="flex flex-col items-center gap-1 h-auto py-3 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              >
                <BookOpen size={18} />
                <span className="text-xs">Recursos</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(`tel:${ticket.client}`, '_self')}
                className="flex flex-col items-center gap-1 h-auto py-3 px-2"
              >
                <Phone size={18} />
                <span className="text-xs">Llamar</span>
              </Button>
            </div>

            {/* Additional Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <Button 
                variant="outline"
                className="h-16 text-lg"
                onClick={() => {
                  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(ticket.location)}`;
                  window.open(mapUrl, '_blank');
                }}
              >
                🗺️ Ver en Mapa
              </Button>
              <Button 
                className="h-16 text-lg bg-green-600 hover:bg-green-700"
                onClick={() => window.open('https://wa.me/1234567890', '_blank')}
              >
                💬 Contactar Soporte
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone size={20} />
              Contacto de Emergencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">¿Necesitas ayuda?</p>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => window.open('https://wa.me/1234567890', '_blank')}
              >
                <Phone size={16} className="mr-2" />
                Contactar Soporte
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resources Search Dialog */}
        <ResourcesSearchDialog
          isOpen={showResourcesDialog}
          onClose={() => setShowResourcesDialog(false)}
          ticketCategory={ticket.category}
        />
      </div>
    </div>
  );
};

export default SharedTicket;
