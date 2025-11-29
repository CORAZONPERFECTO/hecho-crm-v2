import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TicketCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface TechnicalStep {
  id: string;
  category_id: string;
  description: string;
  step_order: number;
  created_at: string;
  updated_at: string;
}

export const useTicketCategories = () => {
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [steps, setSteps] = useState<TechnicalStep[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('technical_service_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive"
      });
    }
  };

  const fetchSteps = async () => {
    try {
      const { data, error } = await supabase
        .from('technical_steps')
        .select('*')
        .order('category_id', { ascending: true })
        .order('step_order', { ascending: true });

      if (error) throw error;
      setSteps(data || []);
    } catch (error) {
      console.error('Error fetching steps:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pasos técnicos",
        variant: "destructive"
      });
    }
  };

  const createCategory = async (categoryData: Omit<TicketCategory, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('technical_service_categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast({
        title: "Éxito",
        description: "Categoría creada correctamente"
      });
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la categoría",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateCategory = async (id: string, updates: Partial<TicketCategory>) => {
    try {
      const { data, error } = await supabase
        .from('technical_service_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => 
        prev.map(cat => cat.id === id ? { ...cat, ...data } : cat)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      toast({
        title: "Éxito",
        description: "Categoría actualizada correctamente"
      });
      return data;
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la categoría",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      // Verificar si tiene pasos técnicos asociados
      const { data: stepsData, error: stepsError } = await supabase
        .from('technical_steps')
        .select('id')
        .eq('category_id', id);

      if (stepsError) throw stepsError;

      if (stepsData && stepsData.length > 0) {
        toast({
          title: "Error",
          description: "No se puede eliminar una categoría que tiene pasos técnicos asociados",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('technical_service_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(prev => prev.filter(cat => cat.id !== id));
      toast({
        title: "Éxito",
        description: "Categoría eliminada correctamente"
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría",
        variant: "destructive"
      });
      throw error;
    }
  };

  const createStep = async (stepData: Omit<TechnicalStep, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('technical_steps')
        .insert([stepData])
        .select()
        .single();

      if (error) throw error;

      setSteps(prev => [...prev, data].sort((a, b) => {
        if (a.category_id === b.category_id) {
          return a.step_order - b.step_order;
        }
        return a.category_id.localeCompare(b.category_id);
      }));
      toast({
        title: "Éxito",
        description: "Paso técnico creado correctamente"
      });
      return data;
    } catch (error) {
      console.error('Error creating step:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el paso técnico",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateStep = async (id: string, updates: Partial<TechnicalStep>) => {
    try {
      const { data, error } = await supabase
        .from('technical_steps')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setSteps(prev => 
        prev.map(step => step.id === id ? { ...step, ...data } : step)
          .sort((a, b) => {
            if (a.category_id === b.category_id) {
              return a.step_order - b.step_order;
            }
            return a.category_id.localeCompare(b.category_id);
          })
      );
      toast({
        title: "Éxito",
        description: "Paso técnico actualizado correctamente"
      });
      return data;
    } catch (error) {
      console.error('Error updating step:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el paso técnico",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteStep = async (id: string) => {
    try {
      const { error } = await supabase
        .from('technical_steps')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSteps(prev => prev.filter(step => step.id !== id));
      toast({
        title: "Éxito",
        description: "Paso técnico eliminado correctamente"
      });
    } catch (error) {
      console.error('Error deleting step:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el paso técnico",
        variant: "destructive"
      });
      throw error;
    }
  };

  const getStepsByCategory = (categoryId: string) => {
    return steps.filter(step => step.category_id === categoryId);
  };

  const reorderSteps = async (categoryId: string, reorderedSteps: TechnicalStep[]) => {
    try {
      const updates = reorderedSteps.map((step, index) => ({
        id: step.id,
        step_order: index + 1
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('technical_steps')
          .update({ step_order: update.step_order })
          .eq('id', update.id);

        if (error) throw error;
      }

      // Refetch steps to ensure correct order
      await fetchSteps();
      
      toast({
        title: "Éxito",
        description: "Orden de pasos actualizado correctamente"
      });
    } catch (error) {
      console.error('Error reordering steps:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el orden de los pasos",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchSteps()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    categories,
    steps,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    createStep,
    updateStep,
    deleteStep,
    getStepsByCategory,
    reorderSteps,
    refetch: () => Promise.all([fetchCategories(), fetchSteps()])
  };
};