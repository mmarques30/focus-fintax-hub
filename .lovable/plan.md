

## Plano — Módulo de Intimações (Tela Completa)

A tabela `intimacoes` e os 29 registros já existem no banco. Este plano cria a tela de gestão e integra no sistema.

---

### 1. Registrar screen permission
**Arquivo:** `src/lib/screen-permissions.ts`
- Adicionar entry `{ key: "intimacoes", label: "Intimações", route: "/intimacoes", defaultRoles: ["admin", "pmo", "gestor_tributario"], defaultReadOnlyRoles: ["comercial"] }` entre `clientes` e `motor_calculo`
- Adicionar mapeamento em `routeToScreenKey`: `if (path.startsWith("/intimacoes")) return "intimacoes";`

### 2. Adicionar no sidebar
**Arquivo:** `src/components/AppSidebar.tsx`
- Novo item no array `menuItems` entre "Clientes" e "Configurações":
  `{ title: "Intimações", url: "/intimacoes", icon: AlertTriangle, screenKey: "intimacoes" }`

### 3. Adicionar rota
**Arquivo:** `src/App.tsx`
- Import + Route: `<Route path="/intimacoes" element={<Intimacoes />} />`

### 4. Criar página `/intimacoes`
**Arquivo:** `src/pages/Intimacoes.tsx`

Seguindo o padrão visual de Pipeline e ClientesList:

- **Header**: Título "Controle de Intimações" + subtítulo + botões "Nova Intimação" e "Exportar Excel"
- **KPI strip** (4 cards, `grid-cols-2 md:grid-cols-4`):
  - Total de intimações
  - Pendentes (pendente + informado_aline + em_andamento) — amber
  - Vencendo em 15 dias (prazo_vencimento <= hoje+15 e status não concluído/cancelado) — red
  - Concluídas (retificacao_feita + concluido) — green
- **Filtros**: busca texto (empresa_nome) + select status + date range (data_intimacao)
- **Tabela**: Empresa, Data Intimação, Motivo, Prazo, Vencimento, Dias Restantes, Status, Próximo Passo, Ações
  - Dias Restantes: pill colorida (red ≤15, amber ≤30, green >30, gray se concluído)
  - Status: badges coloridos conforme especificação
  - Ações: Editar (Dialog) + Excluir (AlertDialog)
- **Loading**: SkeletonKpi + SkeletonTable
- **Exportar Excel**: gera XLSX client-side com dados filtrados

### 5. Criar modal de criação/edição
**Arquivo:** `src/components/intimacoes/IntimacaoFormModal.tsx`

Dialog com campos:
- Empresa (text, required)
- Data da Intimação (DatePicker)
- Motivo (text, required)
- Prazo em dias (number, default 75)
- Status (select com 6 opções)
- Próximo Passo (text)
- Observações (textarea)
- Link para cliente (select buscando de `clientes`)

Validação com Zod. Insert/update via supabase client.

### 6. Exportar Excel
- Usar biblioteca `xlsx` (SheetJS) já disponível ou instalar se necessário
- Botão gera arquivo `.xlsx` com os dados filtrados da tabela

---

### Arquivos criados/modificados
| Arquivo | Ação |
|---------|------|
| `src/pages/Intimacoes.tsx` | Criar |
| `src/components/intimacoes/IntimacaoFormModal.tsx` | Criar |
| `src/lib/screen-permissions.ts` | Editar |
| `src/components/AppSidebar.tsx` | Editar |
| `src/App.tsx` | Editar |

