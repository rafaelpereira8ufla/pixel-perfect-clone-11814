
DROP POLICY IF EXISTS "paciente update own consultas" ON public.consultas;

CREATE POLICY "paciente cancel own consultas"
  ON public.consultas
  FOR UPDATE
  TO authenticated
  USING (paciente_id = auth.uid())
  WITH CHECK (
    paciente_id = auth.uid()
    AND status = 'cancelado'
    AND data_consulta > now() + interval '2 hours'
  );
