
import { useTechnicalResources, TechnicalResource } from './useTechnicalResources';
import { useOfflineSync } from './useOfflineSync';

export const useTechnicalResourcesOffline = () => {
  const resourcesHook = useTechnicalResources();
  const { addToSyncQueue, isOnline } = useOfflineSync();

  const createResourceOffline = async (resource: Omit<TechnicalResource, 'id' | 'created_at' | 'updated_at'>) => {
    if (isOnline) {
      return await resourcesHook.createResource(resource);
    } else {
      addToSyncQueue('technical_resources', 'create', resource);
      
      // Crear recurso temporal para la UI
      const tempResource: TechnicalResource = {
        ...resource,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return tempResource;
    }
  };

  const updateResourceOffline = async (id: string, updates: Partial<TechnicalResource>) => {
    if (isOnline) {
      return await resourcesHook.updateResource(id, updates);
    } else {
      addToSyncQueue('technical_resources', 'update', { id, updates });
      return { id, ...updates, updated_at: new Date().toISOString() } as TechnicalResource;
    }
  };

  const deleteResourceOffline = async (id: string) => {
    if (isOnline) {
      return await resourcesHook.deleteResource(id);
    } else {
      addToSyncQueue('technical_resources', 'delete', { id });
    }
  };

  return {
    ...resourcesHook,
    createResource: createResourceOffline,
    updateResource: updateResourceOffline,
    deleteResource: deleteResourceOffline,
    isOnline
  };
};
