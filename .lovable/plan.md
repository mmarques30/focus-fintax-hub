

## Importação em Lote da Planilha de Compensações (XLSX)

### Contexto

Você enviou uma planilha XLSX com compensações de 27 clientes (DEZ, JAN, FEV), contendo: empresa, CNPJ, valores compensados por mês, honorários e saldo de créditos final. O sistema atual só suporta importação CSV por cliente individual (via Laratex). Não existe importação em lote.

### O que será feito

Criar uma funcionalidade de **importação em lote de XLSX** acessível pela página de Clientes (`/clientes`), que:

1. Lê o arquivo XLSX no browser (usando a lib `xlsx`/SheetJS já disponível ou instalada)
2. Faz match dos clientes por CNPJ (normalizado, sem pontuação)
3. Para cada cliente encontrado no banco:
   - Cria registros em `compensacoes_mensais` para cada mês com valor > 0
   - Usa o processo existente do cliente (ou cria um genérico se não existir)
   - Registra o `valor_nf_servico` (honorários proporcional ao mês)
4. Mostra um preview antes de confirmar: clientes encontrados vs não encontrados, total de registros a inserir
5. Após importação, loga no `cliente_historico` de cada cliente

### Mudanças

**1. Instalar dependência `xlsx`** (SheetJS) para parsing de XLSX no browser

**2. Novo componente `src/components/clientes/ImportCompensacoesModal.tsx`**

- Upload de .xlsx
- Parse da planilha: identifica colunas (EMPRESAS, CNPJ, meses DEZ/JAN/FEV, HONORARIO, SALDO)
- Normaliza CNPJs e faz `.select()` na tabela `clientes` para match
- Preview com tabela: empresa, CNPJ, status (encontrado/não encontrado), total a importar
- Botão "Confirmar importação" que:
  - Para cada cliente matched, busca `processos_teses` existente
  - Insere `compensacoes_mensais` por mês (DEZ→2024-12-01, JAN→2025-01-01, FEV→2025-02-01)
  - Distribui honorário proporcionalmente por mês
  - Loga `cliente_historico` tipo `compensacao_adicionada`
- Feedback: X compensações importadas para Y clientes

**3. `src/pages/ClientesList.tsx`**

- Adicionar botão "Importar Compensações (XLSX)" no header, ao lado dos filtros
- Abrir o modal de importação

### Arquivos modificados/criados
1. `package.json` — adicionar `xlsx`
2. `src/components/clientes/ImportCompensacoesModal.tsx` — novo componente
3. `src/pages/ClientesList.tsx` — botão para abrir modal

