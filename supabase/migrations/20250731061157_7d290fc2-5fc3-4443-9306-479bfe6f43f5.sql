-- Fix missing RLS policies for tables that need them
ALTER TABLE public.technical_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_service_categories ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for technical tools
CREATE POLICY "Allow all users to view technical tools" 
ON public.technical_tools 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage technical tools" 
ON public.technical_tools 
FOR ALL 
USING (is_admin_or_manager())
WITH CHECK (is_admin_or_manager());

-- Add RLS policies for technical steps
CREATE POLICY "Allow all users to view technical steps" 
ON public.technical_steps 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage technical steps" 
ON public.technical_steps 
FOR ALL 
USING (is_admin_or_manager())
WITH CHECK (is_admin_or_manager());

-- Add RLS policies for technical service categories
CREATE POLICY "Allow all users to view technical service categories" 
ON public.technical_service_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage technical service categories" 
ON public.technical_service_categories 
FOR ALL 
USING (is_admin_or_manager())
WITH CHECK (is_admin_or_manager());

-- Update existing functions with proper search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT role IN ('admin', 'manager') FROM public.profiles WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;