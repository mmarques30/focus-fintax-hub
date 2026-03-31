CREATE TABLE public.cliente_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL,
  tipo text NOT NULL,
  descricao text,
  valor_anterior jsonb,
  valor_novo jsonb,
  usuario_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cliente_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_gestor_pmo_crud_historico" ON public.cliente_historico
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor_tributario'::app_role) OR has_role(auth.uid(), 'pmo'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor_tributario'::app_role) OR has_role(auth.uid(), 'pmo'::app_role));

CREATE POLICY "comercial_select_historico" ON public.cliente_historico
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'comercial'::app_role));