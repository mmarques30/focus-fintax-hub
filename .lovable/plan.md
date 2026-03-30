

## Criar RPC `calcular_diagnostico` + tabela `diagnosticos_leads` e refatorar Edge Function

### Contexto atual
- A edge function `submit-lead-public` insere o lead, busca teses do `motor_teses_config`, calcula estimativas manualmente e insere em `relatorios_leads`
- A página `/diagnostico/:token` usa RPC `get_diagnostico_by_token` que busca de `leads` + `relatorios_leads`
- A tabela `diagnosticos_leads` **não existe** no banco — precisa ser criada
- O RPC `calcular_diagnostico` **não existe** — precisa ser criado

### Plano

**1. Migration — Criar tabela `diagnosticos_leads`**

```sql
CREATE TABLE public.diagnosticos_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  tese_nome text NOT NULL,
  descricao_comercial text DEFAULT '',
  ordem_exibicao integer DEFAULT 0,
  estimativa_minima numeric DEFAULT 0,
  estimativa_maxima numeric DEFAULT 0,
  percentual_minimo numeric DEFAULT 0,
  percentual_maximo numeric DEFAULT 0,
  criado_em timestamptz DEFAULT now()
);

ALTER TABLE diagnosticos_leads ENABLE ROW LEVEL SECURITY;

-- Public read via token (handled by RPC with SECURITY DEFINER)
-- Admin/comercial/pmo can SELECT
CREATE POLICY "Admin comercial pmo select diagnosticos"
  ON diagnosticos_leads FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'comercial') OR has_role(auth.uid(), 'pmo'));
```

**2. Migration — Criar RPC `calcular_diagnostico`**

A function recebe `lead_id`, `faturamento_mensal`, `regime_key`, `segmento` e:
- Busca teses elegíveis de `motor_teses_config` (ativo, regime, segmento)
- Calcula estimativas (faturamento_mensal * 60 * percentual)
- Insere cada tese em `diagnosticos_leads`
- Calcula totais e score
- Atualiza `leads` com `score_lead`, `status = 'relatorio_gerado'`
- Insere/atualiza `relatorios_leads` (manter compatibilidade com página existente)

```sql
CREATE OR REPLACE FUNCTION public.calcular_diagnostico(
  _lead_id uuid,
  _faturamento_mensal numeric,
  _regime text,
  _segmento text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ ... $$;
```

**3. Migration — Atualizar `get_diagnostico_by_token`**

Alterar para incluir dados de `diagnosticos_leads` no resultado (ou manter lendo de `relatorios_leads` que o RPC já sincroniza).

**4. Refatorar `supabase/functions/submit-lead-public/index.ts`**

- Manter: insert do lead, mapeamento de enums (SEGMENTO_MAP, FATURAMENTO_MAP, REGIME_MAP)
- Remover: toda a lógica manual de busca motor_teses_config, cálculo de teses, insert em relatorios_leads, update de score
- Adicionar: chamada `supabase.rpc('calcular_diagnostico', { _lead_id, _faturamento_mensal, _regime, _segmento })`
- Retornar: `{ success: true, token: lead.token }` (o frontend LP redireciona para `/diagnostico/{token}`)

**5. Sem alteração no frontend**

A página `Diagnostico.tsx` continua usando `get_diagnostico_by_token` que lê de `relatorios_leads` — o RPC garante que essa tabela é populada.

### Arquivos alterados
1. **Migration SQL** — criar `diagnosticos_leads`, criar `calcular_diagnostico`, opcionalmente atualizar `get_diagnostico_by_token`
2. `supabase/functions/submit-lead-public/index.ts` — simplificar para insert + RPC call

