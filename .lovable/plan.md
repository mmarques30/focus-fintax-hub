

## Diagnóstico: Compensações aparecem vazias apesar da importação

### Causa Raiz

Existem **foreign keys duplicadas** na tabela `compensacoes_mensais`:
- `compensacoes_mensais_cliente_id_fkey` → `clientes(id) ON DELETE CASCADE`
- `fk_comp_cliente` → `clientes(id) ON DELETE CASCADE`
- `compensacoes_mensais_processo_tese_id_fkey` → `processos_teses(id) ON DELETE CASCADE`
- `fk_comp_processo` → `processos_teses(id) ON DELETE SET NULL`

Quando o Supabase (PostgREST) encontra duas FKs apontando para a mesma tabela, ele **não consegue resolver qual usar no join** e o `.select("*, processos_teses(nome_exibicao, tese)")` falha silenciosamente, retornando array vazio.

Os dados **existem** no banco (4 compensações e 5 processos para este cliente), mas a query do front-end não consegue carregá-los.

### Solução

**1. Migration SQL — remover FKs duplicadas**

Remover as FKs extras (`fk_comp_cliente` e `fk_comp_processo`) que foram criadas em duplicata, mantendo apenas as originais com nomes padrão.

```sql
ALTER TABLE compensacoes_mensais DROP CONSTRAINT fk_comp_cliente;
ALTER TABLE compensacoes_mensais DROP CONSTRAINT fk_comp_processo;
```

**2. `src/components/clientes/CompensacoesTab.tsx`** — adicionar hint explícito no select (segurança extra caso haja qualquer ambiguidade restante):

Trocar:
```typescript
.select("*, processos_teses(nome_exibicao, tese)")
```
Por:
```typescript
.select("*, processos_teses!compensacoes_mensais_processo_tese_id_fkey(nome_exibicao, tese)")
```

### Resultado esperado
Após a migration, a aba Compensações passará a exibir os dados já importados corretamente, incluindo o nome da tese associada.

### Arquivos modificados
1. Nova migration SQL (remover FKs duplicadas)
2. `src/components/clientes/CompensacoesTab.tsx` (hint no select)

