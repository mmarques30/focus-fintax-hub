

## Gestão de Permissões por Tela no Módulo de Usuários

### Resumo
Adicionar ao modal de criar/editar usuário uma seção de **permissões por tela**, onde o admin marca quais telas cada usuário pode acessar. Isso substitui a lógica fixa de roles→telas por uma configuração granular por usuário, armazenada no banco.

### Telas do sistema (checklist)
| Tela | Rota | Default habilitado para |
|------|------|------------------------|
| Dashboard | `/dashboard` | todos |
| Pipeline de Leads | `/pipeline` | admin, pmo, comercial |
| Clientes | `/clientes` | admin, pmo, gestor_tributario, comercial(RO) |
| Motor de Cálculo | `/configuracoes/motor` | admin, pmo |
| Benchmarks e Teses | `/benchmarks` | admin |
| Gestão de Usuários | `/usuarios` | admin, pmo |

### Mudanças

**1. Migration — tabela `user_permissions`**
```sql
CREATE TABLE public.user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  screen_key text NOT NULL,
  can_access boolean NOT NULL DEFAULT true,
  read_only boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, screen_key)
);
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
-- Admin full CRUD
CREATE POLICY "Admin crud permissions" ON public.user_permissions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
-- Users read own
CREATE POLICY "Users read own permissions" ON public.user_permissions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
```

Screen keys: `dashboard`, `pipeline`, `clientes`, `motor_calculo`, `benchmarks`, `usuarios`

**2. `src/lib/screen-permissions.ts`** (novo)
- Define `SCREENS` array com `{ key, label, route, defaultRoles, defaultReadOnlyRoles }`
- Export `getDefaultPermissions(role)` — retorna permissões default baseadas no role
- Export `useScreenPermissions()` hook — busca `user_permissions` do user logado, faz merge com defaults do role, cacheia em state

**3. `src/pages/UserManagement.tsx`** — atualizar modal
- Abaixo do select de "Perfil de acesso", adicionar seção "Permissões de Tela"
- Grid de checkboxes: cada tela com toggle "Acesso" e toggle "Somente leitura"
- Ao mudar o role no select, auto-preencher os checkboxes com os defaults daquele role
- No `handleSave`: após criar/editar user, upsert em `user_permissions` as telas marcadas
- Na listagem (tabela), adicionar tooltip ou expandir row para ver permissões

**4. `src/components/AppSidebar.tsx`** — usar permissões do banco
- Importar `useScreenPermissions()` 
- Filtrar `menuItems` com base nas permissões carregadas (em vez de só checar `userRole`)
- Manter ícone de lock para telas read-only

**5. `src/components/ProtectedRoute.tsx`** — validar acesso por tela
- Checar se o user tem `can_access = true` para a rota atual
- Redirecionar para `/dashboard` se não tiver permissão

**6. Edge function `manage-users`** — adicionar upsert de permissões
- No action `create` e `update`, receber array `permissions: [{screen_key, can_access, read_only}]`
- Após salvar role, deletar permissions antigas e insertar as novas

### Fluxo do admin
1. Abre modal de novo/editar usuário
2. Seleciona role → checkboxes auto-preenchidos com defaults
3. Pode desmarcar/marcar telas individuais (ex: dar acesso a Pipeline para gestor_tributário)
4. Salva → permissões gravadas em `user_permissions`

### Arquivos alterados/criados
1. Migration SQL (nova tabela `user_permissions`)
2. `src/lib/screen-permissions.ts` (novo)
3. `src/pages/UserManagement.tsx` (seção de permissões no modal)
4. `src/components/AppSidebar.tsx` (filtro por permissões)
5. `src/components/ProtectedRoute.tsx` (validação por rota)
6. `src/hooks/useAuth.tsx` (carregar permissões junto com role/profile)
7. `supabase/functions/manage-users/index.ts` (upsert permissões)

