

## FIX 3 — Paginação nas Listagens Críticas

### Situação Atual
- **PipelineList.tsx**: Já tem paginação (PAGE_SIZE=25, estado `page`, controles Anterior/Próxima). Nenhuma mudança necessária.
- **ClientesList.tsx**: Sem paginação — renderiza todos os `filtered` direto na tabela.

### Mudanças

**1. `src/pages/ClientesList.tsx`**

- Adicionar estado `currentPage` (default 1) e constante `ITEMS_PER_PAGE = 25`
- Calcular `totalPages` e `paginated` a partir de `filtered`
- Resetar `currentPage` para 1 quando filtros mudarem (`search`, `filterSegmento`, `filterStatus`)
- Renderizar apenas `paginated` no `<TableBody>`
- Adicionar controles de paginação abaixo da tabela (Anterior / números / Próxima) com estilo consistente com o design system existente (navy bg para página ativa)
- Importar `cn` de `@/lib/utils`

### Arquivos modificados
1. `src/pages/ClientesList.tsx` — adicionar paginação client-side

