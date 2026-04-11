

## Plano — Exportar Excel na lista de Clientes

Adicionar dropdown de exportação Excel na página `/clientes` com duas opções: visão geral (por cliente) e detalhado por tese.

### Alterações em `src/pages/ClientesList.tsx`

**1. Imports** — adicionar `Download, ChevronDown` do lucide-react, `DropdownMenu` components, e `* as XLSX from "xlsx"`

**2. Funções de exportação** — criar duas funções dentro do componente:

- `exportClientesSimples()`: gera XLSX com colunas Empresa, CNPJ, Segmento, Teses Ativas, Crédito Identificado, Compensado, Saldo, % Recuperado — usando os dados de `filtered` (respeitando filtros ativos)

- `exportClientesPorTese()`: gera XLSX com duas abas:
  - Aba "Por Cliente": mesma visão do relatório por cliente
  - Aba "Por Tese": dados do `teseBreakdown` com colunas Tese, Clientes, Identificado, Compensado, Saldo

**3. UI** — substituir o botão "Relatório da Carteira" (linha 138-141) por um dropdown com 3 opções:
  - "Relatório da Carteira" (abre o modal existente)
  - "Exportar visão geral" (chama `exportClientesSimples`)
  - "Exportar por tese" (chama `exportClientesPorTese`)

### Arquivos modificados
| Arquivo | Ação |
|---------|------|
| `src/pages/ClientesList.tsx` | Editar (imports + funções export + dropdown UI) |

