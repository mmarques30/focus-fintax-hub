

## FIX 1 — KPI Cards Full Width + Larger Typography

### Summary
Update both KPI strip components to use larger card sizing: `gap-4`, `p-5`, `min-h-[110px]`, `text-[40px]` numbers, and `w-full` on the grid.

### Step 1 — `src/components/dashboard/comercial/KpiStripComercial.tsx`

**Line 29**: Change grid classes:
```
gap-3 mb-4  →  gap-4 mb-5 w-full
```

**Line 31**: Change card classes:
```
card-base p-4 relative  →  card-base p-5 relative flex flex-col justify-between min-h-[110px]
```

**Line 37**: Label size:
```
text-[9px] ... tracking-[1.4px]  →  text-[10px] ... tracking-[1.6px]
```

**Line 38**: Number size:
```
text-[28px]  →  text-[40px]
```

**Line 39**: Sub text:
```
text-[11px] ... mt-1  →  text-xs ... mt-1.5
```

### Step 2 — `src/components/dashboard/operacional/KpiStripOperacional.tsx`

Apply identical changes to lines 32, 34, 40, 41, 42.

### Files modified
1. `src/components/dashboard/comercial/KpiStripComercial.tsx`
2. `src/components/dashboard/operacional/KpiStripOperacional.tsx`

