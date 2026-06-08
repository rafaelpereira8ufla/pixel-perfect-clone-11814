
-- Restrict medico updates on consultas to their own consultations
DROP POLICY IF EXISTS "staff update consultas" ON public.consultas;

CREATE POLICY "recep gestor update consultas"
ON public.consultas
FOR UPDATE
USING (has_role(auth.uid(), 'recepcionista'::app_role) OR has_role(auth.uid(), 'gestor'::app_role))
WITH CHECK (has_role(auth.uid(), 'recepcionista'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "medico update own consultas"
ON public.consultas
FOR UPDATE
USING (
  has_role(auth.uid(), 'medico'::app_role)
  AND EXISTS (SELECT 1 FROM public.medicos m WHERE m.id = consultas.medico_id AND m.user_id = auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'medico'::app_role)
  AND EXISTS (SELECT 1 FROM public.medicos m WHERE m.id = consultas.medico_id AND m.user_id = auth.uid())
);

-- Restrict resultados insert to the doctor who performed the consulta
DROP POLICY IF EXISTS "medico insert resultados" ON public.resultados_consulta;

CREATE POLICY "medico insert own resultados"
ON public.resultados_consulta
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'medico'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.medicos m
    WHERE m.id = resultados_consulta.medico_id
      AND m.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.consultas c
    JOIN public.medicos m ON m.id = c.medico_id
    WHERE c.id = resultados_consulta.consulta_id
      AND m.user_id = auth.uid()
  )
);

-- Add explicit WITH CHECK on profile self-update and prevent identity change
DROP POLICY IF EXISTS "users update own profile" ON public.profiles;

CREATE POLICY "users update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
