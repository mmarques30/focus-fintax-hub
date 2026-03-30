
CREATE TABLE public.user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  screen_key text NOT NULL,
  can_access boolean NOT NULL DEFAULT true,
  read_only boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, screen_key)
);

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin crud permissions" ON public.user_permissions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "PMO crud permissions" ON public.user_permissions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'pmo'::app_role))
  WITH CHECK (has_role(auth.uid(), 'pmo'::app_role));

CREATE POLICY "Users read own permissions" ON public.user_permissions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
