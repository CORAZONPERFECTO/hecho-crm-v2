-- Crear tabla de tareas de clientes
CREATE TABLE public.client_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('baja', 'media', 'alta')),
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_proceso', 'completado')),
  assigned_to TEXT,
  associated_type TEXT CHECK (associated_type IN ('quotation', 'villa', 'equipment')),
  associated_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL
);

-- Crear tabla de mantenimientos de villas
CREATE TABLE public.villa_maintenances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  villa_id UUID NOT NULL,
  next_maintenance_date DATE NOT NULL,
  service_type TEXT NOT NULL,
  observation TEXT,
  status TEXT NOT NULL DEFAULT 'programado' CHECK (status IN ('programado', 'completado', 'vencido')),
  completed_date DATE,
  completed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL
);

-- Crear tabla de historial de mantenimientos
CREATE TABLE public.villa_maintenance_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  villa_id UUID NOT NULL,
  maintenance_date DATE NOT NULL,
  service_type TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  observation TEXT,
  ticket_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de equipos de villas
CREATE TABLE public.villa_equipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  villa_id UUID NOT NULL,
  equipment_name TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  capacity TEXT,
  status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo', 'en_mantenimiento', 'dañado')),
  photo_url TEXT,
  observations TEXT,
  installation_date DATE,
  warranty_expiry DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL
);

-- Crear tabla de relación entre equipos y tickets
CREATE TABLE public.equipment_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL,
  ticket_id UUID NOT NULL,
  relationship_type TEXT NOT NULL DEFAULT 'reparacion' CHECK (relationship_type IN ('instalacion', 'reparacion', 'mantenimiento', 'verificacion')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.client_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villa_maintenances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villa_maintenance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villa_equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_tickets ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para client_tasks
CREATE POLICY "Users can view all client tasks" 
ON public.client_tasks FOR SELECT USING (true);

CREATE POLICY "Users can create client tasks" 
ON public.client_tasks FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update client tasks" 
ON public.client_tasks FOR UPDATE USING (true);

CREATE POLICY "Only admins can delete client tasks" 
ON public.client_tasks FOR DELETE USING (is_admin_or_manager());

-- Políticas RLS para villa_maintenances
CREATE POLICY "Users can view villa maintenances" 
ON public.villa_maintenances FOR SELECT USING (true);

CREATE POLICY "Users can create villa maintenances" 
ON public.villa_maintenances FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update villa maintenances" 
ON public.villa_maintenances FOR UPDATE USING (true);

CREATE POLICY "Only admins can delete villa maintenances" 
ON public.villa_maintenances FOR DELETE USING (is_admin_or_manager());

-- Políticas RLS para villa_maintenance_history
CREATE POLICY "Users can view maintenance history" 
ON public.villa_maintenance_history FOR SELECT USING (true);

CREATE POLICY "Users can create maintenance history" 
ON public.villa_maintenance_history FOR INSERT WITH CHECK (true);

-- Políticas RLS para villa_equipments
CREATE POLICY "Users can view villa equipments" 
ON public.villa_equipments FOR SELECT USING (true);

CREATE POLICY "Users can create villa equipments" 
ON public.villa_equipments FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update villa equipments" 
ON public.villa_equipments FOR UPDATE USING (true);

CREATE POLICY "Only admins can delete villa equipments" 
ON public.villa_equipments FOR DELETE USING (is_admin_or_manager());

-- Políticas RLS para equipment_tickets
CREATE POLICY "Users can view equipment tickets" 
ON public.equipment_tickets FOR SELECT USING (true);

CREATE POLICY "Users can create equipment tickets" 
ON public.equipment_tickets FOR INSERT WITH CHECK (true);

-- Crear triggers para updated_at
CREATE TRIGGER update_client_tasks_updated_at
  BEFORE UPDATE ON public.client_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_villa_maintenances_updated_at
  BEFORE UPDATE ON public.villa_maintenances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_villa_equipments_updated_at
  BEFORE UPDATE ON public.villa_equipments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_client_tasks_client_id ON public.client_tasks(client_id);
CREATE INDEX idx_client_tasks_due_date ON public.client_tasks(due_date);
CREATE INDEX idx_client_tasks_status ON public.client_tasks(status);
CREATE INDEX idx_villa_maintenances_villa_id ON public.villa_maintenances(villa_id);
CREATE INDEX idx_villa_maintenances_next_date ON public.villa_maintenances(next_maintenance_date);
CREATE INDEX idx_villa_equipments_villa_id ON public.villa_equipments(villa_id);
CREATE INDEX idx_equipment_tickets_equipment_id ON public.equipment_tickets(equipment_id);
CREATE INDEX idx_equipment_tickets_ticket_id ON public.equipment_tickets(ticket_id);