
-- Crear tabla de usuarios del sistema
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'technician', 'contador', 'asistente', 'supervisor')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  last_login TEXT DEFAULT 'Nunca',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas las operaciones (ajustar según necesidades de seguridad)
CREATE POLICY "Allow all operations on users" ON public.users
FOR ALL USING (true)
WITH CHECK (true);

-- Insertar algunos usuarios de ejemplo
INSERT INTO public.users (name, email, phone, role, status, last_login) VALUES
('Juan Pérez', 'juan.perez@company.com', '+506 8888-9999', 'admin', 'active', '2024-01-15 14:30'),
('María García', 'maria.garcia@company.com', '+506 7777-8888', 'manager', 'active', '2024-01-15 12:15'),
('Carlos López', 'carlos.lopez@company.com', '+506 6666-7777', 'technician', 'inactive', '2024-01-10 09:45'),
('Ana Torres', 'ana.torres@company.com', '+506 5555-4444', 'contador', 'active', '2024-01-14 11:00'),
('Luis Rojas', 'luis.rojas@company.com', '+506 4444-3333', 'asistente', 'active', '2024-01-15 16:00'),
('Sofía Castro', 'sofia.castro@company.com', '+506 3333-2222', 'supervisor', 'inactive', '2024-01-12 08:20');
