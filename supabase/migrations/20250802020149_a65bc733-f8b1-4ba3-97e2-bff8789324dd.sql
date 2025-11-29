-- Create company_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL DEFAULT 'HECHO SRL',
  tax_id TEXT,
  address TEXT DEFAULT 'Verón Punta Cana, Ciudad del Sol, Calle Sol 5 #476',
  email TEXT DEFAULT 'info@hecho.do',
  phone TEXT DEFAULT '849-649-2702',
  website TEXT,
  ticket_prefix TEXT DEFAULT 'TKT-',
  quote_prefix TEXT DEFAULT 'COT-',
  invoice_prefix TEXT DEFAULT 'FAC-',
  delivery_note_prefix TEXT DEFAULT 'CON-',
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view company settings" 
ON public.company_settings 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert company settings" 
ON public.company_settings 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update company settings" 
ON public.company_settings 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default company settings if none exist
INSERT INTO public.company_settings (company_name, address, email, phone)
SELECT 'HECHO SRL', 'Verón Punta Cana, Ciudad del Sol, Calle Sol 5 #476', 'info@hecho.do', '849-649-2702'
WHERE NOT EXISTS (SELECT 1 FROM public.company_settings);

-- Create storage bucket for company logos if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for logo storage
CREATE POLICY "Public access to company logos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'company-logos');

CREATE POLICY "Authenticated users can upload company logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'company-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update company logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'company-logos' AND auth.role() = 'authenticated');