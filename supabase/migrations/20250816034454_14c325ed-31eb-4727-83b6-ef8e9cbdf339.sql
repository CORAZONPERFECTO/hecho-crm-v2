-- Create contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  identification_type TEXT NOT NULL,
  identification_number TEXT NOT NULL,
  phone1 TEXT,
  phone2 TEXT,
  mobile TEXT,
  fax TEXT,
  address TEXT NOT NULL,
  province TEXT NOT NULL,
  municipality TEXT NOT NULL,
  country TEXT NOT NULL,
  email TEXT NOT NULL,
  payment_terms TEXT NOT NULL,
  price_list TEXT NOT NULL,
  assigned_salesperson TEXT,
  credit_limit NUMERIC NOT NULL DEFAULT 0,
  accounts_receivable NUMERIC NOT NULL DEFAULT 0,
  accounts_payable NUMERIC NOT NULL DEFAULT 0,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'activo'
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS contacts_identification_number_key ON public.contacts(identification_number);
CREATE INDEX IF NOT EXISTS contacts_name_idx ON public.contacts(name);
CREATE INDEX IF NOT EXISTS contacts_email_idx ON public.contacts(email);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Policies (open to authenticated users, following project pattern)
DROP POLICY IF EXISTS "Users can view contacts" ON public.contacts;
CREATE POLICY "Users can view contacts"
ON public.contacts
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can create contacts" ON public.contacts;
CREATE POLICY "Users can create contacts"
ON public.contacts
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update contacts" ON public.contacts;
CREATE POLICY "Users can update contacts"
ON public.contacts
FOR UPDATE
USING (true);

DROP POLICY IF EXISTS "Users can delete contacts" ON public.contacts;
CREATE POLICY "Users can delete contacts"
ON public.contacts
FOR DELETE
USING (true);

-- Trigger to maintain updated_at
DROP TRIGGER IF EXISTS update_contacts_updated_at ON public.contacts;
CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();