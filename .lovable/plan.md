

## Cadastrar mariana@iaplicada.com como Admin + Corrigir Gestão de Usuários

### Problema atual
A página de User Management usa `supabase.auth.signUp()` do client — isso troca a sessão do admin logado para o novo usuário. Precisa de uma edge function server-side com service role key.

### Mudanças

**1. Edge function `manage-users`**
- Recebe ação: `create` ou `update`
- Para `create`: usa `supabase.auth.admin.createUser()` com service role key (confirma email automaticamente)
- Para `update`: atualiza profile e role
- Retorna dados do usuário criado sem afetar a sessão do admin

**2. Atualizar `src/pages/UserManagement.tsx`**
- Trocar `supabase.auth.signUp()` por `supabase.functions.invoke("manage-users")` na criação
- Manter o resto da UI como está (já funciona bem)

**3. Cadastrar mariana@iaplicada.com**
- Usar a edge function para criar o usuário com:
  - Email: mariana@iaplicada.com
  - Nome: Mariana
  - Role: admin
  - Senha inicial definida pelo sistema
- Ou: inserir via seed data após a edge function estar pronta

**4. Config**
- Adicionar `[functions.manage-users]` com `verify_jwt = false` no config.toml

### Ordem de execução
1. Criar edge function `manage-users`
2. Deploy da function
3. Atualizar UserManagement.tsx para usar a function
4. Cadastrar mariana@iaplicada.com como admin via a function

