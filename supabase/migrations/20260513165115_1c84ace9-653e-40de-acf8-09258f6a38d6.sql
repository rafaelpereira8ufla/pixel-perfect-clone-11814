ALTER TABLE public.consultas ADD COLUMN IF NOT EXISTS motivo_cancelamento text;
ALTER TABLE public.consultas ADD COLUMN IF NOT EXISTS cancelado_por uuid;
ALTER TABLE public.consultas ADD COLUMN IF NOT EXISTS cancelado_em timestamp with time zone;