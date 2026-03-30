

## Refactor Dashboard.tsx into Component Architecture

### Summary
Split the 931-line monolithic `Dashboard.tsx` into 17 focused component files. No logic, query, or visual changes — purely structural reorganization.

### Component Mapping

| New File | Source Lines | Content |
|----------|-------------|---------|
| `DashboardHeader.tsx` | 336-356 | Greeting bar + tab switcher |
| `comercial/KpiStripComercial.tsx` | 406-412 + KpiBox (613-628) | 5-column KPI strip + shared KpiBox |
| `comercial/AlertasBanner.tsx` | 414-431 | Stalled leads warning banner |
| `comercial/FunilComercial.tsx` | 434-515 | Funnel card with rows + segmento breakdown + origem |
| `comercial/SegmentoBreakdown.tsx` | 489-514 | Extracted from inside FunilComercial if desired, but currently embedded — will keep inside FunilComercial for now and export separately |
| `comercial/LeadsRecentes.tsx` | 519-547 | Recent leads sidebar card |
| `comercial/QualidadeCarteira.tsx` | 549-567 | Score distribution card |
| `comercial/MotorPerformance.tsx` | 569-584 | Navy motor stats card |
| `comercial/BottomStripComercial.tsx` | 588-606 | Bottom summary strip |
| `operacional/KpiStripOperacional.tsx` | 706-712 | 5-column operational KPIs (reuses KpiBox) |
| `operacional/ProjectionBand.tsx` | 714-739 | Navy projection metrics band |
| `operacional/ChartEvolucao.tsx` | 741-810 | Bar chart + legend |
| `operacional/DistribuicaoSaldo.tsx` | 812-850 (approx) | Saldo distribution bands card |
| `operacional/UrgencyClients.tsx` | ~850-880 | High-saldo urgency list |
| `operacional/RankingTable.tsx` | ~880-920 | Full ranking table |
| `operacional/BottomStripOperacional.tsx` | ~920-931 | Bottom operational strip |

### Shared Exports

**`src/components/dashboard/dashboard-utils.ts`** — Move all helpers, constants, types, and font style objects:
- `greeting()`, `compactCurrency()`, `fullCurrency()`, `timeAgo()`
- `ROLE_LABELS`, `MONTH_ABBR`, `SEGMENTO_CHIP`, `SEGMENTO_BAR_COLOR`, `SCORE_CHIP`, `SCORE_VAL_COLOR`, `FUNNEL_STAGES_COM`, `ORIGEM_LABELS`
- Types: `FunnelRow`, `RecentLead`, `MonthBar`, `ClientRank`
- Font styles: `fontMono`, `fontCondensed`, `fontBarlow`
- `anim()` helper
- `KpiBox` component (used by both tabs)

### Dashboard.tsx (~80 lines)
Keeps only:
- `useAuth`, `useState`, `useCallback`, `useEffect` hooks
- All Supabase queries (unchanged `fetchData`)
- All state declarations
- Realtime subscription
- Permission logic (`canTab`, `resolveDefault`)
- Renders `<DashboardHeader>`, then conditionally `<CommercialView>` or `<OperationalView>` wrapper components that compose the sub-components

### Approach
1. Create `dashboard-utils.ts` with all shared code
2. Create each component file, importing from utils
3. Each component receives only the props it needs (typed, not `any`)
4. Create `CommercialView.tsx` and `OperationalView.tsx` as composition wrappers
5. Slim down `Dashboard.tsx` to orchestration

### Files created/modified
1. `src/components/dashboard/dashboard-utils.ts` — shared helpers, constants, types
2. `src/components/dashboard/DashboardHeader.tsx`
3. `src/components/dashboard/comercial/KpiStripComercial.tsx`
4. `src/components/dashboard/comercial/AlertasBanner.tsx`
5. `src/components/dashboard/comercial/FunilComercial.tsx`
6. `src/components/dashboard/comercial/SegmentoBreakdown.tsx`
7. `src/components/dashboard/comercial/LeadsRecentes.tsx`
8. `src/components/dashboard/comercial/QualidadeCarteira.tsx`
9. `src/components/dashboard/comercial/MotorPerformance.tsx`
10. `src/components/dashboard/comercial/BottomStripComercial.tsx`
11. `src/components/dashboard/operacional/KpiStripOperacional.tsx`
12. `src/components/dashboard/operacional/ProjectionBand.tsx`
13. `src/components/dashboard/operacional/ChartEvolucao.tsx`
14. `src/components/dashboard/operacional/DistribuicaoSaldo.tsx`
15. `src/components/dashboard/operacional/UrgencyClients.tsx`
16. `src/components/dashboard/operacional/RankingTable.tsx`
17. `src/components/dashboard/operacional/BottomStripOperacional.tsx`
18. `src/pages/Dashboard.tsx` — slimmed to ~80 lines orchestration

### Preserved
- All Supabase queries, state, realtime subscriptions — unchanged
- All visual output — pixel-identical
- All inline styles, CSS vars, fonts — unchanged
- Authentication, permissions, routing logic

