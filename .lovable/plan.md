

## Part 12 — Empty States

### Summary
Create a reusable `EmptyState` component and use it in RankingTable, ChartEvolucao, and CompensacoesTab to replace plain text empty messages with a centered icon + title + subtitle layout.

### Step 1 — Create `src/components/EmptyState.tsx`

```tsx
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-12 h-12 rounded-full bg-[rgba(10,21,100,0.06)] flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-sm font-semibold text-[rgba(15,17,23,0.4)]">{title}</p>
      {subtitle && <p className="text-xs text-[rgba(15,17,23,0.25)] mt-1">{subtitle}</p>}
    </div>
  );
}
```

### Step 2 — RankingTable (line 50-52)

Replace the plain `<tr><td>` empty message with:
```tsx
<tr>
  <td colSpan={8}>
    <EmptyState icon={<BarChart3 size={20} />} title="Nenhuma compensação registrada" subtitle="Os dados aparecerão aqui conforme compensações forem lançadas." />
  </td>
</tr>
```
Import `EmptyState` and `BarChart3` from lucide-react.

### Step 3 — ChartEvolucao (line 27)

Replace the plain text empty div with:
```tsx
<EmptyState icon={<TrendingUp size={20} />} title="Nenhuma compensação registrada" subtitle="O gráfico de evolução aparecerá aqui." />
```

### Step 4 — CompensacoesTab (line 193)

Replace the plain `TableCell` empty message with:
```tsx
<TableRow>
  <TableCell colSpan={7}>
    <EmptyState icon={<FileText size={20} />} title="Nenhuma compensação registrada" subtitle="Clique em + Nova Compensação para começar." />
  </TableCell>
</TableRow>
```

### Files modified
1. `src/components/EmptyState.tsx` — new
2. `src/components/dashboard/operacional/RankingTable.tsx` — use EmptyState
3. `src/components/dashboard/operacional/ChartEvolucao.tsx` — use EmptyState
4. `src/components/clientes/CompensacoesTab.tsx` — use EmptyState

