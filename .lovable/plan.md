

## FIX 1 — Compensações Debug Banner

### Analysis

After inspecting the code, the queries are **already correct**:
- `CompensacoesTab.tsx` line 57: `.eq("cliente_id", clienteId)` — correct
- `ProcessosTesesTab.tsx` line 30: `.eq("cliente_id", clienteId)` — correct
- Both use `clienteId` prop which comes from `useParams().id` in `ClienteDetail.tsx`
- RLS policies already grant SELECT to admin, gestor_tributario, pmo, and comercial

The select query in `CompensacoesTab` already joins `processos_teses(nome_exibicao, tese)` — this is correct.

### What to do

Since the queries and RLS are already correct, the only actionable change is adding the **debug diagnostic banner** the user requested, to help troubleshoot empty data scenarios:

**File: `src/components/clientes/CompensacoesTab.tsx` (after line 157, inside the `<div className="space-y-4">`)**

Add a development-only diagnostic banner when both compensações and processos are empty:

```tsx
{import.meta.env.DEV && !loading && compensacoes.length === 0 && processos.length === 0 && (
  <div className="text-xs bg-yellow-50 border border-yellow-200 rounded p-2 mb-3">
    Debug: cliente_id usado = {clienteId} — sem compensações ou processos encontrados
  </div>
)}
```

Note: Uses `import.meta.env.DEV` instead of `process.env.NODE_ENV` (Vite convention).

### Files modified
1. `src/components/clientes/CompensacoesTab.tsx` — add dev-only debug banner

