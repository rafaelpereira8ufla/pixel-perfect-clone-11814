-- 1) Block non-gestor INSERTs on user_roles (privilege escalation fix)
CREATE POLICY "only gestor insert roles"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'gestor'::app_role));

-- 2) Hide medicos.email from regular authenticated users (column-level)
REVOKE SELECT ON public.medicos FROM authenticated;
GRANT SELECT (id, nome, especialidade, crm, created_at, user_id) ON public.medicos TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.medicos TO authenticated;