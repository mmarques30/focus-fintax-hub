

## Integrar formulário LP → banco → diagnóstico

### Contexto
O formulário da LP (`runDiag()`) atualmente faz cálculo 100% client-side com valores fixos. Precisamos: salvar o lead no banco, calcular com benchmarks reais, salvar relatório, e redirecionar para `/diagnostico/:token`.

### Problema de mapeamento
Os valores do formulário LP (ex: "Supermercado", "Até R$ 500 mil") diferem dos valores no banco (ex: `supermercado`, `ate_2m`). Precisamos mapear no backend.

### 1. Nova edge function `submit-lead-public`

Criar `supabase/functions/submit-lead-public/index.ts` — função pública (sem auth):

- Recebe: `nome`, `empresa`, `cnpj`, `whatsapp`, `segmento`, `regime`, `faturamento` (valores do formulário LP como strings)
- Mapeia valores do form para valores do banco:
  - Segmento: "Supermercado" → `supermercado`, "Farmácia" → `farmacia`, "PET Shop" → `pet`, "Material de Construção" → `materiais_construcao`, resto → `outros`
  - Faturamento: "Até R$ 500 mil" / "R$ 500 mil – R$ 1M" → `ate_2m`, "R$ 1M – R$ 5M" / "R$ 5M – R$ 20M" → `2m_15m`, "Acima de R$ 20M" → `acima_15m`
  - Regime: direto (já compatível)
- Insere na tabela `leads` com `origem = 'formulario_lp'`, `status = 'novo'`
- Consulta `benchmarks_teses` cruzando segmento + faturamento_faixa
- Calcula `valor_min = base_mensal × 60 × percentual_min`, `valor_max = base_mensal × 60 × percentual_max` por tese
- Insere na tabela `relatorios_leads`
- Retorna `{ token }` para redirect

Usa `SUPABASE_SERVICE_ROLE_KEY` para bypass de RLS (função pública precisa inserir sem auth).

### 2. Alterar `runDiag()` em `public/lp.html`

Modificar a função para:
- Coletar os dados do form
- Fazer `fetch` à edge function `submit-lead-public`
- Em caso de sucesso, redirecionar: `window.location.href = '/diagnostico/' + data.token`
- Em caso de erro, manter o comportamento atual (cálculo client-side como fallback)
- Adicionar um spinner/loading state no botão durante o envio

Nenhuma mudança visual — apenas o comportamento do submit.

### 3. Configurar `verify_jwt = false` na config

Adicionar bloco em `supabase/config.toml` para a nova função:
```toml
[functions.submit-lead-public]
verify_jwt = false
```

### Arquivos alterados
1. `supabase/functions/submit-lead-public/index.ts` — novo
2. `supabase/config.toml` — bloco da nova função
3. `public/lp.html` — alterar `runDiag()` (linhas 723-765)

