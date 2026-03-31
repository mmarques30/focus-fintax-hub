

## Part 11 — Loading Skeletons Per Section

### Summary
Replace the single `loading` boolean with granular loading states (`kpiLoading`, `chartLoading`) and create dedicated skeleton components for each dashboard section. Sections render independently as their data arrives.

### Step 1 — Create skeleton components

**`src/components/dashboard/SkeletonKpi.tsx`**
- 5-column grid of `card-base p-4 animate-pulse` divs
- Three placeholder bars per card (label, value, sub)

**`src/components/dashboard/SkeletonChart.tsx`**
- Single `card-base p-6 animate-pulse` with a header bar and 6 vertical bars of varying height to mimic a bar chart

**`src/components/dashboard/SkeletonTable.tsx`**
- `card-base p-4 animate-pulse` with a header bar and 5 rows of 4 columns each

### Step 2 — Split loading state in `src/pages/Dashboard.tsx`

Replace `const [loading, setLoading] = useState(true)` with:
```
const [kpiLoading, setKpiLoading] = useState(true);
const [chartLoading, setChartLoading] = useState(true);
```

In `fetchData`:
- After the first `Promise.all` (lines 73-79) that fetches counts → call `setKpiLoading(false)`
- At the end of fetchData (line 209) → call `setChartLoading(false)`
- Remove `setLoading(false)`

### Step 3 — Update render in `Dashboard.tsx`

Remove the top-level `loading ?` ternary. Always render the active view. Pass `kpiLoading` and `chartLoading` as props to both `CommercialView` and `OperationalView`.

### Step 4 — Update `CommercialView` and `OperationalView`

Add `kpiLoading` and `chartLoading` to their Props interfaces. Wrap sections conditionally:

```tsx
// In CommercialView
{kpiLoading ? <SkeletonKpi /> : <KpiStripComercial ... />}
{chartLoading ? <SkeletonChart /> : <FunilComercial ... />}
```

Same pattern for OperationalView: KPI strip, ProjectionBand, ChartEvolucao, etc.

### Files modified
1. `src/components/dashboard/SkeletonKpi.tsx` — new
2. `src/components/dashboard/SkeletonChart.tsx` — new
3. `src/components/dashboard/SkeletonTable.tsx` — new
4. `src/pages/Dashboard.tsx` — split loading state, pass as props
5. `src/components/dashboard/comercial/CommercialView.tsx` — accept loading props, conditional skeletons
6. `src/components/dashboard/operacional/OperationalView.tsx` — accept loading props, conditional skeletons

