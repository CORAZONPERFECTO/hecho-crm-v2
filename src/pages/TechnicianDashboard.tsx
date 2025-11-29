import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, User, LogOut, Camera, Clock, MapPin, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  client: string;
  location: string;
  category: string;
  created_at: string;
  updated_at: string;
}

interface TicketComment {
  id: string;
  ticket_id: string;
  comment: string;
  created_at: string;
  created_by: string;
}


const TechnicianDashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [comments, setComments] = useState<{ [key: string]: TicketComment[] }>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    client: '',
    location: '',
    category: '',
    priority: 'media'
  });

  useEffect(() => {
    console.log('TechnicianDashboard mounted, user:', user?.email, 'profile:', profile?.role);
    if (user && profile) {
      fetchTechniciansTickets();
    }
  }, [user, profile]);

  useEffect(() => {
    if (selectedTicket) {
      fetchTicketComments(selectedTicket.id);
    }
  }, [selectedTicket]);

  // Efecto para abrir automáticamente un ticket específico desde URL
  useEffect(() => {
    const ticketId = searchParams.get('ticket');
    console.log('Checking for ticket parameter:', ticketId);
    if (ticketId && tickets.length > 0) {
      console.log('Looking for ticket in list:', tickets.map(t => t.id));
      const foundTicket = tickets.find(t => t.id === ticketId);
      if (foundTicket) {
        setSelectedTicket(foundTicket);
        toast({
          title: "Ticket abierto",
          description: `Ticket ${foundTicket.ticket_number} abierto automáticamente`,
        });
      } else {
        toast({
          title: "Ticket no encontrado",
          description: "El ticket especificado no está asignado a tu usuario",
          variant: "destructive",
        });
      }
    }
  }, [tickets, searchParams, toast]);

  const fetchTechniciansTickets = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('assigned_to', profile.name)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketComments = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('ticket_comments')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(prev => ({ ...prev, [ticketId]: data || [] }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleCreateTicket = async () => {
    if (!profile) return;

    try {
      const ticketNumber = `TK-${Date.now()}`;
      
      const { error } = await supabase
        .from('tickets')
        .insert({
          ticket_number: ticketNumber,
          title: newTicket.title,
          description: newTicket.description,
          priority: newTicket.priority,
          status: 'abierto',
          assigned_to: profile.name,
          client: newTicket.client,
          location: newTicket.location,
          category: newTicket.category
        });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Ticket creado correctamente",
      });

      setNewTicket({
        title: '',
        description: '',
        client: '',
        location: '',
        category: '',
        priority: 'media'
      });
      setShowCreateForm(false);
      fetchTechniciansTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el ticket",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(newStatus === 'cerrado' ? { 
            closed_at: new Date().toISOString(),
            closed_by: profile?.name 
          } : {})
        })
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Estado del ticket actualizado",
      });

      fetchTechniciansTickets();
      setSelectedTicket(null);
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el ticket",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async (ticketId: string) => {
    if (!newComment.trim() || !profile) return;

    try {
      const { error } = await supabase
        .from('ticket_comments')
        .insert({
          ticket_id: ticketId,
          comment: newComment,
          created_by: profile.name
        });

      if (error) throw error;

      setNewComment('');
      fetchTicketComments(ticketId);
      
      toast({
        title: "Éxito",
        description: "Comentario agregado",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el comentario",
        variant: "destructive",
      });
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'abierto': return 'bg-red-500';
      case 'en_proceso': return 'bg-yellow-500';
      case 'cerrado': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baja': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">Panel Técnico</h1>
              <Badge variant="outline" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {profile?.name}
              </Badge>
            </div>
            <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                <p className="text-2xl font-bold text-foreground">{tickets.length}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Abiertos</p>
                <p className="text-2xl font-bold text-red-600">
                  {tickets.filter(t => t.status === 'abierto').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <div className="h-6 w-6 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Proceso</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {tickets.filter(t => t.status === 'en_proceso').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-6 w-6 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cerrados</p>
                <p className="text-2xl font-bold text-green-600">
                  {tickets.filter(t => t.status === 'cerrado').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-6 w-6 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar tickets por número, cliente o título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="abierto">Abierto</SelectItem>
              <SelectItem value="en_proceso">En Proceso</SelectItem>
              <SelectItem value="cerrado">Cerrado</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Ticket</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título del ticket"
                  />
                </div>
                
                <div>
                  <Label htmlFor="client">Cliente *</Label>
                  <Input
                    id="client"
                    value={newTicket.client}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, client: e.target.value }))}
                    placeholder="Nombre del cliente"
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Ubicación *</Label>
                  <Input
                    id="location"
                    value={newTicket.location}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Ubicación del servicio"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Input
                    id="category"
                    value={newTicket.category}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Tipo de servicio"
                  />
                </div>
                
                <div>
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select value={newTicket.priority} onValueChange={(value) => setNewTicket(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baja">Baja</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción detallada del problema"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateTicket} className="flex-1">
                    Crear Ticket
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tickets List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedTicket(ticket)}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{ticket.title}</h3>
                    <p className="text-sm text-muted-foreground">{ticket.ticket_number}</p>
                  </div>
                  <div className={`h-3 w-3 rounded-full ${getStatusColor(ticket.status)}`}></div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{ticket.client}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{ticket.location}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(ticket.created_at), 'dd/MM/yyyy', { locale: es })}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron tickets</p>
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedTicket.title}</span>
                <Badge className={getPriorityColor(selectedTicket.priority)}>
                  {selectedTicket.priority}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Ticket:</span> {selectedTicket.ticket_number}
                </div>
                <div>
                  <span className="font-medium">Cliente:</span> {selectedTicket.client}
                </div>
                <div>
                  <span className="font-medium">Ubicación:</span> {selectedTicket.location}
                </div>
                <div>
                  <span className="font-medium">Categoría:</span> {selectedTicket.category}
                </div>
              </div>
              
              <div>
                <span className="font-medium">Descripción:</span>
                <p className="mt-2 text-muted-foreground">{selectedTicket.description}</p>
              </div>
              
              <div>
                <Label>Cambiar Estado</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant={selectedTicket.status === 'abierto' ? 'default' : 'outline'}
                    onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'abierto')}
                  >
                    Abierto
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedTicket.status === 'en_proceso' ? 'default' : 'outline'}
                    onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'en_proceso')}
                  >
                    En Proceso
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedTicket.status === 'cerrado' ? 'default' : 'outline'}
                    onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'cerrado')}
                  >
                    Cerrado
                  </Button>
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-4 w-4" />
                  <span className="font-medium">Comentarios</span>
                </div>
                
                <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                  {comments[selectedTicket.id]?.map((comment) => (
                    <div key={comment.id} className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium">{comment.created_by}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{comment.comment}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Agregar comentario..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => handleAddComment(selectedTicket.id)}
                    disabled={!newComment.trim()}
                  >
                    Enviar
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TechnicianDashboard;