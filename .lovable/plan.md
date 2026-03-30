

## Módulo Clientes e Processos por Tese

### 1. Migração SQL — Novas tabelas

**`processos_teses`** — uma linha por tese de cada cliente:
```sql
CREATE TABLE public.processos_teses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tese text NOT NULL,
  nome_exibicao text NOT NULL,
  valor_credito numeric DEFAULT 0,
  percentual_honorario numeric(5,2) DEFAULT 0,
  valor_honorario numeric GENERATED ALWAYS AS (valor_credito * percentual_honorario / 100) STORED,
  status_contrato text DEFAULT 'aguardando_assinatura',
  status_processo text DEFAULT 'a_iniciar',
  observacao text DEFAULT '',
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);
```

**`compensacoes_mensais`** — registro mensal de compensação por processo:
```sql
CREATE TABLE public.compensacoes_mensais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  processo_tese_id uuid NOT NULL REFERENCES processos_teses(id) ON DELETE CASCADE,
  mes_referencia date NOT NULL,
  valor_compensado numeric DEFAULT 0,
  status_pagamento text DEFAULT 'pendente',
  valor_nf_servico numeric DEFAULT 0,
  observacao text DEFAULT '',
  criado_em timestamptz DEFAULT now()
);
```

**Adicionar campos na tabela `clientes`:**
```sql
ALTER TABLE clientes ADD COLUMN compensando_fintax boolean DEFAULT false;
ALTER TABLE clientes ADD COLUMN compensacao_outro_escritorio text DEFAULT '';
```

RLS: admin/gestor_tributario/pmo podem CRUD em ambas tabelas + comercial SELECT.

### 2. Novos arquivos

| Arquivo | Descrição |
|---------|-----------|
| `src/pages/ClientesList.tsx` | Listagem com stats, filtros, tabela, alertas |
| `src/pages/ClienteDetail.tsx` | Detalhe com sidebar + 3 abas |
| `src/components/clientes/ProcessosTesesTab.tsx` | Tabela inline-editable de processos |
| `src/components/clientes/CompensacoesTab.tsx` | Tabela de compensações + modal registro |
| `src/components/clientes/ResumoFinanceiroTab.tsx` | Cards + gráfico barras (recharts) |
| `src/components/clientes/ClienteFormModal.tsx` | Modal cadastro com passo opcional de processos |
| `src/components/clientes/ProcessoFormModal.tsx` | Modal adicionar/editar processo |
| `src/lib/clientes-constants.ts` | Constantes de status_contrato, status_processo, cores |

### 3. Constantes (`clientes-constants.ts`)

- `STATUS_CONTRATO`: assinado (verde), aguardando_assinatura (amarelo), nao_vai_fazer (cinza)
- `STATUS_PROCESSO`: compensando (azul), pedido_feito_receita (laranja), nao_protocolado (vermelho), a_iniciar (cinza), compensado (verde), a_compensar (amarelo), protocolado (roxo), desistiu (cinza escuro)

### 4. Rotas (`App.tsx`)

Adicionar:
```tsx
<Route path="/clientes" element={<ClientesList />} />
<Route path="/clientes/:id" element={<ClienteDetail />} />
```

Substituir o import de `Clientes` (placeholder) por `ClientesList`.

### 5. Lógica principal

- **Listagem**: Query `clientes` com contagem de `processos_teses` e somas de `valor_credito`, compensações
- **Detalhe**: Sidebar fixa 280px com dados editáveis, toggle compensando_fintax. Área principal com Tabs
- **Processos**: Inline edit com debounce 800ms para `percentual_honorario` e `observacao`. `valor_honorario` é coluna gerada no banco
- **Compensações**: Agrupamento por mês, totalizador no footer
- **Resumo Financeiro**: Cards calculados + BarChart (recharts) dos últimos 12 meses
- **Alertas**: Processos `aguardando_assinatura` >7d (amarelo), `nao_protocolado` >15d (vermelho)

### Arquivos alterados/criados
1. **Migração SQL** — `processos_teses`, `compensacoes_mensais`, campos em `clientes`, RLS
2. `src/lib/clientes-constants.ts` — novo
3. `src/pages/ClientesList.tsx` — novo
4. `src/pages/ClienteDetail.tsx` — novo
5. `src/components/clientes/ProcessosTesesTab.tsx` — novo
6. `src/components/clientes/CompensacoesTab.tsx` — novo
7. `src/components/clientes/ResumoFinanceiroTab.tsx` — novo
8. `src/components/clientes/ClienteFormModal.tsx` — novo
9. `src/components/clientes/ProcessoFormModal.tsx` — novo
10. `src/App.tsx` — rotas `/clientes` e `/clientes/:id`
11. `src/pages/Clientes.tsx` — removido (substituído por ClientesList)

