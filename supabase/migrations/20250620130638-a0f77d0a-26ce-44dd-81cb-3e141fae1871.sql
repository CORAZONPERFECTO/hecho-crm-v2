
-- Tabla para almacenar los procesos técnicos de cada proyecto
CREATE TABLE public.project_technical_processes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT NOT NULL,
  category_id UUID REFERENCES public.technical_service_categories(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_proceso', 'completado')),
  assigned_technician TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  completion_date TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para el progreso de pasos individuales
CREATE TABLE public.project_step_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  process_id UUID REFERENCES public.project_technical_processes(id) ON DELETE CASCADE,
  step_id UUID REFERENCES public.technical_steps(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_proceso', 'completado')),
  assigned_technician TEXT,
  completed_by TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(process_id, step_id)
);

-- Tabla para evidencias/adjuntos por paso
CREATE TABLE public.project_step_evidences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  step_progress_id UUID REFERENCES public.project_step_progress(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  description TEXT,
  uploaded_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.project_technical_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_step_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_step_evidences ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Permitir acceso a usuarios autenticados (se puede refinar según roles)
CREATE POLICY "Allow authenticated users to access project processes"
  ON public.project_technical_processes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to access step progress"
  ON public.project_step_progress
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to access step evidences"
  ON public.project_step_evidences
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Índices para mejorar performance
CREATE INDEX idx_project_technical_processes_project_id ON public.project_technical_processes(project_id);
CREATE INDEX idx_project_step_progress_process_id ON public.project_step_progress(process_id);
CREATE INDEX idx_project_step_evidences_step_progress_id ON public.project_step_evidences(step_progress_id);

-- Crear bucket de storage para evidencias de pasos técnicos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-step-evidences', 'project-step-evidences', true);

-- Política de storage para permitir subida de archivos
CREATE POLICY "Allow authenticated users to upload step evidences"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'project-step-evidences')
  WITH CHECK (bucket_id = 'project-step-evidences');
