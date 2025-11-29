-- Agregar columna para rotación manual de evidencias
ALTER TABLE public.ticket_evidences 
ADD COLUMN manual_rotation INTEGER DEFAULT 0;