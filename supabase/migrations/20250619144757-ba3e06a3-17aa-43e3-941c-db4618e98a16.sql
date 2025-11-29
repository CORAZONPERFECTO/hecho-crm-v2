
-- Primero, verificar qué usuarios existen en auth.users pero no tienen perfil
-- y crear los perfiles faltantes con datos por defecto

INSERT INTO public.profiles (id, name, email, role, status)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', au.email) as name,
  au.email,
  'admin' as role,  -- Puedes cambiar esto por el rol que prefieras
  'active' as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
