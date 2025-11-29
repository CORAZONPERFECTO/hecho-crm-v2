
import { useSupabaseTechnicians, Technician } from './useSupabaseTechnicians';
import { useOfflineSync } from './useOfflineSync';

export const useTechniciansOffline = () => {
  const techniciansHook = useSupabaseTechnicians();
  const { addToSyncQueue, isOnline } = useOfflineSync();

  const addTechnicianOffline = async (technicianData: Omit<Technician, 'id'>) => {
    if (isOnline) {
      return await techniciansHook.addTechnician(technicianData);
    } else {
      addToSyncQueue('technicians', 'create', technicianData);
      
      const tempTechnician: Technician = {
        ...technicianData,
        id: `temp-${Date.now()}`
      };
      
      return tempTechnician;
    }
  };

  const updateTechnicianOffline = async (id: string, updates: Partial<Technician>) => {
    if (isOnline) {
      return await techniciansHook.updateTechnician(id, updates);
    } else {
      addToSyncQueue('technicians', 'update', { id, updates });
      return { id, ...updates } as Technician;
    }
  };

  const deleteTechnicianOffline = async (id: string) => {
    if (isOnline) {
      return await techniciansHook.deleteTechnician(id);
    } else {
      addToSyncQueue('technicians', 'delete', { id });
    }
  };

  return {
    ...techniciansHook,
    addTechnician: addTechnicianOffline,
    updateTechnician: updateTechnicianOffline,
    deleteTechnician: deleteTechnicianOffline,
    isOnline
  };
};
