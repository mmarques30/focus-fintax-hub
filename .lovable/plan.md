

## Plano — Adicionar overflow-x-auto nas tabelas de UserManagement e Benchmarks

Envolver cada `<Table>` com `<div className="overflow-x-auto">` nos dois arquivos para permitir scroll horizontal em telas pequenas.

### Alterações

| Arquivo | Linha | Ação |
|---------|-------|------|
| `src/pages/UserManagement.tsx` | ~423 | Envolver `<Table>...</Table>` em `<div className="overflow-x-auto">` |
| `src/pages/Benchmarks.tsx` | ~223 | Envolver `<Table>...</Table>` em `<div className="overflow-x-auto">` |

