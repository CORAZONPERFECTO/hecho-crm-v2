
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { History, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { SyncHistoryItem } from '@/hooks/useOfflineSync';

interface SyncHistoryDialogProps {
  syncHistory: SyncHistoryItem[];
  onClearHistory: () => void;
}

const SyncHistoryDialog: React.FC<SyncHistoryDialogProps> = ({
  syncHistory,
  onClearHistory
}) => {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History size={16} />
          Historial ({syncHistory.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <History size={20} />
              Historial de Sincronización
            </DialogTitle>
            {syncHistory.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearHistory}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 size={16} className="mr-1" />
                Limpiar
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {syncHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              <p>No hay historial de sincronización</p>
              <p className="text-sm">Las sincronizaciones aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-4">
              {syncHistory.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {formatDate(item.timestamp)}
                      </Badge>
                      <span className="text-sm font-medium">
                        {item.totalItems} elemento{item.totalItems > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {item.successCount > 0 && (
                        <Badge variant="default" className="bg-green-100 text-green-800 gap-1">
                          <CheckCircle size={12} />
                          {item.successCount}
                        </Badge>
                      )}
                      {item.errorCount > 0 && (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle size={12} />
                          {item.errorCount}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {item.details.length > 0 && (
                    <>
                      <Separator className="my-2" />
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-600 mb-2">
                          Detalles:
                        </p>
                        {item.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="text-xs text-gray-700 pl-2 border-l-2 border-gray-200">
                            {detail}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SyncHistoryDialog;
