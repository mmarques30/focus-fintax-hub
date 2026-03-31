

## Remove White Card from Dashboard Header

### Summary
Remove the white background card from the header area. The greeting, date, and time should float without any card behind them. The tab switcher should have a subtle, discrete card only around the tab text area.

### Changes — `src/components/dashboard/DashboardHeader.tsx`

1. **Outer wrapper** (line 16): Remove `bg-white border-b border-[rgba(10,21,100,0.10)]` — keep only `sticky top-0 z-[100]`
2. **Tab switcher** (line 28): Add a discrete inline card around the tab buttons: `bg-white/80 border border-[rgba(10,21,100,0.08)] rounded-lg px-1 py-1 mx-auto w-fit`
3. Active tab text stays navy/bold, inactive stays `text-ink-60` — no background change on tabs, just the text color difference

### Files modified
1. `src/components/dashboard/DashboardHeader.tsx`

