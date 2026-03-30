

## Pipeline de Leads — Modulo Completo

### Contexto

O sistema atual tem uma tela simples de leads em `/leads` (tabela com filtros). O prompt pede um pipeline completo com kanban, lista, painel lateral, historico, e conversao para cliente. A tabela `leads` usa `status` com valores simples — precisamos de novos valores de funil e novas tabelas.

### 1. Migracao SQL

**Adicionar campo `observacoes` e `status_funil` na tabela `leads`:**
```sql
ALTER TABLE public.leads ADD COLUMN status_funil text NOT NULL DEFAULT 'novo';
ALTER TABLE public.leads ADD COLUMN observacoes text DEFAULT '';
ALTER TABLE public.leads ADD COLUMN status_funil_atualizado_em timestamptz DEFAULT now();
```

**Tabela `lead_historico`** para rastrear mudancas de etapa:
```sql
CREATE TABLE public.lead_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  de_etapa text,
  para_etapa text NOT NULL,
  anotacao text,
  criado_em timestamptz DEFAULT now(),
  criado_por uuid
);
-- RLS: admin/comercial/pmo podem inserir e ler
```

**Tabela `clientes`** para leads convertidos:
```sql
CREATE TABLE public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id),
  empresa text NOT NULL,
  cnpj text NOT NULL,
  nome_contato text,
  email text,
  whatsapp text,
  segmento text,
  regime_tributario text,
  faturamento_faixa text,
  status text DEFAULT 'ativo',
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);
-- RLS: admin/gestor_tributario/pmo CRUD
```

**Habilitar realtime** na tabela leads:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
```

### 2. Novos Arquivos

**`src/pages/Pipeline.tsx`** — Componente principal com:
- Header: titulo com contador realtime, toggle kanban/lista, botao "Novo Lead"
- Stats cards: total ativos, novos hoje, potencial total (R$ mi), leads sem contato >1 dia
- Renderiza `<PipelineKanban>` ou `<PipelineList>` conforme toggle

**`src/components/pipeline/PipelineKanban.tsx`**:
- 9 colunas: novo, qualificado, em_negociacao, levantamento_teses, em_apresentacao, contrato_emitido, cliente_ativo, nao_vai_fazer, perdido
- Drag-and-drop com `@hello-pangea/dnd` (fork mantido do react-beautiful-dnd)
- Cards com: empresa, segmento (chip colorido), potencial max, score badge (A/B/C/D), dias na etapa
- Borda laranja/vermelha em "novo" com >1/>3 dias
- Ao dropar em "cliente_ativo" abre modal de confirmacao de conversao

**`src/components/pipeline/PipelineList.tsx`**:
- Tabela com colunas: Empresa, Segmento, Regime, Score, Potencial, Etapa, Fonte, Criado em, Dias na etapa
- Filtros: busca, segmento, regime, score, etapa, fonte
- Paginacao 25/pagina, ordenacao clicavel

**`src/components/pipeline/LeadSidePanel.tsx`**:
- Sheet (480px) com 3 abas (Dados, Diagnostico, Historico)
- Dados: campos editaveis, select de etapa, observacoes com auto-save (debounce 1s)
- Diagnostico: teses do relatorio em formato compacto, link para /diagnostico/:token
- Historico: timeline vertical de mudancas de etapa + anotacoes
- Footer: Editar, Converter em cliente, Marcar como perdido

**`src/components/pipeline/LeadFormModal.tsx`**:
- Dialog para criar/editar lead (campos identicos ao LeadForm atual)
- Ao salvar novo lead, chama edge function analyze-lead
- Campo origem com opcoes: manual, referencia, prospeccao_ativa, meta_ads

**`src/lib/pipeline-constants.ts`**:
- Etapas do funil com labels, cores, ordem
- Cores de segmento (supermercado azul, farmacia verde, pet laranja, materiais cinza, outros roxo)
- Score labels (A/B/C/D) com faixas e cores

### 3. Alteracoes em Arquivos Existentes

**`src/App.tsx`**: Adicionar rota `/pipeline` com `<Pipeline />`

**`src/components/AppSidebar.tsx`**: Alterar "Pipeline de Leads" de `/leads` para `/pipeline`

**`src/lib/lead-constants.ts`**: Adicionar constantes de `STATUS_FUNIL` com labels e cores

### 4. Dependencia NPM

Instalar `@hello-pangea/dnd` para drag-and-drop no kanban.

### 5. Fluxo de conversao para cliente

Ao confirmar conversao:
1. Inserir na tabela `clientes` com dados do lead
2. Atualizar `status_funil` do lead para `cliente_ativo`
3. Registrar no `lead_historico`
4. Redirecionar para `/clientes/:id`

### Arquivos
1. **Migracao SQL** — leads (novos campos), lead_historico, clientes, realtime
2. `src/pages/Pipeline.tsx` — novo
3. `src/components/pipeline/PipelineKanban.tsx` — novo
4. `src/components/pipeline/PipelineList.tsx` — novo
5. `src/components/pipeline/LeadSidePanel.tsx` — novo
6. `src/components/pipeline/LeadFormModal.tsx` — novo
7. `src/lib/pipeline-constants.ts` — novo
8. `src/App.tsx` — rota
9. `src/components/AppSidebar.tsx` — url do menu

