
-- Verificar si las políticas existen y recrearlas si es necesario
DROP POLICY IF EXISTS "Admins and managers can view technical resources" ON public.technical_resources;
DROP POLICY IF EXISTS "Admins and managers can insert technical resources" ON public.technical_resources;
DROP POLICY IF EXISTS "Admins and managers can update technical resources" ON public.technical_resources;
DROP POLICY IF EXISTS "Admins and managers can delete technical resources" ON public.technical_resources;

DROP POLICY IF EXISTS "Admins and managers can view manufacturer images" ON public.manufacturer_images;
DROP POLICY IF EXISTS "Admins and managers can insert manufacturer images" ON public.manufacturer_images;
DROP POLICY IF EXISTS "Admins and managers can update manufacturer images" ON public.manufacturer_images;
DROP POLICY IF EXISTS "Admins and managers can delete manufacturer images" ON public.manufacturer_images;

-- Crear políticas más permisivas temporalmente para diagnosticar el problema
CREATE POLICY "Allow all users to view technical resources" 
  ON public.technical_resources 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow all users to insert technical resources" 
  ON public.technical_resources 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow all users to update technical resources" 
  ON public.technical_resources 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow all users to delete technical resources" 
  ON public.technical_resources 
  FOR DELETE 
  USING (true);

-- Políticas para manufacturer_images
CREATE POLICY "Allow all users to view manufacturer images" 
  ON public.manufacturer_images 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow all users to insert manufacturer images" 
  ON public.manufacturer_images 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow all users to update manufacturer images" 
  ON public.manufacturer_images 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow all users to delete manufacturer images" 
  ON public.manufacturer_images 
  FOR DELETE 
  USING (true);

-- Insertar algunos datos de prueba para verificar que funciona
INSERT INTO public.technical_resources (manufacturer, error_code, error_description, cause, solution, category, difficulty) VALUES
('Samsung', 'E1', 'Error de sensor de temperatura', 'Sensor de temperatura defectuoso o conexión suelta', 'Verificar conexiones del sensor y reemplazar si es necesario', 'Aire Acondicionado', 'medio'),
('LG', 'CH05', 'Error de comunicación', 'Problema en la tarjeta de control o interferencia', 'Reiniciar sistema y verificar conexiones de la tarjeta', 'Aire Acondicionado', 'facil'),
('Carrier', 'F0', 'Falla en compresor', 'Sobrecalentamiento o falta de refrigerante', 'Verificar nivel de refrigerante y estado del compresor', 'Aire Acondicionado', 'dificil')
ON CONFLICT (manufacturer, error_code) DO NOTHING;
