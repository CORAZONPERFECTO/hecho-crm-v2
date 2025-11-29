-- Crear tabla para almacenar configuraciones de reportes de evidencias
CREATE TABLE public.evidence_report_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ticket_number TEXT,
  ticket_title TEXT,
  client_name TEXT,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.evidence_report_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own report configs" 
ON public.evidence_report_configs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own report configs" 
ON public.evidence_report_configs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own report configs" 
ON public.evidence_report_configs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own report configs" 
ON public.evidence_report_configs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_evidence_report_configs_updated_at
BEFORE UPDATE ON public.evidence_report_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();