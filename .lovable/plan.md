

## Modulo 01 — Entrada de Leads + Geracao de Teses por IA

### Banco de Dados (3 tabelas novas)

**leads**
- id (uuid PK), nome, whatsapp, email, empresa, cnpj, faturamento_faixa (text), regime_tributario (text), segmento (text), pagou_irpj (boolean), score_lead (integer 0-100), status (text: novo/processando/relatorio_gerado/enviado/contatado/qualificado/convertido/perdido), origem (text: webhook/manual), created_by (uuid FK nullable), criado_em (timestamptz default now())
- RLS: admin e comercial podem CRUD; outros roles so leitura

**benchmarks_teses**
- id (uuid PK), tese_nome, faturamento_faixa, segmento, percentual_minimo (numeric), percentual_maximo (numeric), ativo (boolean default true), atualizado_em (timestamptz default now())
- RLS: admin pode CRUD; comercial pode SELECT (para visualizar)

**relatorios_leads**
- id (uuid PK), lead_id (uuid FK leads), conteudo_html (text), teses_identificadas (jsonb), estimativa_total_minima (numeric), estimativa_total_maxima (numeric), score (integer), enviado_whatsapp (boolean default false), enviado_em (timestamptz nullable), criado_em (timestamptz default now())
- RLS: admin e comercial podem CRUD

### Edge Function: `analyze-lead`

- Recebe lead_id
- Busca dados do lead
- Consulta benchmarks_teses filtrando por faturamento_faixa e segmento (apenas ativos)
- Envia dados para Lovable AI (gemini-3-flash-preview) com prompt para:
  - Identificar teses aplicaveis ao perfil
  - Calcular estimativas por tese (percentual_minimo/maximo * faturamento)
  - Gerar score 0-100
  - Gerar conteudo HTML do relatorio com disclaimer
- Salva resultado em relatorios_leads
- Atualiza lead status para "relatorio_gerado" e score_lead

### Paginas Novas (4)

1. **`src/pages/LeadForm.tsx`** — Cadastro manual de lead
   - Formulario com todos os campos (nome, whatsapp, email, empresa, cnpj, faturamento_faixa como select, regime_tributario como select, segmento como select, pagou_irpj como toggle)
   - Ao salvar: insere lead com status "novo" e origem "manual", depois chama edge function analyze-lead

2. **`src/pages/LeadQueue.tsx`** — Fila de processamento
   - Lista de leads com colunas: nome, empresa, cnpj, score, status, data
   - Badge colorido por status
   - Botao "Reprocessar" para leads com erro
   - Botao "Ver Relatorio" quando disponivel
   - Botao "Novo Lead" que navega para /leads/novo
   - Filtros por status

3. **`src/pages/LeadReport.tsx`** — Visualizacao do relatorio
   - Rota: /leads/:id/relatorio
   - Exibe dados do lead + relatorio HTML renderizado
   - Teses identificadas com estimativas por tese
   - Score total
   - Disclaimer obrigatorio
   - Botoes: "Editar", "Marcar como Enviado", "Reenviar"

4. **`src/pages/Benchmarks.tsx`** — Base de benchmarks (admin only)
   - CRUD table: tese_nome, faturamento_faixa, segmento, percentual_minimo, percentual_maximo, ativo (toggle)
   - Dialog para adicionar/editar
   - Sem dependencia de IA — interface direta

### Routing e Sidebar

- **AppSidebar**: Adicionar item "Leads" com icone `UserPlus` apos Dashboard, roles: ["admin", "comercial"]
- **App.tsx**: Adicionar rotas:
  - `/leads` → LeadQueue
  - `/leads/novo` → LeadForm
  - `/leads/:id/relatorio` → LeadReport
  - `/benchmarks` → Benchmarks (admin only, adicionar ao sidebar como sub-item de Configuracoes ou item separado)

### Faturamento Faixas e Segmentos (constantes compartilhadas)

Arquivo `src/lib/lead-constants.ts` com:
- FATURAMENTO_FAIXAS: ["Ate 500k", "500k-1M", "1M-5M", "5M-20M", "Acima de 20M"]
- REGIMES: ["Simples Nacional", "Lucro Presumido", "Lucro Real"]
- SEGMENTOS: ["Supermercado", "Atacado", "Varejo Alimentar", "Outro"]

### Ordem de Execucao

1. Migracao SQL (3 tabelas + RLS + enum de status)
2. Constantes compartilhadas
3. Edge function analyze-lead
4. Paginas: Benchmarks → LeadForm → LeadQueue → LeadReport
5. Atualizar Sidebar e App.tsx com rotas

### Seguranca
- Todas as tabelas com RLS ativo
- Edge function valida autenticacao
- Benchmarks acessivel apenas a admin
- WhatsApp: marcar como "enviado manualmente" por enquanto (integracao real em modulo futuro)

