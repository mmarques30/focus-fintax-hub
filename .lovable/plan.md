

## Cadastrar 5 benchmarks reais para supermercado / ate_2m

Nao ha registros existentes para essa combinacao. Preciso inserir 5 linhas na tabela `benchmarks_teses` usando o insert tool (dados, nao schema).

### Registros a inserir

| tese_nome | segmento | faturamento_faixa | % min | % max |
|---|---|---|---|---|
| PIS/COFINS sobre insumos e despesas essenciais | supermercado | ate_2m | 1.33 | 3.00 |
| Subvenção de ICMS para IRPJ e CSLL | supermercado | ate_2m | 0.50 | 1.50 |
| Exclusão do PIS/COFINS próprio da base | supermercado | ate_2m | 0.30 | 0.43 |
| Exclusão do ICMS-ST da base de PIS/COFINS | supermercado | ate_2m | 0.23 | 0.38 |
| Exclusão do ICMS normal da base de PIS/COFINS | supermercado | ate_2m | 1.83 | 3.00 |

### Execucao

Uma unica operacao INSERT com 5 rows na tabela `benchmarks_teses`. Todos com `ativo = true`. Nenhuma mudanca de codigo necessaria.

