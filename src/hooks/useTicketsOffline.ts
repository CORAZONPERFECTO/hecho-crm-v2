
import { useTickets } from './useTickets';
import { useOfflineSync } from './useOfflineSync';
import { SupabaseTicket } from './useTickets';

export const useTicketsOffline = () => {
  const ticketsHook = useTickets();
  const { addToSyncQueue, isOnline } = useOfflineSync();

  const createTicketOffline = async (ticketData: Omit<SupabaseTicket, 'id' | 'created_at' | 'updated_at'>) => {
    if (isOnline) {
      return await ticketsHook.createTicket(ticketData);
    } else {
      // Guardar localmente para sincronizar después
      addToSyncQueue('tickets', 'create', ticketData);
      
      // Crear un ticket temporal con ID local para mostrar en la UI
      const tempTicket: SupabaseTicket = {
        ...ticketData,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return tempTicket;
    }
  };

  const updateTicketOffline = async (id: string, updates: Partial<SupabaseTicket>) => {
    if (isOnline) {
      return await ticketsHook.updateTicket(id, updates);
    } else {
      // Guardar para sincronizar después
      addToSyncQueue('tickets', 'update', { id, updates });
      
      // Simular actualización local
      return { id, ...updates, updated_at: new Date().toISOString() } as SupabaseTicket;
    }
  };

  return {
    ...ticketsHook,
    createTicket: createTicketOffline,
    updateTicket: updateTicketOffline,
    isOnline
  };
};
