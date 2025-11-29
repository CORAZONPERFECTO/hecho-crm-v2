import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileText, User, Briefcase, AlignLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PDFEditToolbarProps {
  metadata: {
    ticketNumber?: string;
    ticketTitle?: string;
    clientName?: string;
    description?: string;
  };
  onMetadataChange: (metadata: any) => void;
  totalEvidences: number;
}

export const PDFEditToolbar: React.FC<PDFEditToolbarProps> = ({
  metadata,
  onMetadataChange,
  totalEvidences
}) => {
  const handleChange = (field: string, value: string) => {
    onMetadataChange({ ...metadata, [field]: value });
  };

  return (
    <div className="p-4 space-y-4 border-b bg-card">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Información del Reporte</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="ticketNumber" className="text-xs">
              N° Ticket
            </Label>
            <Input
              id="ticketNumber"
              value={metadata.ticketNumber || ''}
              onChange={(e) => handleChange('ticketNumber', e.target.value)}
              placeholder="TK-001"
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="clientName" className="text-xs">
              Cliente
            </Label>
            <Input
              id="clientName"
              value={metadata.clientName || ''}
              onChange={(e) => handleChange('clientName', e.target.value)}
              placeholder="Nombre"
              className="h-8 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ticketTitle" className="text-xs">
            Proyecto
          </Label>
          <Input
            id="ticketTitle"
            value={metadata.ticketTitle || ''}
            onChange={(e) => handleChange('ticketTitle', e.target.value)}
            placeholder="Nombre del proyecto"
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-xs">
            Descripción
          </Label>
          <Textarea
            id="description"
            value={metadata.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Descripción del trabajo realizado..."
            className="min-h-[80px] text-sm resize-none"
          />
        </div>

        <div className="pt-2 pb-1 px-3 bg-muted rounded-lg">
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total evidencias:</span>
              <span className="font-semibold">{totalEvidences}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha:</span>
              <span className="font-semibold">
                {new Date().toLocaleDateString('es-ES')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
