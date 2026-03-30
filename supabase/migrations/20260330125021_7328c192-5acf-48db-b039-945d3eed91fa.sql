
-- Add new columns to leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS status_funil text NOT NULL DEFAULT 'novo';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS observacoes text DEFAULT '';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS status_funil_atualizado_em timestamptz DEFAULT now();

-- Create lead_historico table
CREATE TABLE public.lead_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  de_etapa text,
  para_etapa text NOT NULL,
  anotacao text,
  criado_em timestamptz DEFAULT now(),
  criado_por uuid
);

ALTER TABLE public.lead_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin comercial pmo select historico" ON public.lead_historico
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'comercial'::app_role) OR 
    has_role(auth.uid(), 'pmo'::app_role)
  );

CREATE POLICY "Admin comercial pmo insert historico" ON public.lead_historico
  FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'comercial'::app_role) OR 
    has_role(auth.uid(), 'pmo'::app_role)
  );

-- Create clientes table
CREATE TABLE public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.leads(id),
  empresa text NOT NULL,
  cnpj text NOT NULL DEFAULT '',
  nome_contato text DEFAULT '',
  email text DEFAULT '',
  whatsapp text DEFAULT '',
  segmento text DEFAULT '',
  regime_tributario text DEFAULT '',
  faturamento_faixa text DEFAULT '',
  status text DEFAULT 'ativo',
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin gestor pmo select clientes" ON public.clientes
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'gestor_tributario'::app_role) OR 
    has_role(auth.uid(), 'pmo'::app_role)
  );

CREATE POLICY "Admin gestor pmo insert clientes" ON public.clientes
  FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'gestor_tributario'::app_role) OR 
    has_role(auth.uid(), 'pmo'::app_role)
  );

CREATE POLICY "Admin gestor pmo update clientes" ON public.clientes
  FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'gestor_tributario'::app_role) OR 
    has_role(auth.uid(), 'pmo'::app_role)
  );

-- Also allow comercial to insert/select clientes (for conversion flow)
CREATE POLICY "Comercial select clientes" ON public.clientes
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'comercial'::app_role));

CREATE POLICY "Comercial insert clientes" ON public.clientes
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'comercial'::app_role));

-- Allow PMO to also read lead_historico
-- PMO update leads
CREATE POLICY "PMO select leads" ON public.leads
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'pmo'::app_role));

CREATE POLICY "PMO update leads" ON public.leads
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'pmo'::app_role));

-- Enable realtime for leads
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
