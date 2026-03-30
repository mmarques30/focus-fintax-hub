

## Redesign Visão Comercial — Replicar HTML de referência

### Resumo
Reescrever completamente a tab "Visão Comercial" do Dashboard para replicar fielmente o layout do HTML `dashboard-comercial-v2-2.html`. A tab Operacional permanece intacta.

### Mudanças

**1. `src/index.css` — Fontes e variáveis CSS**
- Importar Google Fonts: `DM Mono 400/500`, `Barlow 300-700`, `Barlow Condensed 600/700/800`
- Declarar custom properties: `--navy`, `--red`, `--green`, `--amber`, `--ink-*`, `--border`, `--page`, `--surface` etc.

**2. `src/pages/Dashboard.tsx` — Tab Comercial reescrita**

Substituir todo o bloco `activeTab === "comercial"` por:

**KPI Strip (5 cards em grid 5 colunas)**
- Leads no pipeline / Novos esta semana / Potencial total (red) / Contratos emitidos (amber) / Taxa de conversão (green)
- Sub-labels descritivos. Trend badge no KPI "Novos" (comparação vs semana anterior — query adicional para `criado_em >= now()-14d AND criado_em < now()-7d`)
- Tipografia: label uppercase 10px `DM Mono`-like, valor 26px `Barlow Condensed 700`

**Alertas banner (amber)**
- Query: leads em `contrato_emitido` com `status_funil_atualizado_em < now()-3d`
- Header amber com dot + título uppercase
- Rows: empresa (bold), descrição, badge "há X dias"
- Renderizar somente se houver resultados

**Main Grid (2 colunas: 1fr 320px)**

Coluna esquerda — Card "Funil Comercial":
- Funil com layout **flexbox** idêntico ao HTML: color bar (5px), stage name (flex:1 truncate), count (32px DM Mono bold), value (60px DM Mono green), progress bar (100px track), arrow (14px)
- Stages: novo, qualificado, levantamento_teses, em_apresentacao, contrato_emitido, cliente_ativo
- `contrato_emitido` com background amber quando count > 0
- `cliente_ativo`: count = clientes ativos no banco (query `clientes` com status ativo), cor green, checkmark
- Total row com fundo navy-06, border-top 2px
- Progress bar width = `(stage_count / max_count) * 100%`
- Seção "Distribuição por segmento": query group by segmento, barras horizontais proporcionais
- Seção "Origem dos leads": 3 boxes (Formulário LP, Manual, Meta Ads) — query group by `origem`

Coluna direita — Sidebar com 3 cards:
1. **Leads recentes**: avatar (iniciais em box navy-10), empresa, chips segmento coloridos, score badge (A/B/C/D), "quando", valor potencial em green. Link "Ver pipeline completo →"
2. **Qualidade da carteira**: 4 rows Score A/B/C/D com contagem — query `score_lead` ranges agrupadas
3. **Performance do motor** (card navy escuro): 3 métricas — total diagnósticos (count `diagnosticos_leads` distintos por lead), teses ativas (count `motor_teses_config` ativo), sem cobertura (0 ou calculado)

**Bottom Strip (5 items)**
- Leads pipeline / Contratos emitidos (amber) / Clientes ativos (green) / Potencial total (red) / Taxa conversão (green)
- Tipografia: valor 20px Barlow Condensed 700, label 9px uppercase

**Queries adicionais necessárias** (no `fetchData`):
- Taxa conversão: `count(cliente_ativo) / count(all non-lost)` — já temos `comLeads`; precisa contar `cliente_ativo`
- Score distribution: contar leads por faixa de score (A: ≥80, B: 50-79, C: 20-49, D: <20)
- Segmentos: `group by segmento` dos leads ativos
- Origem: `group by origem` dos leads ativos
- Clientes ativos count: `clientes` com status ativo
- Diagnósticos count: `count distinct lead_id from diagnosticos_leads`
- Teses ativas: `count from motor_teses_config where ativo=true`
- Semana anterior (trend): leads criados entre 14d e 7d atrás

**3. Animações**
- Fade-up com `opacity:0 → 1` + `translateY(10px → 0)` em 0.45s, delays escalonados (d1=40ms, d2=90ms, d3=140ms, d4=190ms)
- Aplicar via classes utilitárias ou inline styles com `animation`

**4. Tipografia inline**
- Usar `fontFamily: "'Barlow Condensed', sans-serif"` nos KPI values
- Usar `fontFamily: "'DM Mono', monospace"` nos counts/valores tabulares
- `font-variant-numeric: tabular-nums` em todos os números monetários

### Arquivos alterados
1. `src/index.css` — fontes + CSS custom properties
2. `src/pages/Dashboard.tsx` — tab comercial reescrita, queries adicionais no fetchData, novo state

### Preservado
- Tab Operacional intacta
- Header + tab switcher existentes
- Realtime subscriptions
- Autenticação, rotas, sidebar

