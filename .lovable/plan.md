

## Varredura Completa — Focus FinTax CRM

### Visão Geral do Sistema

O Focus FinTax é um CRM tributário completo construído em React + Vite + Tailwind + Lovable Cloud. Ele gerencia o ciclo de vida desde a captação de leads até a compensação tributária de clientes, com dashboards operacionais e comerciais.

---

### Arquitetura

```text
┌──────────────────────────────────────────────────────┐
│  Frontend (React 18 + Vite + Tailwind)               │
│                                                      │
│  ┌────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐ │
│  │ Login  │ │Dashboard │ │ Pipeline │ │ Clientes  │ │
│  │        │ │Com + Op  │ │Kanban/List│ │Detail+Tabs│ │
│  └────────┘ └──────────┘ └──────────┘ └───────────┘ │
│  ┌───────────┐ ┌──────────┐ ┌───────────┐           │
│  │UserMgmt   │ │MotorCfg  │ │Benchmarks │           │
│  └───────────┘ └──────────┘ └───────────┘           │
│                                                      │
│  AuthProvider → ProtectedRoute → AppLayout           │
│  (useAuth, permissions, roles)                       │
├──────────────────────────────────────────────────────┤
│  Backend (Lovable Cloud / Supabase)                  │
│  Tabelas: leads, clientes, processos_teses,          │
│  compensacoes_mensais, relatorios_leads,             │
│  diagnosticos_leads, motor_teses_config,             │
│  benchmarks_teses, profiles, user_roles,             │
│  user_permissions, lead_historico, cliente_historico  │
│  Edge Functions: analyze-lead, manage-users,         │
│  submit-lead-public                                  │
└──────────────────────────────────────────────────────┘
```

---

### Módulos e Estado Atual

| Módulo | Rota | Status | Observações |
|--------|------|--------|-------------|
| **Login** | `/auth` | OK | Login + recuperação de senha. Sem signup (correto — usuários criados por admin). |
| **Dashboard Comercial** | `/dashboard` | OK | KPIs, funil, leads recentes, qualidade carteira, motor performance. Realtime via Supabase channels. |
| **Dashboard Operacional** | `/dashboard` | OK | KPIs, evolução mensal, distribuição saldo, ranking, projeções. |
| **Pipeline** | `/pipeline` | OK | Kanban + Lista. Paginação na lista (25/page). Realtime. Side panel com detalhes do lead. |
| **Clientes Lista** | `/clientes` | OK | 4 KPIs reais, filtros, paginação (25/page), coluna saúde, relatório carteira imprimível. |
| **Cliente Detalhe** | `/clientes/:id` | OK | Sidebar fixa (280px), 3 tabs (Processos, Compensações, Resumo Financeiro), importação CSV Laratex, histórico/timeline. |
| **Motor de Cálculo** | `/configuracoes/motor` | OK | Configuração de teses para diagnóstico automático. |
| **Benchmarks** | `/benchmarks` | OK | Benchmarks por tese/segmento/faixa. |
| **Gestão de Usuários** | `/usuarios` | OK | CRUD de usuários, atribuição de roles, permissões por tela. |
| **Diagnóstico Público** | `/diagnostico/:token` | OK | Página pública para leads verem diagnóstico. |

---

### Design System

- **Fontes**: Barlow (body), Barlow Condensed (display/headings), DM Mono (numbers)
- **Cores**: Navy (#0a1564), Dash Red (#c8001e), Dash Green (#0f7b4e), Dash Amber (#b45309)
- **Cards**: `.card-base` com shadow, sem bordas explícitas. `.card-hover` para interativos.
- **KPI pattern**: Label 9px uppercase tracking, valor 28px Barlow Condensed bold, subtitle 11px ink-35
- **Animações**: `animate-slide-up` com delays escalonados (40ms increments)
- **Sidebar**: Gradiente navy vertical, expand-on-hover (60px → 250px), ícones brancos
- **Responsividade**: Grid adaptativo (`grid-cols-2 sm:grid-cols-4`), mas sidebar do ClienteDetail é fixa 280px

---

### Implementações Recentes (FIXes + IMPROVEMENTs)

| # | Descrição | Status |
|---|-----------|--------|
| FIX 1 | Filtro "Compensando" baseado em dados reais (não mais `compensando_fintax`) | Implementado |
| FIX 2 | Coluna honorários — verificado que `valor_nf_servico` já é consistente | Nenhuma ação necessária |
| FIX 3 | Paginação em ClientesList (25/page com controles) | Implementado |
| FIX 4 | Sidebar responsiva em ClienteDetail | **Não implementado** — sidebar continua fixa `w-[280px]` |
| IMP 1 | KPI strip com dados reais (4 cards: total, compensando, compensado, saldo) | Implementado |
| IMP 2 | Notificações funcionais no header (hook + 2 tipos de alerta) | Implementado |
| IMP 3 | Audit trail `cliente_historico` + timeline no sidebar | Implementado |
| IMP 4 | Botão "Enviar por E-mail" no modal WhatsApp + log de comunicados | Implementado |
| IMP 5 | Indicador de saúde (dot verde/amarelo/vermelho) na listagem | Implementado |

---

### Pontos de Atenção e Potenciais Melhorias

**Bugs / Inconsistências:**
1. **FIX 4 não aplicado**: `ClienteDetail.tsx` linha 198 ainda usa `w-[280px] shrink-0` sem collapse — o plano foi aprovado mas não implementado
2. **Dashboard Operacional filtra por `compensando_fintax`**: linha 160 de Dashboard.tsx usa `.eq("compensando_fintax", true)` para contar clientes operacionais — deveria usar dados reais de compensação (mesmo padrão do FIX 1)
3. **`handleObsChange` não salva o valor**: linha 81 do ClienteDetail atualiza `atualizado_em` mas não inclui o campo `observacoes` no `.update()`
4. **Tipo `as any` em queries**: `cliente_historico` é referenciado com `as any` porque o types.ts pode não estar atualizado — funcional, mas perde type safety

**UX / Design:**
5. **ClienteDetail sidebar não é responsiva** em viewports < 1024px — conteúdo pode ficar espremido
6. **Paginação** mostra no máximo 5 botões de página, sem elipsis para listas longas
7. **Sem loading state nas notificações** — o popover pode abrir vazio enquanto carrega
8. **Sem confirmação ao excluir compensações ou processos** no detalhe do cliente

**Funcionalidade:**
9. **Sem busca global** — cada módulo tem busca independente
10. **Sem export de dados** além do relatório imprimível de carteira
11. **Histórico do cliente** não mostra quem fez a ação (falta join com profiles)
12. **Sem mobile layout** — sidebar e tabelas não adaptam para telas pequenas

---

### Resumo

O sistema está funcional e bem estruturado, com um design system consistente. As principais melhorias recentes (KPIs reais, notificações, audit trail, saúde do cliente, paginação) foram implementadas corretamente. Os pontos mais críticos pendentes são: (1) FIX 4 do sidebar responsivo que não foi aplicado, (2) o Dashboard Operacional ainda usando `compensando_fintax` como filtro, e (3) o bug de observações não salvando. Fora isso, o sistema está sólido para uso.

