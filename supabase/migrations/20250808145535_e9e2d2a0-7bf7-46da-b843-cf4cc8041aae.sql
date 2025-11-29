-- Add new fields for technician ticket finalization
ALTER TABLE public.tickets 
ADD COLUMN fecha_finalizacion_tecnico TIMESTAMP WITH TIME ZONE,
ADD COLUMN id_tecnico_finalizador UUID REFERENCES auth.users(id);

-- Add comment for clarity
COMMENT ON COLUMN public.tickets.fecha_finalizacion_tecnico IS 'Timestamp when technician marked ticket as completed';
COMMENT ON COLUMN public.tickets.id_tecnico_finalizador IS 'ID of technician who finalized the ticket';