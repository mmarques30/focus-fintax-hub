

## Tasks 2, 3 e 4 — FK hint, histórico de leads com nome, banner de saúde dos dados

### Task 2 — ResumoFinanceiroTab com hint explícito de FK

**Arquivo:** `src/components/clientes/ResumoFinanceiroTab.tsx` (linha 27)

Trocar:
```typescript
.select("*, processos_teses(id, tese, nome_exibicao, percentual_honorario, valor_credito)")
```
Por:
```typescript
.select("*, processos_teses!compensacoes_mensais_processo_tese_id_fkey(id, tese, nome_exibicao, percentual_honorario, valor_credito)")
```

---

### Task 3 — lead_historico com nome do usuário

**Arquivo:** `src/components/pipeline/LeadSidePanel.tsx`

1. Atualizar interface `HistoricoEntry` para incluir `criado_por: string | null` e `usuario_nome: string`
2. Em `fetchHistorico` (linha 53-60):
   - Selecionar `criado_por` explicitamente
   - Após buscar histórico, extrair `criado_por` únicos e buscar `profiles` com `.select("user_id, full_name").in("user_id", userIds)`
   - Enriquecer cada entrada com `usuario_nome` (fallback "Sistema")
3. Na renderização do histórico (linha 276), adicionar nome do usuário antes da data:
   ```tsx
   <p className="text-[10px] text-muted-foreground mt-1">
     {h.usuario_nome} · {new Date(h.criado_em).toLocaleString("pt-BR")}
   </p>
   ```

---

### Task 4 — Banner de saúde dos dados (admin only)

**Arquivo:** `src/pages/Dashboard.tsx`

1. Adicionar state `dataHealth` com `{ compensacoes: number; processos: number; hasData: boolean } | null`
2. Adicionar `useEffect` que roda apenas quando `role === "admin"`:
   - Query `count` em `compensacoes_mensais` e `processos_teses`
   - Seta `hasData` se compensações > 0
3. Renderizar banner condicional entre `DashboardHeader` e o conteúdo principal:
   - Só aparece quando `role === "admin" && dataHealth && !dataHealth.hasData`
   - Dot vermelho + texto "Nenhuma compensação encontrada" + link para `/clientes`

### Arquivos modificados
1. `src/components/clientes/ResumoFinanceiroTab.tsx`
2. `src/components/pipeline/LeadSidePanel.tsx`
3. `src/pages/Dashboard.tsx`

