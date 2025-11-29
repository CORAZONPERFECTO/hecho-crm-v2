-- Crear tabla para almacenar plantillas de documentos
CREATE TABLE public.document_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('invoice', 'quotation', 'delivery_note', 'purchase_order')),
  template_id TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  styles JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(document_type, template_id)
);

-- Crear tabla para configuración de documentos por empresa
CREATE TABLE public.company_document_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_type TEXT NOT NULL CHECK (document_type IN ('invoice', 'quotation', 'delivery_note', 'purchase_order')),
  default_template_id TEXT NOT NULL,
  auto_numbering BOOLEAN DEFAULT true,
  number_format TEXT DEFAULT 'PREFIX-YYYY-000',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(document_type)
);

-- Habilitar RLS
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_document_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para plantillas de documentos
CREATE POLICY "Users can view document templates" 
ON public.document_templates 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage document templates" 
ON public.document_templates 
FOR ALL 
USING (is_admin_or_manager());

-- Políticas para configuración de documentos
CREATE POLICY "Users can view company document settings" 
ON public.company_document_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage company document settings" 
ON public.company_document_settings 
FOR ALL 
USING (is_admin_or_manager());

-- Insertar las mejores plantillas por defecto
INSERT INTO public.document_templates (name, description, document_type, template_id, is_default, styles) VALUES
-- Plantillas de Facturas
('Moderno', 'Estilo limpio con colores suaves y minimalista. Perfecto para empresas tecnológicas.', 'invoice', 'modern', true, '{"container": "border border-gray-300 rounded-lg shadow-sm", "header": "bg-blue-50 border-b border-blue-200 rounded-t-lg", "title": "text-lg font-bold text-blue-800", "table": "border-0", "tableHeader": "bg-blue-100", "tableCell": "border-b border-gray-200 p-2"}'),
('Clásico', 'Diseño tradicional con líneas y tabla sólida. Ideal para empresas establecidas.', 'invoice', 'classic', false, '{"container": "border-2 border-gray-800", "header": "bg-gray-100 border-b-2 border-gray-800", "title": "text-lg font-bold text-gray-800", "table": "border border-gray-800", "tableHeader": "bg-gray-200 border border-gray-800", "tableCell": "border border-gray-800 p-2"}'),
('Compacto', 'Optimizado para uso interno o impresoras térmicas. Ahorra espacio y tinta.', 'invoice', 'compact', false, '{"container": "border border-gray-400", "header": "bg-gray-800 text-white", "title": "text-lg font-bold text-white", "table": "border-0", "tableHeader": "bg-gray-600 text-white", "tableCell": "border-b border-gray-300 p-1 text-xs"}'),

-- Plantillas de Cotizaciones
('Elegante', 'Diseño sofisticado para clientes corporativos. Transmite profesionalismo.', 'quotation', 'elegant', true, '{"container": "border-2 border-gray-800", "header": "bg-gray-100 border-b-2 border-gray-800", "title": "text-lg font-bold text-gray-800", "table": "border border-gray-800", "tableHeader": "bg-gray-200 border border-gray-800", "tableCell": "border border-gray-800 p-2"}'),
('Simple', 'Formato claro y directo, sin distracciones. Fácil de leer y entender.', 'quotation', 'simple', false, '{"container": "border border-gray-300 rounded-lg shadow-sm", "header": "bg-blue-50 border-b border-blue-200 rounded-t-lg", "title": "text-lg font-bold text-blue-800", "table": "border-0", "tableHeader": "bg-blue-100", "tableCell": "border-b border-gray-200 p-2"}'),
('Corporativo', 'Diseño formal que refuerza la imagen de marca. Para grandes empresas.', 'quotation', 'corporate', false, '{"container": "border border-gray-400", "header": "bg-gray-800 text-white", "title": "text-lg font-bold text-white", "table": "border-0", "tableHeader": "bg-gray-600 text-white", "tableCell": "border-b border-gray-300 p-1 text-xs"}'),

-- Plantillas de Conduces
('Técnico', 'Minimalista, enfocado en los detalles del servicio. Para equipos técnicos.', 'delivery_note', 'technical', true, '{"container": "border-2 border-gray-800", "header": "bg-gray-100 border-b-2 border-gray-800", "title": "text-lg font-bold text-gray-800", "table": "border border-gray-800", "tableHeader": "bg-gray-200 border border-gray-800", "tableCell": "border border-gray-800 p-2"}'),
('Logístico', 'Incluye campos para códigos QR o seriales. Optimizado para inventario.', 'delivery_note', 'logistic', false, '{"container": "border border-gray-300 rounded-lg shadow-sm", "header": "bg-blue-50 border-b border-blue-200 rounded-t-lg", "title": "text-lg font-bold text-blue-800", "table": "border-0", "tableHeader": "bg-blue-100", "tableCell": "border-b border-gray-200 p-2"}'),
('Elegante', 'Presentación cuidada para entregas de alto valor. Impresiona al cliente.', 'delivery_note', 'elegant-dn', false, '{"container": "border border-gray-400", "header": "bg-gray-800 text-white", "title": "text-lg font-bold text-white", "table": "border-0", "tableHeader": "bg-gray-600 text-white", "tableCell": "border-b border-gray-300 p-1 text-xs"}'),

-- Plantillas de Órdenes de Compra
('Estándar', 'Formato completo para órdenes de compra. Incluye todos los campos necesarios.', 'purchase_order', 'standard', true, '{"container": "border-2 border-gray-800", "header": "bg-gray-100 border-b-2 border-gray-800", "title": "text-lg font-bold text-gray-800", "table": "border border-gray-800", "tableHeader": "bg-gray-200 border border-gray-800", "tableCell": "border border-gray-800 p-2"}'),
('Simple', 'Diseño simplificado para compras rápidas. Agiliza el proceso.', 'purchase_order', 'simple-po', false, '{"container": "border border-gray-300 rounded-lg shadow-sm", "header": "bg-blue-50 border-b border-blue-200 rounded-t-lg", "title": "text-lg font-bold text-blue-800", "table": "border-0", "tableHeader": "bg-blue-100", "tableCell": "border-b border-gray-200 p-2"}');

-- Insertar configuración por defecto para la empresa
INSERT INTO public.company_document_settings (document_type, default_template_id, number_format) VALUES
('invoice', 'modern', 'FAC-YYYY-000'),
('quotation', 'elegant', 'COT-YYYY-000'),
('delivery_note', 'technical', 'CON-YYYY-000'),
('purchase_order', 'standard', 'OC-YYYY-000');

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar timestamps
CREATE TRIGGER update_document_templates_updated_at
BEFORE UPDATE ON public.document_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_document_settings_updated_at
BEFORE UPDATE ON public.company_document_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();