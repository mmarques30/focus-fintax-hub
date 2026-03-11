

## Ajuste de Roles e Alinhamento com Especificacao do Sistema

### Problema
Os roles atuais no banco sao `admin | gestor | operador | visualizador`. A especificacao exige `admin | pmo | gestor_tributario | comercial | cliente`. Todos os componentes que referenciam roles precisam ser atualizados.

### Mudancas

**1. Migracao de banco de dados**
- Criar novo enum `app_role` com os valores corretos: `admin`, `pmo`, `gestor_tributario`, `comercial`, `cliente`
- Migrar dados existentes (mapear `gestor` → `pmo`, `operador` → `comercial`, `visualizador` → `cliente`)
- Atualizar o trigger `handle_new_user_role` para atribuir `cliente` como role padrao (ao inves de `visualizador`)

**2. `src/components/AppHeader.tsx`** — Atualizar `ROLE_LABELS`:
```
admin → Administrador
pmo → PMO
gestor_tributario → Gestor Tributario
comercial → Comercial
cliente → Cliente
```

**3. `src/pages/UserManagement.tsx`** — Atualizar `ROLE_LABELS`, `ROLE_COLORS` e o select de roles no formulario para os novos 5 perfis.

**4. `src/components/AppSidebar.tsx`** — Filtrar itens do menu por role:
- `admin`: ve tudo
- `pmo`: Dashboard, Empresas, Relatorios, Usuarios
- `gestor_tributario`: Dashboard, Empresas, Obrigacoes, Fiscal, Relatorios
- `comercial`: Dashboard, Empresas, Relatorios
- `cliente`: Dashboard, Relatorios

**5. `src/hooks/useAuth.tsx`** — Sem mudanca estrutural, o tipo do `userRole` ja e string generico.

### Ordem de execucao
1. Migracao SQL (enum + trigger)
2. Atualizar AppHeader, UserManagement, AppSidebar em paralelo

