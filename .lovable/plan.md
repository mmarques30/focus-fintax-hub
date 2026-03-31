

## Shadows Over Borders + KPI Strip Redesign

### Summary
Two visual upgrades: (1) Replace border-based card styling with shadow-based `.card-base` / `.card-hover` / `.card-flush` classes globally. (2) Break KPI strips into individual floating cards with gap spacing instead of border-right dividers.

### Step 1 — Add utility classes to `src/index.css`

Add three card classes after the existing animation keyframes:

```css
.card-base {
  background: white;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(10,21,100,0.06), 0 4px 16px rgba(10,21,100,0.04);
  border: none;
}
.card-hover {
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.card-hover:hover {
  box-shadow: 0 4px 12px rgba(10,21,100,0.10), 0 12px 32px rgba(10,21,100,0.07);
  transform: translateY(-1px);
}
.card-flush {
  background: white;
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(10,21,100,0.05);
}
```

### Step 2 — KPI Strips → individual floating cards

**`KpiStripComercial.tsx`**: Replace single grid container with `grid grid-cols-5 gap-3 mb-4`. Each KPI becomes its own `card-base` div. Remove `KpiBox` usage, inline the content directly with `card-base p-4`.

**`KpiStripOperacional.tsx`**: Same pattern — 5 individual `card-base` cards in a gap-3 grid.

**`dashboard-utils.tsx` — `KpiBox`**: Remove `border-r` divider logic and `last` prop. Or keep `KpiBox` but remove the border-r styling since each card is now standalone.

**`Pipeline.tsx`** (line 149): Replace single bordered container with `grid grid-cols-4 gap-3` of individual `card-base` cards.

**`ClientesList.tsx`** (line 129): Replace single bordered container with `grid grid-cols-5 gap-3` of individual `card-base` cards.

### Step 3 — Apply `card-base` to all dashboard cards

Replace `bg-white border border-[rgba(10,21,100,0.10)] rounded-[10px]` with `card-base` in:

| File | Current class | New class |
|------|--------------|-----------|
| `FunilComercial.tsx` (line 17) | bordered container | `card-base overflow-hidden` |
| `LeadsRecentes.tsx` (line 11) | bordered container | `card-base overflow-hidden` |
| `QualidadeCarteira.tsx` (line 9) | bordered container | `card-base overflow-hidden` |
| `ChartEvolucao.tsx` (line 17) | bordered container | `card-base overflow-hidden` |
| `DistribuicaoSaldo.tsx` (line 23) | bordered container | `card-base overflow-hidden flex flex-col` |
| `RankingTable.tsx` (line 12) | bordered container | `card-base overflow-hidden mb-3.5` |
| `BottomStripComercial.tsx` (line 21) | bordered container | `card-base px-6 py-3 flex items-center mt-3.5` |
| `BottomStripOperacional.tsx` (line 26) | bordered container | `card-base px-6 py-[13px] flex items-center` |

Keep internal `border-b` separators within cards (e.g., card headers, table rows) — only remove the outer border.

### Step 4 — Apply `card-hover` to clickable items

- `FunilComercial.tsx` funnel rows: add `card-hover` effect (already have hover handlers — simplify by removing inline `onMouseEnter`/`onMouseLeave` and using CSS)
- `UrgencyClients.tsx` client items: add `card-hover` to each clickable client div
- `LeadsRecentes.tsx` lead rows: add hover transition

### Step 5 — Apply `card-base` to non-dashboard pages

- `MotorConfig.tsx`: Uses shadcn `Card` — add `card-base` className override to Card components (or wrap)
- `UserManagement.tsx`: Same approach for Card components
- `ClienteDetail.tsx`: Card components get `card-base` override

For shadcn Cards, add `className="card-base"` which will override the default border styling.

### Step 6 — ProjectionBand + UrgencyClients

- `ProjectionBand.tsx`: Keep navy bg, update `rounded-[10px]` → `rounded-[14px]` for consistency
- `UrgencyClients.tsx`: Keep red-tinted bg, update to `rounded-[14px]`
- Bottom strips: Remove internal `border-r` dividers between items (consistent with KPI strip pattern)

### Files modified
1. `src/index.css` — add card utility classes
2. `src/components/dashboard/comercial/KpiStripComercial.tsx` — individual card grid
3. `src/components/dashboard/operacional/KpiStripOperacional.tsx` — individual card grid
4. `src/components/dashboard/dashboard-utils.tsx` — update KpiBox (remove border-r)
5. `src/components/dashboard/comercial/FunilComercial.tsx` — card-base
6. `src/components/dashboard/comercial/LeadsRecentes.tsx` — card-base
7. `src/components/dashboard/comercial/QualidadeCarteira.tsx` — card-base
8. `src/components/dashboard/comercial/BottomStripComercial.tsx` — card-base, remove dividers
9. `src/components/dashboard/operacional/ChartEvolucao.tsx` — card-base
10. `src/components/dashboard/operacional/DistribuicaoSaldo.tsx` — card-base
11. `src/components/dashboard/operacional/RankingTable.tsx` — card-base
12. `src/components/dashboard/operacional/BottomStripOperacional.tsx` — card-base, remove dividers
13. `src/components/dashboard/operacional/ProjectionBand.tsx` — rounded-[14px]
14. `src/components/dashboard/operacional/UrgencyClients.tsx` — rounded-[14px], card-hover on items
15. `src/pages/Pipeline.tsx` — individual KPI cards
16. `src/pages/ClientesList.tsx` — individual KPI cards
17. `src/pages/MotorConfig.tsx` — card-base on Card components
18. `src/pages/UserManagement.tsx` — card-base on Card components

