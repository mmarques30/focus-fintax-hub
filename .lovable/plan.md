

## Plano — Correção de 3 bugs visuais

### BUG 1 — Coluna "Teses" duplicada em ClientesList
**Arquivo:** `src/pages/ClientesList.tsx` (linha 281)
- Remover a segunda `<TableHead>Teses</TableHead>` duplicada na linha 281

### BUG 2 — Label "Comp. outro escritório" duplicado
**Arquivo:** `src/pages/ClienteDetail.tsx`
- Verificação mostra apenas 1 instância (linha 309). O bug pode já ter sido corrigido em commit anterior. Confirmarei e removerei se houver duplicata residual.

### BUG 3 — Rotas /leads sem entrada no sidebar
**Arquivos:**
- `src/lib/screen-permissions.ts` — Adicionar entry `{ key: "fila_leads", label: "Fila de Leads", route: "/leads", defaultRoles: ["admin", "pmo", "comercial"], defaultReadOnlyRoles: ["gestor_tributario"] }` entre "pipeline" e "clientes"
- `src/lib/screen-permissions.ts` — Adicionar caso no `routeToScreenKey`: `if (path.startsWith("/leads")) return "fila_leads";`
- `src/components/AppSidebar.tsx` — Adicionar item `{ title: "Fila de Leads", url: "/leads", icon: Inbox, screenKey: "fila_leads" }` entre "Pipeline de Leads" e "Clientes", e importar `Inbox` do lucide-react

### Arquivos modificados
| Arquivo | Ação |
|---------|------|
| `src/pages/ClientesList.tsx` | Remover TableHead duplicado |
| `src/pages/ClienteDetail.tsx` | Verificar/remover label duplicado |
| `src/lib/screen-permissions.ts` | Adicionar screen "fila_leads" + routeToScreenKey |
| `src/components/AppSidebar.tsx` | Adicionar item sidebar "Fila de Leads" com ícone Inbox |

