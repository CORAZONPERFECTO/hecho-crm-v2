
import { SupabaseTicket } from '@/hooks/useTickets';
import { Ticket } from './types';

export const convertSupabaseToLegacyTicket = (supabaseTicket: SupabaseTicket): Ticket => {
  return {
    id: supabaseTicket.id,
    ticketNumber: supabaseTicket.ticket_number,
    title: supabaseTicket.title,
    description: supabaseTicket.description,
    priority: supabaseTicket.priority,
    status: supabaseTicket.status,
    assignedTo: supabaseTicket.assigned_to,
    client: supabaseTicket.client,
    project: supabaseTicket.project,
    location: supabaseTicket.location,
    createdAt: supabaseTicket.created_at,
    updatedAt: supabaseTicket.updated_at,
    category: supabaseTicket.category,
    attachments: supabaseTicket.attachments || [],
    internalNotes: supabaseTicket.internal_notes || '',
    visits: [], // TODO: Cargar desde base de datos
    categoryServices: [], // TODO: Cargar desde base de datos
    closedAt: supabaseTicket.closed_at,
    closedBy: supabaseTicket.closed_by
  };
};

export const convertLegacyToSupabaseTicket = (legacyTicket: Ticket): Partial<SupabaseTicket> => {
  return {
    ticket_number: legacyTicket.ticketNumber,
    title: legacyTicket.title,
    description: legacyTicket.description,
    priority: legacyTicket.priority,
    status: legacyTicket.status,
    assigned_to: legacyTicket.assignedTo,
    client: legacyTicket.client,
    project: legacyTicket.project,
    location: legacyTicket.location,
    category: legacyTicket.category,
    internal_notes: legacyTicket.internalNotes,
    attachments: legacyTicket.attachments,
    closed_at: legacyTicket.closedAt,
    closed_by: legacyTicket.closedBy
  };
};
