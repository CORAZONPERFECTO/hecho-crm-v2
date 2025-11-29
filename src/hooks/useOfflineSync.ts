import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useOnlineStatus } from './useOnlineStatus';
import { toast } from 'sonner';

export interface OfflineSyncData {
  id: string;
  module: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  retryCount: number;
}

export interface SyncHistoryItem {
  id: string;
  timestamp: string;
  totalItems: number;
  successCount: number;
  errorCount: number;
  details: string[];
}

export const useOfflineSync = () => {
  const [pendingSync, setPendingSync] = useLocalStorage<OfflineSyncData[]>('offline-sync-queue', []);
  const [syncHistory, setSyncHistory] = useLocalStorage<SyncHistoryItem[]>('sync-history', []);
  const [syncing, setSyncing] = useState(false);
  const [manualSyncRequested, setManualSyncRequested] = useState(false);
  const isOnline = useOnlineStatus();

  // Agregar datos para sincronizar cuando vuelva la conexión
  const addToSyncQueue = useCallback((module: string, action: 'create' | 'update' | 'delete', data: any) => {
    const syncItem: OfflineSyncData = {
      id: `${module}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      module,
      action,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    setPendingSync(prev => [...prev, syncItem]);
    
    if (!isOnline) {
      toast.info(`${action === 'create' ? 'Creación' : action === 'update' ? 'Actualización' : 'Eliminación'} guardada localmente - Se sincronizará automáticamente`);
    }

    console.log('📦 [OFFLINE] Agregado a cola de sincronización:', syncItem);
  }, [setPendingSync, isOnline]);

  // Remover elemento de la cola de sincronización
  const removeFromSyncQueue = useCallback((id: string) => {
    setPendingSync(prev => prev.filter(item => item.id !== id));
  }, [setPendingSync]);

  // Limpiar toda la cola de sincronización
  const clearSyncQueue = useCallback(() => {
    setPendingSync([]);
  }, [setPendingSync]);

  // Forzar sincronización manual
  const forceSyncNow = useCallback(() => {
    if (!isOnline) {
      toast.error('No hay conexión a internet para sincronizar');
      return;
    }

    if (pendingSync.length === 0) {
      toast.info('No hay elementos pendientes para sincronizar');
      return;
    }

    setManualSyncRequested(true);
    toast.info('🔄 Iniciando sincronización manual...');
    console.log('🔧 [SYNC] Sincronización manual solicitada');
  }, [isOnline, pendingSync.length]);

  // Limpiar historial de sincronización
  const clearSyncHistory = useCallback(() => {
    setSyncHistory([]);
    toast.success('Historial de sincronización limpiado');
  }, [setSyncHistory]);

  // Procesar cola de sincronización (versión mejorada)
  const processSyncQueue = useCallback(async (syncHandlers: Record<string, (item: OfflineSyncData) => Promise<void>>) => {
    if (!isOnline || pendingSync.length === 0 || syncing) return;

    setSyncing(true);
    const syncStartTime = new Date().toISOString();
    const isManual = manualSyncRequested;
    
    console.log(`🔄 [SYNC] Iniciando sincronización ${isManual ? 'manual' : 'automática'} de`, pendingSync.length, 'elementos');

    let successCount = 0;
    let errorCount = 0;
    const syncDetails: string[] = [];

    for (const item of pendingSync) {
      try {
        const handler = syncHandlers[item.module];
        if (handler) {
          await handler(item);
          removeFromSyncQueue(item.id);
          successCount++;
          
          const actionText = item.action === 'create' ? 'Creado' : 
                           item.action === 'update' ? 'Actualizado' : 'Eliminado';
          syncDetails.push(`${actionText}: ${item.module} (${new Date(item.timestamp).toLocaleString()})`);
        } else {
          console.warn('⚠️ [SYNC] No hay handler para el módulo:', item.module);
          errorCount++;
          syncDetails.push(`Error: No hay handler para ${item.module}`);
        }
      } catch (error) {
        console.error('❌ [SYNC] Error sincronizando elemento:', item, error);
        errorCount++;
        syncDetails.push(`Error: ${item.module} - ${error.message || 'Error desconocido'}`);
        
        // Incrementar contador de reintentos
        setPendingSync(prev => prev.map(p => 
          p.id === item.id ? { ...p, retryCount: p.retryCount + 1 } : p
        ));
      }
    }

    // Guardar en historial si hubo elementos procesados
    if (successCount > 0 || errorCount > 0) {
      const historyItem: SyncHistoryItem = {
        id: `sync-${Date.now()}`,
        timestamp: syncStartTime,
        totalItems: successCount + errorCount,
        successCount,
        errorCount,
        details: syncDetails
      };

      setSyncHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Mantener solo los últimos 10
    }

    setSyncing(false);
    setManualSyncRequested(false);

    if (successCount > 0) {
      const syncType = isManual ? 'manual' : 'automática';
      toast.success(`✅ Sincronización ${syncType} completada: ${successCount} elemento${successCount > 1 ? 's' : ''}`);
    }
    
    if (errorCount > 0) {
      toast.error(`❌ Error sincronizando ${errorCount} elemento${errorCount > 1 ? 's' : ''} - Se reintentará`);
    }

    console.log('🏁 [SYNC] Sincronización completada:', { successCount, errorCount, isManual });
  }, [isOnline, pendingSync, syncing, manualSyncRequested, removeFromSyncQueue, setPendingSync, setSyncHistory]);

  // Auto-sincronizar cuando se recupera la conexión
  useEffect(() => {
    if (isOnline && pendingSync.length > 0) {
      console.log('🌐 [SYNC] Conexión restaurada - Iniciando sincronización automática');
      // Pequeño delay para asegurar que la conexión esté estable
      setTimeout(() => {
        toast.info('🔄 Sincronizando datos offline...');
      }, 1000);
    }
  }, [isOnline, pendingSync.length]);

  return {
    pendingSync,
    syncHistory,
    syncing,
    isOnline,
    addToSyncQueue,
    removeFromSyncQueue,
    clearSyncQueue,
    clearSyncHistory,
    processSyncQueue,
    forceSyncNow,
    hasPendingSync: pendingSync.length > 0,
    manualSyncRequested
  };
};
