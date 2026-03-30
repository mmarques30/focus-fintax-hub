

## Mapa Tributário (PDF) + Comunicado WhatsApp

### Resumo
Duas features na aba Compensações do `/clientes/:id`: (1) Mapa Tributário PDF com layout formal por mês, (2) Comunicado WhatsApp com cálculo de honorários. Inclui migration para coluna `tributo` na tabela `compensacoes_mensais`.

### Arquivos alterados

**1. Migration — adicionar coluna `tributo`**
```sql
ALTER TABLE compensacoes_mensais ADD COLUMN tributo text;
```

**2. `src/components/clientes/CompensacoesTab.tsx`**
- Adicionar dois botões no header ao lado de "Registrar compensação": "Gerar Mapa Tributário" (FileText icon) e "Comunicado WhatsApp" (MessageCircle icon, green)
- Receber `cliente` como prop (empresa, cnpj) para usar nos modais
- Receber `processos` e `compensacoes` dos dados já carregados (ou fazer fetch com dados extras: `percentual_honorario`, `valor_credito` do processo)
- Ajustar query de compensacoes para incluir `tributo`
- No formulário de registro de compensação, adicionar campo opcional "Tributo" (Select com opções: INSS, PIS/COFINS, IRPJ, CSLL, Outros — ou input livre)
- No insert, incluir `tributo`
- Na tabela, adicionar coluna "Tributo" mostrando o valor

**Modal Mapa Tributário:**
- Month selector mostrando meses distintos das compensacoes do cliente
- Ao selecionar mês, renderizar report HTML dentro do modal com `id="mapa-tributario-pdf"`
- Layout conforme especificado:
  - **Cover page**: bg navy `#0a1564`, "GRUPO FOCUS", "Focus FinTax", "MAPA TRIBUTÁRIO DAS COMPENSAÇÕES" — `page-break-after: always`
  - **Report page**: header com logo Focus FinTax
  - Section 1 "IDENTIFICAÇÃO DO CONTRIBUINTE": empresa + CNPJ
  - Section 2 "DADOS GERAIS DO TRABALHO": tabela 2 colunas com header navy — escopo, competência, modalidade, valor total benefício, valor utilizado, saldo futuro (calculado como `valor_credito - sum(compensações até o mês selecionado)`)
  - Section 3 "DÉBITOS COMPENSADOS": tabela com Tributo, Cód. DARF, Valor Débito, Multa, Juros — usar `tributo` ou observacao ou default "INSS"
  - Section 4 "CONTROLE DOS CRÉDITOS": créditos apurados, utilizados (acumulado até o mês), a compensar, saldo final
  - Section 5 "RESUMO DE COMPLIANCE FISCAL": conteúdo dinâmico baseado no nome da tese (subvenção vs. outros)
  - Section 6 "CONSIDERAÇÕES FINAIS": texto estático
  - Footer: "GRUPO FOCUS FINTAX"
- Botão "Baixar PDF" → `window.print()`
- Se o cliente tem múltiplos processos com compensações no mês, gerar seções 2-5 para cada processo separadamente

**Modal Comunicado WhatsApp:**
- Month selector (mesmos meses disponíveis)
- Ao selecionar mês, mostrar preview do texto gerado com cálculos:
  - `honorario = valor_compensado × percentual_honorario`
  - `economia = valor_compensado - honorario`
  - tributo: usar campo `tributo`, ou `observacao`, ou default "INSS"
  - Mês em português maiúsculo
- Mostrar "Honorários calculados: R$ X,XX" inline
- Botão "Copiar mensagem" → `navigator.clipboard.writeText()` + toast "Copiado!"
- Sem boleto ou instrução bancária além do Pix

**3. `src/index.css`**
- Atualizar `@media print` para incluir `#mapa-tributario-pdf` com `print-color-adjust: exact` para preservar backgrounds navy
- Adicionar `page-break` rules

**4. `src/pages/ClienteDetail.tsx`**
- Remover o modal Mapa Tributário antigo (linhas 278-406) que será substituído pelo novo dentro do CompensacoesTab
- Remover botão "Gerar Mapa Tributário" da sidebar (será na aba Compensações)
- Passar `cliente` como prop para `CompensacoesTab`
- Manter botão Laratex na sidebar

### Dados necessários no CompensacoesTab
- Query processos_teses expandida: `id, nome_exibicao, tese, valor_credito, percentual_honorario`
- Query compensacoes expandida: incluir `tributo` no select
- Meses disponíveis: `[...new Set(compensacoes.map(c => c.mes_referencia.slice(0,7)))]` ordenados desc

### Print CSS additions
```css
#mapa-tributario-pdf, #mapa-tributario-pdf * {
  visibility: visible;
}
#mapa-tributario-pdf {
  position: absolute; left: 0; top: 0; width: 100%;
  print-color-adjust: exact; -webkit-print-color-adjust: exact;
}
```

