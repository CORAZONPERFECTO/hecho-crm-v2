-- Crear tabla de comentarios de tickets
CREATE TABLE public.ticket_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id uuid NOT NULL,
  comment text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by text NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para comentarios
CREATE POLICY "Users can view ticket comments" 
ON public.ticket_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create ticket comments" 
ON public.ticket_comments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own comments" 
ON public.ticket_comments 
FOR UPDATE 
USING (created_by = (SELECT name FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can delete comments" 
ON public.ticket_comments 
FOR DELETE 
USING (is_admin_or_manager());