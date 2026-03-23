

## Ajustar tags do Alcir — todos lado a lado sem quebra de linha

### Problema
Os 4 tags (Contador CRC, Estrategista Tributário, Analista Financeiro, Especialista em Varejo) estao quebrando em 2 linhas por causa do `flex-wrap:wrap`, e ha muito espaco vazio abaixo.

### Correcao em `public/lp.html`

**1. CSS (linha 229)**: Alterar `.alcir-tags` para `flex-wrap:nowrap` para manter todos na mesma linha

**2. CSS (linha 230)**: Reduzir levemente o padding dos tags para `padding:6px 14px` e `font-size:12px` para caberem em uma unica linha

Apenas ajuste de CSS. Nenhuma mudanca estrutural.

