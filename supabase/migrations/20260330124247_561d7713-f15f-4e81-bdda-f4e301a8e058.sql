-- Motor de Teses Config table
CREATE TABLE public.motor_teses_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tese text NOT NULL,
  nome_exibicao text NOT NULL,
  descricao_comercial text,
  regimes_elegiveis text[] NOT NULL DEFAULT '{}',
  segmentos_elegiveis text[] NOT NULL DEFAULT '{}',
  percentual_min numeric(6,4) NOT NULL,
  percentual_max numeric(6,4) NOT NULL,
  ativo boolean DEFAULT true,
  ordem_exibicao int DEFAULT 0,
  atualizado_em timestamptz DEFAULT now(),
  atualizado_por uuid
);

ALTER TABLE public.motor_teses_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin CRUD motor_teses" ON public.motor_teses_config
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "PMO select motor_teses" ON public.motor_teses_config
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'pmo'::app_role));

CREATE POLICY "Service select motor_teses" ON public.motor_teses_config
  FOR SELECT TO anon
  USING (ativo = true);