
-- 1) Flag para forçar troca de senha no primeiro acesso
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;

-- 2) Função auxiliar para criar usuário com senha temporária
CREATE OR REPLACE FUNCTION public._seed_user(
  p_email text,
  p_password text,
  p_nome text,
  p_role app_role,
  p_cpf text DEFAULT NULL,
  p_telefone text DEFAULT NULL,
  p_crm text DEFAULT NULL,
  p_especialidade text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE email = p_email;

  IF v_uid IS NULL THEN
    v_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
      p_email, crypt(p_password, gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('nome', p_nome, 'cpf', p_cpf, 'telefone', p_telefone),
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(), v_uid,
      jsonb_build_object('sub', v_uid::text, 'email', p_email),
      'email', v_uid::text, now(), now(), now()
    );
  ELSE
    UPDATE auth.users
      SET encrypted_password = crypt(p_password, gen_salt('bf')),
          email_confirmed_at = COALESCE(email_confirmed_at, now()),
          updated_at = now()
    WHERE id = v_uid;
  END IF;

  -- profile
  INSERT INTO public.profiles (id, nome, email, cpf, telefone, must_change_password)
  VALUES (v_uid, p_nome, p_email, p_cpf, p_telefone, true)
  ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    cpf = COALESCE(EXCLUDED.cpf, public.profiles.cpf),
    telefone = COALESCE(EXCLUDED.telefone, public.profiles.telefone),
    must_change_password = true;

  -- roles: limpa e atribui a função correta
  DELETE FROM public.user_roles WHERE user_id = v_uid;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_uid, p_role);

  -- médico
  IF p_role = 'medico' THEN
    INSERT INTO public.medicos (user_id, nome, email, crm, especialidade)
    VALUES (v_uid, p_nome, p_email, p_crm, p_especialidade)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN v_uid;
END;
$$;

-- 3) Criar os três usuários
SELECT public._seed_user('pedrocardoso@medico.com',       'Pedro@2026',   'Pedro Cardoso',  'medico',         NULL, NULL, 'CRM-12345', 'Clínico Geral');
SELECT public._seed_user('rafaelvilela@administrador.com', 'Rafael@2026', 'Rafael Vilela',  'gestor');
SELECT public._seed_user('larapinto@recpcionista.com',    'Lara@2026',    'Lara Pinto',     'recepcionista');

-- 4) Remover a função auxiliar (não deve ficar exposta)
DROP FUNCTION public._seed_user(text, text, text, app_role, text, text, text, text);
