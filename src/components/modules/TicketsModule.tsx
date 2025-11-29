import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTickets, SupabaseTicket } from '@/hooks/useTickets';
import { getFilteredTickets } from './tickets/utils';
import { convertSupabaseToLegacyTicket, convertLegacyToSupabaseTicket } from './tickets/ticketUtils';
import CreateTicketForm from './tickets/CreateTicketForm';
import TicketDetail from './tickets/TicketDetail';
import TicketsList from './tickets/TicketsList';
import TicketStats from './tickets/TicketStats';
import TicketFilters from './tickets/TicketFilters';
import AddVisitForm from './tickets/AddVisitForm';
import EditTicketForm from './tickets/EditTicketForm';
import AttachmentUpload from './tickets/AttachmentUpload';
import AddServiceForm from './tickets/AddServiceForm';
import CreateQuotationForm from './tickets/CreateQuotationForm';

export interface TicketsModuleProps {
  userRole?: 'admin' | 'technician' | 'manager';
  currentUser?: string;
}

const TicketsModule: React.FC<TicketsModuleProps> = ({ 
  userRole = 'admin',
  currentUser = 'Juan Pérez'
}) => {
  const { tickets, loading, createTicket, updateTicket } = useTickets();
  const [selectedTicket, setSelectedTicket] = useState<SupabaseTicket | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [duplicateTicketData, setDuplicateTicketData] = useState<any | null>(null);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAttachmentUpload, setShowAttachmentUpload] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showQuotationForm, setShowQuotationForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Convertir tickets de Supabase al formato legacy para compatibilidad
  const legacyTickets = tickets.map(convertSupabaseToLegacyTicket);

  const filteredTickets = getFilteredTickets(legacyTickets, userRole, currentUser, filter, searchTerm);

  const handleCreateTicket = async (ticketData: any) => {
    try {
      const supabaseData = {
        ticket_number: ticketData.ticketNumber,
        title: ticketData.title,
        description: ticketData.description,
        priority: ticketData.priority,
        status: 'abierto' as const,
        assigned_to: ticketData.assignedTo,
        client: ticketData.client,
        project: ticketData.project,
        location: ticketData.location,
        category: ticketData.category,
        internal_notes: ticketData.internalNotes,
        villa_id: ticketData.villaId || null,
        attachments: [],
        exclude_from_profit_loss: false
      };

      await createTicket(supabaseData);
      console.log('Ticket creado en Supabase:', supabaseData);
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const handleUpdateTicket = async (ticketId: string, ticketData: any) => {
    try {
      const supabaseData = {
        title: ticketData.title,
        description: ticketData.description,
        priority: ticketData.priority,
        status: ticketData.status,
        assigned_to: ticketData.assignedTo,
        client: ticketData.client,
        project: ticketData.project,
        location: ticketData.location,
        category: ticketData.category,
        internal_notes: ticketData.internalNotes,
        exclude_from_profit_loss: ticketData.excludeFromProfitLoss,
        loss_observation: ticketData.lossObservation
      };

      const updatedTicket = await updateTicket(ticketId, supabaseData);
      
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(updatedTicket);
      }

      console.log('Ticket actualizado en Supabase:', updatedTicket);
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    try {
      await updateTicket(ticketId, {
        status: 'cerrado-pendiente-cotizar',
        closed_at: new Date().toISOString(),
        closed_by: currentUser
      });
      console.log('Ticket cerrado:', ticketId);
    } catch (error) {
      console.error('Error closing ticket:', error);
    }
  };

  const handleDuplicateTicket = (ticket: any) => {
    // Generar nuevo número de ticket
    const ticketNumbers = legacyTickets.map(t => parseInt(t.ticketNumber));
    const nextNumber = Math.max(...ticketNumbers, 0) + 1;
    
    // Preparar datos para duplicar (sin ID, nuevo número y estado inicial)
    const duplicateData = {
      ticketNumber: nextNumber.toString().padStart(4, '0'),
      title: `${ticket.title} (Copia)`,
      description: ticket.description,
      priority: ticket.priority,
      assignedTo: ticket.assignedTo,
      client: ticket.client,
      project: ticket.project,
      location: ticket.location,
      category: ticket.category,
      internalNotes: ticket.internalNotes
    };
    
    setDuplicateTicketData(duplicateData);
    setSelectedTicket(null);
    setShowCreateForm(true);
  };

  // TODO: Implementar handlers para visitas, servicios, cotizaciones, etc.
  const handleAddService = (ticketId: string, serviceData: any) => {
    console.log('Add service (TODO):', serviceData);
  };

  const handleCreateQuotation = (quotationData: any) => {
    console.log('Create quotation (TODO):', quotationData);
  };

  const handleAddAttachment = (ticketId: string, fileName: string) => {
    console.log('Add attachment (TODO):', fileName);
  };

  const handleAddVisit = (ticketId: string, visitData: any) => {
    console.log('Add visit (TODO):', visitData);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (showQuotationForm && selectedTicket) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <CreateQuotationForm 
          ticket={convertSupabaseToLegacyTicket(selectedTicket)}
          existingQuotations={[]} // TODO: Cargar cotizaciones reales
          onClose={() => setShowQuotationForm(false)}
          onCreateQuotation={handleCreateQuotation}
        />
      </div>
    );
  }

  if (showServiceForm && selectedTicket) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <AddServiceForm 
          ticket={convertSupabaseToLegacyTicket(selectedTicket)}
          currentUser={currentUser}
          onClose={() => setShowServiceForm(false)}
          onAddService={handleAddService}
        />
      </div>
    );
  }

  if (showAttachmentUpload && selectedTicket) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <AttachmentUpload 
          ticket={convertSupabaseToLegacyTicket(selectedTicket)}
          onClose={() => setShowAttachmentUpload(false)}
          onAddAttachment={handleAddAttachment}
        />
      </div>
    );
  }

  if (showEditForm && selectedTicket) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <EditTicketForm 
          ticket={selectedTicket}
          onClose={() => setShowEditForm(false)}
          onUpdateTicket={handleUpdateTicket}
        />
      </div>
    );
  }

  if (showVisitForm && selectedTicket) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <AddVisitForm 
          ticket={convertSupabaseToLegacyTicket(selectedTicket)}
          userRole={userRole}
          currentUser={currentUser}
          onClose={() => setShowVisitForm(false)}
          onAddVisit={handleAddVisit}
        />
      </div>
    );
  }

  if (selectedTicket) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <TicketDetail 
          ticket={convertSupabaseToLegacyTicket(selectedTicket)} 
          userRole={userRole}
          currentUser={currentUser}
          onClose={() => setSelectedTicket(null)}
          onShowVisitForm={() => setShowVisitForm(true)}
          onShowEditForm={() => setShowEditForm(true)}
          onShowAttachmentUpload={() => setShowAttachmentUpload(true)}
          onShowServiceForm={() => setShowServiceForm(true)}
          onShowQuotationForm={() => setShowQuotationForm(true)}
          onCloseTicket={handleCloseTicket}
          onDuplicateTicket={handleDuplicateTicket}
        />
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <CreateTicketForm 
          tickets={legacyTickets}
          userRole={userRole}
          duplicateData={duplicateTicketData}
          onClose={() => {
            setShowCreateForm(false);
            setDuplicateTicketData(null);
          }}
          onCreateTicket={async (ticketData) => {
            await handleCreateTicket(ticketData);
            setShowCreateForm(false);
            setDuplicateTicketData(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Tickets de Servicio</h1>
          <p className="text-gray-600">
            Gestiona servicios técnicos, cotizaciones y facturación
            {userRole === 'technician' && ' (Vista de Técnico)'}
          </p>
        </div>
        {(userRole === 'admin' || userRole === 'manager') && (
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
          >
            <Plus size={20} className="mr-2" />
            Nuevo Ticket
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <TicketStats tickets={filteredTickets} />

      {/* Filters and Search */}
      <TicketFilters 
        filter={filter}
        searchTerm={searchTerm}
        onFilterChange={setFilter}
        onSearchChange={setSearchTerm}
      />

      {/* Tickets Table */}
      <TicketsList 
        tickets={filteredTickets}
        onSelectTicket={(ticket) => {
          const supabaseTicket = tickets.find(t => t.id === ticket.id);
          if (supabaseTicket) setSelectedTicket(supabaseTicket);
        }}
      />
    </div>
  );
};

export default TicketsModule;
