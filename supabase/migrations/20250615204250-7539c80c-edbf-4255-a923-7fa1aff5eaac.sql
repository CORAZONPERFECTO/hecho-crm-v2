
-- Crear tabla completa de tickets en Supabase
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('alta', 'media', 'baja')),
  status TEXT NOT NULL CHECK (status IN ('abierto', 'en-progreso', 'cerrado-pendiente-cotizar', 'aprobado-factura', 'facturado-finalizado')),
  assigned_to TEXT NOT NULL,
  client TEXT NOT NULL,
  project TEXT,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  internal_notes TEXT,
  attachments TEXT[] DEFAULT '{}',
  exclude_from_profit_loss BOOLEAN DEFAULT FALSE,
  loss_observation TEXT,
  closed_at TIMESTAMPTZ,
  closed_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de visitas de tickets
CREATE TABLE public.ticket_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  visit_date TIMESTAMPTZ NOT NULL,
  technician TEXT NOT NULL,
  observation TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de servicios realizados en las visitas
CREATE TABLE public.ticket_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES public.ticket_visits(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN ('instalacion', 'reparacion', 'mantenimiento', 'verificacion', 'levantamiento', 'rastreo_fuga', 'otros')),
  quantity INT NOT NULL DEFAULT 1,
  description TEXT,
  service_date TIMESTAMPTZ NOT NULL,
  technician TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de cotizaciones
CREATE TABLE public.ticket_quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  quotation_number TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('pendiente', 'aprobada', 'rechazada')) DEFAULT 'pendiente',
  valid_until DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de facturas de tickets
CREATE TABLE public.ticket_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  quotation_id UUID REFERENCES public.ticket_quotations(id),
  invoice_number TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('generada', 'enviada', 'pagada')) DEFAULT 'generada',
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de gastos fijos mensuales
CREATE TABLE public.fixed_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL,
  month INT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (year, month, category)
);

-- Tabla de gastos variables por ticket
CREATE TABLE public.ticket_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_tickets_status ON public.tickets (status);
CREATE INDEX idx_tickets_assigned_to ON public.tickets (assigned_to);
CREATE INDEX idx_tickets_created_at ON public.tickets (created_at);
CREATE INDEX idx_fixed_expenses_year_month ON public.fixed_expenses (year, month);
CREATE INDEX idx_ticket_expenses_ticket_id ON public.ticket_expenses (ticket_id);

-- Habilitar RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_expenses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (permitir acceso completo por ahora)
CREATE POLICY "Ver tickets" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Crear tickets" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar tickets" ON public.tickets FOR UPDATE USING (true);
CREATE POLICY "Eliminar tickets" ON public.tickets FOR DELETE USING (true);

CREATE POLICY "Ver visitas" ON public.ticket_visits FOR SELECT USING (true);
CREATE POLICY "Crear visitas" ON public.ticket_visits FOR INSERT WITH CHECK (true);

CREATE POLICY "Ver servicios" ON public.ticket_services FOR SELECT USING (true);
CREATE POLICY "Crear servicios" ON public.ticket_services FOR INSERT WITH CHECK (true);

CREATE POLICY "Ver cotizaciones" ON public.ticket_quotations FOR SELECT USING (true);
CREATE POLICY "Crear cotizaciones" ON public.ticket_quotations FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar cotizaciones" ON public.ticket_quotations FOR UPDATE USING (true);

CREATE POLICY "Ver facturas ticket" ON public.ticket_invoices FOR SELECT USING (true);
CREATE POLICY "Crear facturas ticket" ON public.ticket_invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar facturas ticket" ON public.ticket_invoices FOR UPDATE USING (true);

CREATE POLICY "Ver gastos fijos" ON public.fixed_expenses FOR SELECT USING (true);
CREATE POLICY "Crear gastos fijos" ON public.fixed_expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar gastos fijos" ON public.fixed_expenses FOR UPDATE USING (true);

CREATE POLICY "Ver gastos variables" ON public.ticket_expenses FOR SELECT USING (true);
CREATE POLICY "Crear gastos variables" ON public.ticket_expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar gastos variables" ON public.ticket_expenses FOR UPDATE USING (true);
