

## Motor de Teses — Tabela `motor_teses_config` + Painel de Configuração + Refatorar Edge Functions

### Visão geral

Criar a tabela `motor_teses_config` como fonte única de verdade para as teses tributárias (substituindo a dependência de `benchmarks_teses` para elegibilidade). Criar o painel `/configuracoes/motor` para admins/PMOs calibrarem percentuais. Refatorar as edge functions para usar a nova tabela.

### 1. Migração — Tabela `motor_teses_config`

```sql
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
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "PMO select motor_teses" ON public.motor_teses_config
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'pmo'::app_role));
```

Inserir os 5 registros iniciais com os percentuais do PDF.

### 2. Refatorar `submit-lead-public` edge function

Substituir a consulta a `benchmarks_teses` por `motor_teses_config`:
- Filtrar teses onde `ativo = true`, `regimes_elegiveis @> ARRAY[regime]`, `segmentos_elegiveis @> ARRAY[segmento]`
- Calcular: `faturamento_mensal_midpoint × 60 × percentual` por tese
- Incluir `descricao_comercial` e `ordem_exibicao` nos dados salvos em `relatorios_leads.teses_identificadas`

Midpoints: `ate_2m=1000000, 2m_15m=3500000, acima_15m=20000000`

### 3. Refatorar `analyze-lead` edge function

Mesma lógica — consultar `motor_teses_config` em vez de `benchmarks_teses`.

### 4. Nova página `src/pages/MotorConfig.tsx`

Painel com:
- **Card de simulação ao vivo** no topo: selects para segmento/regime/faturamento, calcula totais em tempo real com os percentuais da tabela
- **Tabela** com colunas: Tese, Regimes (chips), Segmentos (chips), % Mín, % Máx, Ativo (toggle), Última atualização
- **Edição via modal**: ao clicar "Editar" abre dialog com todos os campos (nome, descrição comercial, regimes checkboxes, segmentos checkboxes, percentuais, ativo, ordem)
- **Botão "Adicionar nova tese"**: mesmo modal em modo criação
- **Alerta** se alguma combinação regime+segmento não tem tese ativa

### 5. Rota e navegação

- Adicionar rota `/configuracoes/motor` no `App.tsx` (dentro do bloco protegido)
- Adicionar item "Configurações" no sidebar com ícone Settings, roles `["admin", "pmo"]`, url `/configuracoes/motor`

### 6. Atualizar `Diagnostico.tsx`

Usar `descricao_comercial` e `ordem_exibicao` vindos do `teses_identificadas` JSONB (já salvo pela edge function refatorada) em vez do mapa hardcoded `TESE_DESCRICOES`.

### Arquivos alterados
1. **Migração SQL** — `motor_teses_config` + seed + RLS
2. `supabase/functions/submit-lead-public/index.ts` — consultar nova tabela
3. `supabase/functions/analyze-lead/index.ts` — consultar nova tabela
4. `src/pages/MotorConfig.tsx` — novo
5. `src/App.tsx` — rota `/configuracoes/motor`
6. `src/components/AppSidebar.tsx` — item "Configurações"
7. `src/pages/Diagnostico.tsx` — usar descrições dinâmicas

