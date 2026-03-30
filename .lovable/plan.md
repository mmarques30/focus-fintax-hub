

## Redesign completo do Dashboard

### Arquivo alterado
`src/pages/Dashboard.tsx` — rewrite visual completo, preservando toda lógica de dados (queries, realtime, role filtering, state).

### Estrutura

**SECTION 1 — Header strip** (full width, `bg-[#0a1564]`, h-[72px])
- Left: greeting dinâmico + nome, abaixo data formatada em branco 60% opacity
- Right: badge com role do usuário (fundo white/10%), badge com hora atual

**SECTION 2 — KPI strip** (6 cards em uma faixa unificada branca, 88px, separados por divider vertical 1px)
- Leads no pipeline (Users icon)
- Novos leads 7d (TrendingUp)
- Potencial da carteira (DollarSign, **text-red-600**)
- Clientes ativos (Briefcase)
- Total compensado (CheckCircle2, **text-green-700**)
- Honorários a receber (FileText)
- Cada card: ícone navy left, número bold navy, label gray, trend arrow right (green/red %)

**SECTION 3 — Duas colunas** (left 65% / right 35%)

Left column:
- **Alertas operacionais**: amber border-left se alerts > 0, compact lines (dot + empresa + detail + "há Xd" + arrow). Se zero: linha verde "Tudo em ordem". Max 5.
- **Funil comercial**: tabela compacta (stage name | thin bar navy | count + potencial). Click navega para /pipeline?etapa=X. Total no footer.

Right column (3 cards stacked):
- **Últimos leads**: 5 items compactos (empresa bold, segmento chip colorido, potencial green, time ago). Link "Ver pipeline →"
- **Compensações do mês**: total green large + lista, ou "R$ 0 registrado em [mês]" compacto. Link "Ver clientes →"
- **Motor de teses** (bg navy): 3 métricas em row (diagnósticos / leads LP 30d / taxa conversão) em branco

**SECTION 4 — Bottom strip** (full width, white, 64px)
- 3 métricas estáticas separadas por dividers: clientes na carteira / teses configuradas / combinações cobertas
- Buscar count de `motor_teses_config` ativo e calcular combinações cobertas (regime×segmento)

### Detalhes visuais
- Background geral: `bg-[#f4f5f7]`
- Card radius: `rounded-[10px]`
- Shadow: `shadow-[0_1px_3px_rgba(0,0,0,0.08)]`
- Padding máximo 20px por card
- Gaps 16px (gap-4)
- Segmento chips: supermercado=blue, farmacia=green, pet=orange, materiais=gray, outros=purple (10px font, pill)
- Trend arrows: green `#166534` / red `#991b1b`, 11px
- Monetary: `Intl.NumberFormat('pt-BR')` via `formatCurrency` existente

### Dados adicionais necessários
- Query `motor_teses_config` para contar teses ativas e combinações cobertas (já temos acesso via RLS). Adicionar ao `fetchData`.
- Query `clientes` count para bottom strip (já existe no KPI).

### Preservado integralmente
- Todas as queries Supabase existentes
- Realtime subscriptions
- Role-based filtering (`showLeads`, `showClientes`)
- Routing/navigation
- `AnimatedNumber`, `timeAgo`, `greeting` helpers
- `fetchData` callback structure

