-- Crear tabla para almacenar reportes exportados
CREATE TABLE public.ticket_exported_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'pdf', -- 'pdf', 'word', 'zip'
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  generated_by TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.ticket_exported_reports ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY "Users can view ticket reports" 
ON public.ticket_exported_reports 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create ticket reports" 
ON public.ticket_exported_reports 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their reports" 
ON public.ticket_exported_reports 
FOR UPDATE 
USING (generated_by = (SELECT name FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can delete reports" 
ON public.ticket_exported_reports 
FOR DELETE 
USING (is_admin_or_manager());

-- Índices para mejor rendimiento
CREATE INDEX idx_ticket_exported_reports_ticket_id ON public.ticket_exported_reports(ticket_id);
CREATE INDEX idx_ticket_exported_reports_created_at ON public.ticket_exported_reports(created_at DESC);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_ticket_exported_reports_updated_at
BEFORE UPDATE ON public.ticket_exported_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Crear bucket para reportes exportados
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ticket-exported-reports', 'ticket-exported-reports', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para reportes
CREATE POLICY "Public access to exported reports" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'ticket-exported-reports');

CREATE POLICY "Users can upload exported reports" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'ticket-exported-reports');

CREATE POLICY "Users can update their exported reports" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'ticket-exported-reports');

CREATE POLICY "Admins can delete exported reports" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'ticket-exported-reports' AND (
  SELECT role FROM profiles WHERE id = auth.uid()
) IN ('admin', 'manager'));