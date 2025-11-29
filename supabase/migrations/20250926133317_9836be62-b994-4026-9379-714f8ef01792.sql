-- Fix function search path security warnings
-- Add proper search_path settings to security definer functions

-- Update mark_overdue_tasks function
CREATE OR REPLACE FUNCTION public.mark_overdue_tasks()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  UPDATE public.tasks 
  SET is_overdue = true, updated_at = now()
  WHERE execution_datetime < now() 
    AND status != 'completada' 
    AND is_overdue = false;
END;
$function$;

-- Update get_next_ncf_sequence function
CREATE OR REPLACE FUNCTION public.get_next_ncf_sequence(ncf_type_code text)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

-- Update mark_critical_tasks function
CREATE OR REPLACE FUNCTION public.mark_critical_tasks()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  UPDATE public.tasks 
  SET is_critical = true, updated_at = now()
  WHERE execution_datetime BETWEEN now() AND now() + interval '2 hours'
    AND status != 'completada' 
    AND is_critical = false;
    
  -- Limpiar tareas que ya no son críticas
  UPDATE public.tasks 
  SET is_critical = false, updated_at = now()
  WHERE (execution_datetime < now() OR execution_datetime > now() + interval '2 hours')
    AND is_critical = true;
END;
$function$;

-- Update handle_new_user function  
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