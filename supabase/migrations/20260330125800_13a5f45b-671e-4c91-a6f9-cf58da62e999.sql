
-- New table: processos_teses
CREATE TABLE public.processos_teses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tese text NOT NULL,
  nome_exibicao text NOT NULL,
  valor_credito numeric DEFAULT 0,
  percentual_honorario numeric(5,2) DEFAULT 0,
  valor_honorario numeric GENERATED ALWAYS AS (valor_credito * percentual_honorario / 100) STORED,
  status_contrato text DEFAULT 'aguardando_assinatura',
  status_processo text DEFAULT 'a_iniciar',
  observacao text DEFAULT '',
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

ALTER TABLE public.processos_teses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin gestor pmo crud processos_teses" ON public.processos_teses
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor_tributario'::app_role) OR has_role(auth.uid(), 'pmo'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor_tributario'::app_role) OR has_role(auth.uid(), 'pmo'::app_role));

CREATE POLICY "Comercial select processos_teses" ON public.processos_teses
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'comercial'::app_role));

-- New table: compensacoes_mensais
CREATE TABLE public.compensacoes_mensais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  processo_tese_id uuid NOT NULL REFERENCES processos_teses(id) ON DELETE CASCADE,
  mes_referencia date NOT NULL,
  valor_compensado numeric DEFAULT 0,
  status_pagamento text DEFAULT 'pendente',
  valor_nf_servico numeric DEFAULT 0,
  observacao text DEFAULT '',
  criado_em timestamptz DEFAULT now()
);

ALTER TABLE public.compensacoes_mensais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin gestor pmo crud compensacoes" ON public.compensacoes_mensais
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor_tributario'::app_role) OR has_role(auth.uid(), 'pmo'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor_tributario'::app_role) OR has_role(auth.uid(), 'pmo'::app_role));

CREATE POLICY "Comercial select compensacoes" ON public.compensacoes_mensais
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'comercial'::app_role));

-- Add columns to clientes
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS compensando_fintax boolean DEFAULT false;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS compensacao_outro_escritorio text DEFAULT '';
