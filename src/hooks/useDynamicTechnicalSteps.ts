
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DynamicTechnicalStep {
  id: string;
  description: string;
  completed: boolean;
  observation?: string;
  step_order: number;
}

export interface DynamicTechnicalTool {
  id: string;
  name: string;
  tool_type: 'herramienta' | 'material';
}

export interface DynamicServiceData {
  steps: DynamicTechnicalStep[];
  tools: DynamicTechnicalTool[];
}

export const useDynamicTechnicalSteps = (serviceType: string) => {
  const [serviceData, setServiceData] = useState<DynamicServiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServiceData = async () => {
      try {
        setLoading(true);
        
        // Determinar el nombre de la categoría basado en el tipo de servicio
        const getServiceKey = (type: string): string => {
          const lowerType = type.toLowerCase();
          if (lowerType.includes('mantenimiento')) return 'mantenimiento';
          if (lowerType.includes('instalacion') || lowerType.includes('instalación')) return 'instalacion';
          if (lowerType.includes('emergencia') || lowerType.includes('urgencia')) return 'emergencia';
          if (lowerType.includes('diagnostico') || lowerType.includes('diagnóstico') || lowerType.includes('falla')) return 'diagnostico';
          if (lowerType.includes('limpieza')) return 'limpieza';
          return 'mantenimiento'; // default
        };

        const serviceKey = getServiceKey(serviceType);

        // Buscar la categoría
        const { data: category } = await supabase
          .from('technical_service_categories')
          .select('id')
          .eq('name', serviceKey)
          .single();

        if (!category) {
          setServiceData(null);
          return;
        }

        // Cargar pasos
        const { data: stepsData } = await supabase
          .from('technical_steps')
          .select('*')
          .eq('category_id', category.id)
          .order('step_order');

        // Cargar herramientas
        const { data: toolsData } = await supabase
          .from('technical_tools')
          .select('*')
          .eq('category_id', category.id)
          .order('name');

        const steps: DynamicTechnicalStep[] = (stepsData || []).map(step => ({
          id: step.id,
          description: step.description,
          completed: false,
          step_order: step.step_order
        }));

        const tools: DynamicTechnicalTool[] = (toolsData || []).map(tool => ({
          id: tool.id,
          name: tool.name,
          tool_type: tool.tool_type as 'herramienta' | 'material'
        }));

        setServiceData({ steps, tools });
      } catch (error) {
        console.error('Error loading service data:', error);
        setServiceData(null);
      } finally {
        setLoading(false);
      }
    };

    if (serviceType) {
      loadServiceData();
    }
  }, [serviceType]);

  return { serviceData, loading };
};
