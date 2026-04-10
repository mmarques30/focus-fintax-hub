

## Plano de Correção — Itens Restantes da Varredura 360°

6 itens pendentes do relatório original. Implementação em ordem de impacto.

---

### Item #10 — Sidebar mobile com hamburger menu
**Arquivos:** `src/components/AppSidebar.tsx`, `src/components/AppLayout.tsx`

- Detectar mobile via `useIsMobile()` (hook já existe)
- Em mobile: sidebar renderiza dentro de um `Sheet` (drawer lateral) em vez do panel fixo
- Adicionar botão hamburger (Menu icon) no `AppLayout` visível apenas em mobile
- Manter sidebar desktop intacta (hover expand)
- O Sheet usa o mesmo conteúdo de navegação

### Item #11 — Eliminar queries duplicadas com React Query
**Arquivos:** `src/pages/Dashboard.tsx`, `src/pages/Pipeline.tsx`

- Extrair queries de `leads` para hooks dedicados com `useQuery` do React Query (já instalado via `@tanstack/react-query`)
- Chaves de cache: `["leads"]`, `["clientes"]`, `["compensacoes"]`
- Dashboard e Pipeline compartilham cache de leads automaticamente
- `staleTime: 30_000` para evitar refetch desnecessário

### Item #13 — Padronizar loading states
**Arquivos:** `src/pages/Pipeline.tsx`, `src/pages/ClienteDetail.tsx`, `src/pages/LeadQueue.tsx`

- Substituir `"Carregando..."` e spinners genéricos por componentes Skeleton já existentes no projeto (`SkeletonKpi`, `SkeletonTable`)
- Pipeline: skeleton strip de 4 KPIs + skeleton de tabela/kanban
- ClienteDetail: skeleton de sidebar + conteúdo
- LeadQueue: skeleton de tabela

### Item #20 — Deprecar `compensando_fintax` no UI
**Arquivos:** `src/pages/ClienteDetail.tsx`, `src/pages/ClientesList.tsx`

- Remover toggle Switch "Compensando Fintax" do ClienteDetail sidebar
- Remover coluna "Fintax" (CheckCircle2) da tabela em ClientesList
- Manter o campo no banco (não precisa de migration) — apenas invisível no UI
- Disclaimer já informa que filtros usam dados reais

### Item #22 — Eliminar constantes duplicadas em Diagnostico.tsx
**Arquivo:** `src/pages/Diagnostico.tsx`

- Remover `SEGMENTO_LABELS_DIAG` local (linhas 37-43), importar `SEGMENTO_LABELS` de `pipeline-constants`
- Mover `FATURAMENTO_MIDPOINTS` para `src/lib/pipeline-constants.ts` e importar em `Diagnostico.tsx` e na edge function

### Item #24 — Tooltip nativo → Tooltip shadcn
**Arquivo:** `src/pages/ClientesList.tsx`

- Substituir `title="Acesso restrito..."` no `TableRow` por componente `Tooltip` do shadcn wrapping a row
- Manter comportamento visual consistente com o resto do sistema

---

### Resumo
| Item | Severidade | Arquivos principais |
|------|-----------|---------------------|
| #10 Sidebar mobile | 🟡 | AppSidebar, AppLayout |
| #11 React Query cache | 🟡 | Dashboard, Pipeline |
| #13 Loading skeletons | 🟡 | Pipeline, ClienteDetail, LeadQueue |
| #20 Deprecar toggle | 🟢 | ClienteDetail, ClientesList |
| #22 Constantes duplicadas | 🟢 | Diagnostico, pipeline-constants |
| #24 Tooltip shadcn | 🟢 | ClientesList |

