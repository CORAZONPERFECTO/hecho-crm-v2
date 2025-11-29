-- Crear tabla para reportes técnicos
CREATE TABLE public.technical_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES public.tickets(id),
  report_number TEXT NOT NULL,
  title TEXT NOT NULL,
  general_description TEXT,
  technical_description TEXT,
  observations TEXT,
  evidences JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'borrador',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL,
  auto_saved_data JSONB DEFAULT '{}'
);

-- Habilitar RLS
ALTER TABLE public.technical_reports ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view technical reports" 
ON public.technical_reports 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create technical reports" 
ON public.technical_reports 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update technical reports" 
ON public.technical_reports 
FOR UPDATE 
USING (true);

CREATE POLICY "Only admins can delete technical reports" 
ON public.technical_reports 
FOR DELETE 
USING (is_admin_or_manager());

-- Trigger para updated_at
CREATE TRIGGER update_technical_reports_updated_at
BEFORE UPDATE ON public.technical_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para rendimiento
CREATE INDEX idx_technical_reports_ticket_id ON public.technical_reports(ticket_id);
CREATE INDEX idx_technical_reports_created_at ON public.technical_reports(created_at DESC);
CREATE INDEX idx_technical_reports_status ON public.technical_reports(status);