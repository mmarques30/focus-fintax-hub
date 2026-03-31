

## Funil Comercial — Refactor Hover to React State

### Summary
Replace direct DOM manipulation (`e.currentTarget.style.background`) with `useState` for hover tracking. Add `cn()` utility for conditional classes. Remove `style={{ background }}` from rows.

### Changes — `src/components/dashboard/comercial/FunilComercial.tsx`

1. **Add imports**: `useState` from React, `cn` from `@/lib/utils`
2. **Add state**: `const [hoveredRow, setHoveredRow] = useState<string | null>(null);`
3. **Refactor each funnel row** (lines 33-54):
   - Remove `style={{ background: rowBg }}`
   - Remove `onMouseEnter`/`onMouseLeave` with DOM manipulation
   - Replace with `onMouseEnter={() => setHoveredRow(f.stage)}` / `onMouseLeave={() => setHoveredRow(null)}`
   - Use `cn()` for conditional background classes:
     - `contrato_emitido` with count > 0: `bg-[rgba(251,191,36,0.08)]`, hover → `bg-[rgba(251,191,36,0.14)]`
     - Normal rows: `bg-transparent`, hover → `bg-[rgba(10,21,100,0.04)]`
   - Add `rounded-xl mx-2 my-0.5` for breathing room inside the card
   - Remove `border-b border-[rgba(0,0,0,0.04)]` from rows (rounded rows don't need bottom borders)

### Files modified
1. `src/components/dashboard/comercial/FunilComercial.tsx`

