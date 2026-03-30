

## Replace ALL Dashboard Inline Styles with Tailwind CSS

### Summary
Convert every `style={{...}}` across all 18 dashboard component files to Tailwind utility classes. Add custom font families and dashboard-specific colors to `tailwind.config.ts`. Some dynamic styles (computed widths, dynamic colors from data) will remain as minimal inline styles where Tailwind can't handle runtime values.

### Step 1 — Update `tailwind.config.ts`

Add font families and dashboard-specific colors:
```ts
fontFamily: {
  sans: ['Barlow', 'sans-serif'],        // replaces Montserrat for dashboard
  display: ['"Barlow Condensed"', 'sans-serif'],
  'mono-dm': ['"DM Mono"', 'monospace'],
},
colors: {
  // existing colors stay...
  navy: '#0a1564',
  'dash-red': '#c8001e',
  'dash-green': '#0f7b4e',
  'dash-amber': '#b45309',
  ink: '#0f1117',
}
```

Add custom animation for fade-up (`fu` keyframe already in CSS):
```ts
animation: {
  'dash-in': 'fu 0.45s ease var(--anim-delay) both',
}
```

### Step 2 — Update `src/index.css`

Add Tailwind-compatible utility for the animation delay pattern using CSS custom properties, since `anim(delay)` is used everywhere with different delay values.

### Step 3 — Refactor `dashboard-utils.tsx`

- Remove `fontMono`, `fontCondensed`, `fontBarlow` style objects (replaced by `font-mono-dm tabular-nums`, `font-display`, `font-sans`)
- Remove `anim()` helper — replaced by a className helper: `cn("animate-dash-in", style with --anim-delay var)` or keep a tiny `animClass(delay)` that returns className + minimal style
- Convert `KpiBox` component from inline styles to Tailwind classes
- Keep `compactCurrency`, `fullCurrency`, `timeAgo`, constants, types unchanged

### Step 4 — Convert each component file

**Files to convert (17 component files):**

| File | Inline styles approx | Notes |
|------|---------------------|-------|
| `DashboardHeader.tsx` | ~15 | Sticky header, tab buttons |
| `KpiStripComercial.tsx` | ~5 | Grid wrapper |
| `AlertasBanner.tsx` | ~10 | Conditional banner |
| `FunilComercial.tsx` | ~40 | Most complex — funnel rows with dynamic colors per row, hover handlers |
| `LeadsRecentes.tsx` | ~25 | Lead cards with dynamic chip colors |
| `QualidadeCarteira.tsx` | ~10 | Score distribution |
| `MotorPerformance.tsx` | ~10 | Navy card |
| `BottomStripComercial.tsx` | ~10 | Bottom strip |
| `CommercialView.tsx` | ~3 | Layout grid |
| `KpiStripOperacional.tsx` | ~5 | Grid wrapper |
| `ProjectionBand.tsx` | ~15 | Navy band with dividers |
| `ChartEvolucao.tsx` | ~30 | Chart + legend + insight strip |
| `DistribuicaoSaldo.tsx` | ~20 | Bands with dynamic colors |
| `UrgencyClients.tsx` | ~15 | Dynamic grid columns |
| `RankingTable.tsx` | ~30 | Full table with hover |
| `BottomStripOperacional.tsx` | ~10 | 7-item strip |
| `OperationalView.tsx` | ~3 | Layout grid |

**Conversion pattern:**

Before:
```tsx
<div style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)", borderRadius: 10, overflow: "hidden" }}>
```

After:
```tsx
<div className="bg-white border border-[rgba(10,21,100,0.10)] rounded-[10px] overflow-hidden">
```

**Dynamic values that must stay as style:**
- `width: \`${(f.count / maxFunnelCount) * 100}%\`` — computed percentages for progress bars
- `background: f.color` — colors from data (funnel stage colors)
- `gridTemplateColumns: \`repeat(${Math.min(urgencyClients.length, 5)},1fr)\`` — dynamic grid
- `style={{ '--anim-delay': '140ms' }}` — animation delays

### Step 5 — Update `Dashboard.tsx`

Convert the 2 remaining inline style divs (outer wrapper + content area) to Tailwind classes.

### What stays as inline style
- Dynamic computed widths/percentages (progress bars)
- Dynamic colors from data arrays (funnel colors, segmento bar colors)  
- Recharts component props (they use their own style system)
- Animation delay values (CSS custom property)

### Files modified
1. `tailwind.config.ts`
2. `src/index.css` (animation utility)
3. `src/components/dashboard/dashboard-utils.tsx`
4. `src/components/dashboard/DashboardHeader.tsx`
5. `src/components/dashboard/comercial/KpiStripComercial.tsx`
6. `src/components/dashboard/comercial/AlertasBanner.tsx`
7. `src/components/dashboard/comercial/FunilComercial.tsx`
8. `src/components/dashboard/comercial/LeadsRecentes.tsx`
9. `src/components/dashboard/comercial/QualidadeCarteira.tsx`
10. `src/components/dashboard/comercial/MotorPerformance.tsx`
11. `src/components/dashboard/comercial/BottomStripComercial.tsx`
12. `src/components/dashboard/comercial/CommercialView.tsx`
13. `src/components/dashboard/operacional/KpiStripOperacional.tsx`
14. `src/components/dashboard/operacional/ProjectionBand.tsx`
15. `src/components/dashboard/operacional/ChartEvolucao.tsx`
16. `src/components/dashboard/operacional/DistribuicaoSaldo.tsx`
17. `src/components/dashboard/operacional/UrgencyClients.tsx`
18. `src/components/dashboard/operacional/RankingTable.tsx`
19. `src/components/dashboard/operacional/BottomStripOperacional.tsx`
20. `src/components/dashboard/operacional/OperationalView.tsx`
21. `src/pages/Dashboard.tsx`

### Preserved
- All visual output — pixel-identical
- All data logic, queries, realtime — untouched
- Recharts internal styling — unchanged
- CSS variables in `index.css` — kept for non-Tailwind consumers

