-- Agregar campos NCF a configuración de empresa
ALTER TABLE company_settings 
ADD COLUMN ncf_series jsonb DEFAULT '{}',
ADD COLUMN current_ncf_sequences jsonb DEFAULT '{}',
ADD COLUMN ncf_enabled boolean DEFAULT false;

-- Crear tabla para tipos de NCF
CREATE TABLE public.ncf_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  prefix TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insertar tipos de NCF comunes en República Dominicana
INSERT INTO public.ncf_types (code, name, description, prefix) VALUES
('B01', 'Crédito Fiscal', 'Comprobante que da derecho a crédito fiscal', 'B01'),
('B02', 'Consumo', 'Comprobante para consumo final', 'B02'),
('B03', 'Nota de Débito', 'Nota de débito', 'B03'),
('B04', 'Nota de Crédito', 'Nota de crédito', 'B04'),
('B11', 'Proveedores Informales', 'Comprobante para proveedores informales', 'B11'),
('B12', 'Registro Único de Ingresos', 'Para contribuyentes con registro único de ingresos', 'B12'),
('B13', 'Comprobante Especial', 'Comprobante especial', 'B13'),
('B14', 'Comprobante de Regímenes Especiales', 'Para regímenes especiales', 'B14'),
('B15', 'Comprobante Gubernamental', 'Para entidades gubernamentales', 'B15'),
('B16', 'Comprobante de Exportación', 'Para exportaciones', 'B16');

-- Habilitar RLS para ncf_types
ALTER TABLE public.ncf_types ENABLE ROW LEVEL SECURITY;

-- Políticas para ncf_types
CREATE POLICY "Users can view NCF types" 
ON public.ncf_types 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage NCF types" 
ON public.ncf_types 
FOR ALL 
USING (is_admin_or_manager())
WITH CHECK (is_admin_or_manager());

-- Agregar campos NCF a las tablas de facturas existentes
ALTER TABLE invoices 
ADD COLUMN ncf_type_code TEXT,
ADD COLUMN ncf_number TEXT,
ADD COLUMN ncf_sequence BIGINT,
ADD COLUMN quotation_id UUID;

ALTER TABLE quotations 
ADD COLUMN converted_to_invoice BOOLEAN DEFAULT false,
ADD COLUMN invoice_id UUID;

-- Agregar campos NCF a ticket_quotations y ticket_invoices
ALTER TABLE ticket_quotations 
ADD COLUMN converted_to_invoice BOOLEAN DEFAULT false,
ADD COLUMN invoice_id UUID;

ALTER TABLE ticket_invoices 
ADD COLUMN ncf_type_code TEXT,
ADD COLUMN ncf_number TEXT,
ADD COLUMN ncf_sequence BIGINT,
ADD COLUMN quotation_id UUID;

-- Crear índices para optimizar búsquedas
CREATE INDEX idx_invoices_ncf_number ON invoices(ncf_number);
CREATE INDEX idx_ticket_invoices_ncf_number ON ticket_invoices(ncf_number);
CREATE INDEX idx_quotations_converted ON quotations(converted_to_invoice);
CREATE INDEX idx_ticket_quotations_converted ON ticket_quotations(converted_to_invoice);

-- Función para generar próximo número NCF
CREATE OR REPLACE FUNCTION get_next_ncf_sequence(ncf_type_code TEXT)
RETURNS BIGINT AS $$
DECLARE
  current_seq BIGINT;
  settings_data JSONB;
BEGIN
  -- Obtener la configuración actual
  SELECT current_ncf_sequences INTO settings_data 
  FROM company_settings 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Si no existe configuración, inicializar
  IF settings_data IS NULL THEN
    settings_data := '{}';
  END IF;
  
  -- Obtener secuencia actual para el tipo de NCF
  current_seq := COALESCE((settings_data->ncf_type_code)::BIGINT, 0);
  
  -- Incrementar secuencia
  current_seq := current_seq + 1;
  
  -- Actualizar la configuración
  UPDATE company_settings 
  SET current_ncf_sequences = jsonb_set(
    COALESCE(current_ncf_sequences, '{}'), 
    ARRAY[ncf_type_code], 
    to_jsonb(current_seq)
  );
  
  RETURN current_seq;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar updated_at en ncf_types
CREATE TRIGGER update_ncf_types_updated_at
  BEFORE UPDATE ON public.ncf_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();