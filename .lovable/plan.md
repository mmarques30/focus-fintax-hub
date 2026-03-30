

## Pipeline — Unificar etapas + altura ajustável + colunas colapsáveis

### Mudanças

**1. Unificar etapas** (`src/lib/pipeline-constants.ts`)

Reduzir de 9 para 7 etapas visíveis:
- Remover `levantamento_teses` — leads com esse valor serão agrupados em `em_negociacao` (label passa a "Negociação / Teses")
- Remover `nao_vai_fazer` — leads com esse valor serão agrupados em `perdido` (label passa a "Perdido")
- Manter `STAGE_COLORS` para os valores antigos como fallback (leads no banco ainda podem ter o valor original)

Atualizar `ACTIVE_STAGES` para excluir só `perdido`.

**2. Agrupamento no Kanban** (`src/components/pipeline/PipelineKanban.tsx`)

No `grouped` useMemo, mapear:
- `l.status_funil === "levantamento_teses"` → cai na coluna `em_negociacao`
- `l.status_funil === "nao_vai_fazer"` → cai na coluna `perdido`

Ao fazer drag para `em_negociacao`, o lead é salvo com `status_funil = "em_negociacao"` (normalizado).

**3. Altura ajustável das colunas** (`PipelineKanban.tsx`)

Substituir `style={{ minHeight: 500 }}` por `h-[calc(100vh-280px)]` no container flex, e cada coluna com `overflow-y-auto` para scroll interno. As colunas ocupam a altura disponível da viewport.

**4. Colunas colapsáveis** (`PipelineKanban.tsx`)

Adicionar estado `collapsedStages: Set<string>` com toggle no header de cada coluna (ícone ChevronRight/ChevronDown). Quando colapsada:
- Coluna fica com `w-[44px]` (apenas header vertical rotacionado com label + count)
- Cards ficam ocultos, Droppable desabilitado
- Click no header expande de volta

### Arquivos alterados
1. `src/lib/pipeline-constants.ts` — reduzir PIPELINE_STAGES, ajustar labels e colors
2. `src/components/pipeline/PipelineKanban.tsx` — merge de etapas no agrupamento, altura calc(100vh), collapse/expand toggle
3. `src/pages/Pipeline.tsx` — ajustar `activeLeads` filter (só `perdido` agora)

