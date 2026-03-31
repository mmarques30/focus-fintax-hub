

## IMPROVEMENT 1 — KPI Strip em ClientesList com dados reais

### Situação Atual
A KPI strip (linhas 141-167) já usa dados calculados de `allStats`, mas tem 5 cards com labels genéricos e grid `grid-cols-5`. Os dados já são reais (vindos de processos e compensações).

### Mudanças em `src/pages/ClientesList.tsx`

Substituir o bloco de 5 KPIs (linhas 141-167) por 4 KPIs conforme spec do usuário:

| # | Label | Valor | Sub | Cor |
|---|-------|-------|-----|-----|
| 1 | Total de clientes | `clientes.length` | na carteira | navy |
| 2 | Compensando ativamente | `allStats.filter(c => c.totalCompensado > 0).length` | com dados reais | green |
| 3 | Total compensado | `globalCompensado` (formatCurrencyBR) | acumulado carteira | green |
| 4 | Saldo a compensar | `globalCredito - globalCompensado` (formatCurrencyBR) | potencial restante | red |

- Grid muda de `grid-cols-5` para `grid-cols-2 sm:grid-cols-4`
- Remove o card "Crédito identificado" (redundante com saldo)
- Mantém variáveis existentes (`totalCompensando`, `globalCompensado`, `globalCredito`)

### Arquivos modificados
1. `src/pages/ClientesList.tsx` — substituir bloco KPI (linhas 141-167)

