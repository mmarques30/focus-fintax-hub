

## Part 10 — Urgency Clients Strip: Cards Not a Grid

### Summary
Replace the single bordered container with a grid of cells with individual floating cards in a horizontal scrollable flex layout. Keep the header banner, change only the items area.

### Changes — `src/components/dashboard/operacional/UrgencyClients.tsx`

1. **Keep** the outer wrapper and header banner as-is (lines 14-20)
2. **Replace** the grid div (lines 21-29) with a horizontal flex layout:
   - `flex gap-3 overflow-x-auto pb-1 px-4 py-3` container
   - Each client becomes an individual card: `flex-shrink-0 w-48 rounded-xl p-3` with gradient background, subtle red border, and shadow via inline style
   - Hover: `hover:-translate-y-0.5` with `transition-all duration-200`
   - Text: `text-xs font-bold` for empresa (truncated), `font-display text-xl font-bold text-dash-red` for saldo, `text-[10px]` for honorário
3. **Remove** the `border-r` dividers between items (no longer needed — each card is independent)
4. Continue using `compactCurrency` for formatting values

### Files modified
1. `src/components/dashboard/operacional/UrgencyClients.tsx`

