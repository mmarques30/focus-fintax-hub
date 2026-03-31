

## PART 4 — Animations (discrete, professional)

### Summary
Replace the current `animate-dash-in` + `animDelay()` pattern with a cleaner `animate-slide-up` + `delay-N` system. Add a `useCountUp` hook for KPI number animations. Apply across all dashboard components and Pipeline/Clientes KPI strips.

### Step 1 — CSS (`src/index.css`)

Replace the existing `fu` keyframe and add delay utilities:
```css
@keyframes slideUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-slide-up {
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.delay-1 { animation-delay: 40ms; }
.delay-2 { animation-delay: 80ms; }
.delay-3 { animation-delay: 120ms; }
.delay-4 { animation-delay: 160ms; }
.delay-5 { animation-delay: 200ms; }
```

Remove the old `fu` keyframe.

### Step 2 — Tailwind config (`tailwind.config.ts`)

Remove `dash-in` animation entry (no longer needed since we use plain CSS classes now).

### Step 3 — Remove `animDelay` from `dashboard-utils.tsx`

Delete the `animDelay` helper function. It's no longer needed.

### Step 4 — Create `useCountUp` hook (`src/hooks/useCountUp.ts`)

```ts
function useCountUp(target: number, duration = 800) {
  // ease-out cubic count-up from 0 to target
}
```

### Step 5 — Update `KpiBox` in `dashboard-utils.tsx`

Add optional `animate` prop. When true, use `useCountUp` for the numeric value display. The `KpiBox` will accept both `value: string` (formatted) and `rawValue?: number` for count-up.

### Step 6 — Replace animations in all 10 dashboard components

| Component | Old | New |
|-----------|-----|-----|
| `KpiStripComercial` | `animate-dash-in` + `animDelay(40)` | `animate-slide-up delay-1` |
| `AlertasBanner` | `animate-dash-in` + `animDelay(90)` | `animate-slide-up delay-2` |
| `CommercialView` main grid | `animate-dash-in` + `animDelay(140)` | `animate-slide-up delay-3` |
| `BottomStripComercial` | `animate-dash-in` + `animDelay(190)` | `animate-slide-up delay-4` |
| `KpiStripOperacional` | `animate-dash-in` + `animDelay(40)` | `animate-slide-up delay-1` |
| `ProjectionBand` | `animate-dash-in` + `animDelay(90)` | `animate-slide-up delay-2` |
| `OperationalView` main grid | `animate-dash-in` + `animDelay(140)` | `animate-slide-up delay-3` |
| `UrgencyClients` | `animate-dash-in` + `animDelay(190)` | `animate-slide-up delay-4` |
| `RankingTable` | `animate-dash-in` + `animDelay(240)` | `animate-slide-up delay-5` |
| `BottomStripOperacional` | `animate-dash-in` + `animDelay(290)` | `animate-slide-up delay-5` |

Remove all `style={animDelay(...)}` props — replaced by `delay-N` classes.

### Step 7 — Apply count-up to KPI values

In `KpiStripComercial` and `KpiStripOperacional`, pass `rawValue` to `KpiBox` for numeric KPIs so count-up animates on mount. Currency values use `useCountUp` on the raw number then format the animated value.

### Step 8 — Pipeline & Clientes KPI strips

Add `animate-slide-up delay-1` to the KPI strip wrapper in `Pipeline.tsx` and `ClientesList.tsx`.

### Files modified
1. `src/index.css` — new keyframe + delay utilities, remove old `fu`
2. `tailwind.config.ts` — remove `dash-in` animation
3. `src/hooks/useCountUp.ts` — new hook
4. `src/components/dashboard/dashboard-utils.tsx` — remove `animDelay`, update `KpiBox` with count-up
5. `src/components/dashboard/comercial/KpiStripComercial.tsx`
6. `src/components/dashboard/comercial/AlertasBanner.tsx`
7. `src/components/dashboard/comercial/CommercialView.tsx`
8. `src/components/dashboard/comercial/BottomStripComercial.tsx`
9. `src/components/dashboard/operacional/KpiStripOperacional.tsx`
10. `src/components/dashboard/operacional/ProjectionBand.tsx`
11. `src/components/dashboard/operacional/OperationalView.tsx`
12. `src/components/dashboard/operacional/UrgencyClients.tsx`
13. `src/components/dashboard/operacional/RankingTable.tsx`
14. `src/components/dashboard/operacional/BottomStripOperacional.tsx`
15. `src/pages/Pipeline.tsx`
16. `src/pages/ClientesList.tsx`

