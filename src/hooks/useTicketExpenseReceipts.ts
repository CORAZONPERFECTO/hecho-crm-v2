
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TicketExpenseReceipt {
  id: string;
  ticket_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  description?: string;
  expense_date: string;
  detected_amount?: number;
  confirmed_amount: number;
  currency: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export const useTicketExpenseReceipts = (ticketId?: string) => {
  const [receipts, setReceipts] = useState<TicketExpenseReceipt[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchReceipts = async () => {
    if (!ticketId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ticket_expense_receipts')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReceipts(data || []);
    } catch (error) {
      console.error('Error fetching expense receipts:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las facturas de gastos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadReceipt = async (
    file: File,
    confirmedAmount: number,
    description?: string,
    expenseDate?: string,
    detectedAmount?: number,
    uploadedBy: string = 'Usuario'
  ) => {
    if (!ticketId) throw new Error('Ticket ID is required');

    try {
      // Subir archivo a storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${ticketId}-${Date.now()}.${fileExt}`;
      const filePath = `${ticketId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('ticket-expense-receipts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública del archivo
      const { data: { publicUrl } } = supabase.storage
        .from('ticket-expense-receipts')
        .getPublicUrl(filePath);

      // Guardar registro en la base de datos
      const { data, error } = await supabase
        .from('ticket_expense_receipts')
        .insert([{
          ticket_id: ticketId,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          description,
          expense_date: expenseDate || new Date().toISOString().split('T')[0],
          detected_amount: detectedAmount,
          confirmed_amount: confirmedAmount,
          uploaded_by: uploadedBy
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Factura de gasto subida correctamente"
      });

      // Recargar la lista
      await fetchReceipts();
      return data;
    } catch (error) {
      console.error('Error uploading expense receipt:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la factura de gasto",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateReceipt = async (id: string, updates: Partial<TicketExpenseReceipt>) => {
    try {
      const { error } = await supabase
        .from('ticket_expense_receipts')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Factura actualizada correctamente"
      });

      await fetchReceipts();
    } catch (error) {
      console.error('Error updating expense receipt:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la factura",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteReceipt = async (id: string, fileUrl: string) => {
    try {
      // Eliminar archivo del storage
      const filePath = fileUrl.split('/').pop();
      if (filePath) {
        await supabase.storage
          .from('ticket-expense-receipts')
          .remove([`${ticketId}/${filePath}`]);
      }

      // Eliminar registro de la base de datos
      const { error } = await supabase
        .from('ticket_expense_receipts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Factura eliminada correctamente"
      });

      await fetchReceipts();
    } catch (error) {
      console.error('Error deleting expense receipt:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la factura",
        variant: "destructive"
      });
      throw error;
    }
  };

  const getTotalExpenses = () => {
    return receipts.reduce((total, receipt) => total + receipt.confirmed_amount, 0);
  };

  useEffect(() => {
    if (ticketId) {
      fetchReceipts();
    }
  }, [ticketId]);

  return {
    receipts,
    loading,
    uploadReceipt,
    updateReceipt,
    deleteReceipt,
    getTotalExpenses,
    refetch: fetchReceipts
  };
};
