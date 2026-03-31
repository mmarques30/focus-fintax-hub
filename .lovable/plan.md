

## Dashboard — Fill & Adapt to Screen Size

### Problem
The dashboard content wrapper has `max-w-[1400px]` (line 242 of Dashboard.tsx), which constrains the layout on wide screens. On smaller screens, the fixed `gridTemplateColumns: '1fr 340px'` can cause overflow.

### Changes

**1. `src/pages/Dashboard.tsx` (line 242)**

Remove `max-w-[1400px] mx-auto` — let the content stretch to fill the available width:
```tsx
// Before
<div className="px-7 pt-[18px] pb-9 max-w-[1400px] mx-auto">

// After
<div className="px-7 pt-[18px] pb-9 w-full">
```

**2. `src/components/dashboard/comercial/CommercialView.tsx` (line 58)**

Make the grid responsive — stack on small screens, side-by-side on large:
```tsx
// Before
<div className="... grid gap-4 mb-4 w-full" style={{ gridTemplateColumns: '1fr 340px' }}>

// After
<div className="... grid gap-4 mb-4 w-full grid-cols-1 lg:grid-cols-[1fr_340px]">
```

**3. `src/components/dashboard/operacional/OperationalView.tsx` (line 106)**

Same responsive treatment:
```tsx
// Before
<div className="... grid grid-cols-[1.6fr_1fr] gap-3.5 mb-3.5">

// After
<div className="... grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4 mb-4">
```

**4. `src/components/dashboard/comercial/KpiStripComercial.tsx`**

Make KPI grid responsive — 2 cols on mobile, 5 on desktop:
```tsx
grid-cols-2 sm:grid-cols-3 lg:grid-cols-5
```

**5. `src/components/dashboard/operacional/KpiStripOperacional.tsx`**

Same responsive KPI grid treatment.

### Files modified
1. `src/pages/Dashboard.tsx`
2. `src/components/dashboard/comercial/CommercialView.tsx`
3. `src/components/dashboard/operacional/OperationalView.tsx`
4. `src/components/dashboard/comercial/KpiStripComercial.tsx`
5. `src/components/dashboard/operacional/KpiStripOperacional.tsx`

