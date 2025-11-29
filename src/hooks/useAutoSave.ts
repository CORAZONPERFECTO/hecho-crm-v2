
import { useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useOnlineStatus } from './useOnlineStatus';

interface AutoSaveData {
  ticketId: string;
  formData: any;
  photos: string[];
  lastSaved: string;
}

export function useAutoSave(ticketId: string) {
  const [pendingData, setPendingData] = useLocalStorage<AutoSaveData[]>('pending-tickets', []);
  const isOnline = useOnlineStatus();

  const saveLocally = useCallback((formData: any, photos: string[] = []) => {
    const saveData: AutoSaveData = {
      ticketId,
      formData,
      photos,
      lastSaved: new Date().toISOString()
    };

    setPendingData(prev => {
      const filtered = prev.filter(item => item.ticketId !== ticketId);
      return [...filtered, saveData];
    });

    console.log('Datos guardados localmente para ticket:', ticketId);
  }, [ticketId, setPendingData]);

  const clearSavedData = useCallback(() => {
    setPendingData(prev => prev.filter(item => item.ticketId !== ticketId));
  }, [ticketId, setPendingData]);

  const getSavedData = useCallback(() => {
    return pendingData.find(item => item.ticketId === ticketId);
  }, [pendingData, ticketId]);

  const syncPendingData = useCallback(async (onSyncCallback?: (data: AutoSaveData) => Promise<void>) => {
    if (!isOnline || !onSyncCallback) return;

    for (const data of pendingData) {
      try {
        await onSyncCallback(data);
        setPendingData(prev => prev.filter(item => item.ticketId !== data.ticketId));
        console.log('Datos sincronizados para ticket:', data.ticketId);
      } catch (error) {
        console.error('Error sincronizando ticket:', data.ticketId, error);
      }
    }
  }, [isOnline, pendingData, setPendingData]);

  return {
    saveLocally,
    clearSavedData,
    getSavedData,
    syncPendingData,
    isOnline,
    hasPendingData: pendingData.length > 0
  };
}
