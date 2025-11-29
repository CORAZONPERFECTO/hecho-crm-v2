-- Agregar campo de orden a las evidencias de tickets
ALTER TABLE public.ticket_evidences 
ADD COLUMN display_order INTEGER DEFAULT 1;

-- Crear índice para mejorar el rendimiento en ordenamiento
CREATE INDEX idx_ticket_evidences_order ON public.ticket_evidences(ticket_id, display_order);

-- Actualizar evidencias existentes con orden secuencial por ticket
WITH ranked_evidences AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY ticket_id ORDER BY created_at ASC) as row_num
  FROM public.ticket_evidences
)
UPDATE public.ticket_evidences 
SET display_order = ranked_evidences.row_num
FROM ranked_evidences 
WHERE public.ticket_evidences.id = ranked_evidences.id;