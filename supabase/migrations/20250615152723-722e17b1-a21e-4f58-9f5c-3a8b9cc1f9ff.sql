
-- Tabla de facturas (puedes omitir si ya la tienes, aquí va ejemplo simple)
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  number TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendiente',
  description TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de cotizaciones (opcional)
CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  number TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'aprobada',
  description TEXT,
  valid_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla para links de pago únicos
CREATE TABLE public.payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_type TEXT NOT NULL, -- 'invoice' o 'quotation'
  reference_id UUID NOT NULL,    -- id de la factura o cotización
  token TEXT NOT NULL UNIQUE,    -- token seguro para el link (url)
  amount NUMERIC(12,2) NOT NULL,
  description TEXT,
  expires_at TIMESTAMPTZ,
  customer_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'activo' -- activo, expirado, pagado
);

-- Tabla de pagos recibidos
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_link_id UUID REFERENCES public.payment_links(id),
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  method TEXT, -- 'stripe', 'paypal', 'bancaria', 'efectivo'
  customer_email TEXT,
  status TEXT NOT NULL DEFAULT 'completado', -- completado, pendiente, fallido
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security en las tablas relevantes
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de RLS para permitir gestión por usuario autenticado
-- (luego se pueden personalizar según tus modelos de usuario)
CREATE POLICY "Usuarios ven sus facturas" ON public.invoices
  FOR SELECT USING (true);
CREATE POLICY "Usuarios insertan facturas" ON public.invoices
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuarios ven sus cotizaciones" ON public.quotations
  FOR SELECT USING (true);
CREATE POLICY "Usuarios insertan cotizaciones" ON public.quotations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuarios ven sus links de pago" ON public.payment_links
  FOR SELECT USING (true);
CREATE POLICY "Usuarios insertan links de pago" ON public.payment_links
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuarios ven sus pagos" ON public.payments
  FOR SELECT USING (true);
CREATE POLICY "Usuarios insertan pagos" ON public.payments
  FOR INSERT WITH CHECK (true);
