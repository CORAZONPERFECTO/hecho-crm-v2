
-- Crear tabla para evidencias de tickets
CREATE TABLE public.ticket_evidences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  description TEXT,
  uploaded_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'failed'))
);

-- Crear tabla para links compartibles de tickets
CREATE TABLE public.ticket_shared_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_by TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para ubicaciones de clientes
CREATE TABLE public.client_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  location_name TEXT,
  address TEXT NOT NULL,
  reference_notes TEXT,
  is_villa BOOLEAN DEFAULT false,
  villa_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear bucket de storage para evidencias
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ticket-evidences', 'ticket-evidences', true);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.ticket_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_shared_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_locations ENABLE ROW LEVEL SECURITY;

-- Crear políticas permisivas para las evidencias (acceso completo por ahora)
CREATE POLICY "Anyone can manage ticket evidences" 
  ON public.ticket_evidences 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Crear políticas permisivas para links compartibles
CREATE POLICY "Anyone can manage shared links" 
  ON public.ticket_shared_links 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Crear políticas permisivas para ubicaciones de clientes
CREATE POLICY "Anyone can manage client locations" 
  ON public.client_locations 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Crear políticas de storage para evidencias
CREATE POLICY "Anyone can upload evidences" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'ticket-evidences');

CREATE POLICY "Anyone can view evidences" ON storage.objects 
  FOR SELECT USING (bucket_id = 'ticket-evidences');

CREATE POLICY "Anyone can update evidences" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'ticket-evidences');

CREATE POLICY "Anyone can delete evidences" ON storage.objects 
  FOR DELETE USING (bucket_id = 'ticket-evidences');

-- Crear índices para mejor rendimiento
CREATE INDEX idx_ticket_evidences_ticket_id ON public.ticket_evidences(ticket_id);
CREATE INDEX idx_ticket_shared_links_token ON public.ticket_shared_links(token);
CREATE INDEX idx_ticket_shared_links_ticket_id ON public.ticket_shared_links(ticket_id);
CREATE INDEX idx_client_locations_client_name ON public.client_locations(client_name);
