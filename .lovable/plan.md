

## Ajustes 1.1 a 1.4 — Constantes, Formulario e Prompt da Edge Function

### 1. `src/lib/lead-constants.ts`

**Segmentos** — trocar para value/label pairs:
```ts
export const SEGMENTOS = [
  { value: "supermercado", label: "Supermercado" },
  { value: "pet", label: "PET" },
  { value: "materiais_construcao", label: "Materiais de Construção" },
  { value: "farmacia", label: "Farmácia" },
  { value: "outros", label: "Outros" },
] as const;
```

**Faturamento** — trocar para value/label pairs:
```ts
export const FATURAMENTO_FAIXAS = [
  { value: "ate_2m", label: "Até R$ 2 milhões (Pequeno)" },
  { value: "2m_15m", label: "De R$ 2M a R$ 15 milhões (Médio)" },
  { value: "acima_15m", label: "Acima de R$ 15 milhões (Grande)" },
] as const;
```

**FATURAMENTO_VALORES** — atualizar mapeamento:
```ts
"ate_2m": 24_000_000,      // 2M mensal × 12
"2m_15m": 102_000_000,     // ~8.5M medio × 12
"acima_15m": 300_000_000,  // 25M medio × 12
```

### 2. Atualizar componentes que usam SEGMENTOS e FATURAMENTO_FAIXAS

Os selects em `LeadForm.tsx` e `Benchmarks.tsx` iteram sobre arrays de strings. Precisam usar `.value` e `.label`:
```tsx
{SEGMENTOS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
```

### 3. Remover `pagou_irpj`

**LeadForm.tsx**: remover state `pagouIrpj`, remover Switch, remover `pagou_irpj` do insert.

**Edge Function**: remover referencia a `lead.pagou_irpj` no prompt.

**Migracao SQL**: `ALTER TABLE leads DROP COLUMN pagou_irpj;`

### 4. Reformular prompt da Edge Function `analyze-lead`

Substituir o prompt atual por dois blocos:

**Bloco 1 — Contexto educativo** (fixo): explica teses tributarias em linguagem simples, como funciona a recuperacao, embasamento legal resumido. Sem juridiques.

**Bloco 2 — Diagnostico personalizado** (dinamico): saudacao com nome da empresa, dados do perfil, frase de dor, valor total estimado (sem nomes de teses), disclaimer, call to action.

Regras: nao mencionar nomes de teses, nao mencionar Laratex, filtrar IPI, linguagem simples, cores #010f69/#c73737, Montserrat.

Atualizar tambem o fallback HTML para seguir a mesma estrutura.

**Atualizar FATURAMENTO_VALORES** na Edge Function para os novos valores.

### 5. Migracao SQL adicional

Atualizar registros existentes em `benchmarks_teses` para usar novos valores de faturamento_faixa e segmento (UPDATE com CASE).

### Ordem de execucao
1. Migracao SQL (drop `pagou_irpj`, update benchmarks)
2. Atualizar `lead-constants.ts`
3. Atualizar `LeadForm.tsx` e `Benchmarks.tsx` (selects + remover pagou_irpj)
4. Atualizar Edge Function `analyze-lead` (FATURAMENTO_VALORES + novo prompt)

