

## Estado Atual do Sistema — Focus FinTax (Varredura Completa)

---

### 1. Arquitetura Geral

```text
┌──────────────────────────────────────────────────────────┐
│  React 18 + Vite 5 + TypeScript + Tailwind CSS v3        │
│  Backend: Lovable Cloud (Supabase)                        │
│  Auth: email/password (sem auto-confirm)                  │
│  State: React Query + useState + Supabase Realtime        │
│  Routing: React Router v6 (nested protected routes)       │
└──────────────────────────────────────────────────────────┘

Layout: Sidebar colapsável (60px → 250px on hover) + Header fixo + Content area
```

**10 tabelas no banco**: leads, clientes, processos_teses, compensacoes_mensais, relatorios_leads, diagnosticos_leads, lead_historico, benchmarks_teses, motor_teses_config, profiles, user_roles, user_permissions

**5 roles**: admin, pmo, gestor_tributario, comercial, cliente — com RLS granular por tabela e permissões por tela (user_permissions)

**3 Edge Functions**: analyze-lead, manage-users, submit-lead-public

---

### 2. Telas Implementadas

| Rota | Página | Status |
|------|--------|--------|
| `/auth` | Login (email/password + forgot) | Funcional |
| `/dashboard` | Dashboard dual-view (Comercial + Operacional) | Funcional, recém-redesenhado |
| `/pipeline` | Pipeline de Leads (Kanban + Lista) | Funcional |
| `/leads/novo` | Formulário de criação de lead | Funcional |
| `/leads/:id/relatorio` | Relatório de análise IA do lead | Funcional |
| `/clientes` | Lista de clientes com filtros | Funcional |
| `/clientes/:id` | Detalhe do cliente (3 tabs: Processos, Compensações, Resumo) | Funcional |
| `/benchmarks` | Configuração de benchmarks por tese | Funcional |
| `/configuracoes/motor` | Motor de cálculo de teses | Funcional |
| `/usuarios` | Gestão de usuários + permissões | Funcional |
| `/diagnostico/:token` | Diagnóstico público (via token) | Funcional |

---

### 3. Design System Atual

**Tipografia**:
- `Barlow` (body), `Barlow Condensed` (títulos/números grandes), `DM Mono` (valores numéricos)
- KPI numbers: `text-[40px] font-bold` (atualizado recentemente)

**Cores**:
- Navy `#0a1564` (primária), Dash-Red `#c8001e`, Dash-Green `#0f7b4e`, Dash-Amber `#b45309`
- Superfícies: `#f2f3f7` (page bg), `#fff` (cards), gradientes sutis no body

**Cards**: `card-base` (border-radius: 16px, sombra suave, sem border visível), `card-hover` para interatividade

**Sidebar**: Gradiente navy (`#0a1564` → `#071040`), expande on hover, ícones Lucide

---

### 4. Atualizações Recentes (Fixes 1-6)

| Fix | O que mudou |
|-----|------------|
| FIX 1 | KPI cards: `text-[40px]`, `min-h-[110px]`, `p-5`, `gap-4` — ambas as views |
| FIX 2 | Taxa de conversão: corrigida para `clientesAtivos / totalLeadsEver` (capped 100%) |
| FIX 3 | Funil inferior: separado em 3 cards (Funil, Segmento, Origem) |
| FIX 4 | Grid principal: `1fr 340px` sidebar, `w-full` sem max-width |
| FIX 5 | Funil rows: layout flex com larguras fixas (`w-9`, `w-[72px]`, `w-[100px]`), sem overflow |
| FIX 6 | Test leads movidos para `nao_vai_fazer` (3 leads: Your Solutions, Cimed) |
| Responsive | KPIs: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`. Grids: `grid-cols-1 lg:grid-cols-[...]` |
| Empty States | Componente `EmptyState` reutilizável, aplicado em RankingTable, ChartEvolucao, CompensacoesTab |

---

### 5. Pontos de Atenção / Melhorias Potenciais

**Layout / Design:**
- O `AppHeader` (h-16 com Bell + nome) aparece **acima** do `DashboardHeader` (greeting + tabs) — são 2 headers empilhados, somando ~128px de altura antes do conteúdo. Considerar unificar ou ocultar o AppHeader no dashboard.
- A sidebar não mostra active state para sub-rotas do dashboard (comercial/operacional)
- O tab switcher (Visão Comercial / Operacional) não tem indicador visual forte de qual está selecionado (apenas `font-semibold`)

**Dados / Business Logic:**
- O banco está essencialmente vazio (3 leads em `nao_vai_fazer`, sem clientes com compensações reais). Todo o dashboard mostra zeros.
- `comTaxaConversao` agora usa `totalEver` (inclui `nao_vai_fazer` e `perdido`), o que é correto para taxa histórica. Mas com 0 leads ativos, mostra "NaN%" ou "0%".
- Nenhuma foreign key declarada entre as tabelas — a integridade referencial depende do código da aplicação.

**Código:**
- `Dashboard.tsx` faz ~15 queries Supabase em sequência no `fetchData` callback. Poderia ser otimizado com uma Edge Function que retorna todos os KPIs agregados.
- A subscrição Realtime refaz **todas** as queries a cada mudança em `leads` ou `compensacoes_mensais`.
- `ClientesList.tsx` (389 linhas) e `ClienteDetail.tsx` (374 linhas) são monólitos que poderiam ser modularizados como foi feito com o Dashboard.
- `src/App.css` tem estilos default do Vite (`.logo`, `.read-the-docs`) não utilizados — pode ser removido.

**Responsividade:**
- Dashboard está responsivo (KPIs e grids). Demais telas (Pipeline, Clientes, Usuários) não foram ajustadas para mobile.
- A sidebar hover-expand não tem alternativa mobile (hamburger menu).

**Segurança:**
- RLS está bem implementada com `has_role()` security definer function
- Sem foreign keys no banco, porém as policies cobrem os acessos corretamente
- `submit-lead-public` aceita leads anônimos (correto para LP)

---

### 6. Resumo Visual — Dashboard Comercial Atual

```text
┌─ Sidebar (60px) ─┬─────────────────────────────────────────────┐
│  F               │  AppHeader (Bell, User avatar, Role badge)   │
│  Dashboard       ├─────────────────────────────────────────────┤
│  Pipeline        │  Greeting + Date + Tab Switcher              │
│  Clientes        ├─────────────────────────────────────────────┤
│  Config ▶        │  ┌─KPI─┐ ┌─KPI─┐ ┌─KPI─┐ ┌─KPI─┐ ┌─KPI─┐ │
│  Usuários        │  │ 40px│ │     │ │     │ │     │ │     │ │
│                  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ │
│                  │  ┌─── Alertas Banner (amber) ─────────────┐ │
│                  │  ├─── Funil Card ──────┬── Leads Recentes ┤ │
│                  │  │  flex rows w/ bars  │  Qualidade       │ │
│                  │  ├─── Segmento Card ───│  Motor Perf      │ │
│                  │  ├─── Origem Card ─────┘                  │ │
│                  │  └─── Bottom Strip (summary) ─────────────┘ │
│  [User/Logout]   │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

