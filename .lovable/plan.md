

## Part 8 — Table Refinements

### Summary
Update the base shadcn table components to remove borders, add subtle hover, and support zebra striping. Then update the custom RankingTable (which uses raw `<table>` elements) to match.

### Step 1 — Update `src/components/ui/table.tsx` (base components)

**TableHeader** (line 15): Remove `[&_tr]:border-b`, keep it clean — the TableHead cells will carry the bottom border.

**TableHead** (lines 44-55): Replace current classes with:
```
text-[9px] font-bold uppercase tracking-[1.4px] text-[rgba(15,17,23,0.35)] border-b border-[rgba(10,21,100,0.08)] bg-transparent py-3 px-4 text-left align-middle [&:has([role=checkbox])]:pr-0
```

**TableRow** (lines 33-41): Replace `border-b` with `border-0`, update hover:
```
border-0 transition-colors duration-100 data-[state=selected]:bg-muted hover:bg-[rgba(10,21,100,0.025)]
```

### Step 2 — Update `src/components/dashboard/operacional/RankingTable.tsx`

- **Header row `<th>` elements** (line 23): Remove `bg-[rgba(15,17,23,0.05)]`, use `bg-transparent border-b border-[rgba(10,21,100,0.08)]`
- **Body rows `<tr>` elements** (line 32): Remove `hover:bg-[rgba(15,17,23,0.05)]`, add zebra striping via index: `i % 2 === 0 ? "bg-[rgba(10,21,100,0.012)]" : ""`; hover → `hover:bg-[rgba(10,21,100,0.025)]`
- **Body cells `<td>` elements** (lines 33-45): Remove `border-b border-[rgba(0,0,0,0.04)]` from all `<td>` classes

### Step 3 — Update `src/components/pipeline/PipelineList.tsx`

- **Table wrapper** (line 106): Remove `border` from `<div className="border rounded-lg overflow-hidden">`
- **SortHeader** (line 69): Update TableHead class to include the new header styling while keeping `cursor-pointer select-none hover:text-foreground`
- **Body rows** (line 132): Add zebra striping using the index from `paged.map`; change to use index parameter and conditional class

### Step 4 — Other shadcn table consumers

Pages using `<Table>` with default styling (Benchmarks.tsx, UserManagement.tsx, ClienteDetail.tsx) will automatically inherit the base changes from Step 1. Their custom `TableHead` classes (e.g. `font-semibold uppercase tracking-wider text-xs`) will merge with the new defaults via `cn()`.

### Files modified
1. `src/components/ui/table.tsx` — base TableHead, TableRow, TableHeader defaults
2. `src/components/dashboard/operacional/RankingTable.tsx` — transparent header, zebra rows, no cell borders
3. `src/components/pipeline/PipelineList.tsx` — remove wrapper border, zebra rows

