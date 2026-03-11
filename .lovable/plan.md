

## Remover páginas sem implementação (404)

O sidebar lista 5 itens que não têm rotas nem páginas criadas: **Empresas**, **Obrigações**, **Fiscal**, **Relatórios** e **Configurações**. Todos caem no NotFound.

### Mudança única

**`src/components/AppSidebar.tsx`** — remover esses 5 itens do array `menuItems`:
- Empresas (`/empresas`)
- Obrigações (`/obrigacoes`)
- Fiscal (`/fiscal`)
- Relatórios (`/relatorios`)
- Configurações (`/configuracoes`)

Também remover os imports de ícones não utilizados: `Building2`, `FileText`, `Receipt`, `BarChart3`, `Settings`.

O sidebar ficará com: Dashboard, Leads, Usuários, Benchmarks.

Nenhuma outra alteração necessária — App.tsx já não tem essas rotas.

