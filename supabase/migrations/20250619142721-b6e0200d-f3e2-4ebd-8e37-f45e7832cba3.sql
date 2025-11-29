
-- Crear tabla de perfiles de usuario que se sincroniza con auth.users
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'technician', 'contador', 'asistente', 'supervisor')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en la tabla profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Crear función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Buscar si el usuario ya existe en la tabla users por email
  INSERT INTO public.profiles (id, name, email, phone, role, status)
  SELECT 
    NEW.id,
    COALESCE(u.name, NEW.email),
    NEW.email,
    u.phone,
    u.role,
    u.status
  FROM public.users u
  WHERE u.email = NEW.email
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para nuevos usuarios
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función de seguridad para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Función de seguridad para verificar si el usuario es admin o manager
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN AS $$
  SELECT role IN ('admin', 'manager') FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins and managers can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin_or_manager());

CREATE POLICY "Admins and managers can update profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin_or_manager());

-- Habilitar RLS en tickets con políticas más específicas
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Políticas para tickets
CREATE POLICY "Admins and managers can view all tickets" ON public.tickets
  FOR SELECT USING (public.get_current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Technicians can view assigned tickets" ON public.tickets
  FOR SELECT USING (
    public.get_current_user_role() = 'technician' AND 
    assigned_to = (SELECT name FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins and managers can create tickets" ON public.tickets
  FOR INSERT WITH CHECK (public.get_current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Admins and managers can update all tickets" ON public.tickets
  FOR UPDATE USING (public.get_current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Technicians can update assigned tickets" ON public.tickets
  FOR UPDATE USING (
    public.get_current_user_role() = 'technician' AND 
    assigned_to = (SELECT name FROM public.profiles WHERE id = auth.uid())
  );

-- Habilitar RLS en otras tablas relacionadas
ALTER TABLE public.ticket_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_invoices ENABLE ROW LEVEL SECURITY;

-- Políticas para ticket_visits
CREATE POLICY "View visits based on ticket access" ON public.ticket_visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = ticket_id AND (
        public.get_current_user_role() IN ('admin', 'manager') OR
        (public.get_current_user_role() = 'technician' AND t.assigned_to = (SELECT name FROM public.profiles WHERE id = auth.uid()))
      )
    )
  );

CREATE POLICY "Insert visits for accessible tickets" ON public.ticket_visits
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = ticket_id AND (
        public.get_current_user_role() IN ('admin', 'manager') OR
        (public.get_current_user_role() = 'technician' AND t.assigned_to = (SELECT name FROM public.profiles WHERE id = auth.uid()))
      )
    )
  );

-- Políticas similares para otras tablas relacionadas con tickets
CREATE POLICY "View services based on ticket access" ON public.ticket_services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t, public.ticket_visits tv
      WHERE tv.id = visit_id AND t.id = tv.ticket_id AND (
        public.get_current_user_role() IN ('admin', 'manager') OR
        (public.get_current_user_role() = 'technician' AND t.assigned_to = (SELECT name FROM public.profiles WHERE id = auth.uid()))
      )
    )
  );

CREATE POLICY "View evidences based on ticket access" ON public.ticket_evidences
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = ticket_id AND (
        public.get_current_user_role() IN ('admin', 'manager') OR
        (public.get_current_user_role() = 'technician' AND t.assigned_to = (SELECT name FROM public.profiles WHERE id = auth.uid()))
      )
    )
  );

CREATE POLICY "Insert evidences for accessible tickets" ON public.ticket_evidences
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = ticket_id AND (
        public.get_current_user_role() IN ('admin', 'manager') OR
        (public.get_current_user_role() = 'technician' AND t.assigned_to = (SELECT name FROM public.profiles WHERE id = auth.uid()))
      )
    )
  );

-- Políticas para cotizaciones y facturas
CREATE POLICY "View quotations based on ticket access" ON public.ticket_quotations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = ticket_id AND (
        public.get_current_user_role() IN ('admin', 'manager', 'contador')
      )
    )
  );

CREATE POLICY "View invoices based on ticket access" ON public.ticket_invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = ticket_id AND (
        public.get_current_user_role() IN ('admin', 'manager', 'contador')
      )
    )
  );

-- Migrar datos existentes de users a profiles para usuarios que no existen en auth
-- Esto se hará después de que se configuren las cuentas de autenticación
