

## FIX 1 — Filtro "Compensando" baseado em dados reais

### Problema
Linha 72 e 83 de `ClientesList.tsx` usam `compensando_fintax` (toggle manual) para KPI e filtro. Isso causa inconsistência: clientes aparecem como "compensando" sem ter dados reais em `compensacoes_mensais`.

### Mudanças

**1. `src/pages/ClientesList.tsx`**

- **Linha 72** — KPI: trocar `c.compensando_fintax` por `getClienteStats(c.id).totalCompensado > 0`:
  ```typescript
  const totalCompensando = allStats.filter((c) => c.totalCompensado > 0).length;
  ```

- **Linha 83** — Filtro: trocar `c.compensando_fintax` por `c.totalCompensado > 0`:
  ```typescript
  if (filterStatus === "compensando") filtered = filtered.filter((c) => c.totalCompensado > 0);
  ```

**2. `src/pages/ClienteDetail.tsx` (sidebar)**

- Manter o toggle `compensando_fintax` visível
- Adicionar nota abaixo: `"Marcação interna — filtros baseados em dados reais de compensação."`

### Arquivos modificados
1. `src/pages/ClientesList.tsx` — 2 linhas
2. `src/pages/ClienteDetail.tsx` — nota informativa junto ao toggle

