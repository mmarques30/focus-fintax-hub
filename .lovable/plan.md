

## BUG FIX 6 — Confirmação em ações destrutivas (excluir compensações e processos)

### Situação Atual
Nem `CompensacoesTab` nem `ProcessosTesesTab` possuem botões de exclusão. Precisamos adicionar botões de delete com confirmação via AlertDialog.

### Mudanças

**1. `src/components/clientes/CompensacoesTab.tsx`**
- Importar `Trash2` do lucide e componentes `AlertDialog*` do shadcn
- Adicionar coluna "Ações" no header da tabela (nova `<TableHead>`)
- Criar `handleDeleteCompensacao(id)` que faz `.delete()` no supabase, loga no histórico, e chama `fetchData()`
- Em cada row, adicionar `<TableCell>` com `AlertDialog` wrapping um botão `Trash2`:
  - Descrição mostra valor e mês da compensação
  - Botão "Excluir" com `bg-[#c8001e]`
- Atualizar `colSpan` nas linhas loading/empty/footer

**2. `src/components/clientes/ProcessosTesesTab.tsx`**
- Importar `Trash2` e componentes `AlertDialog*`
- Criar `handleDeleteProcesso(id)` que faz `.delete()` no supabase, loga no histórico, e chama `fetchProcessos()`
- Na coluna de ações existente (onde está o `Pencil`), adicionar `AlertDialog` com botão `Trash2` ao lado do editar
- Descrição mostra nome da tese

### Arquivos modificados
1. `src/components/clientes/CompensacoesTab.tsx`
2. `src/components/clientes/ProcessosTesesTab.tsx`

