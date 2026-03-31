

## FIX 5 — Funil Row Layout (Prevent Overflow)

### Summary
Replace the current funnel row styling with a cleaner flex-based layout: remove `rounded-xl mx-2 my-0.5` wrapper margins, use consistent `px-5 py-3` padding, widen the color bar to `w-1 h-6 rounded-full`, increase count font to `text-[15px]`, widen value column to `w-[72px]`, and use `h-1.5 rounded-full` progress bars. Remove emoji suffixes (⚠ ✓).

### Changes — `src/components/dashboard/comercial/FunilComercial.tsx`

**Lines 31-63** — Replace funnel row rendering:

1. Remove `rounded-xl mx-2 my-0.5` from row container — use flat `px-5 py-3` rows
2. Color bar: `w-[5px] h-[26px] rounded-[3px] mr-3` → `w-1 h-6 rounded-full mr-4`
3. Stage label: keep `flex-1 min-w-0 truncate`, increase to `text-sm`, add `pr-4`; remove suffix emojis
4. Count: `text-sm w-8` → `text-[15px] w-9`
5. Value: `w-[60px]` → `w-[72px]`
6. Progress bar: `h-[5px] rounded-[3px]` → `h-1.5 rounded-full`
7. Arrow column: `w-3.5 ml-2` → `w-[22px] ml-2`
8. Hover: remove rounded card effect, use flat row highlight `bg-[rgba(10,21,100,0.03)]`; amber rows use `bg-[rgba(251,191,36,0.06)]` default, `bg-[rgba(251,191,36,0.12)]` on hover
9. Amber text: `text-dash-amber` → `text-[#b45309]`; Green text: `text-dash-green` → `text-[#0f7b4e]`

### Files modified
1. `src/components/dashboard/comercial/FunilComercial.tsx` — lines 31-63

