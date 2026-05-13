
DO $$
DECLARE
  paciente_id uuid := gen_random_uuid();
  medico_id uuid := gen_random_uuid();
  recep_id uuid := gen_random_uuid();
  encrypted_pw text := crypt('Teste@123', gen_salt('bf'));
BEGIN
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
  VALUES ('00000000-0000-0000-0000-000000000000', paciente_id, 'authenticated', 'authenticated', 'paciente@teste.com', encrypted_pw, now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('nome','Ana Paciente Teste'), '', '', '', '');
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), paciente_id, jsonb_build_object('sub', paciente_id::text, 'email', 'paciente@teste.com'), 'email', paciente_id::text, now(), now(), now());
  INSERT INTO public.profiles (id, nome, email) VALUES (paciente_id, 'Ana Paciente Teste', 'paciente@teste.com')
    ON CONFLICT (id) DO UPDATE SET nome=EXCLUDED.nome, email=EXCLUDED.email;
  INSERT INTO public.user_roles (user_id, role) VALUES (paciente_id, 'paciente') ON CONFLICT DO NOTHING;

  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
  VALUES ('00000000-0000-0000-0000-000000000000', medico_id, 'authenticated', 'authenticated', 'medico@teste.com', encrypted_pw, now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('nome','Dr. Carlos Médico'), '', '', '', '');
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), medico_id, jsonb_build_object('sub', medico_id::text, 'email', 'medico@teste.com'), 'email', medico_id::text, now(), now(), now());
  INSERT INTO public.profiles (id, nome, email) VALUES (medico_id, 'Dr. Carlos Médico', 'medico@teste.com')
    ON CONFLICT (id) DO UPDATE SET nome=EXCLUDED.nome, email=EXCLUDED.email;
  INSERT INTO public.user_roles (user_id, role) VALUES (medico_id, 'medico') ON CONFLICT DO NOTHING;

  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
  VALUES ('00000000-0000-0000-0000-000000000000', recep_id, 'authenticated', 'authenticated', 'recepcao@teste.com', encrypted_pw, now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('nome','Marina Recepção'), '', '', '', '');
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), recep_id, jsonb_build_object('sub', recep_id::text, 'email', 'recepcao@teste.com'), 'email', recep_id::text, now(), now(), now());
  INSERT INTO public.profiles (id, nome, email) VALUES (recep_id, 'Marina Recepção', 'recepcao@teste.com')
    ON CONFLICT (id) DO UPDATE SET nome=EXCLUDED.nome, email=EXCLUDED.email;
  INSERT INTO public.user_roles (user_id, role) VALUES (recep_id, 'recepcionista') ON CONFLICT DO NOTHING;
END $$;
