

## Dashboard Redesign — Duas abas (Comercial + Operacional)

### Arquivo alterado
`src/pages/Dashboard.tsx` — rewrite completo do componente visual, preservando helpers, realtime, auth

### Estrutura

**Header** (mantido, ajustado para 64px): greeting + role badge + horário

**Tab switcher** (novo): Centered underline tabs "Visão Comercial" / "Visão Operacional". Default baseado em role (`comercial` → tab 0, `gestor_tributario` → tab 1, `admin/pmo` → localStorage). Usar estado `activeTab` com persistência em `localStorage`.

---

### TAB 1 — Visão Comercial

**Row 1 — 4 KPIs** (strip branca, dividida): Leads no pipeline (navy), Novos esta semana (navy), Potencial total (red `#c8001e`, compact format), Contratos emitidos (amber se >0, gray se 0)

**Row 2 — 60/40 grid**
- LEFT: Funil comercial — tabela compacta com stages que têm dados. Colunas: stage, count, potencial, alerta dias. Border-left vermelho decrescente (8→6→4→2→1px). `contrato_emitido` com bg amber se count>0. Clickable → `/pipeline?etapa=X`
- RIGHT: Leads recentes — últimos 5, com empresa, segmento chip, potencial green, timeAgo, score badge. Link "Ver pipeline →"

**Row 3 — Alertas** (condicional): Banner amber com leads parados em "novo" >1d. Max 3 + "ver todos"

---

### TAB 2 — Visão Operacional

**Row 1 — 5 KPIs** (strip branca, 72px): Clientes ativos (navy), Compensado total (green), Honorários gerados (green), Economia líquida (green), Saldo de créditos (red `#c8001e` + tooltip)

**Row 2 — Evolução mensal** (full width): BarChart (Recharts) — últimos 6 meses de compensações agrupadas por `mes_referencia`. Barras navy, mês mais recente lighter. Título "Evolução mensal — compensações realizadas". Placeholder se sem dados.

**Row 3 — 55/45 grid**
- LEFT: "Ranking de compensações" — Top 8 clientes por total compensado. Colunas: rank, empresa, compensado (green), saldo (red se >500k), mini progress bar. Click → `/clientes/:id`
- RIGHT: "Maior saldo a compensar" — Top 8 por saldo restante. Colunas: empresa, saldo (red bold), total identificado (gray). Subtitle "Priorize esses clientes"

**Row 4 — Resumo mês atual** (strip compacta): Compensado em [mês], Honorários em [mês], Clientes com compensação. Se sem dados: "Nenhuma compensação registrada em [mês]" com dot laranja.

---

### Queries novas/ajustadas

1. **Saldo de créditos**: Query `processos_teses` (status_contrato = 'assinado') → sum valor_credito, minus sum compensacoes_mensais.valor_compensado → saldo
2. **Evolução mensal 6m**: `compensacoes_mensais` grouped by month (últimos 6 meses)
3. **Top clientes por compensado**: `compensacoes_mensais` grouped by cliente_id, joined com `clientes.empresa`, top 8
4. **Top clientes por saldo**: Calcular saldo por cliente (crédito - compensado), top 8
5. **Contratos emitidos**: count leads where status_funil = 'contrato_emitido'
6. **Score dos leads recentes**: adicionar fetch de `score_lead` na query de leads recentes
7. **Honorários mês atual**: compensacoes do mês × percentual médio ou usar valor_nf_servico

### Preservado
- Helpers: `greeting`, `AnimatedNumber`, `timeAgo`, `SEGMENTO_CHIP`
- Realtime subscriptions
- Role-based filtering
- All imports/routing
- `fetchData` callback pattern

### Imports adicionais
- `BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer` de recharts
- `Tooltip, TooltipContent, TooltipProvider, TooltipTrigger` de ui/tooltip
- `Info` de lucide-react
- `getScoreLabel, SCORE_CONFIG` de pipeline-constants

### Design tokens
- `font-variant-numeric: tabular-nums` nos valores monetários
- Monetary compact: `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 })`
- Tab switcher: underline style, navy active, no background pill

