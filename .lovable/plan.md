

## Plano — Empty States com CTA contextual

### 1. `src/components/EmptyState.tsx` — Adicionar prop `action`

Adicionar prop opcional `action: ReactNode` ao componente e renderizá-lo após o subtitle.

### 2. `src/pages/ClientesList.tsx` (linha 293) — Substituir texto plain

Substituir `Nenhum cliente encontrado.` por `EmptyState` com ícone `Building2`, título contextual baseado em `searchQuery`, e botão CTA "Cadastrar cliente →" quando não há busca ativa. Importar `EmptyState` e `Building2`.

### 3. `src/components/pipeline/PipelineKanban.tsx` (linha 138-143) — Adicionar empty state por coluna

Após o map de `stageLeads`, quando `stageLeads.length === 0`, renderizar `EmptyState` com ícone `Users`, título "Nenhum lead nesta etapa", subtitle "Arraste leads para cá ou adicione um novo". Importar `EmptyState` e `Users`.

### Arquivos modificados
| Arquivo | Ação |
|---------|------|
| `src/components/EmptyState.tsx` | Adicionar prop `action` |
| `src/pages/ClientesList.tsx` | Substituir empty state plain text |
| `src/components/pipeline/PipelineKanban.tsx` | Adicionar empty state em colunas vazias |

