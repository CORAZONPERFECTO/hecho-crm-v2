import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Edit,
  Plus,
  Calendar,
  User,
  MapPin,
  Building,
  Clock,
  CheckCircle,
  AlertCircle,
  Paperclip,
  Wrench,
  FileText,
  Share2,
  Camera,
  Image,
  Phone,
  BookOpen,
  Receipt,
  Copy
} from 'lucide-react';
import { Ticket } from './types';
import StatusIcon from './StatusIcon';
import ShareTicketDialog from './ShareTicketDialog';
import ShareWithTechnicianDialog from './ShareWithTechnicianDialog';
import TechnicalStepsSection from './TechnicalStepsSection';
import ResourcesSearchDialog from './ResourcesSearchDialog';
import UploadExpenseReceiptDialog from './UploadExpenseReceiptDialog';
import ExpenseReceiptsList from './ExpenseReceiptsList';
import TicketExportedReports from './TicketExportedReports';

interface TicketDetailProps {
  ticket: Ticket;
  userRole: 'admin' | 'technician' | 'manager';
  currentUser: string;
  onClose: () => void;
  onShowVisitForm: () => void;
  onShowEditForm: () => void;
  onShowAttachmentUpload: () => void;
  onShowServiceForm: () => void;
  onShowQuotationForm: () => void;
  onCloseTicket: (ticketId: string) => void;
  onDuplicateTicket: (ticket: Ticket) => void;
}

