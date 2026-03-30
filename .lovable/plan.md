

## Importar clientes da planilha + alinhar fluxo

### Dados na planilha
A planilha tem ~85 clientes reais (linhas 9-93, Page 1) com dados por tese: REPORTO, SUBVENÇÃO, INSUMOS, ICMS-ST da BC PIS/COFINS, PIS/COFINS BC. Cada tese tem: valor_credito, status_contrato, percentual_honorario, valor_honorario, status_processo.

### Plano

**1. Script Python para importar dados via INSERT no banco**

Usar `openpyxl` para ler o XLSX e `psql` para insertar. Para cada linha válida (com EMPRESA + CNPJ):

- **Inserir em `clientes`**: empresa, cnpj, compensando_fintax (SIM→true), compensacao_outro_escritorio, segmento="supermercado", regime_tributario="Lucro Real", status="ativo"
- **Inserir em `processos_teses`** (até 5 por cliente, só se tiver valor > 0):
  - REPORTO → tese="reporto"
  - SUBVENÇÃO → tese="subvencao"  
  - INSUMOS → tese="insumos"
  - ICMS-ST → tese="icms_st_bc_pis_cofins"
  - PIS/COFINS BC → tese="pis_cofins_bc"

**Mapeamento de status_contrato:**
- "ASSINADO" → "assinado"
- "AGUARDANDO ASS" / variantes → "aguardando_assinatura"
- "não vai fazer" / "nao vai fazer" → "nao_vai_fazer"

**Mapeamento de status_processo:**
- "COMPENSANDO" / "COMPESANDO" → "compensando"
- "PEDIDO FEITO RECEITA" → "pedido_feito_receita"
- "NÃO PROTOCOLADO" / variantes → "nao_protocolado"
- "A INICIAR" → "a_iniciar"
- "COMPENSADO" → "compensado"
- "A COMPENSAR" → "a_compensar"
- "PROTOCOLADO" → "protocolado"
- "DESISTIU" / "DESISITU" → "desistiu"
- Sem status / pendência docs → "a_iniciar"

**2. Alinhamento com o fluxo (imagem anexa)**

O fluxo mostra: Comercial → Supermercado (levantamento teses, apresentação, contrato) → Focus FinTax (compensações por tipo de tese: Subvenção, Insumos, Exc. ICMS, Reporto, PIS/COFINS).

O sistema já suporta isso com:
- Pipeline/CRM (comercial prospecta leads)
- Conversão lead→cliente com processos_teses por tese
- ClienteDetail com tabs de processos, compensações e resumo financeiro
- Cada processo_tese tem status_contrato + status_processo individual

Sem mudanças estruturais necessárias — o modelo atual já reflete o fluxo.

**3. Execução**

Rodar script Python que:
1. Lê o XLSX com openpyxl
2. Parseia valores monetários (remove "R$", pontos, vírgulas)
3. Insere clientes via psql
4. Para cada tese com valor > 0, insere processo_tese vinculado ao cliente_id
5. Gera relatório de quantos clientes/processos importados

### Resultado esperado
- ~85 clientes na tabela `clientes`
- ~200-300 processos_teses vinculados (múltiplas teses por cliente)
- Dados visíveis imediatamente na página /clientes do sistema

