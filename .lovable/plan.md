

## Permissões granulares por aba e sub-aba

### Resumo
Expandir o sistema de permissões para incluir não apenas telas (menus), mas também abas e sub-abas internas de cada tela. O admin poderá habilitar/desabilitar cada aba individualmente na gestão de usuários.

### Mapeamento de todas as abas do sistema

| Tela | Aba/Sub-aba | Key |
|------|------------|-----|
| Dashboard | Visão Comercial | `dashboard.comercial` |
| Dashboard | Visão Operacional | `dashboard.operacional` |
| Clientes (detalhe) | Processos por Tese | `clientes.processos` |
| Clientes (detalhe) | Compensações | `clientes.compensacoes` |
| Clientes (detalhe) | Resumo Financeiro | `clientes.resumo` |

Pipeline, Motor de Cálculo, Benchmarks e Usuários não têm sub-abas — mantêm permissão apenas no nível de tela.

### Mudanças

**1. `src/lib/screen-permissions.ts`**
- Adicionar campo opcional `children` ao `ScreenDef` com sub-keys
- Expandir `SCREENS` para incluir sub-abas em Dashboard e Clientes
- `getDefaultPermissions` gera entradas para cada sub-aba
- Manter retrocompatibilidade: telas sem children funcionam como antes

```typescript
export interface ScreenDef {
  key: string;
  label: string;
  route: string;
  defaultRoles: string[];
  defaultReadOnlyRoles: string[];
  children?: { key: string; label: string; defaultRoles: string[]; defaultReadOnlyRoles: string[] }[];
}
```

**2. `src/pages/UserManagement.tsx`**
- No checklist de permissões, renderizar sub-abas indentadas abaixo da tela-pai
- Sub-abas só aparecem se a tela-pai estiver habilitada
- Cada sub-aba tem seu próprio checkbox de acesso e somente leitura
- As sub-abas são salvas na mesma tabela `user_permissions` com keys como `dashboard.comercial`

**3. `src/hooks/useAuth.tsx`**
- Sem mudança — já carrega todas as permissões por `screen_key`, que agora inclui sub-keys

**4. `src/pages/Dashboard.tsx`**
- Verificar permissão de `dashboard.comercial` e `dashboard.operacional` antes de mostrar cada tab
- Se só uma tab permitida, mostrar direto sem switcher
- Se nenhuma, mostrar mensagem de acesso restrito

**5. `src/pages/ClienteDetail.tsx`**
- Verificar permissões `clientes.processos`, `clientes.compensacoes`, `clientes.resumo`
- Filtrar TabsTrigger e TabsContent — só renderizar abas permitidas
- Default tab = primeira aba permitida

**6. Migration SQL** — nenhuma necessária (tabela `user_permissions` já suporta qualquer `screen_key` string)

### Arquivos alterados
1. `src/lib/screen-permissions.ts` — children nas definições
2. `src/pages/UserManagement.tsx` — UI de sub-abas no modal
3. `src/pages/Dashboard.tsx` — filtrar tabs por permissão
4. `src/pages/ClienteDetail.tsx` — filtrar tabs por permissão

