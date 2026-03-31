

## IMPROVEMENT 2 — Notificações Funcionais no Header

### Situação Atual
`AppHeader.tsx` já tem lógica de notificações inline (leads parados em `contrato_emitido` > 3 dias). Funciona, mas é monolítica e suporta apenas 1 tipo de alerta.

### Problema com a proposta do usuário
A tabela `clientes` **não tem** colunas `total_credito_identificado` nem `total_compensado` — esses valores são calculados via joins com `processos_teses` e `compensacoes_mensais`. O alerta de "saldo zerado" precisa de uma abordagem diferente.

### Mudanças

**1. Criar `src/hooks/useNotifications.ts`**

Hook extraído com 2 tipos de alerta:

| Tipo | Query | Condição |
|------|-------|----------|
| `warning` — Lead parado | `leads` where `status_funil = 'contrato_emitido'` e `status_funil_atualizado_em < 3 dias atrás` | Já funciona |
| `info` — Saldo zerado | Para cada cliente: soma `valor_credito` de `processos_teses` e soma `valor_compensado` de `compensacoes_mensais`. Se compensado >= crédito e crédito > 0 → alerta | Requer 2 queries adicionais |

Interface:
```typescript
interface Notification {
  id: string;
  type: 'warning' | 'info';
  title: string;
  subtitle: string;
  href: string;
}
```

- Refresh a cada 5 minutos (não 1 min como atual)
- Gated por `canSeeNotifications` (admin, comercial, pmo)

**2. Atualizar `src/components/AppHeader.tsx`**

- Remover lógica inline de fetch
- Usar `useNotifications()` hook
- Renderizar notificações com ícone de tipo (warning = amber dot, info = blue dot)
- `navigate(n.href)` ao clicar (em vez de sempre `/pipeline`)

### Arquivos modificados
1. `src/hooks/useNotifications.ts` — novo hook
2. `src/components/AppHeader.tsx` — consumir hook, remover lógica inline

