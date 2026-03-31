

## PART 6 — Fix Foreign Key Constraints

### Step 1 — Database Migration

Run SQL to add missing FK constraints with cascade behavior:

```sql
ALTER TABLE public.processos_teses
ADD CONSTRAINT fk_processos_cliente
FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE;

ALTER TABLE public.compensacoes_mensais
ADD CONSTRAINT fk_comp_cliente
FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE;

ALTER TABLE public.compensacoes_mensais
ADD CONSTRAINT fk_comp_processo
FOREIGN KEY (processo_tese_id) REFERENCES public.processos_teses(id) ON DELETE SET NULL;
```

### Step 2 — Remove manual cascade delete in `src/pages/ClienteDetail.tsx`

In the delete confirmation handler (around line 206-212), remove the two manual delete calls:
```ts
// REMOVE these two lines:
await supabase.from("compensacoes_mensais").delete().eq("cliente_id", id!);
await supabase.from("processos_teses").delete().eq("cliente_id", id!);
```

Keep only the `clientes` delete — the DB cascade handles the rest automatically.

### Files modified
1. Database migration — 3 FK constraints
2. `src/pages/ClienteDetail.tsx` — remove 2 manual delete lines

