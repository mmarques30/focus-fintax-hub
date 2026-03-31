

## Estado Atual do Sistema — Focus FinTax (Varredura Completa)

---

### 1. Arquitetura e Stack

```text
┌─────────────────────────────────────────────────────────┐
│  Frontend: React 18 + Vite 5 + TypeScript + Tailwind v3 │
│  Backend:  Lovable Cloud (Supabase)                      │
│  Auth:     Email/password (sem auto-confirm)             │
│  State:    React Query + useState local                  │
│  Charts:   Recharts                                      │
│  UI:       shadcn/ui + custom design system               │
│  Fonts:    Barlow (body) + Barlow Condensed (display)    │
│            + DM Mono (monospace)                          │
│  Realtime: Supabase channels (leads, compensacoes)       │
└─────────────────────────────────────────────────────────┘
```

---

### 2. Rotas e Módulos

| Rota | Página | Acesso |
|------|--------|--------|
| `/` | Landing redirect | Público |
| `/auth` | Login (email/password + forgot) | Público |
| `/diagnostico/:token` | Diagnóstico tributário (link público) | Público |
| `/dashboard` | Dashboard dual-tab | admin, pmo, gestor_tributario, comercial |
| `/pipeline` | Kanban/List de leads | admin, pmo, comercial (gestor: read-only) |
| `/leads/novo` | Formulário de cadastro de lead | admin, pmo, comercial |
| `/leads/:id/relatorio` | Relatório do lead | admin, pmo, comercial |
| `/clientes` | Lista de clientes com KPIs | admin, pmo, gestor_tributario (comercial: read-only) |
| `/clientes/:id` | Detalhe do cliente (3 abas) | admin, pmo, gestor_tributario |
| `/configuracoes/motor` | Motor de Cálculo (teses) | admin, pmo |
| `/benchmarks` | Benchmarks e Teses | admin |
| `/usuarios` | Gestão de Usuários + permissões | admin, pmo |

---

### 3. Banco de Dados (10 tabelas)

| Tabela | Propósito |
|--------|-----------|
| `profiles` | Nome, email, cargo do usuário |
| `user_roles` | Papel do usuário (admin/pmo/gestor_tributario/comercial/cliente) |
| `user_permissions` | Permissões granulares por tela |
| `leads` | Pipeline comercial (nome, empresa, CNPJ, score, status_funil) |
| `relatorios_leads` | Relatórios gerados por lead (HTML, estimativas, teses) |
| `diagnosticos_leads` | Diagnósticos tributários do motor |
| `lead_historico` | Histórico de mudanças de etapa |
| `clientes` | Carteira de clientes convertidos |
| `processos_teses` | Processos/teses por cliente (valor_credito, honorários) |
| `compensacoes_mensais` | Compensações mês a mês (valor_compensado, valor_nf_servico) |
| `motor_teses_config` | Configuração das teses do motor de cálculo |
| `benchmarks_teses` | Benchmarks por segmento e faixa de faturamento |

---

### 4. Design System — Atualizações Recentes

**Implementado:**
- Sidebar hover-expand (60px → 250px) com gradiente navy
- AppHeader oculto no Dashboard (FIX 4) — apenas DashboardHeader visível
- Dashboard full-width (sem max-w-1400px), responsivo com `grid-cols-1 lg:grid-cols-[1fr_340px]`
- KPI strips padronizados: `card-base`, `font-display text-[28px]`, labels `text-[9px] uppercase tracking-[1.4px]`
- Funil comercial flex-based (FIX 5) — sem overflow em qualquer largura
- Emojis removidos (FIX 3) — substituídos por CSS dots e Lucide icons
- Resumo Financeiro redesenhado (FIX 2) — 5 KPIs + progress bar + gráfico mensal + tabela + exportação PDF
- Print styles configurados para exportação PDF via `window.print()`
- Cores semânticas: navy `#0a1564`, red `#c8001e` (oportunidades), green `#0f7b4e` (realizado), amber `#b45309` (alertas)

