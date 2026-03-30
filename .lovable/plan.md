

## Importar dados Laratex — CSV temporário

### Arquivo alterado
`src/pages/ClienteDetail.tsx` — adicionar botão + modal de importação CSV

### Plano

**1. Botão "Importar dados Laratex"** na sidebar, abaixo do botão "Gerar Mapa Tributário" (variant ghost, ícone Upload, texto menor)

**2. Estado**
- `laratexOpen` — controla modal
- `csvData` — array de rows parseados do CSV
- `csvHeaders` — colunas detectadas
- `columnMap` — mapeamento do usuário: `{ tese: colIndex, valor_credito: colIndex, mes_referencia: colIndex, valor_compensado: colIndex }`
- `importing` — loading state

**3. Modal** (Dialog max-w-[700px])
- Título: "Importação temporária de dados — aguardando integração direta com Laratex"
- Área de upload (`<input type="file" accept=".csv">`) estilizada como dropzone
- Instrução: "Exporte os dados do cliente no Laratex em formato CSV e importe aqui."

**4. Fluxo após upload**
- Parse CSV client-side (split por `;` ou `,`, detectar separador automaticamente pela primeira linha)
- Mostrar preview table com primeiras 5 linhas + headers
- 4 selects para mapear colunas: Tese, Valor Crédito, Mês Referência, Valor Compensado
- Cada select lista os headers detectados + opção "— Ignorar —"

**5. "Confirmar importação"**
- Para cada row com tese mapeada e valor_credito: inserir em `processos_teses` (`cliente_id`, `tese`, `nome_exibicao`, `valor_credito`, `status_contrato: 'assinado'`)
- Para cada row com mes_referencia e valor_compensado: inserir em `compensacoes_mensais` (`cliente_id`, `processo_tese_id`, `mes_referencia`, `valor_compensado`)
- Lógica: primeiro inserir processos agrupados por tese (deduplica), depois inserir compensações vinculando ao processo_tese_id correto
- Toast de sucesso com contagem

**6. Nota no footer do modal**: "Esta importação será substituída pela integração automática com Laratex quando disponível." (texto muted, itálico)

### Imports adicionais
- `Upload` de lucide-react
- `Select, SelectContent, SelectItem, SelectTrigger, SelectValue` de ui/select
- `Input` de ui/input

### Sem alterações no banco — usa tabelas existentes (`processos_teses`, `compensacoes_mensais`)

