

## FIX 6 — Clean Up Test Leads

### Findings

The database has exactly **3 leads total** — all test data:
1. `Your Solutions` (PET) — status `novo`, from `formulario_lp`
2. `Cimed` — status `cliente_ativo`, from `formulario_lp`
3. `Cimed` — status `novo`, from `formulario_lp`

Related records: 4 relatórios, 7 diagnósticos, 4 históricos. No clients linked to these leads.

### Recommendation

Since these are the **only** leads in the database and all are test data, I recommend the safer approach: move them to `nao_vai_fazer` instead of deleting. This way:
- They disappear from the active pipeline (dashboard filters exclude `nao_vai_fazer`)
- The data is preserved if you ever need to reference it
- No cascade issues with related tables

### Execution

Run a single UPDATE via the database insert tool:

```sql
UPDATE leads 
SET status_funil = 'nao_vai_fazer'
WHERE empresa IN ('Your Solutions', 'Cimed')
  AND origem = 'formulario_lp';
```

This affects all 3 leads. The dashboard KPIs will then show 0 leads in pipeline, 0 potencial, etc. — which is correct for a fresh start.

### Alternative

If you prefer a full delete (removes all trace), I would need to delete from `diagnosticos_leads`, `relatorios_leads`, and `lead_historico` first (child records), then delete from `leads`. Let me know which approach you prefer.

### Files modified
None — this is a data-only operation.

