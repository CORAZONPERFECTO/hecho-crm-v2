import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  Edit, 
  Search, 
  Calendar,
  User,
  FileText,
  Image,
  Video,
  File,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { EditEvidenceDialog } from '../evidences/EditEvidenceDialog';

interface TicketEvidence {
  id: string;
  ticket_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  description: string | null;
  uploaded_by: string;
  created_at: string;
  sync_status?: 'pending' | 'synced' | 'failed';
  tickets?: {
    ticket_number: string;
    client: string;
    title: string;
  };
}

interface EvidenceManagementProps {
  searchTerm: string;
}

const EvidenceManagement: React.FC<EvidenceManagementProps> = ({ searchTerm }) => {
  const [evidences, setEvidences] = useState<TicketEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<string>('all');
  const [editingEvidence, setEditingEvidence] = useState<TicketEvidence | null>(null);
  const [tickets, setTickets] = useState<{id: string, ticket_number: string, client: string}[]>([]);

  const fetchEvidences = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('ticket_evidences')
        .select(`
          *,
          tickets!inner(
            ticket_number,
            client,
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (selectedTicket !== 'all') {
        query = query.eq('ticket_id', selectedTicket);
      }

      const { data, error } = await query;

      if (error) throw error;

      setEvidences((data || []) as TicketEvidence[]);
    } catch (error) {
      console.error('Error fetching evidences:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las evidencias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('id, ticket_number, client')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    fetchEvidences();
  }, [selectedTicket]);

  const handleDownload = async (evidence: TicketEvidence) => {
    try {
      // Extract file path from the full URL
      const urlParts = evidence.file_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      const { data, error } = await supabase.storage
        .from('ticket-evidences')
        .download(fileName);
      
      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = evidence.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Descarga iniciada",
        description: `Descargando ${evidence.file_name}`,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "No se pudo descargar el archivo",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image size={16} className="text-blue-500" />;
    if (fileType.startsWith('video/')) return <Video size={16} className="text-purple-500" />;
    if (fileType.includes('pdf')) return <FileText size={16} className="text-red-500" />;
    return <File size={16} className="text-gray-500" />;
  };

  const filteredEvidences = evidences.filter(evidence => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      evidence.file_name.toLowerCase().includes(searchLower) ||
      evidence.description?.toLowerCase().includes(searchLower) ||
      evidence.uploaded_by.toLowerCase().includes(searchLower) ||
      evidence.tickets?.ticket_number.toLowerCase().includes(searchLower) ||
      evidence.tickets?.client.toLowerCase().includes(searchLower)
    );
  });

  const formatFileSize = (url: string) => {
    // Placeholder for file size - would need actual implementation
    return 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} />
            Gestión de Evidencias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedTicket} onValueChange={setSelectedTicket}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por ticket" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tickets</SelectItem>
                  {tickets.map((ticket) => (
                    <SelectItem key={ticket.id} value={ticket.id}>
                      {ticket.ticket_number} - {ticket.client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evidences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredEvidences.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No se encontraron evidencias</p>
            <p className="text-gray-400">Prueba ajustando los filtros de búsqueda</p>
          </div>
        ) : (
          filteredEvidences.map((evidence) => (
            <Card key={evidence.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {/* File Preview */}
                <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {evidence.file_type.startsWith('image/') ? (
                    <img 
                      src={evidence.file_url} 
                      alt={evidence.file_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      {getFileIcon(evidence.file_type)}
                      <span className="text-xs text-gray-500 mt-2">
                        {evidence.file_type.split('/')[1]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Evidence Info */}
                <div className="space-y-2">
                  <h3 className="font-medium text-sm truncate" title={evidence.file_name}>
                    {evidence.file_name}
                  </h3>
                  
                  {evidence.description && (
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {evidence.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User size={12} />
                    <span>{evidence.uploaded_by}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={12} />
                    <span>{new Date(evidence.created_at).toLocaleDateString()}</span>
                  </div>

                  {evidence.tickets && (
                    <Badge variant="outline" className="text-xs">
                      {evidence.tickets.ticket_number}
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingEvidence(evidence)}
                    className="flex-1"
                  >
                    <Edit size={14} className="mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(evidence)}
                    className="flex-1"
                  >
                    <Download size={14} className="mr-1" />
                    Descargar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(evidence.file_url, '_blank')}
                  >
                    <ExternalLink size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Evidence Dialog */}
      {editingEvidence && (
        <EditEvidenceDialog
          evidence={{
            ...editingEvidence,
            sync_status: editingEvidence.sync_status || 'synced',
            tickets: editingEvidence.tickets ? {
              id: '',
              ticket_number: editingEvidence.tickets.ticket_number,
              title: editingEvidence.tickets.title,
              status: ''
            } : undefined
          }}
          open={!!editingEvidence}
          onClose={() => setEditingEvidence(null)}
          onSave={(updatedEvidence) => {
            setEvidences(prev => 
              prev.map(e => e.id === updatedEvidence.id ? { ...e, file_name: updatedEvidence.file_name, description: updatedEvidence.description } : e)
            );
            setEditingEvidence(null);
            toast({
              title: "Evidencia actualizada",
              description: "Los cambios se han guardado correctamente",
            });
          }}
        />
      )}
    </div>
  );
};

export default EvidenceManagement;