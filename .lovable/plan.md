

## Plano: Agrupar menu "Configurações" + Reduzir espaçamento lateral

### Mudanças

**1. Sidebar — submenu "Configurações"** (`src/components/AppSidebar.tsx`)

Substituir os dois itens separados "Benchmarks e Teses" e "Motor de Cálculo" por um único item **"Configurações"** (ícone `Settings`) que, quando a sidebar está expandida, mostra dois sub-links indentados abaixo:
- Motor de Cálculo → `/configuracoes/motor`
- Benchmarks e Teses → `/benchmarks`

Quando a sidebar está colapsada (fechada), mostrar apenas o ícone `Settings`. Ao expandir, o item "Configurações" é clicável para expandir/colapsar os sub-itens (accordion simples com estado local). Os sub-itens ficam com `pl-10` (indentados) e fonte `text-xs`.

Permissões:
- "Configurações" visível para `admin` e `pmo`
- Benchmarks visível apenas para `admin`
- Motor visível para `admin` e `pmo`

**2. Reduzir espaçamento lateral** (`src/components/AppLayout.tsx` + `src/pages/Dashboard.tsx`)

- `AppLayout`: reduzir `main` padding de `p-6` para `p-4`
- `Dashboard.tsx`: reduzir `px-4 py-4` para `px-3 py-3` e `gap-4` para `gap-3`
- Dashboard header negativo margin: ajustar de `-m-6` para `-m-4` para compensar o novo padding

Estas duas mudanças fazem o conteúdo ocupar mais área útil em tela.

### Arquivos alterados
1. `src/components/AppSidebar.tsx` — reestruturar menuItems com sub-itens para Configurações
2. `src/components/AppLayout.tsx` — reduzir padding do main
3. `src/pages/Dashboard.tsx` — ajustar margin negativo e paddings internos

