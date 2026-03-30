

## Relatório Consolidado da Carteira

### Arquivo alterado
`src/pages/ClientesList.tsx` — adicionar botão + modal de relatório

### Plano

**1. Botão "Relatório da Carteira"** ao lado do "Cadastrar cliente" no header (ícone FileText, variant outline)

**2. Estado `reportOpen`** para controlar modal fullscreen

**3. Modal fullscreen** (Dialog com `max-w-[95vw] h-[90vh] overflow-auto`) com classes `print:` para ocupar tela toda no print

**4. Conteúdo do relatório** (usa dados já carregados em `allStats`, `processos`, `compensacoes`):

- **Título**: "Carteira Focus FinTax — Visão Consolidada" + data atual formatada
- **Summary row**: 4 cards — Total clientes / Total identificado / Total compensado / Saldo total
- **Tabela de clientes**: ordenada por totalCredito desc. Colunas: Empresa, CNPJ, Teses ativas, Total Identificado, Total Compensado, Saldo, % Recuperado (progress bar + percentual). Grand total row no `TableFooter`.
- **Breakdown por tese**: segunda tabela agrupando `processos` (status_contrato=assinado) por `tese`. Colunas: Tese (nome_exibicao), Clientes (count distinct cliente_id), Total Identificado, Total Compensado, Saldo. Precisa buscar `tese, nome_exibicao` no select de processos_teses (já busca parcial, adicionar esses campos).

**5. Botão "Imprimir / Exportar PDF"** no header do modal → `window.print()`

**6. Print CSS** (via `@media print`): ocultar sidebar, header, botões do modal; mostrar só o conteúdo do relatório.

### Query adjustment
Linha 29: adicionar `tese, nome_exibicao` ao select de `processos_teses` para poder agrupar por tese no breakdown.

Linha 30: adicionar `processo_tese_id` ao select de `compensacoes_mensais` para vincular compensações a teses.

### Sem novos arquivos — tudo inline no ClientesList.tsx

