

## Inserir dados reais de compensação + usuário do Paulo

### Análise do schema atual

A coluna no banco já se chama `valor_nf_servico` (confirmado no types.ts e em todo o código). **Não precisa renomear.** O SQL do prompt usa `valor_nfse` — vou corrigir para `valor_nf_servico` nos INSERTs. A coluna `tributo` já existe na tabela.

### Execução

**1. Insert processos_teses (27 clientes)**
Usar o SQL fornecido, sem alterações — a estrutura da tabela bate.

**2. Insert compensações (3 meses)**
Corrigir `valor_nfse` → `valor_nf_servico` nos 3 INSERTs (Dez/Jan/Fev). O cálculo de honorários `ROUND(v.val * pt.percentual_honorario, 2)` vai para `valor_nf_servico`.

**3. Sem migration de schema**
Nenhuma alteração de schema necessária — `tributo` e `valor_nf_servico` já existem. Tudo é INSERT de dados via ferramenta de insert.

**4. Sem alteração no Dashboard**
O código já usa `valor_nf_servico` corretamente. Após os inserts, os KPIs vão refletir os ~R$ 8,09M automaticamente.

**5. Usuário do Paulo**
Preciso do email do Paulo para criar via edge function `manage-users`. Vou perguntar.

### Pergunta pendente
Qual o email do Paulo Marcos para criar o usuário com role `pmo`?