const TicketDetail: React.FC<TicketDetailProps> = ({
  ticket,
  userRole,
  currentUser,
  onClose,
  onShowVisitForm,
  onShowEditForm,
  onShowAttachmentUpload,
  onShowServiceForm,
  onShowQuotationForm,
  onCloseTicket,
  onDuplicateTicket
}) => {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showShareTechnicianDialog, setShowShareTechnicianDialog] = useState(false);
  const [showResourcesDialog, setShowResourcesDialog] = useState(false);
  const [showExpenseReceiptDialog, setShowExpenseReceiptDialog] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'abierto': return 'bg-red-100 text-red-800';
      case 'en-progreso': return 'bg-yellow-100 text-yellow-800';
      case 'cerrado-pendiente-cotizar': return 'bg-blue-100 text-blue-800';
      case 'aprobado-factura': return 'bg-purple-100 text-purple-800';
      case 'facturado-finalizado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
        // Aquí se procesarían las fotos capturadas
        console.log('Fotos capturadas:', files);
        // En el futuro, esto se conectará con el sistema de evidencias
        onShowAttachmentUpload();
      }
    };

    input.click();
  };

  const canEdit = userRole === 'admin' || userRole === 'manager';
  const canClose = userRole === 'admin' || userRole === 'manager';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onClose} size="sm">
            <ArrowLeft size={16} className="mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <StatusIcon status={ticket.status} />
              Ticket #{ticket.ticketNumber}
            </h1>
            <p className="text-gray-600">{ticket.title}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShareDialog(true)}
            className="flex items-center gap-2"
            title="Compartir"
          >
            <Share2 size={16} />
            <span className="hidden sm:inline">Compartir</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShareTechnicianDialog(true)}
            className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
            title="Asignar Técnico"
          >
            <User size={16} />
            <span className="hidden sm:inline">Técnico</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDuplicateTicket(ticket)}
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
            title="Duplicar Ticket"
          >
            <Copy size={16} />
            <span className="hidden sm:inline">Duplicar</span>
          </Button>
          {canEdit && (
            <Button variant="outline" onClick={onShowEditForm} size="sm" title="Editar Ticket">
              <Edit size={16} className="mr-2" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Status and Priority */}
      <div className="flex gap-4">
        <Badge className={getStatusColor(ticket.status)}>
          {ticket.status}
        </Badge>
        <Badge className={getPriorityColor(ticket.priority)}>
          Prioridad {ticket.priority}
        </Badge>
      </div>

      {/* Main Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Ticket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">Cliente:</span>
              <span className="font-medium">{ticket.client}</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">Asignado a:</span>
              <span className="font-medium">{ticket.assignedTo}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">Ubicación:</span>
              <span className="font-medium">{ticket.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">Proyecto:</span>
              <span className="font-medium">{ticket.project || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">Creado:</span>
              <span className="font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">Categoría:</span>
              <span className="font-medium">{ticket.category}</span>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Descripción</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {ticket.internalNotes && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Notas Internas</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{ticket.internalNotes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Technical Steps Section */}
      <TechnicalStepsSection
        ticketId={ticket.id}
        serviceType={ticket.category}
        onStepsUpdate={(steps) => {
          console.log('Technical steps updated:', steps);
        }}
      />

      {/* Expense Receipts Section */}
      <ExpenseReceiptsList
        ticketId={ticket.id}
        userRole={userRole}
      />

      {/* Quick Actions - Mobile Optimized */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-2 mb-4">
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
              onClick={onShowAttachmentUpload}
              className="flex flex-col items-center gap-1 h-auto py-3 px-2"
            >
              <Image size={18} />
              <span className="text-xs">Fotos</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onShowVisitForm}
              className="flex flex-col items-center gap-1 h-auto py-3 px-2"
            >
              <Calendar size={18} />
              <span className="text-xs">Visita</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onShowServiceForm}
              className="flex flex-col items-center gap-1 h-auto py-3 px-2"
            >
              <Wrench size={18} />
              <span className="text-xs">Servicio</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onShowQuotationForm}
              className="flex flex-col items-center gap-1 h-auto py-3 px-2"
            >
              <FileText size={18} />
              <span className="text-xs">Cotizar</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExpenseReceiptDialog(true)}
              className="flex flex-col items-center gap-1 h-auto py-3 px-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
            >
              <Receipt size={18} />
              <span className="text-xs">Factura</span>
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

          {/* Traditional Actions */}
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3 text-gray-700">Acciones Completas</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              <Button
                variant="outline"
                onClick={onShowVisitForm}
                className="flex items-center gap-2 justify-start"
              >
                <Calendar size={16} />
                Agregar Visita
              </Button>

              <Button
                variant="outline"
                onClick={onShowAttachmentUpload}
                className="flex items-center gap-2 justify-start"
              >
                <Paperclip size={16} />
                Adjuntar Archivo
              </Button>

              <Button
                variant="outline"
                onClick={onShowServiceForm}
                className="flex items-center gap-2 justify-start"
              >
                <Wrench size={16} />
                Agregar Servicio
              </Button>

              <Button
                variant="outline"
                onClick={onShowQuotationForm}
                className="flex items-center gap-2 justify-start"
              >
                <FileText size={16} />
                Crear Cotización
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowExpenseReceiptDialog(true)}
                className="flex items-center gap-2 justify-start bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
              >
                <Receipt size={16} />
                Subir Factura de Gasto
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowResourcesDialog(true)}
                className="flex items-center gap-2 justify-start bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              >
                <BookOpen size={16} />
                Buscar Recursos
              </Button>
            </div>
          </div>

          {canClose && ticket.status !== 'facturado-finalizado' && (
            <div className="mt-4 pt-4 border-t">
              <Button
                onClick={() => onCloseTicket(ticket.id)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle size={16} className="mr-2" />
                Cerrar Ticket
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exported Reports Section */}
      <TicketExportedReports ticketId={ticket.id} />

      {/* Share Dialog */}
      <ShareTicketDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        ticketId={ticket.id}
        ticketNumber={ticket.ticketNumber}
        currentUser={currentUser}
      />

      {/* Share with Technician Dialog */}
      <ShareWithTechnicianDialog
        isOpen={showShareTechnicianDialog}
        onClose={() => setShowShareTechnicianDialog(false)}
        ticketId={ticket.id}
        ticketNumber={ticket.ticketNumber}
        assignedTo={ticket.assignedTo}
      />

      {/* Resources Search Dialog */}
      <ResourcesSearchDialog
        isOpen={showResourcesDialog}
        onClose={() => setShowResourcesDialog(false)}
        ticketCategory={ticket.category}
      />

      {/* Upload Expense Receipt Dialog */}
      {showExpenseReceiptDialog && (
        <UploadExpenseReceiptDialog
          ticketId={ticket.id}
          currentUser={currentUser}
          onClose={() => setShowExpenseReceiptDialog(false)}
        />
      )}
    </div>
  );
};

export default TicketDetail;
