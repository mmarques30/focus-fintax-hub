

## Redesign Visão Operacional — Replicar HTML de referência

### Resumo
Reescrever completamente a função `OperationalTab` no Dashboard para replicar fielmente o layout do HTML `dashboard-operacional-v2.html`, usando o mesmo design system (CSS vars, fontes) já aplicado na tab comercial.

### Dados já disponíveis vs novos
Os dados atuais (`opClientes`, `opCompensado`, `opHonorarios`, `opSaldo`, `monthlyBars`, `topCompensado`, `topSaldo`) cobrem ~80% do que o HTML precisa. Faltam:
- **Total de clientes ativos** (para "de X ativos" no KPI) — query adicional no fetchData
- **Saldo por cliente** para distribuição por faixas e clientes prioritários — já temos via `topSaldo`
- **Projeções** — calculadas client-side a partir dos dados existentes

### Mudanças em `src/pages/Dashboard.tsx`

**1. Novo state + fetchData**
- Adicionar `opTotalAtivos` (count de todos clientes ativos, não só compensando)
- Todos os cálculos de projeção são client-side no render da tab

**2. Reescrever `OperationalTab` com estas seções (na ordem do HTML):**

**KPI Strip** (5 cards, grid 5 cols) — mesma tipografia da tab comercial:
- Clientes compensando (navy) / sub "de X ativos"
- Total compensado (green) / trend badge com variação mês anterior
- Honorários gerados (navy) / sub "taxa média X%"
- Economia líquida (green) / sub "líquido de honorários"
- Saldo de créditos (red) / sub "disponível para compensar"

**Projection Band** (navy bar, grid 5 cols com dividers):
- Projeção anual: `(compensado / meses_distintos) * 12` — cor accent (#fca5a5)
- Honorários projetados/ano: `(honorarios / meses) * 12` — green-light (#6ee7b7)
- Prazo do saldo: `saldo / média_mensal` — amber-light (#fcd34d), em "X meses"
- Honorários futuros no saldo: `saldo * (hon/comp)` — green-light
- Média mensal: `compensado / meses` — white

**Chart + Distribuição** (grid 1.6fr 1fr):
- Esquerda: Recharts BarChart (compensado navy + honorários red) + barra projeção (próximo mês, opacity reduzida) + legend + insight strip (3 métricas: variação mês, taxa hon. média, média mensal)
- Direita: Distribuição do saldo por faixas (>1M red, 500k-1M amber, <500k navy, zerado gray) com barras proporcionais + callout estratégico red (quando prazo < 9 meses) + honorários futuros box (green)

**Urgency Card** (red-tinted): Top 5 clientes com saldo > 1M, mostrando empresa, saldo, hon. potencial

**Ranking Table** (full HTML table): 8 colunas — #, Empresa, Total compensado (green), Honorários (muted), Economia líquida (navy), % utilizado (muted), Progresso (bar), Saldo restante (red if > 0)

**Bottom Strip** (7 items): Clientes compensando / Compensado 3m (green) / Honorários / Economia líquida (green) / Saldo (red) / Prazo do saldo (amber) / Projeção hon. anual (green)

**3. Animações**: Fade-up com delays escalonados (d1–d6), usando a keyframe `fu` já definida no CSS.

### Arquivos alterados
1. `src/pages/Dashboard.tsx` — reescrever `OperationalTab` + adicionar `opTotalAtivos` state + query no fetchData

### Preservado
- Tab Comercial intacta
- Header, tab switcher, realtime, autenticação, rotas

