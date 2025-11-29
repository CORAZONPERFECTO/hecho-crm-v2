-- Add proforma_prefix column to company_settings table
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS proforma_prefix TEXT DEFAULT 'FACPR-';

-- Update existing records to have the new prefix
UPDATE public.company_settings 
SET proforma_prefix = 'FACPR-' 
WHERE proforma_prefix IS NULL;