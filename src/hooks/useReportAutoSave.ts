import { useEffect, useCallback, useRef } from 'react';
import { useTechnicalReports, ReportFormData } from './useTechnicalReports';
import { useLocalStorage } from './useLocalStorage';
import { useOnlineStatus } from './useOnlineStatus';
import { toast } from '@/hooks/use-toast';

interface AutoSaveData {
  reportId: string;
  formData: ReportFormData;
  lastSaved: string;
  isDirty: boolean;
}

export const useReportAutoSave = (reportId?: string) => {
  const { autoSaveReport } = useTechnicalReports();
  const [pendingData, setPendingData] = useLocalStorage<AutoSaveData[]>('pending-reports', []);
  const isOnline = useOnlineStatus();
  const autoSaveInterval = useRef<NodeJS.Timeout>();
  const lastSaveTime = useRef<Date>();

  // Autoguardado cada 30 segundos
  const startAutoSave = useCallback((id: string, formData: ReportFormData) => {
    if (autoSaveInterval.current) {
      clearInterval(autoSaveInterval.current);
    }

    // Guardar inmediatamente en localStorage
    const saveData: AutoSaveData = {
      reportId: id,
      formData,
      lastSaved: new Date().toISOString(),
      isDirty: true
    };

    setPendingData(prev => {
      const filtered = prev.filter(item => item.reportId !== id);
      return [...filtered, saveData];
    });

    // Configurar intervalo de autoguardado
    autoSaveInterval.current = setInterval(async () => {
      if (isOnline && reportId) {
        try {
          await autoSaveReport(id, formData);
          lastSaveTime.current = new Date();
          
          // Actualizar estado como guardado
          setPendingData(prev => prev.map(item => 
            item.reportId === id 
              ? { ...item, isDirty: false, lastSaved: new Date().toISOString() }
              : item
          ));

          console.log('Autoguardado exitoso:', new Date().toLocaleTimeString());
        } catch (error) {
          console.error('Error en autoguardado:', error);
        }
      }
    }, 30000); // 30 segundos
  }, [reportId, autoSaveReport, isOnline, setPendingData]);

  const stopAutoSave = useCallback(() => {
    if (autoSaveInterval.current) {
      clearInterval(autoSaveInterval.current);
      autoSaveInterval.current = undefined;
    }
  }, []);

  const saveNow = useCallback(async (id: string, formData: ReportFormData) => {
    if (!isOnline || !id) return false;

    try {
      await autoSaveReport(id, formData);
      lastSaveTime.current = new Date();
      
      // Actualizar estado como guardado
      setPendingData(prev => prev.map(item => 
        item.reportId === id 
          ? { ...item, isDirty: false, lastSaved: new Date().toISOString() }
          : item
      ));

      toast({
        title: "Guardado",
        description: "Reporte guardado correctamente",
      });
      
      return true;
    } catch (error) {
      console.error('Error guardando:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el reporte",
        variant: "destructive",
      });
      return false;
    }
  }, [autoSaveReport, isOnline, setPendingData]);

  const getSavedData = useCallback((id: string) => {
    return pendingData.find(item => item.reportId === id);
  }, [pendingData]);

  const clearSavedData = useCallback((id: string) => {
    setPendingData(prev => prev.filter(item => item.reportId !== id));
  }, [setPendingData]);

  const syncPendingReports = useCallback(async () => {
    if (!isOnline) return;

    for (const data of pendingData.filter(item => item.isDirty)) {
      try {
        await autoSaveReport(data.reportId, data.formData);
        setPendingData(prev => prev.map(item => 
          item.reportId === data.reportId 
            ? { ...item, isDirty: false, lastSaved: new Date().toISOString() }
            : item
        ));
        console.log('Sincronizado reporte:', data.reportId);
      } catch (error) {
        console.error('Error sincronizando reporte:', data.reportId, error);
      }
    }
  }, [isOnline, pendingData, autoSaveReport, setPendingData]);

  // Sincronizar cuando se recupere la conexión
  useEffect(() => {
    if (isOnline && pendingData.some(item => item.isDirty)) {
      syncPendingReports();
    }
  }, [isOnline, syncPendingReports]);

  // Limpiar intervalos al desmontar
  useEffect(() => {
    return () => {
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current);
      }
    };
  }, []);

  return {
    startAutoSave,
    stopAutoSave,
    saveNow,
    getSavedData,
    clearSavedData,
    syncPendingReports,
    isOnline,
    lastSaveTime: lastSaveTime.current,
    hasPendingChanges: pendingData.some(item => item.isDirty)
  };
};