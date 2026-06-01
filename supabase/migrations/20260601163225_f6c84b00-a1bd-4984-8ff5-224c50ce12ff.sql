
UPDATE auth.users
SET encrypted_password = crypt(encode(gen_random_bytes(24), 'base64') || 'A1!', gen_salt('bf'))
WHERE email IN ('paciente@teste.com', 'medico@teste.com', 'recepcao@teste.com');
