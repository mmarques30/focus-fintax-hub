DO $$
DECLARE
  new_user_id uuid;
BEGIN
  SELECT id INTO new_user_id FROM auth.users WHERE email = 'mariana@iaplicada.com';
  
  IF new_user_id IS NULL THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_user_meta_data, created_at, updated_at, aud, role
    ) VALUES (
      gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
      'mariana@iaplicada.com', crypt('Focus2026!', gen_salt('bf')),
      now(), jsonb_build_object('full_name', 'Mariana'),
      now(), now(), 'authenticated', 'authenticated'
    ) RETURNING id INTO new_user_id;

    INSERT INTO auth.identities (
      id, user_id, provider_id, provider, identity_data,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), new_user_id, 'mariana@iaplicada.com', 'email',
      jsonb_build_object('sub', new_user_id::text, 'email', 'mariana@iaplicada.com'),
      now(), now(), now()
    );
  END IF;

  UPDATE public.user_roles SET role = 'admin' WHERE user_id = new_user_id;
  UPDATE public.profiles SET full_name = 'Mariana', cargo = 'CEO' WHERE user_id = new_user_id;
END $$;