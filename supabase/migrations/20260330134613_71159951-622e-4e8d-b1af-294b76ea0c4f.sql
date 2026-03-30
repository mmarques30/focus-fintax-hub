
-- 1. Create diagnosticos_leads table
CREATE TABLE public.diagnosticos_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  tese_nome text NOT NULL,
  descricao_comercial text DEFAULT '',
  ordem_exibicao integer DEFAULT 0,
  estimativa_minima numeric DEFAULT 0,
  estimativa_maxima numeric DEFAULT 0,
  percentual_minimo numeric DEFAULT 0,
  percentual_maximo numeric DEFAULT 0,
  criado_em timestamptz DEFAULT now()
);

ALTER TABLE public.diagnosticos_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin comercial pmo select diagnosticos"
  ON public.diagnosticos_leads FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) 
    OR public.has_role(auth.uid(), 'comercial'::app_role) 
    OR public.has_role(auth.uid(), 'pmo'::app_role)
  );

-- 2. Create calcular_diagnostico RPC
CREATE OR REPLACE FUNCTION public.calcular_diagnostico(
  _lead_id uuid,
  _faturamento_mensal numeric,
  _regime text,
  _segmento text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tese RECORD;
  _est_min numeric;
  _est_max numeric;
  _total_min numeric := 0;
  _total_max numeric := 0;
  _score integer;
  _faturamento_anual numeric;
  _teses_json jsonb := '[]'::jsonb;
BEGIN
  -- Clear previous diagnosticos for this lead
  DELETE FROM diagnosticos_leads WHERE lead_id = _lead_id;

  -- Fetch eligible teses and insert into diagnosticos_leads
  FOR _tese IN
    SELECT nome_exibicao, descricao_comercial, ordem_exibicao, percentual_min, percentual_max
    FROM motor_teses_config
    WHERE ativo = true
      AND _regime = ANY(regimes_elegiveis)
      AND _segmento = ANY(segmentos_elegiveis)
    ORDER BY ordem_exibicao ASC
  LOOP
    _est_min := round(_faturamento_mensal * 60 * _tese.percentual_min);
    _est_max := round(_faturamento_mensal * 60 * _tese.percentual_max);

    INSERT INTO diagnosticos_leads (lead_id, tese_nome, descricao_comercial, ordem_exibicao, estimativa_minima, estimativa_maxima, percentual_minimo, percentual_maximo)
    VALUES (_lead_id, _tese.nome_exibicao, COALESCE(_tese.descricao_comercial, ''), COALESCE(_tese.ordem_exibicao, 0), _est_min, _est_max, _tese.percentual_min, _tese.percentual_max);

    _total_min := _total_min + _est_min;
    _total_max := _total_max + _est_max;

    _teses_json := _teses_json || jsonb_build_object(
      'tese_nome', _tese.nome_exibicao,
      'descricao_comercial', COALESCE(_tese.descricao_comercial, ''),
      'ordem_exibicao', COALESCE(_tese.ordem_exibicao, 0),
      'estimativa_minima', _est_min,
      'estimativa_maxima', _est_max,
      'percentual_minimo', _tese.percentual_min,
      'percentual_maximo', _tese.percentual_max
    );
  END LOOP;

  -- Calculate score
  _faturamento_anual := _faturamento_mensal * 12;
  IF _faturamento_anual > 0 THEN
    _score := LEAST(100, round((_total_max / _faturamento_anual) * 100));
  ELSE
    _score := 0;
  END IF;

  -- Update lead
  UPDATE leads SET score_lead = _score, status = 'relatorio_gerado' WHERE id = _lead_id;

  -- Sync relatorios_leads (upsert)
  IF EXISTS (SELECT 1 FROM relatorios_leads WHERE lead_id = _lead_id) THEN
    UPDATE relatorios_leads
    SET teses_identificadas = _teses_json,
        estimativa_total_minima = _total_min,
        estimativa_total_maxima = _total_max,
        score = _score
    WHERE lead_id = _lead_id;
  ELSE
    INSERT INTO relatorios_leads (lead_id, conteudo_html, teses_identificadas, estimativa_total_minima, estimativa_total_maxima, score)
    VALUES (_lead_id, '', _teses_json, _total_min, _total_max, _score);
  END IF;
END;
$$;
