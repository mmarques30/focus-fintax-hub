

## Part 4 & 5 — Projection Band Glass Effect + Border-Radius Hierarchy

### Summary
Two changes: (1) Add gradient + glass effect to the ProjectionBand. (2) Standardize border-radius across the app with a clear hierarchy and update `--radius` to `0.75rem`.

### Step 1 — ProjectionBand glass effect (`src/components/dashboard/operacional/ProjectionBand.tsx`)

Replace the outer div (line 27):
- Remove `bg-navy rounded-[14px]`
- Add `relative overflow-hidden rounded-2xl` with inline style for gradient background and box-shadow
- Add a child `<div className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-white/10" />` as the first element inside the container

### Step 2 — Update `--radius` (`src/index.css`, line 116)

Change `--radius: 0.5rem` → `--radius: 0.75rem` (12px). This automatically updates all shadcn components (Button, Input, Dialog, Card, etc.) that use `var(--radius)`.

### Step 3 — Update `.card-base` and `.card-flush` radius (`src/index.css`, lines 37-54)

Change `border-radius: 14px` → `border-radius: 16px` (matching `rounded-2xl`) in both `.card-base` and `.card-flush` for major containers.

### Step 4 — Radius hierarchy audit across components

Update explicit radius values to match the hierarchy:

| Target | Old | New |
|--------|-----|-----|
| `ProjectionBand.tsx` outer | `rounded-[14px]` | `rounded-2xl` (16px) |
| `UrgencyClients.tsx` outer | `rounded-[14px]` | `rounded-2xl` |
| `FunilComercial.tsx` rows | `rounded-xl` | `rounded-xl` (keep — cards within sections) |
| `FunilComercial.tsx` origem chips | `rounded-lg` | `rounded-lg` (keep — small chips) |
| `Login.tsx` inputs | `rounded-xl` | `rounded-xl` (keep) |
| `PipelineKanban.tsx` columns | `rounded-lg` | `rounded-lg` (keep — input-level) |
| `PipelineList.tsx` table | `rounded-lg` | `rounded-lg` (keep) |
| `Dashboard.tsx` skeletons | `rounded-lg` | `rounded-lg` (keep) |

Most existing values already fit the hierarchy. The main changes are the CSS custom properties and the ProjectionBand/UrgencyClients containers.

### Files modified
1. `src/components/dashboard/operacional/ProjectionBand.tsx` — gradient + glass highlight
2. `src/index.css` — `--radius: 0.75rem`, `.card-base`/`.card-flush` radius to 16px
3. `src/components/dashboard/operacional/UrgencyClients.tsx` — `rounded-2xl`

