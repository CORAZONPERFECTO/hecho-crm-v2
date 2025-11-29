
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FixedExpense {
  id: string;
  year: number;
  month: number;
  category: string;
  amount: number;
  description?: string;
  created_at: string;
}

export interface TicketExpense {
  id: string;
  ticket_id: string;
  category: string;
  amount: number;
  description?: string;
  created_at: string;
}

export const useExpenses = () => {
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [ticketExpenses, setTicketExpenses] = useState<TicketExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFixedExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('fixed_expenses')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) throw error;
      setFixedExpenses(data || []);
    } catch (error) {
      console.error('Error fetching fixed expenses:', error);
    }
  };

  const fetchTicketExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTicketExpenses(data || []);
    } catch (error) {
      console.error('Error fetching ticket expenses:', error);
    }
  };

  const createFixedExpense = async (expenseData: Omit<FixedExpense, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('fixed_expenses')
        .insert([expenseData])
        .select()
        .single();

      if (error) throw error;

      setFixedExpenses(prev => [data, ...prev]);
      toast({
        title: "Éxito",
        description: "Gasto fijo agregado correctamente"
      });
      return data;
    } catch (error) {
      console.error('Error creating fixed expense:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el gasto fijo",
        variant: "destructive"
      });
      throw error;
    }
  };

  const createTicketExpense = async (expenseData: Omit<TicketExpense, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('ticket_expenses')
        .insert([expenseData])
        .select()
        .single();

      if (error) throw error;

      setTicketExpenses(prev => [data, ...prev]);
      toast({
        title: "Éxito",
        description: "Gasto variable agregado correctamente"
      });
      return data;
    } catch (error) {
      console.error('Error creating ticket expense:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el gasto variable",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchFixedExpenses(), fetchTicketExpenses()]);
      setLoading(false);
    };

    fetchData();
  }, []);

  return {
    fixedExpenses,
    ticketExpenses,
    loading,
    createFixedExpense,
    createTicketExpense,
    refetchFixed: fetchFixedExpenses,
    refetchTicket: fetchTicketExpenses
  };
};
