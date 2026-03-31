

## PART 5 — Header Notification Bell

### Summary
Make the bell icon functional: query leads stuck in `contrato_emitido` for >3 days, show red dot badge when alerts exist, and display a Popover dropdown listing them on click.

### Implementation

**File: `src/components/AppHeader.tsx`**

1. Add state + useEffect to query leads:
   ```sql
   SELECT id, empresa, status_funil_atualizado_em 
   FROM leads 
   WHERE status_funil = 'contrato_emitido' 
   AND status_funil_atualizado_em < now() - interval '3 days'
   ```
2. Wrap Bell button in `Popover` + `PopoverTrigger` + `PopoverContent`
3. Show red dot badge (absolute positioned `span` with `bg-dash-red w-2 h-2 rounded-full`) on the bell when notifications array is non-empty
4. PopoverContent lists each alert with empresa name, days stuck, and a link to `/pipeline` (or click to navigate)
5. Empty state: "Nenhuma notificação" text
6. Re-fetch on 60s interval for freshness
7. Only query if user role is admin, comercial, or pmo (skip for gestor_tributario/cliente who can't see leads)

### Files modified
1. `src/components/AppHeader.tsx` — add Popover, query, badge, dropdown list

