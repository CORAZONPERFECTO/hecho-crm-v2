import React, { useEffect } from 'react';
import { useOfflineSync, OfflineSyncData } from '@/hooks/useOfflineSync';
import { useTickets } from '@/hooks/useTickets';
import { useTechnicalResources } from '@/hooks/useTechnicalResources';
import { useSupabaseTechnicians } from '@/hooks/useSupabaseTechnicians';
import { useClientVillas } from '@/hooks/useClientVillas';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wifi, WifiOff, RefreshCw, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';
import SyncHistoryDialog from '@/components/SyncHistoryDialog';

const OfflineSyncManager: React.FC = () => {
  const {
    pendingSync,
    syncHistory,
    syncing,
    isOnline,
    processSyncQueue,
    forceSyncNow,
    clearSyncHistory
  } = useOfflineSync();

  const [isExpanded, setIsExpanded] = React.useState(false);

  const { createTicket, updateTicket } = useTickets();
  const { createResource, updateResource, deleteResource } = useTechnicalResources();
  const { addTechnician, updateTechnician, deleteTechnician } = useSupabaseTechnicians();
  const { createVilla, updateVilla, deleteVilla } = useClientVillas();

  // Definir handlers de sincronización para cada módulo
  const syncHandlers = {
    tickets: async (item: OfflineSyncData) => {
      console.log('🎫 [SYNC] Sincronizando ticket:', item);
      switch (item.action) {
        case 'create':
          await createTicket(item.data);
          break;
        case 'update':
          await updateTicket(item.data.id, item.data.updates);
          break;
        default:
          console.warn('⚠️ [SYNC] Acción no soportada para tickets:', item.action);
      }
    },

    technical_resources: async (item: OfflineSyncData) => {
      console.log('🔧 [SYNC] Sincronizando recurso técnico:', item);
      switch (item.action) {
        case 'create':
          await createResource(item.data);
          break;
        case 'update':
          await updateResource(item.data.id, item.data.updates);
          break;
        case 'delete':
          await deleteResource(item.data.id);
          break;
      }
    },

    technicians: async (item: OfflineSyncData) => {
      console.log('👥 [SYNC] Sincronizando técnico:', item);
      switch (item.action) {
        case 'create':
          await addTechnician(item.data);
          break;
        case 'update':
          await updateTechnician(item.data.id, item.data.updates);
          break;
        case 'delete':
          await deleteTechnician(item.data.id);
          break;
      }
    },

    villas: async (item: OfflineSyncData) => {
      console.log('🏠 [SYNC] Sincronizando villa:', item);
      switch (item.action) {
        case 'create':
          await createVilla(item.data);
          break;
        case 'update':
          await updateVilla(item.data.id, item.data.updates);
          break;
        case 'delete':
          await deleteVilla(item.data.id);
          break;
      }
    }
  };

  // Procesar cola cuando hay conexión
  useEffect(() => {
    if (isOnline && pendingSync.length > 0) {
      const timer = setTimeout(() => {
        processSyncQueue(syncHandlers);
      }, 2000); // Dar tiempo a que se estabilice la conexión

      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingSync.length, processSyncQueue]);

  // No renderizar nada si no hay datos pendientes y no hay historial
  if (pendingSync.length === 0 && syncHistory.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="bg-white shadow-lg border">
        <CardContent className="p-3">
          {/* Indicador principal */}
          <div className="flex items-center gap-3">
            <Badge
              variant={isOnline ? (syncing ? "default" : "outline") : "destructive"}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium"
            >
              {syncing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : isOnline ? (
                <Wifi className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}

              {syncing ? (
                'Sincronizando...'
              ) : isOnline ? (
                `${pendingSync.length} pendiente${pendingSync.length > 1 ? 's' : ''}`
              ) : (
                `${pendingSync.length} offline`
              )}
            </Badge>

            {/* Botón para expandir/contraer */}
            {(pendingSync.length > 0 || syncHistory.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 h-8 w-8"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </Button>
            )}
          </div>

          {/* Panel expandido */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t space-y-3">
              {/* Botones de acción */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={forceSyncNow}
                  disabled={!isOnline || pendingSync.length === 0 || syncing}
                  className="flex-1"
                >
                  <RotateCcw size={14} className="mr-1" />
                  {syncing ? 'Sincronizando...' : 'Forzar Sync'}
                </Button>

                <SyncHistoryDialog
                  syncHistory={syncHistory}
                  onClearHistory={clearSyncHistory}
                />
              </div>

              {/* Estado detallado */}
              <div className="text-xs text-gray-600 space-y-1">
                {pendingSync.length > 0 && (
                  <div>
                    📋 {pendingSync.length} elemento{pendingSync.length > 1 ? 's' : ''} en cola
                  </div>
                )}

                {syncHistory.length > 0 && (
                  <div>
                    📊 {syncHistory.length} sincronizacion{syncHistory.length > 1 ? 'es' : ''} en historial
                  </div>
                )}

                <div className="flex items-center">
                  {isOnline ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Conectado
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      Sin conexión
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflineSyncManager;
