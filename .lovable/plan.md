

## BUG FIX 5 — Loading state nas Notificações

### Mudanças

**1. `src/hooks/useNotifications.ts`**
- Adicionar estado `loading` inicializado como `true`
- Setar `loading = false` após `fetchAlerts` completar (no finally)
- Retornar objeto `{ notifications, loading }` em vez de array direto

**2. `src/components/AppHeader.tsx`**
- Destructure `{ notifications, loading }` do hook
- Antes da lista/empty, renderizar skeleton animado quando `loading === true`:
  - 2 placeholders com `animate-pulse`, dot + barras cinzas
- Manter badge no ícone apenas quando `!loading && notifications.length > 0`

### Arquivos modificados
1. `src/hooks/useNotifications.ts`
2. `src/components/AppHeader.tsx`

