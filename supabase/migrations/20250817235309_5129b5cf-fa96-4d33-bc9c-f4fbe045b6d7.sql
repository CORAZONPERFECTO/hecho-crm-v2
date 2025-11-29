-- Fix critical security vulnerability: Restrict access to users table
-- Remove the overly permissive policy that allows public access
DROP POLICY IF EXISTS "Allow all operations on users" ON public.users;

-- Create secure role-based policies for the users table
-- Only admins and managers can view all user data
CREATE POLICY "Admins and managers can view all users"
ON public.users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'manager')
  )
);

-- Users can view their own data by email match
CREATE POLICY "Users can view their own data"
ON public.users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email = users.email
  )
);

-- Only admins and managers can create new users
CREATE POLICY "Admins and managers can create users"
ON public.users 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'manager')
  )
);

-- Only admins and managers can update user data
CREATE POLICY "Admins and managers can update users"
ON public.users 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'manager')
  )
);

-- Only admins and managers can delete users
CREATE POLICY "Admins and managers can delete users"
ON public.users 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'manager')
  )
);