
import React, { useState, useEffect } from 'react';
import { Camera, Search, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import EvidencesStats from './evidences/EvidencesStats';
import TicketEvidencesList from './evidences/TicketEvidencesList';

interface EvidencesModuleProps {
  userRole?: 'admin' | 'technician' | 'manager';
  currentUser?: string;
}

interface TicketWithEvidences {
  id: string;
  ticket_number: string;
  title: string;
  client: string;
  status: string;
  evidence_count: number;
}

const EvidencesModule: React.FC<EvidencesModuleProps> = ({ 
  userRole = 'admin',
  currentUser = 'Usuario Actual'
}) => {
  const [tickets, setTickets] = useState<TicketWithEvidences[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketWithEvidences | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchTicketsWithEvidences();
  }, []);

  const fetchTicketsWithEvidences = async () => {
    try {
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('id, ticket_number, title, client, status')
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;

      // Obtener conteo de evidencias para cada ticket
      const ticketsWithEvidences = await Promise.all(
        tickets.map(async (ticket) => {
          const { count } = await supabase
            .from('ticket_evidences')
            .select('*', { count: 'exact' })
            .eq('ticket_id', ticket.id);

          return {
            ...ticket,
            evidence_count: count || 0
          };
        })
      );

      setTickets(ticketsWithEvidences);
    } catch (error) {
      console.error('Error fetching tickets with evidences:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.client.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'abierto': return 'bg-red-100 text-red-800';
      case 'en-progreso': return 'bg-yellow-100 text-yellow-800';
      case 'cerrado-pendiente-cotizar': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  if (selectedTicket) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedTicket(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Volver a Tickets
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              Evidencias - Ticket #{selectedTicket.ticket_number}
            </h1>
            <p className="text-gray-600">{selectedTicket.title}</p>
          </div>
        </div>

        <TicketEvidencesList
          ticketId={selectedTicket.id}
          ticketNumber={selectedTicket.ticket_number}
          ticketTitle={selectedTicket.title}
          clientName={selectedTicket.client}
          currentUser={currentUser}
          userRole={userRole}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Camera size={24} className="text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Evidencias por Ticket
          </h1>
          <p className="text-gray-600">
            Selecciona un ticket para ver y gestionar sus evidencias
          </p>
        </div>
      </div>

      {/* Stats */}
      <EvidencesStats />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Estado del ticket" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="abierto">Abierto</SelectItem>
                <SelectItem value="en-progreso">En Progreso</SelectItem>
                <SelectItem value="cerrado-pendiente-cotizar">Cerrado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets con Evidencias</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 animate-pulse rounded"></div>
              ))}
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-8">
              <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron tickets
              </h3>
              <p className="text-gray-500">
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((ticket) => (
                <Card 
                  key={ticket.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">
                            Ticket #{ticket.ticket_number}
                          </h3>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Camera size={12} />
                            {ticket.evidence_count} evidencias
                          </Badge>
                        </div>
                        <p className="text-gray-900 font-medium">{ticket.title}</p>
                        <p className="text-sm text-gray-600">Cliente: {ticket.client}</p>
                      </div>
                      <div className="text-right">
                        <Button variant="outline" size="sm">
                          Ver Evidencias
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EvidencesModule;
