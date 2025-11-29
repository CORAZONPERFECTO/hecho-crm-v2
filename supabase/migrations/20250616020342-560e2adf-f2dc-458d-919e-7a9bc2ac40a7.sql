
-- Crear tabla para villas de clientes
CREATE TABLE public.client_villas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL, -- Referencia al cliente por nombre
  villa_name TEXT NOT NULL,
  villa_code TEXT UNIQUE,
  address TEXT NOT NULL,
  gps_location TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  exterior_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agregar columna villa_id a tickets para asociar tickets con villas específicas
ALTER TABLE public.tickets 
ADD COLUMN villa_id UUID REFERENCES public.client_villas(id) ON DELETE SET NULL;

-- Agregar columna villa_id a ticket_evidences para organizar evidencias por villa
ALTER TABLE public.ticket_evidences 
ADD COLUMN villa_id UUID REFERENCES public.client_villas(id) ON DELETE SET NULL;

-- Crear bucket para fotos de villas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('villa-photos', 'villa-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS en la nueva tabla
ALTER TABLE public.client_villas ENABLE ROW LEVEL SECURITY;

-- Crear políticas para villas
CREATE POLICY "Anyone can manage client villas" 
  ON public.client_villas 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Crear políticas de storage para fotos de villas
CREATE POLICY "Anyone can upload villa photos" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'villa-photos');

CREATE POLICY "Anyone can view villa photos" ON storage.objects 
  FOR SELECT USING (bucket_id = 'villa-photos');

CREATE POLICY "Anyone can update villa photos" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'villa-photos');

CREATE POLICY "Anyone can delete villa photos" ON storage.objects 
  FOR DELETE USING (bucket_id = 'villa-photos');

-- Crear índices para mejor rendimiento
CREATE INDEX idx_client_villas_client_id ON public.client_villas(client_id);
CREATE INDEX idx_client_villas_villa_code ON public.client_villas(villa_code);
CREATE INDEX idx_tickets_villa_id ON public.tickets(villa_id);
CREATE INDEX idx_ticket_evidences_villa_id ON public.ticket_evidences(villa_id);
