
-- Crear tabla para categorías de servicios técnicos
CREATE TABLE public.technical_service_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para pasos técnicos
CREATE TABLE public.technical_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.technical_service_categories(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para herramientas y materiales
CREATE TABLE public.technical_tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.technical_service_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tool_type TEXT NOT NULL DEFAULT 'herramienta', -- 'herramienta' o 'material'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insertar datos iniciales de categorías
INSERT INTO public.technical_service_categories (name, description) VALUES
('mantenimiento', 'Servicios de mantenimiento preventivo y correctivo'),
('instalacion', 'Servicios de instalación de equipos'),
('emergencia', 'Servicios de emergencia y reparaciones urgentes'),
('diagnostico', 'Servicios de diagnóstico y evaluación'),
('limpieza', 'Servicios de limpieza y desinfección');

-- Insertar pasos para mantenimiento
INSERT INTO public.technical_steps (category_id, description, step_order)
SELECT id, 'Verificar estado del filtro de aire', 1 FROM public.technical_service_categories WHERE name = 'mantenimiento'
UNION ALL
SELECT id, 'Inspeccionar nivel de refrigerante', 2 FROM public.technical_service_categories WHERE name = 'mantenimiento'
UNION ALL
SELECT id, 'Revisar conexiones eléctricas', 3 FROM public.technical_service_categories WHERE name = 'mantenimiento'
UNION ALL
SELECT id, 'Limpiar bandeja de drenaje', 4 FROM public.technical_service_categories WHERE name = 'mantenimiento'
UNION ALL
SELECT id, 'Lubricar piezas móviles si aplica', 5 FROM public.technical_service_categories WHERE name = 'mantenimiento'
UNION ALL
SELECT id, 'Verificar consumo de amperaje', 6 FROM public.technical_service_categories WHERE name = 'mantenimiento'
UNION ALL
SELECT id, 'Probar funcionamiento completo del sistema', 7 FROM public.technical_service_categories WHERE name = 'mantenimiento';

-- Insertar herramientas para mantenimiento
INSERT INTO public.technical_tools (category_id, name, tool_type)
SELECT id, 'Amperímetro', 'herramienta' FROM public.technical_service_categories WHERE name = 'mantenimiento'
UNION ALL
SELECT id, 'Termómetro infrarrojo', 'herramienta' FROM public.technical_service_categories WHERE name = 'mantenimiento'
UNION ALL
SELECT id, 'Cepillos y trapos', 'material' FROM public.technical_service_categories WHERE name = 'mantenimiento'
UNION ALL
SELECT id, 'Lanillas', 'material' FROM public.technical_service_categories WHERE name = 'mantenimiento'
UNION ALL
SELECT id, 'Lubricante en spray', 'material' FROM public.technical_service_categories WHERE name = 'mantenimiento'
UNION ALL
SELECT id, 'Desinfectante de serpentines', 'material' FROM public.technical_service_categories WHERE name = 'mantenimiento';

-- Insertar pasos para instalación
INSERT INTO public.technical_steps (category_id, description, step_order)
SELECT id, 'Validar ubicación y orientación correcta', 1 FROM public.technical_service_categories WHERE name = 'instalacion'
UNION ALL
SELECT id, 'Asegurar la estructura o soporte de instalación', 2 FROM public.technical_service_categories WHERE name = 'instalacion'
UNION ALL
SELECT id, 'Instalar unidad interior y exterior', 3 FROM public.technical_service_categories WHERE name = 'instalacion'
UNION ALL
SELECT id, 'Realizar vacío del sistema con bomba', 4 FROM public.technical_service_categories WHERE name = 'instalacion'
UNION ALL
SELECT id, 'Cargar refrigerante si aplica', 5 FROM public.technical_service_categories WHERE name = 'instalacion'
UNION ALL
SELECT id, 'Verificar fugas con nitrógeno', 6 FROM public.technical_service_categories WHERE name = 'instalacion'
UNION ALL
SELECT id, 'Probar funcionamiento y entregar explicación al cliente', 7 FROM public.technical_service_categories WHERE name = 'instalacion';

-- Insertar herramientas para instalación
INSERT INTO public.technical_tools (category_id, name, tool_type)
SELECT id, 'Taladro y brocas', 'herramienta' FROM public.technical_service_categories WHERE name = 'instalacion'
UNION ALL
SELECT id, 'Soportes y tornillería', 'material' FROM public.technical_service_categories WHERE name = 'instalacion'
UNION ALL
SELECT id, 'Nivel de burbuja', 'herramienta' FROM public.technical_service_categories WHERE name = 'instalacion'
UNION ALL
SELECT id, 'Bomba de vacío', 'herramienta' FROM public.technical_service_categories WHERE name = 'instalacion'
UNION ALL
SELECT id, 'Kit de manómetros', 'herramienta' FROM public.technical_service_categories WHERE name = 'instalacion'
UNION ALL
SELECT id, 'Cilindro de refrigerante', 'material' FROM public.technical_service_categories WHERE name = 'instalacion'
UNION ALL
SELECT id, 'Sistema de Tubería', 'material' FROM public.technical_service_categories WHERE name = 'instalacion'
UNION ALL
SELECT id, 'Mangueras y conexiones', 'material' FROM public.technical_service_categories WHERE name = 'instalacion';

-- Continuar con las demás categorías...
INSERT INTO public.technical_steps (category_id, description, step_order)
SELECT id, 'Escuchar diagnóstico del cliente', 1 FROM public.technical_service_categories WHERE name = 'emergencia'
UNION ALL
SELECT id, 'Identificar ruidos, fugas o cortes', 2 FROM public.technical_service_categories WHERE name = 'emergencia'
UNION ALL
SELECT id, 'Verificar voltaje y fusibles', 3 FROM public.technical_service_categories WHERE name = 'emergencia'
UNION ALL
SELECT id, 'Revisar componentes críticos (compresor, tarjetas, sensores)', 4 FROM public.technical_service_categories WHERE name = 'emergencia'
UNION ALL
SELECT id, 'Dar solución inmediata si es posible o generar informe técnico', 5 FROM public.technical_service_categories WHERE name = 'emergencia';

INSERT INTO public.technical_tools (category_id, name, tool_type)
SELECT id, 'Amperímetro', 'herramienta' FROM public.technical_service_categories WHERE name = 'emergencia'
UNION ALL
SELECT id, 'Kit de repuestos rápidos', 'material' FROM public.technical_service_categories WHERE name = 'emergencia'
UNION ALL
SELECT id, 'Linterna táctica', 'herramienta' FROM public.technical_service_categories WHERE name = 'emergencia'
UNION ALL
SELECT id, 'Cinta aislante', 'material' FROM public.technical_service_categories WHERE name = 'emergencia'
UNION ALL
SELECT id, 'Cableado de prueba', 'material' FROM public.technical_service_categories WHERE name = 'emergencia'
UNION ALL
SELECT id, 'Soldadura rápida', 'material' FROM public.technical_service_categories WHERE name = 'emergencia';

INSERT INTO public.technical_steps (category_id, description, step_order)
SELECT id, 'Revisar historial del ticket / cliente', 1 FROM public.technical_service_categories WHERE name = 'diagnostico'
UNION ALL
SELECT id, 'Probar encendido básico', 2 FROM public.technical_service_categories WHERE name = 'diagnostico'
UNION ALL
SELECT id, 'Identificar errores en el panel o display', 3 FROM public.technical_service_categories WHERE name = 'diagnostico'
UNION ALL
SELECT id, 'Comprobar continuidad eléctrica', 4 FROM public.technical_service_categories WHERE name = 'diagnostico'
UNION ALL
SELECT id, 'Determinar si requiere cambio de pieza o reparación', 5 FROM public.technical_service_categories WHERE name = 'diagnostico';

INSERT INTO public.technical_tools (category_id, name, tool_type)
SELECT id, 'Probador de continuidad', 'herramienta' FROM public.technical_service_categories WHERE name = 'diagnostico'
UNION ALL
SELECT id, 'Manual del fabricante', 'material' FROM public.technical_service_categories WHERE name = 'diagnostico'
UNION ALL
SELECT id, 'Multímetro avanzado', 'herramienta' FROM public.technical_service_categories WHERE name = 'diagnostico'
UNION ALL
SELECT id, 'Pinzas amperimétricas', 'herramienta' FROM public.technical_service_categories WHERE name = 'diagnostico'
UNION ALL
SELECT id, 'Lector de códigos de error (si aplica)', 'herramienta' FROM public.technical_service_categories WHERE name = 'diagnostico';

INSERT INTO public.technical_steps (category_id, description, step_order)
SELECT id, 'Asegurarse que los aires no dan error', 1 FROM public.technical_service_categories WHERE name = 'limpieza'
UNION ALL
SELECT id, 'Desmontar carcasas', 2 FROM public.technical_service_categories WHERE name = 'limpieza'
UNION ALL
SELECT id, 'Retirar filtros y limpiarlos con presión', 3 FROM public.technical_service_categories WHERE name = 'limpieza'
UNION ALL
SELECT id, 'Aplicar desinfectante a serpentines', 4 FROM public.technical_service_categories WHERE name = 'limpieza'
UNION ALL
SELECT id, 'Limpiar turbina y bandeja de condensado', 5 FROM public.technical_service_categories WHERE name = 'limpieza'
UNION ALL
SELECT id, 'Reensamblar y probar sistema', 6 FROM public.technical_service_categories WHERE name = 'limpieza'
UNION ALL
SELECT id, 'Asegurarse que el aire no da error', 7 FROM public.technical_service_categories WHERE name = 'limpieza';

INSERT INTO public.technical_tools (category_id, name, tool_type)
SELECT id, 'Hidrolavadora portátil y su manguera', 'herramienta' FROM public.technical_service_categories WHERE name = 'limpieza'
UNION ALL
SELECT id, 'Desinfectante', 'material' FROM public.technical_service_categories WHERE name = 'limpieza'
UNION ALL
SELECT id, 'Escobillas', 'herramienta' FROM public.technical_service_categories WHERE name = 'limpieza'
UNION ALL
SELECT id, 'Cubetas', 'herramienta' FROM public.technical_service_categories WHERE name = 'limpieza'
UNION ALL
SELECT id, 'Guantes de goma', 'material' FROM public.technical_service_categories WHERE name = 'limpieza';

-- Crear índices para mejor rendimiento
CREATE INDEX idx_technical_steps_category_id ON public.technical_steps(category_id);
CREATE INDEX idx_technical_steps_order ON public.technical_steps(category_id, step_order);
CREATE INDEX idx_technical_tools_category_id ON public.technical_tools(category_id);
