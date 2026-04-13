

## Plano — Melhorar Exportações Excel (3 locais)

### Resumo
Atualizar as funções de exportação Excel existentes em ClientesList e Intimações com os formatos melhorados, e adicionar exportação Excel na aba Resumo Financeiro do ClienteDetail.

---

### 1. `src/pages/ClientesList.tsx` — Atualizar exportações existentes

As funções `exportClientesSimples` e `exportClientesPorTese` já existem (linhas 124-174). Substituir ambas com as versões melhoradas do prompt:
- **Visão geral**: adicionar colunas Regime, Status (Compensando/Contrato), Saúde, e formatação `% Utilizado` como string
- **Por tese**: buscar `processos_teses` com join em `clientes` via supabase query (uma row por processo), colunas: Empresa, CNPJ, Segmento, Tese, Status Contrato, Status Processo, Crédito, Honorários %, Valor Honorários, Observação
- Renomear arquivos para `FocusFinTax_Clientes_` e `FocusFinTax_Teses_`

### 2. `src/components/clientes/ResumoFinanceiroTab.tsx` — Adicionar botão Excel

- Adicionar botão "Exportar Excel" ao lado do botão "Exportar PDF" existente (linha 82-90)
- Função `exportCompensacoesExcel`: gera XLSX com colunas Competência, Tese, Tributo, Valor Compensado, Honorários, Economia Líquida, Status Pagamento + linha TOTAL
- Import `* as XLSX from "xlsx"` e `Download` icon
- Precisa receber `cliente` prop para o nome do arquivo

### 3. `src/pages/Intimacoes.tsx` — Melhorar exportação existente

- Substituir a função `exportExcel` (linhas 95-112) com a versão melhorada que inclui `ws["!cols"]` para larguras de coluna
- Renomear arquivo para `FocusFinTax_Intimacoes_`

---

### Arquivos modificados
| Arquivo | Ação |
|---------|------|
| `src/pages/ClientesList.tsx` | Editar (substituir funções export) |
| `src/components/clientes/ResumoFinanceiroTab.tsx` | Editar (adicionar botão + função export Excel) |
| `src/pages/Intimacoes.tsx` | Editar (melhorar exportExcel com col widths) |

