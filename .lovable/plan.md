

## FIX 2 — Taxa de Conversão Calculation + FIX 3 — Funil Bottom Sections

### FIX 2 — Taxa de Conversão

**Problem**: Line 88-89 in `Dashboard.tsx` divides `clientesAtivos / totalNonLost` where `totalNonLost` excludes lost leads but includes `cliente_ativo` itself, producing inflated percentages (e.g. 2700%).

**Root cause**: `clientesAtivos` comes from the `clientes` table (active clients count), while `totalNonLost` comes from the `leads` table (active pipeline leads). These are different tables with different row counts — the ratio is meaningless.

**Fix in `src/pages/Dashboard.tsx` (lines 85-89)**:

1. Add a query for total leads that ever entered the pipeline (all statuses including `cliente_ativo` and `perdido`):
```ts
const [totalEverRes] = await Promise.all([
  supabase.from("leads").select("id", { count: "exact", head: true })
]);
const totalEver = totalEverRes.count ?? 0;
```

2. Replace the conversion calculation:
```ts
const clientesAtivos = clientesAtivosRes.count ?? 0;
setComClientesAtivos(clientesAtivos);

// Correct: clients ativos / all leads that ever existed, capped at 100%
const taxaConversao = totalEver > 0
  ? Math.min(Math.round((clientesAtivos / totalEver) * 100), 100)
  : 0;
setComTaxaConversao(taxaConversao);
```

3. Update `KpiStripComercial.tsx` — dynamic color for conversion KPI:
```ts
// colorClass logic: green if > 50%, amber if 20-50%, navy otherwise
const conversaoColor = comTaxaConversao > 50 ? "text-dash-green"
  : comTaxaConversao >= 20 ? "text-dash-amber" : "text-navy";
```

---

### FIX 3 — Funil Bottom Sections Into Separate Cards

**Problem**: Segmento and Origem sections are visually glued inside the funnel card.

**Change in `src/components/dashboard/comercial/FunilComercial.tsx`**:

Split the single `<div className="card-base">` into three separate cards wrapped in a `flex flex-col gap-3.5`:

1. **Card 1 — Funil only**: Header + funnel rows + total row (same as current lines 22-72)
2. **Card 2 — Distribuição por Segmento**: Own `card-base p-5` with the segment bars (current lines 75-86), bars use `h-1.5 rounded-full`
3. **Card 3 — Origem dos Leads**: Own `card-base p-5` with the 3 origin tiles using `rounded-xl p-4` and `text-[26px]` numbers

### Files modified
1. `src/pages/Dashboard.tsx` — fix conversion rate calculation
2. `src/components/dashboard/comercial/KpiStripComercial.tsx` — dynamic color for conversion KPI
3. `src/components/dashboard/comercial/FunilComercial.tsx` — split into 3 separate cards

