

## Mapa Tributário — Relatório PDF por cliente

### Arquivo alterado
`src/pages/ClienteDetail.tsx` — adicionar botão + modal + print styles

### Plano

**1. Estado e dados**
- `mapaOpen` state para controlar modal
- Ao abrir modal, buscar `processos_teses` (select id, tese, nome_exibicao, valor_credito, percentual_honorario, valor_honorario, status_contrato) e `compensacoes_mensais` (select processo_tese_id, mes_referencia, valor_compensado, status_pagamento) para o cliente
- Calcular totais: identificado (sum valor_credito onde status_contrato=assinado), compensado, saldo

**2. Botão "Gerar Mapa Tributário"** na sidebar, abaixo do nome do cliente (ícone FileText, variant outline, destaque visual)

**3. Modal fullscreen** (Dialog max-w-[900px] h-[90vh] overflow-auto, print-ready)

**4. Conteúdo do relatório** (div `id="mapa-tributario"`):

- **Header**: Logo Focus FinTax (import existente `logo-focus-fintax.svg`) + título "Mapa Tributário — {empresa}" + CNPJ + data atual
- **Section 1 "Oportunidades Identificadas"**: Table com Tese, Valor Identificado, % Honorários, Valor Honorários. Total row no footer. Apenas processos com status_contrato=assinado.
- **Section 2 "Histórico de Compensações"**: Table com Mês, Tese, Valor Compensado, Status Pagamento. Agrupado por mês (mais recente primeiro). Join com processos_teses para nome da tese. Total compensado no footer.
- **Section 3 "Resumo Executivo"**: 3 métricas lado a lado (Total Identificado / Total Compensado / Saldo). Frase: "Você já recuperou R$ X de um potencial de R$ Y. Saldo disponível para compensação: R$ Z."
- **Footer**: "Focus FinTax · Grupo Focus · Documento gerado em [data]"

**5. Botão "Baixar PDF"** no header do modal → `window.print()`

**6. Print CSS**: Reutilizar o `@media print` já existente em `index.css` com target no `#mapa-tributario` (adicionar regra similar ao `#report-content` já implementado)

### Imports adicionais
- `FileText, Printer` de lucide-react
- `Dialog, DialogContent, DialogHeader, DialogTitle` de ui/dialog
- `Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow` de ui/table
- `formatCurrencyBR` de clientes-constants
- Logo SVG existente

