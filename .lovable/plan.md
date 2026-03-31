

## BUG FIX 4 — Histórico do cliente com nome do usuário

### Problema
A query em `fetchHistorico` (linha 40-46) usa `.select("*")` sem join com `profiles`. O timeline não mostra quem realizou a ação.

### Mudanças em `src/pages/ClienteDetail.tsx`

**1. Atualizar `fetchHistorico`** (linhas 40-46):
- Trocar `.select("*")` por `.select("*, profiles!cliente_historico_usuario_id_fkey(full_name)")` 
- Como `cliente_historico.usuario_id` não tem FK formal para `profiles`, usar uma abordagem alternativa: após buscar o histórico, fazer um segundo select em `profiles` com os `usuario_id`s distintos e fazer o join no client-side

**Abordagem concreta** (sem FK):
```typescript
const { data } = await supabase
  .from("cliente_historico")
  .select("*")
  .eq("cliente_id", id)
  .order("created_at", { ascending: false })
  .limit(20);

// Buscar nomes dos usuários
const userIds = [...new Set((data || []).map(h => h.usuario_id).filter(Boolean))];
let userMap: Record<string, string> = {};
if (userIds.length > 0) {
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name")
    .in("user_id", userIds);
  profiles?.forEach(p => { userMap[p.user_id] = p.full_name; });
}

// Enriquecer historico com nome
const enriched = (data || []).map(h => ({
  ...h,
  usuario_nome: h.usuario_id ? (userMap[h.usuario_id] || "Usuário") : "Sistema"
}));
setHistorico(enriched);
```

**2. Atualizar renderização** (linha 311-313) — adicionar nome do usuário após a data:
```tsx
<p className="text-[10px] text-muted-foreground">
  {h.usuario_nome} · {formatDistanceToNow(...)}
</p>
```

### Arquivo modificado
1. `src/pages/ClienteDetail.tsx`

