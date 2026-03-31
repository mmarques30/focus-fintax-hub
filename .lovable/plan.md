

## FIX 2 — Análise da Coluna de Honorários

### Situação Atual

A coluna no banco de dados **já se chama `valor_nf_servico`** e **todo o código já usa `valor_nf_servico` consistentemente** (4 arquivos, 75 referências). Não existe nenhuma referência a `valor_nfse` no código.

A coluna `tributo` também **já existe** na tabela `compensacoes_mensais` (confirmado no schema e em `types.ts`).

### Recomendação: NÃO executar esta migração

Renomear `valor_nf_servico` → `valor_nfse` quebraria:
- `src/pages/Dashboard.tsx` (4 referências)
- `src/components/clientes/ResumoFinanceiroTab.tsx` (3 referências)
- `src/components/clientes/CompensacoesTab.tsx` (5 referências)
- `src/integrations/supabase/types.ts` (auto-gerado — quebraria até ser regenerado)

**Não há inconsistência a corrigir.** O nome `valor_nf_servico` é o nome canônico atual, usado em 100% do código e do banco. A coluna `tributo` já existe.

### Ação
Nenhuma mudança necessária. Este FIX já está resolvido pelo estado atual do sistema.

