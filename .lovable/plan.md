

## Ajustar estrutura interna — navegação, perfis e paleta

O sistema já possui a maior parte da estrutura (login, sidebar, rotas protegidas, roles). As mudanças são ajustes pontuais.

### O que já existe e será mantido
- Login minimalista em `/auth` (email, senha, recuperação)
- Sidebar colapsável com hover
- Rotas protegidas via `ProtectedRoute`
- Roles: admin, pmo, gestor_tributario, comercial, cliente
- Sem cadastro público

### Mudanças necessárias

**1. Renomear e adicionar itens na sidebar** (`src/components/AppSidebar.tsx`)
- "Leads" → "Pipeline de Leads" (url `/leads`)
- "Benchmarks" → "Benchmarks e Teses" (url `/benchmarks`)
- Adicionar "Clientes" (url `/clientes`, ícone `Building2`)

**2. Atualizar permissões por role na sidebar**
| Seção | admin | comercial | gestor_tributario | pmo |
|---|---|---|---|---|
| Dashboard | ✓ | ✓ | ✓ | ✓ |
| Pipeline de Leads | ✓ | ✓ | — | ✓ |
| Clientes | ✓ | — | ✓ | ✓ |
| Benchmarks e Teses | ✓ | — | — | — |
| Usuários | ✓ | — | — | ✓ |

**3. Criar página placeholder Clientes** (`src/pages/Clientes.tsx`)
- Página simples com título e mensagem "Em construção"
- Será expandida em prompts futuros

**4. Adicionar rota `/clientes`** (`src/App.tsx`)

**5. Ajustar cor primária para `#0a1a6e`** (`src/index.css`)
- `--primary`: de `233 97% 21%` para `233 83% 24%`
- `--sidebar-background`: mesma atualização
- Ajustar `--sidebar-accent` proporcionalmente

### Arquivos alterados
1. `src/components/AppSidebar.tsx` — nomes, ícone, roles
2. `src/App.tsx` — rota `/clientes`
3. `src/pages/Clientes.tsx` — novo arquivo placeholder
4. `src/index.css` — ajuste de cor primária