**Paleta CSS customizada** em `index.css`:
- `--navy`, `--dash-red`, `--dash-green`, `--dash-amber`
- `--ink`, `--ink-60`, `--ink-35` para hierarquia de texto
- `.card-base`, `.card-hover`, `.card-flush` para containers
- `.animate-slide-up` com delays escalonados

---

### 5. Sistema de Permissões

```text
5 roles: admin > pmo > gestor_tributario > comercial > cliente

Cada tela tem defaultRoles e defaultReadOnlyRoles.
Permissões podem ser customizadas por usuário na tabela user_permissions.
Sidebar filtra itens por permissão. Sub-abas (dashboard.comercial, clientes.processos) também controladas.
```

---

### 6. Edge Functions (3)

| Função | Propósito |
|--------|-----------|
| `analyze-lead` | Motor de diagnóstico tributário automático |
| `manage-users` | CRUD de usuários via service_role |
| `submit-lead-public` | Submissão de lead pelo formulário público (LP) |

---

### 7. Pontos Fortes

- Arquitetura modular: Dashboard dividido em 17+ sub-componentes
- Permissões granulares por tela e sub-aba
- Realtime no dashboard (leads + compensacoes)
- Design system consistente com tokens CSS
- Pipeline Kanban com drag-and-drop, conversão para cliente, exceções com justificativa
- Importação CSV (Laratex) no detalhe do cliente
- Relatório da carteira com print/PDF

---

### 8. Pontos de Atenção / Melhorias Possíveis

| Área | Observação |
|------|------------|
| **Dados vazios** | Leads de teste foram movidos para `nao_vai_fazer`. Dashboard mostra zeros. Sem dados reais de clientes/compensações ainda. |
| **Mobile** | KPI grids usam `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5` mas tabelas grandes (ClientesList, RankingTable) não têm tratamento mobile. Sidebar não tem hamburger menu. |
| **Validação de forms** | LeadForm usa Zod. ClienteFormModal e ProcessoFormModal não usam validação estruturada. |
| **Loading states** | Dashboard tem skeletons. Outras páginas usam spinner simples ou "Carregando..." text. |
| **Error handling** | Queries não tratam erros de forma consistente (alguns usam toast, outros silenciam). |
| **Testes** | Apenas 1 teste placeholder (`example.test.ts`). Sem testes de integração ou E2E reais. |
| **ClienteDetail sidebar** | Largura fixa `w-[280px]` sem responsividade — pode sobrepor conteúdo em telas pequenas. |
| **Pagination** | Nenhuma página implementa paginação. Pode bater no limite de 1000 rows do Supabase em crescimento. |
| **Offline/cache** | React Query usado mas sem `staleTime` ou `cacheTime` configurados globalmente. |
| **Logs/auditoria** | Apenas `lead_historico` registra mudanças. Sem audit trail para clientes, compensações, ou config changes. |
| **Notifications** | Sem sistema de notificações (alertas de contratos vencendo, compensações pendentes). |
| **Landing page** | `public/lp.html` é estática, separada do React. `submit-lead-public` edge function integra. |

---

### 9. Resumo Visual da Navegação

```text
Login ──→ Dashboard ──┬── Visão Comercial (KPIs, Funil, Leads, Qualidade, Motor)
                      └── Visão Operacional (KPIs, Projeções, Evolução, Distribuição, Rankings)
       ──→ Pipeline ──── Kanban ◄──► Lista ◄──► Side Panel (histórico, relatório)
       ──→ Clientes ──── Lista com KPIs e filtros
                    └──→ Detalhe ──┬── Processos por Tese
                                   ├── Compensações (CRUD + debug banner)
                                   └── Resumo Financeiro (KPIs + gráfico + tabela + PDF)
       ──→ Config ────── Motor de Cálculo (teses, regimes, segmentos)
                    └──→ Benchmarks (percentuais por segmento/faixa)
       ──→ Usuários ──── CRUD + permissões por tela
```

---

Este é o estado completo do sistema. Nenhuma alteração de código necessária — esta é uma análise somente leitura.

