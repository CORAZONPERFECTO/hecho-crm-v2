-- Crear tabla para ingresos por cliente
CREATE TABLE public.client_revenues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_id TEXT,
  revenue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  invoiced_amount NUMERIC NOT NULL,
  associated_service TEXT,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('efectivo', 'transferencia', 'tarjeta', 'otro')),
  observations TEXT,
  ticket_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.client_revenues ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso (solo administradores)
CREATE POLICY "Only admins can view client revenues" 
ON public.client_revenues 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Only admins can insert client revenues" 
ON public.client_revenues 
FOR INSERT 
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Only admins can update client revenues" 
ON public.client_revenues 
FOR UPDATE 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Only admins can delete client revenues" 
ON public.client_revenues 
FOR DELETE 
USING (get_current_user_role() = 'admin');

-- Trigger para updated_at
CREATE TRIGGER update_client_revenues_updated_at
BEFORE UPDATE ON public.client_revenues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para mejor rendimiento
CREATE INDEX idx_client_revenues_client_name ON public.client_revenues(client_name);
CREATE INDEX idx_client_revenues_date ON public.client_revenues(revenue_date);
CREATE INDEX idx_client_revenues_payment_method ON public.client_revenues(payment_method);