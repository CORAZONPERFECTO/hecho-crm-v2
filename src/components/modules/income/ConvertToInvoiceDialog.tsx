import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NCFType {
  id: string;
  code: string;
  name: string;
  prefix: string;
}

interface ConvertToInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  quotationId: string;
  quotationData: any;
  onSuccess: () => void;
}

const ConvertToInvoiceDialog: React.FC<ConvertToInvoiceDialogProps> = ({
  isOpen,
  onClose,
  quotationId,
  quotationData,
  onSuccess
}) => {
  const [ncfTypes, setNcfTypes] = useState<NCFType[]>([]);
  const [selectedNCFType, setSelectedNCFType] = useState<string>('');
  const [dueDate, setDueDate] = useState<Date>();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [ncfEnabled, setNcfEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadNCFConfiguration();
      // Establecer fecha de vencimiento por defecto (30 días)
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 30);
      setDueDate(defaultDueDate);
    }
  }, [isOpen]);

  const loadNCFConfiguration = async () => {
    try {
      // Cargar configuración de NCF
      const { data: settings } = await supabase
        .from('company_settings')
        .select('ncf_enabled')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setNcfEnabled(settings?.ncf_enabled || false);

      if (settings?.ncf_enabled) {
        // Cargar tipos de NCF activos
        const { data: types } = await supabase
          .from('ncf_types')
          .select('*')
          .eq('is_active', true)
          .order('code');

        setNcfTypes(types || []);
        
        // Seleccionar automáticamente B02 (Consumo) como predeterminado
        const defaultType = types?.find(t => t.code === 'B02');
        if (defaultType) {
          setSelectedNCFType(defaultType.code);
        }
      }
    } catch (error) {
      console.error('Error loading NCF configuration:', error);
    }
  };

  const generateInvoiceNumber = async () => {
    try {
      // Obtener configuración de empresa para el prefijo
      const { data: settings } = await supabase
        .from('company_settings')
        .select('invoice_prefix')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const prefix = settings?.invoice_prefix || 'FAC-';
      const timestamp = Date.now();
      return `${prefix}${timestamp}`;
    } catch (error) {
      return `FAC-${Date.now()}`;
    }
  };

  const generateNCFNumber = async (ncfTypeCode: string) => {
    if (!ncfEnabled || !ncfTypeCode) return null;

    try {
      // Llamar a la función para obtener el próximo número de secuencia
      const { data, error } = await supabase.rpc('get_next_ncf_sequence', {
        ncf_type_code: ncfTypeCode
      });

      if (error) throw error;

      // Formatear el número NCF (8 dígitos con ceros a la izquierda)
      const sequence = data.toString().padStart(8, '0');
      return `${ncfTypeCode}${sequence}`;
    } catch (error) {
      console.error('Error generating NCF number:', error);
      return null;
    }
  };

  const handleConvert = async () => {
    try {
      setLoading(true);

      // Generar número de factura
      const invoiceNumber = await generateInvoiceNumber();

      // Generar número NCF si está habilitado
      let ncfNumber = null;
      let ncfSequence = null;
      if (ncfEnabled && selectedNCFType) {
        ncfNumber = await generateNCFNumber(selectedNCFType);
        if (ncfNumber) {
          // Extraer la secuencia del número NCF
          ncfSequence = parseInt(ncfNumber.slice(3)); // Remover los primeros 3 caracteres (B01, B02, etc.)
        }
      }

      // Crear la factura
      const invoiceData = {
        number: invoiceNumber,
        customer_id: null, // Por ahora no tenemos customer_id
        amount: quotationData.total || 0,
        status: 'pendiente',
        description: `Factura generada desde cotización ${quotationData.number || quotationId}`,
        due_date: dueDate?.toISOString().split('T')[0],
        quotation_id: quotationId,
        ncf_type_code: ncfEnabled ? selectedNCFType : null,
        ncf_number: ncfNumber,
        ncf_sequence: ncfSequence
      };

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Marcar la cotización como convertida
      const { error: quotationError } = await supabase
        .from('quotations')
        .update({
          converted_to_invoice: true,
          invoice_id: invoice.id
        })
        .eq('id', quotationId);

      if (quotationError) throw quotationError;

      toast({
        title: "Factura creada",
        description: `La factura ${invoiceNumber} ha sido creada exitosamente${ncfNumber ? ` con NCF ${ncfNumber}` : ''}`,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error converting quotation to invoice:', error);
      toast({
        title: "Error",
        description: "No se pudo convertir la cotización a factura",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Convertir a Factura</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Cotización: {quotationData?.number || quotationId}
          </div>

          {ncfEnabled && (
            <div className="space-y-2">
              <Label>Tipo de NCF</Label>
              <Select value={selectedNCFType} onValueChange={setSelectedNCFType}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo de NCF" />
                </SelectTrigger>
                <SelectContent>
                  {ncfTypes.map((type) => (
                    <SelectItem key={type.id} value={type.code}>
                      {type.code} - {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Fecha de Vencimiento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Notas (opcional)</Label>
            <Textarea
              placeholder="Notas adicionales para la factura..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConvert} 
              disabled={loading || (ncfEnabled && !selectedNCFType)}
            >
              {loading ? "Convirtiendo..." : "Crear Factura"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertToInvoiceDialog;