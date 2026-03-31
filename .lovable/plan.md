

## Varredura Completa — Focus FinTax CRM (Atualizado)

### Visão Geral

CRM tributário completo para gestão de leads, pipeline comercial, clientes e compensações tributárias. Stack: React 18 + Vite + Tailwind + Lovable Cloud (Supabase). 14 páginas, 3 edge functions, 16 migrations, sistema de permissões granular por tela.

---

### Arquitetura Geral

```text
┌─────────────────────────────────────────────────────────┐
│                      FRONT-END                          │
│  Landing (lp.html) → Login → Dashboard (2 visões)      │
│  Pipeline (Kanban/Lista) → Clientes → Detalhe Cliente   │
│  LeadForm → LeadReport → Diagnóstico → Motor Config     │
│  Benchmarks → UserManagement                            │
├─────────────────────────────────────────────────────────┤
│  Auth (email/senha) → Roles (RBAC) → Permissões/Tela   │
│  useAuth → ProtectedRoute → screen-permissions.ts       │
├─────────────────────────────────────────────────────────┤
│                    BACKEND (Cloud)                       │
│  10 tabelas: leads, clientes, processos_teses,          │
│  compensacoes_mensais, cliente_historico, profiles,      │
│  user_roles, user_permissions, etc.                      │
│  3 Edge Functions: analyze-lead, manage-users,           │
│  submit-lead-public                                      │
│  RLS em todas as tabelas                                 │
└─────────────────────────────────────────────────────────┘
```

---

### Status das Funcionalidades

| Módulo | Status | Notas |
|--------|--------|-------|
| **Landing Page** | ✅ OK | lp.html injetado via Index.tsx |
| **Login** | ✅ OK | Email/senha + recuperação, sem signup público |
| **Sidebar** | ✅ OK | Colapsável por hover, permissões por tela, submenus |
| **Dashboard Comercial** | ✅ OK | KPIs reais, funil, leads recentes, score, motor |
| **Dashboard Operacional** | ✅ OK | KPIs de compensação reais (não mais `compensando_fintax`), projeções, ranking, distribuição saldo |
| **Pipeline** | ✅ OK | Kanban + Lista, drag-and-drop, exceção, side panel |
| **LeadForm** | ✅ OK | Validação com Zod, todos os campos |
| **LeadReport** | ✅ OK | Relatório de diagnóstico do lead |
| **Diagnóstico** | ✅ OK | Token público para preenchimento |
| **Clientes Lista** | ✅ OK | Paginação 25/página, filtros, relatório carteira, importação XLSX, saúde do cliente, alertas |
| **Cliente Detalhe** | ✅ OK | 3 abas (Processos, Compensações, Resumo), sidebar colapsável, observações com debounce + feedback "Salvo", histórico com nome do usuário |
| **Compensações** | ✅ OK | CRUD completo, Mapa Tributário PDF, comunicado WhatsApp/Email, exclusão com AlertDialog |
| **Processos/Teses** | ✅ OK | CRUD, status inline, exclusão com AlertDialog, alertas de contrato |
| **Resumo Financeiro** | ✅ OK | KPIs, gráfico mensal, progresso de compensação, exportar PDF |
| **Import XLSX** | ✅ OK | Match por CNPJ, preview, criação automática de processos |
| **Motor Config** | ✅ OK | Configuração de teses |
| **Benchmarks** | ✅ OK | Referências de mercado |
| **UserManagement** | ✅ OK | CRUD de usuários, permissões por tela, roles |
| **Notificações** | ✅ OK | Loading skeleton, leads parados, saldo zerado |
| **Realtime** | ✅ OK | Dashboard escuta `leads` e `compensacoes_mensais` |

---

### Bug Fixes Aplicados

| Fix | Status | Detalhe |
|-----|--------|---------|
| BUG FIX 1 — Observações não salvando | ✅ Corrigido | `handleObsChange` agora salva `observacoes` + feedback visual "Salvo ✓" |
| BUG FIX 2 — Dashboard Op. usando `compensando_fintax` | ✅ Corrigido | Agora conta clientes com compensações reais via `Set` de `cliente_id` |
| BUG FIX 4 — Histórico sem nome do usuário | ✅ Corrigido | Query separada em `profiles` + enriquecimento com `usuario_nome` |
| BUG FIX 5 — Notificações sem loading | ✅ Corrigido | Hook retorna `{ notifications, loading }`, skeleton no popover |
| BUG FIX 6 — Sem confirmação em ações destrutivas | ✅ Corrigido | `AlertDialog` em compensações e processos antes de excluir |
| BUG FIX 7 — FKs duplicadas impedindo query | ✅ Corrigido | FKs extras removidas + hint explícito no select |

---

### Design System

- **Tipografia**: Barlow (corpo), Barlow Condensed (display/KPIs), DM Mono (valores numéricos)
- **Cores**: Navy (#0a1564) primário, Dash Red (#c8001e), Dash Green (#0f7b4e), Dash Amber (#b45309)
- **Cards**: `.card-base` (16px radius, shadow layers), `.card-hover` para interativos
- **Background**: Gradiente radial sutil (navy top-left, red bottom-right) sobre #f2f3f7
- **Sidebar**: Gradiente 180deg navy, ícones + texto colapsável por hover, 60px→250px
- **Animações**: `slideUp` com delays escalonados (40ms por grupo)
- **Print**: Estilos dedicados para Mapa Tributário e Resumo Financeiro

---

### Segurança / Permissões

- **RBAC**: 5 roles (admin, pmo, gestor_tributario, comercial, cliente) via `user_roles` com `has_role()` SECURITY DEFINER
- **Permissões por tela**: `user_permissions` com `screen_key`, `can_access`, `read_only` — fallback para defaults baseados em role
- **RLS**: Todas as 10 tabelas com políticas granulares por role
- **ProtectedRoute**: Verifica auth + permissão de tela antes de renderizar
- **Comercial**: Read-only em clientes, sem acesso a detalhe do cliente
- **Gestor Tributário**: Sem drag no pipeline, acesso operacional por default

---

### Pontos de Atenção / Melhorias Potenciais

1. **ResumoFinanceiroTab** (linha 27): query de `compensacoes_mensais` com join `processos_teses(...)` **sem hint explícito de FK** — após a remoção das FKs duplicadas isso funciona, mas seria prudente adicionar o hint como foi feito no `CompensacoesTab`

2. **Sidebar mobile**: Não há menu hamburger ou drawer para telas < 768px. O sidebar por hover funciona bem em desktop mas em mobile não há alternativa

3. **Paginação ClientesList**: Mostra no máximo 5 páginas fixas (1-5), não se adapta quando há mais páginas ou quando o usuário está na página 6+

4. **`window.location.reload()`** no import Laratex (ClienteDetail linha 202): Força reload total — poderia chamar `fetchData()` em vez disso

5. **Tipagem fraca**: Vários `any` em states de clientes, compensações e histórico. Poderia usar tipos gerados do Supabase

6. **Edge function `analyze-lead`**: Usa lógica local de scoring — sem integração com IA para análise mais sofisticada

7. **Sem testes E2E**: Apenas um test de exemplo (`example.test.ts`). Playwright configurado mas sem suites

8. **Campo `compensando_fintax`**: Ainda existe na tabela `clientes` e no toggle do sidebar do detalhe. O dashboard operacional já não usa, mas o campo permanece como "marcação interna". Poderia ser deprecado

9. **Import XLSX em lote**: Hardcoded para 3 meses (DEZ, JAN, FEV). Não é dinâmico para detectar colunas de meses automaticamente

10. **Sem audit trail para leads**: `lead_historico` registra mudanças de etapa, mas não tem query com profiles para mostrar quem fez a ação (diferente do `cliente_historico` que já foi corrigido)

