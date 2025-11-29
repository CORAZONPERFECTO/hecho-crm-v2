
-- Crear tabla para almacenar facturas de gastos de tickets
CREATE TABLE public.ticket_expense_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  description TEXT,
  expense_date DATE DEFAULT CURRENT_DATE,
  detected_amount NUMERIC(10,2),
  confirmed_amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'RD$',
  uploaded_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.ticket_expense_receipts ENABLE ROW LEVEL SECURITY;

-- Política para que todos los usuarios autenticados puedan ver las facturas
CREATE POLICY "Users can view expense receipts" 
  ON public.ticket_expense_receipts 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Política para que usuarios autenticados puedan crear facturas
CREATE POLICY "Users can create expense receipts" 
  ON public.ticket_expense_receipts 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Política para que solo admins puedan actualizar facturas
CREATE POLICY "Only admins can update expense receipts" 
  ON public.ticket_expense_receipts 
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Política para que solo admins puedan eliminar facturas
CREATE POLICY "Only admins can delete expense receipts" 
  ON public.ticket_expense_receipts 
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Crear bucket de storage para las facturas de gastos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ticket-expense-receipts', 'ticket-expense-receipts', true);

-- Política de storage para permitir subir archivos
CREATE POLICY "Users can upload expense receipts" 
  ON storage.objects 
  FOR INSERT 
  TO authenticated
  WITH CHECK (bucket_id = 'ticket-expense-receipts');

-- Política de storage para permitir ver archivos
CREATE POLICY "Users can view expense receipts" 
  ON storage.objects 
  FOR SELECT 
  TO authenticated
  USING (bucket_id = 'ticket-expense-receipts');

-- Política de storage para que solo admins puedan eliminar archivos
CREATE POLICY "Only admins can delete expense receipt files" 
  ON storage.objects 
  FOR DELETE 
  TO authenticated
  USING (
    bucket_id = 'ticket-expense-receipts' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );
