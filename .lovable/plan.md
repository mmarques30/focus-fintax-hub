

## Criar página pública de diagnóstico — `/diagnostico/:token`

### Visão geral
Página pública (sem login) que exibe o resultado do diagnóstico tributário para o lead. O acesso é controlado por um token UUID na URL.

### 1. Migração de banco de dados

**Adicionar coluna `token` na tabela `leads`:**
```sql
ALTER TABLE public.leads ADD COLUMN token uuid DEFAULT gen_random_uuid() UNIQUE;
UPDATE public.leads SET token = gen_random_uuid() WHERE token IS NULL;
ALTER TABLE public.leads ALTER COLUMN token SET NOT NULL;
```

**Criar função `get_diagnostico_by_token` (security definer)** para acesso público sem RLS:
```sql
CREATE OR REPLACE FUNCTION public.get_diagnostico_by_token(_token uuid)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'lead', row_to_json(l),
    'relatorio', row_to_json(r)
  ) INTO result
  FROM leads l
  LEFT JOIN relatorios_leads r ON r.lead_id = l.id
  WHERE l.token = _token
  ORDER BY r.criado_em DESC
  LIMIT 1;
  
  RETURN result;
END;
$$;
```

### 2. Página `src/pages/Diagnostico.tsx`

Componente React que:
- Extrai o `:token` da URL via `useParams`
- Chama `supabase.rpc('get_diagnostico_by_token', { _token: token })` no `useEffect`
- Renderiza sem layout interno (sem sidebar) — página standalone

**Estrutura visual:**
- **Topo**: Logo Focus FinTax, titulo "Diagnóstico Focus FinTax — [Empresa]", data, badge "Análise estimada · Dados declarados"
- **Card destaque**: "Sua empresa pode recuperar entre R$ X e R$ Y em créditos tributários" com valores formatados em vermelho da marca
- **Tabela de teses**: Itera `teses_identificadas` do relatório, exibe apenas teses com valores > 0 (nome, descrição comercial, intervalo)
- **Disclaimer**: Texto obrigatório sobre estimativas
- **CTAs**: Botão primário "Quero minha análise completa" → abre WhatsApp com mensagem pré-formatada. Botão secundário "Baixar diagnóstico em PDF" → usa `window.print()` com CSS de impressão

Paleta: azul `#0a1a6e`, vermelho `#d04545`, fundo branco/cinza claro.

### 3. Rota pública em `src/App.tsx`

Adicionar antes da rota protegida `/*`:
```tsx
<Route path="/diagnostico/:token" element={<Diagnostico />} />
```

### 4. Atualizar edge function `analyze-lead`

Incluir o `token` do lead no retorno da função para que o sistema possa gerar o link `/diagnostico/{token}` após a análise.

### Arquivos alterados
1. **Migração SQL** — nova coluna `token` + função `get_diagnostico_by_token`
2. `src/pages/Diagnostico.tsx` — novo arquivo
3. `src/App.tsx` — rota pública
4. `supabase/functions/analyze-lead/index.ts` — retornar token

