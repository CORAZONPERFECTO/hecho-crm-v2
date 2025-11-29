
-- Crear tabla para configuración de la empresa
CREATE TABLE public.company_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  tax_id TEXT NOT NULL,
  address TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  website TEXT,
  ticket_prefix TEXT,
  quote_prefix TEXT,
  invoice_prefix TEXT,
  delivery_note_prefix TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Política para que solo usuarios autenticados puedan ver y modificar
CREATE POLICY "Authenticated users can view company settings" 
  ON public.company_settings 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can insert company settings" 
  ON public.company_settings 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update company settings" 
  ON public.company_settings 
  FOR UPDATE 
  TO authenticated 
  USING (true);

-- Crear bucket para logos de empresa si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Política para el bucket de logos
CREATE POLICY "Anyone can view company logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-logos');

CREATE POLICY "Authenticated users can upload company logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'company-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update company logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'company-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete company logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'company-logos' AND auth.role() = 'authenticated');
