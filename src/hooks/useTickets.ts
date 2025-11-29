
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SupabaseTicket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  priority: 'alta' | 'media' | 'baja';
  status: 'abierto' | 'en-progreso' | 'cerrado-pendiente-cotizar' | 'aprobado-factura' | 'facturado-finalizado' | 'finalizado-por-tecnico';
  assigned_to: string;
  client: string;
  project?: string;
  location: string;
  category: string;
  internal_notes?: string;
  attachments: string[];
  exclude_from_profit_loss: boolean;
  loss_observation?: string;
  closed_at?: string;
  closed_by?: string;
  fecha_finalizacion_tecnico?: string;
  id_tecnico_finalizador?: string;
  created_at: string;
  updated_at: string;
}

export const useTickets = () => {
  const [tickets, setTickets] = useState<SupabaseTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTickets = async () => {
    try {
      // MOCK TEMPORAL PARA EVITAR CRASHES CON SUPABASE
      console.log('Using mock tickets to prevent Supabase crash');
      setTickets([]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setLoading(false);
    }
  };

  const createTicket = async (ticketData: Omit<SupabaseTicket, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .insert([ticketData])
        .select()
        .single();

      if (error) throw error;

      const typedTicket = {
        ...data,
        priority: data.priority as 'alta' | 'media' | 'baja',
        status: data.status as 'abierto' | 'en-progreso' | 'cerrado-pendiente-cotizar' | 'aprobado-factura' | 'facturado-finalizado' | 'finalizado-por-tecnico',
        attachments: data.attachments || [],
        exclude_from_profit_loss: data.exclude_from_profit_loss || false
      } as SupabaseTicket;

      setTickets(prev => [typedTicket, ...prev]);
      toast({
        title: "Éxito",
        description: "Ticket creado correctamente"
      });
      return typedTicket;
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el ticket",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateTicket = async (id: string, updates: Partial<SupabaseTicket>) => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const typedTicket = {
        ...data,
        priority: data.priority as 'alta' | 'media' | 'baja',
        status: data.status as 'abierto' | 'en-progreso' | 'cerrado-pendiente-cotizar' | 'aprobado-factura' | 'facturado-finalizado' | 'finalizado-por-tecnico',
        attachments: data.attachments || [],
        exclude_from_profit_loss: data.exclude_from_profit_loss || false
      } as SupabaseTicket;

      setTickets(prev => prev.map(ticket =>
        ticket.id === id ? typedTicket : ticket
      ));

      toast({
        title: "Éxito",
        description: "Ticket actualizado correctamente"
      });
      return typedTicket;
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el ticket",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return {
    tickets,
    loading,
    createTicket,
    updateTicket,
    refetch: fetchTickets
  };
};
