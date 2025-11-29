
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProjectTechnicalProcess {
  id: string;
  project_id: string;
  category_id: string;
  status: 'pendiente' | 'en_proceso' | 'completado';
  assigned_technician?: string;
  start_date?: string;
  completion_date?: string;
  progress_percentage: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  technical_service_categories?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface ProjectStepProgress {
  id: string;
  process_id: string;
  step_id: string;
  status: 'pendiente' | 'en_proceso' | 'completado';
  assigned_technician?: string;
  completed_by?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  technical_steps?: {
    id: string;
    description: string;
    step_order: number;
  };
}

export interface ProjectStepEvidence {
  id: string;
  step_progress_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size?: number;
  description?: string;
  uploaded_by: string;
  created_at: string;
}

export const useProjectTechnicalProcesses = (projectId: string) => {
  const [processes, setProcesses] = useState<ProjectTechnicalProcess[]>([]);
  const [stepProgress, setStepProgress] = useState<Record<string, ProjectStepProgress[]>>({});
  const [stepEvidences, setStepEvidences] = useState<Record<string, ProjectStepEvidence[]>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProcesses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_technical_processes')
        .select(`
          *,
          technical_service_categories(id, name, description)
        `)
        .eq('project_id', projectId)
        .order('created_at');

      if (error) throw error;
      setProcesses((data || []) as ProjectTechnicalProcess[]);
    } catch (error) {
      console.error('Error fetching processes:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los procesos técnicos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStepProgress = async (processId: string) => {
    try {
      const { data, error } = await supabase
        .from('project_step_progress')
        .select(`
          *,
          technical_steps(id, description, step_order)
        `)
        .eq('process_id', processId)
        .order('created_at');

      if (error) throw error;
      setStepProgress(prev => ({ ...prev, [processId]: (data || []) as ProjectStepProgress[] }));
    } catch (error) {
      console.error('Error fetching step progress:', error);
    }
  };

  const fetchStepEvidences = async (stepProgressId: string) => {
    try {
      const { data, error } = await supabase
        .from('project_step_evidences')
        .select('*')
        .eq('step_progress_id', stepProgressId)
        .order('created_at');

      if (error) throw error;
      setStepEvidences(prev => ({ ...prev, [stepProgressId]: (data || []) as ProjectStepEvidence[] }));
    } catch (error) {
      console.error('Error fetching step evidences:', error);
    }
  };

  const createProcess = async (categoryId: string, assignedTechnician?: string) => {
    try {
      const { data, error } = await supabase
        .from('project_technical_processes')
        .insert({
          project_id: projectId,
          category_id: categoryId,
          assigned_technician: assignedTechnician,
          status: 'pendiente'
        })
        .select(`
          *,
          technical_service_categories(id, name, description)
        `)
        .single();

      if (error) throw error;

      // Crear progreso inicial para todos los pasos de la categoría
      const { data: steps } = await supabase
        .from('technical_steps')
        .select('*')
        .eq('category_id', categoryId)
        .order('step_order');

      if (steps && steps.length > 0) {
        const stepProgressData = steps.map(step => ({
          process_id: data.id,
          step_id: step.id,
          status: 'pendiente' as const,
          assigned_technician: assignedTechnician
        }));

        await supabase
          .from('project_step_progress')
          .insert(stepProgressData);
      }

      setProcesses(prev => [...prev, data as ProjectTechnicalProcess]);
      toast({
        title: "Éxito",
        description: "Proceso técnico creado correctamente"
      });

      return data;
    } catch (error) {
      console.error('Error creating process:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el proceso técnico",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateStepProgress = async (
    stepProgressId: string, 
    updates: Partial<ProjectStepProgress>
  ) => {
    try {
      const { data, error } = await supabase
        .from('project_step_progress')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          ...(updates.status === 'completado' && {
            completed_at: new Date().toISOString()
          })
        })
        .eq('id', stepProgressId)
        .select(`
          *,
          technical_steps(id, description, step_order)
        `)
        .single();

      if (error) throw error;

      // Actualizar el estado local
      setStepProgress(prev => {
        const processId = data.process_id;
        const currentSteps = prev[processId] || [];
        const updatedSteps = currentSteps.map(step => 
          step.id === stepProgressId ? data as ProjectStepProgress : step
        );
        return { ...prev, [processId]: updatedSteps };
      });

      // Actualizar progreso del proceso padre
      await updateProcessProgress(data.process_id);

      toast({
        title: "Éxito",
        description: "Paso actualizado correctamente"
      });

      return data;
    } catch (error) {
      console.error('Error updating step progress:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el paso",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateProcessProgress = async (processId: string) => {
    try {
      const steps = stepProgress[processId] || [];
      if (steps.length === 0) return;

      const completedSteps = steps.filter(step => step.status === 'completado').length;
      const progressPercentage = Math.round((completedSteps / steps.length) * 100);
      
      let processStatus: 'pendiente' | 'en_proceso' | 'completado' = 'pendiente';
      if (progressPercentage === 100) {
        processStatus = 'completado';
      } else if (progressPercentage > 0) {
        processStatus = 'en_proceso';
      }

      const { error } = await supabase
        .from('project_technical_processes')
        .update({
          progress_percentage: progressPercentage,
          status: processStatus,
          completion_date: processStatus === 'completado' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', processId);

      if (error) throw error;

      // Actualizar estado local
      setProcesses(prev => prev.map(process => 
        process.id === processId 
          ? { 
              ...process, 
              progress_percentage: progressPercentage, 
              status: processStatus,
              completion_date: processStatus === 'completado' ? new Date().toISOString() : process.completion_date
            }
          : process
      ));
    } catch (error) {
      console.error('Error updating process progress:', error);
    }
  };

  const uploadStepEvidence = async (
    stepProgressId: string,
    file: File,
    description?: string,
    uploadedBy: string = 'Usuario'
  ) => {
    try {
      // Subir archivo a Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${projectId}/${stepProgressId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-step-evidences')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Guardar información en la base de datos
      const { data, error } = await supabase
        .from('project_step_evidences')
        .insert({
          step_progress_id: stepProgressId,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          description,
          uploaded_by: uploadedBy
        })
        .select()
        .single();

      if (error) throw error;

      setStepEvidences(prev => ({
        ...prev,
        [stepProgressId]: [...(prev[stepProgressId] || []), data as ProjectStepEvidence]
      }));

      toast({
        title: "Éxito",
        description: "Evidencia subida correctamente"
      });

      return data;
    } catch (error) {
      console.error('Error uploading evidence:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la evidencia",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProcesses();
    }
  }, [projectId]);

  return {
    processes,
    stepProgress,
    stepEvidences,
    loading,
    createProcess,
    updateStepProgress,
    uploadStepEvidence,
    fetchStepProgress,
    fetchStepEvidences,
    refetch: fetchProcesses
  };
};
