
-- Crear tabla para recursos técnicos (errores, causas, soluciones)
CREATE TABLE public.technical_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manufacturer TEXT NOT NULL,
  error_code TEXT NOT NULL,
  error_description TEXT NOT NULL,
  cause TEXT NOT NULL,
  solution TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  difficulty TEXT NOT NULL DEFAULT 'medio' CHECK (difficulty IN ('facil', 'medio', 'dificil')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(manufacturer, error_code)
);

-- Crear tabla para imágenes de fabricantes (tarjetas electrónicas)
CREATE TABLE public.manufacturer_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manufacturer TEXT NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  board_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en ambas tablas
ALTER TABLE public.technical_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manufacturer_images ENABLE ROW LEVEL SECURITY;

-- Políticas para technical_resources (solo admins y managers pueden gestionar)
CREATE POLICY "Admins and managers can view technical resources" 
  ON public.technical_resources 
  FOR SELECT 
  USING (is_admin_or_manager());

CREATE POLICY "Admins and managers can insert technical resources" 
  ON public.technical_resources 
  FOR INSERT 
  WITH CHECK (is_admin_or_manager());

CREATE POLICY "Admins and managers can update technical resources" 
  ON public.technical_resources 
  FOR UPDATE 
  USING (is_admin_or_manager());

CREATE POLICY "Admins and managers can delete technical resources" 
  ON public.technical_resources 
  FOR DELETE 
  USING (is_admin_or_manager());

-- Políticas para manufacturer_images (solo admins y managers pueden gestionar)
CREATE POLICY "Admins and managers can view manufacturer images" 
  ON public.manufacturer_images 
  FOR SELECT 
  USING (is_admin_or_manager());

CREATE POLICY "Admins and managers can insert manufacturer images" 
  ON public.manufacturer_images 
  FOR INSERT 
  WITH CHECK (is_admin_or_manager());

CREATE POLICY "Admins and managers can update manufacturer images" 
  ON public.manufacturer_images 
  FOR UPDATE 
  USING (is_admin_or_manager());

CREATE POLICY "Admins and managers can delete manufacturer images" 
  ON public.manufacturer_images 
  FOR DELETE 
  USING (is_admin_or_manager());

-- Índices para mejorar el rendimiento
CREATE INDEX idx_technical_resources_manufacturer ON public.technical_resources(manufacturer);
CREATE INDEX idx_technical_resources_error_code ON public.technical_resources(error_code);
CREATE INDEX idx_technical_resources_category ON public.technical_resources(category);
CREATE INDEX idx_manufacturer_images_manufacturer ON public.manufacturer_images(manufacturer);
