

## IMPROVEMENT 3 + 4 — Audit Trail para Clientes + Comunicado por E-mail

### Mudanças

**1. Migração — Tabela `cliente_historico`**

```sql
CREATE TABLE public.cliente_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL,
  tipo text NOT NULL,
  descricao text,
  valor_anterior jsonb,
  valor_novo jsonb,
  usuario_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cliente_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_gestor_pmo_crud_historico" ON public.cliente_historico
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor_tributario'::app_role) OR has_role(auth.uid(), 'pmo'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor_tributario'::app_role) OR has_role(auth.uid(), 'pmo'::app_role));

CREATE POLICY "comercial_select_historico" ON public.cliente_historico
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'comercial'::app_role));
```

Tipos de evento: `compensacao_adicionada`, `processo_atualizado`, `status_mudado`, `observacao`, `comunicado_enviado`

**2. Helper `logClienteHistorico`** — `src/lib/cliente-historico.ts`

Função utilitária que faz `insert` na `cliente_historico` recebendo `clienteId`, `tipo`, `descricao`, `valorAnterior?`, `valorNovo?`. Obtém `usuario_id` via `supabase.auth.getUser()`.

**3. `src/components/clientes/CompensacoesTab.tsx`**

- Na função `handleSave` (linha 76-96): após insert bem-sucedido, chamar `logClienteHistorico` com tipo `compensacao_adicionada`
- No modal WhatsApp (linha 487): após `handleCopy`, chamar `logClienteHistorico` com tipo `comunicado_enviado` e descrição incluindo o mês
- Adicionar botão **"Enviar por E-mail"** ao lado do "Copiar mensagem" no modal WhatsApp:
  - Gera `mailto:` link com subject `Compensação Tributária {mês} — {empresa}` e body com a mensagem
  - Ao clicar, também loga `comunicado_enviado` no histórico

**4. `src/components/clientes/ProcessosTesesTab.tsx`**

- Na função `handleStatusProcessoChange` (linha 51-55): após update, chamar `logClienteHistorico` com tipo `status_mudado`, valor anterior e novo

**5. `src/pages/ClienteDetail.tsx` — Timeline no sidebar**

- Abaixo dos metadados no sidebar, adicionar seção "Histórico"
- Query `cliente_historico` onde `cliente_id = id`, ordenado por `created_at desc`, limite 10
- Renderizar como timeline vertical com ícone por tipo (dot colorido), descrição e data relativa
- Scroll interno se > 5 itens

### Arquivos modificados/criados
1. Migração SQL — nova tabela `cliente_historico`
2. `src/lib/cliente-historico.ts` — novo helper
3. `src/components/clientes/CompensacoesTab.tsx` — log ao salvar compensação + botão e-mail + log comunicado
4. `src/components/clientes/ProcessosTesesTab.tsx` — log ao mudar status
5. `src/pages/ClienteDetail.tsx` — timeline no sidebar

