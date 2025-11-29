
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TechnicalCategory {
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

export interface TechnicalTool {
  id: string;
  category_id: string;
  name: string;
  tool_type: 'herramienta' | 'material';
  created_at: string;
  updated_at: string;
}

export const useTechnicalConfiguration = () => {
  const [categories, setCategories] = useState<TechnicalCategory[]>([]);
  const [steps, setSteps] = useState<TechnicalStep[]>([]);
  const [tools, setTools] = useState<TechnicalTool[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar categorías
  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('technical_service_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Error al cargar las categorías');
    }
  };

  // Cargar pasos por categoría
  const loadSteps = async (categoryId?: string) => {
    try {
      let query = supabase
        .from('technical_steps')
        .select('*')
        .order('step_order');

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setSteps(data || []);
    } catch (error) {
      console.error('Error loading steps:', error);
      toast.error('Error al cargar los pasos');
    }
  };

  // Cargar herramientas por categoría
  const loadTools = async (categoryId?: string) => {
    try {
      let query = supabase
        .from('technical_tools')
        .select('*')
        .order('name');

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Cast tool_type to the proper type
      const typedTools: TechnicalTool[] = (data || []).map(tool => ({
        ...tool,
        tool_type: tool.tool_type as 'herramienta' | 'material'
      }));
      
      setTools(typedTools);
    } catch (error) {
      console.error('Error loading tools:', error);
      toast.error('Error al cargar las herramientas');
    }
  };

  // Crear categoría
  const createCategory = async (name: string, description?: string) => {
    try {
      const { data, error } = await supabase
        .from('technical_service_categories')
        .insert({ name, description })
        .select()
        .single();

      if (error) throw error;
      setCategories(prev => [...prev, data]);
      toast.success('Categoría creada exitosamente');
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Error al crear la categoría');
      throw error;
    }
  };

  const updateCategory = async (id: string, name: string, description?: string) => {
    try {
      const { data, error } = await supabase
        .from('technical_service_categories')
        .update({ name, description, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setCategories(prev => prev.map(cat => cat.id === id ? data : cat));
      toast.success('Categoría actualizada exitosamente');
      return data;
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Error al actualizar la categoría');
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('technical_service_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCategories(prev => prev.filter(cat => cat.id !== id));
      setSteps(prev => prev.filter(step => step.category_id !== id));
      setTools(prev => prev.filter(tool => tool.category_id !== id));
      toast.success('Categoría eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Error al eliminar la categoría');
      throw error;
    }
  };

  const createStep = async (categoryId: string, description: string, stepOrder: number) => {
    try {
      const { data, error } = await supabase
        .from('technical_steps')
        .insert({ category_id: categoryId, description, step_order: stepOrder })
        .select()
        .single();

      if (error) throw error;
      setSteps(prev => [...prev, data]);
      toast.success('Paso creado exitosamente');
      return data;
    } catch (error) {
      console.error('Error creating step:', error);
      toast.error('Error al crear el paso');
      throw error;
    }
  };

  const updateStep = async (id: string, description: string, stepOrder: number) => {
    try {
      const { data, error } = await supabase
        .from('technical_steps')
        .update({ description, step_order: stepOrder, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setSteps(prev => prev.map(step => step.id === id ? data : step));
      toast.success('Paso actualizado exitosamente');
      return data;
    } catch (error) {
      console.error('Error updating step:', error);
      toast.error('Error al actualizar el paso');
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
      toast.success('Paso eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting step:', error);
      toast.error('Error al eliminar el paso');
      throw error;
    }
  };

  // Función para reordenar pasos
  const reorderSteps = async (stepsWithNewOrder: { id: string; step_order: number }[]) => {
    try {
      const updatePromises = stepsWithNewOrder.map(step =>
        supabase
          .from('technical_steps')
          .update({ step_order: step.step_order, updated_at: new Date().toISOString() })
          .eq('id', step.id)
      );

      const results = await Promise.all(updatePromises);
      
      // Verificar errores
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error('Error reordering some steps');
      }

      // Recargar pasos para obtener el orden actualizado
      await loadSteps();
      toast.success('Orden de pasos actualizado exitosamente');
    } catch (error) {
      console.error('Error reordering steps:', error);
      toast.error('Error al reordenar los pasos');
      throw error;
    }
  };

  const createTool = async (categoryId: string, name: string, toolType: 'herramienta' | 'material') => {
    try {
      const { data, error } = await supabase
        .from('technical_tools')
        .insert({ category_id: categoryId, name, tool_type: toolType })
        .select()
        .single();

      if (error) throw error;
      
      const typedTool: TechnicalTool = {
        ...data,
        tool_type: data.tool_type as 'herramienta' | 'material'
      };
      
      setTools(prev => [...prev, typedTool]);
      toast.success('Herramienta creada exitosamente');
      return typedTool;
    } catch (error) {
      console.error('Error creating tool:', error);
      toast.error('Error al crear la herramienta');
      throw error;
    }
  };

  const updateTool = async (id: string, name: string, toolType: 'herramienta' | 'material') => {
    try {
      const { data, error } = await supabase
        .from('technical_tools')
        .update({ name, tool_type: toolType, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const typedTool: TechnicalTool = {
        ...data,
        tool_type: data.tool_type as 'herramienta' | 'material'
      };
      
      setTools(prev => prev.map(tool => tool.id === id ? typedTool : tool));
      toast.success('Herramienta actualizada exitosamente');
      return typedTool;
    } catch (error) {
      console.error('Error updating tool:', error);
      toast.error('Error al actualizar la herramienta');
      throw error;
    }
  };

  const deleteTool = async (id: string) => {
    try {
      const { error } = await supabase
        .from('technical_tools')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTools(prev => prev.filter(tool => tool.id !== id));
      toast.success('Herramienta eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting tool:', error);
      toast.error('Error al eliminar la herramienta');
      throw error;
    }
  };

  // Obtener pasos por categoría
  const getStepsByCategory = (categoryId: string) => {
    return steps.filter(step => step.category_id === categoryId).sort((a, b) => a.step_order - b.step_order);
  };

  // Obtener herramientas por categoría
  const getToolsByCategory = (categoryId: string) => {
    return tools.filter(tool => tool.category_id === categoryId);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadCategories(), loadSteps(), loadTools()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    categories,
    steps,
    tools,
    loading,
    loadCategories,
    loadSteps,
    loadTools,
    createCategory,
    updateCategory,
    deleteCategory,
    createStep,
    updateStep,
    deleteStep,
    createTool,
    updateTool,
    deleteTool,
    getStepsByCategory,
    getToolsByCategory,
    reorderSteps
  };
};
