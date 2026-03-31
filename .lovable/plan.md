

## FIX 4 — Grid Layout Proportions

### Summary
Widen the right sidebar column from `320px` to `340px` and ensure the main grid uses the full available width.

### Changes — `src/components/dashboard/comercial/CommercialView.tsx` (line 58)

Replace:
```tsx
<div className="animate-slide-up delay-3 grid grid-cols-[1fr_320px] gap-3.5 mb-3.5">
```
With:
```tsx
<div className="animate-slide-up delay-3 grid gap-4 mb-4 w-full" style={{ gridTemplateColumns: '1fr 340px' }}>
```

Also update the inner right column gap on line 65:
```tsx
<div className="flex flex-col gap-3">
```
to:
```tsx
<div className="flex flex-col gap-4">
```

### Files modified
1. `src/components/dashboard/comercial/CommercialView.tsx`

