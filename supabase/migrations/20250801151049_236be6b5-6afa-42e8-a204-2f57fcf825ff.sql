-- Crear tabla principal de tareas con campos avanzados
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('baja', 'media', 'alta')),
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_proceso', 'completada')),
  execution_datetime TIMESTAMP WITH TIME ZONE,
  warning_datetime TIMESTAMP WITH TIME ZONE,
  assigned_to TEXT,
  associated_type TEXT CHECK (associated_type IN ('villa', 'quotation', 'equipment')),
  associated_id TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by TEXT,
  is_overdue BOOLEAN DEFAULT false,
  is_critical BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL
);

-- Crear tabla de notificaciones enviadas
CREATE TABLE public.task_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('warning', 'execution', 'overdue')),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  error_message TEXT
);

-- Crear tabla de configuración de notificaciones por usuario
CREATE TABLE public.user_notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL UNIQUE,
  enable_task_warnings BOOLEAN DEFAULT true,
  enable_task_executions BOOLEAN DEFAULT true,
  enable_overdue_alerts BOOLEAN DEFAULT true,
  warning_hours_before INTEGER DEFAULT 24,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para tasks
CREATE POLICY "Admins can view all tasks" 
ON public.tasks FOR SELECT 
USING (get_current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Technicians can view assigned tasks" 
ON public.tasks FOR SELECT 
USING (
  get_current_user_role() = 'technician' AND 
  assigned_to = (SELECT name FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins can create tasks" 
ON public.tasks FOR INSERT 
WITH CHECK (get_current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Admins can update all tasks" 
ON public.tasks FOR UPDATE 
USING (get_current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Technicians can update assigned tasks status" 
ON public.tasks FOR UPDATE 
USING (
  get_current_user_role() = 'technician' AND 
  assigned_to = (SELECT name FROM profiles WHERE id = auth.uid()) AND
  -- Prevent changes within 2 hours of execution
  (execution_datetime IS NULL OR execution_datetime > now() + interval '2 hours')
);

CREATE POLICY "Only admins can delete tasks" 
ON public.tasks FOR DELETE 
USING (get_current_user_role() IN ('admin', 'manager'));

-- Políticas RLS para task_notifications
CREATE POLICY "Users can view their own notifications" 
ON public.task_notifications FOR SELECT 
USING (true);

CREATE POLICY "System can create notifications" 
ON public.task_notifications FOR INSERT 
WITH CHECK (true);

-- Políticas RLS para user_notification_settings
CREATE POLICY "Users can view their own settings" 
ON public.user_notification_settings FOR SELECT 
USING (user_email = (SELECT email FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own settings" 
ON public.user_notification_settings FOR UPDATE 
USING (user_email = (SELECT email FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own settings" 
ON public.user_notification_settings FOR INSERT 
WITH CHECK (user_email = (SELECT email FROM profiles WHERE id = auth.uid()));

-- Crear triggers para updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_notification_settings_updated_at
  BEFORE UPDATE ON public.user_notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Función para marcar tareas como vencidas
CREATE OR REPLACE FUNCTION public.mark_overdue_tasks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.tasks 
  SET is_overdue = true, updated_at = now()
  WHERE execution_datetime < now() 
    AND status != 'completada' 
    AND is_overdue = false;
END;
$$;

-- Función para detectar tareas críticas (próximas a vencer)
CREATE OR REPLACE FUNCTION public.mark_critical_tasks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.tasks 
  SET is_critical = true, updated_at = now()
  WHERE execution_datetime BETWEEN now() AND now() + interval '2 hours'
    AND status != 'completada' 
    AND is_critical = false;
    
  -- Limpiar tareas que ya no son críticas
  UPDATE public.tasks 
  SET is_critical = false, updated_at = now()
  WHERE (execution_datetime < now() OR execution_datetime > now() + interval '2 hours')
    AND is_critical = true;
END;
$$;

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_execution_datetime ON public.tasks(execution_datetime);
CREATE INDEX idx_tasks_warning_datetime ON public.tasks(warning_datetime);
CREATE INDEX idx_tasks_overdue ON public.tasks(is_overdue);
CREATE INDEX idx_tasks_critical ON public.tasks(is_critical);

CREATE INDEX idx_task_notifications_task_id ON public.task_notifications(task_id);
CREATE INDEX idx_task_notifications_type ON public.task_notifications(notification_type);
CREATE INDEX idx_task_notifications_sent_at ON public.task_notifications(sent_at);