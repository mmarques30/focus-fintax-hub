
-- Table: leads
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  empresa text NOT NULL DEFAULT '',
  cnpj text NOT NULL DEFAULT '',
  faturamento_faixa text NOT NULL DEFAULT '',
  regime_tributario text NOT NULL DEFAULT '',
  segmento text NOT NULL DEFAULT '',
  pagou_irpj boolean NOT NULL DEFAULT false,
  score_lead integer DEFAULT 0,
  status text NOT NULL DEFAULT 'novo',
  origem text NOT NULL DEFAULT 'manual',
  created_by uuid,
  criado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Admin and comercial can do everything on leads
CREATE POLICY "Admin comercial select leads" ON public.leads
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'comercial'::public.app_role)
  );

CREATE POLICY "Admin comercial insert leads" ON public.leads
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'comercial'::public.app_role)
  );

CREATE POLICY "Admin comercial update leads" ON public.leads
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'comercial'::public.app_role)
  );

CREATE POLICY "Admin comercial delete leads" ON public.leads
  FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- Table: benchmarks_teses
CREATE TABLE public.benchmarks_teses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tese_nome text NOT NULL DEFAULT '',
  faturamento_faixa text NOT NULL DEFAULT '',
  segmento text NOT NULL DEFAULT '',
  percentual_minimo numeric NOT NULL DEFAULT 0,
  percentual_maximo numeric NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.benchmarks_teses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin CRUD benchmarks" ON public.benchmarks_teses
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Comercial select benchmarks" ON public.benchmarks_teses
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'comercial'::public.app_role));

-- Table: relatorios_leads
CREATE TABLE public.relatorios_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  conteudo_html text NOT NULL DEFAULT '',
  teses_identificadas jsonb NOT NULL DEFAULT '[]'::jsonb,
  estimativa_total_minima numeric NOT NULL DEFAULT 0,
  estimativa_total_maxima numeric NOT NULL DEFAULT 0,
  score integer NOT NULL DEFAULT 0,
  enviado_whatsapp boolean NOT NULL DEFAULT false,
  enviado_em timestamptz,
  criado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.relatorios_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin comercial select relatorios" ON public.relatorios_leads
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'comercial'::public.app_role)
  );

CREATE POLICY "Admin comercial insert relatorios" ON public.relatorios_leads
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'comercial'::public.app_role)
  );

CREATE POLICY "Admin comercial update relatorios" ON public.relatorios_leads
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'comercial'::public.app_role)
  );
