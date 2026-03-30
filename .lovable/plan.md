

## Corrigir faixas de faturamento — substituir valores legados

### Arquivos a alterar

**1. `src/lib/lead-constants.ts`** — Fonte central das faixas
- `FATURAMENTO_FAIXAS`: substituir 3 valores por 5 novos (ate_500k, 500k_2m, 2m_5m, 5m_15m, acima_15m)
- `FATURAMENTO_VALORES`: atualizar para 5 faixas com valores anuais proporcionais (ex: ate_500k → 6M, 500k_2m → 15M, 2m_5m → 42M, 5m_15m → 120M, acima_15m → 300M)

**2. `src/pages/MotorConfig.tsx`** (linhas 47-51, 81)
- `FATURAMENTO_FAIXAS` local: 5 faixas com midpoints (ate_500k: 250k, 500k_2m: 1.25M, 2m_5m: 3.5M, 5m_15m: 10M, acima_15m: 20M)
- Default `simFaturamento`: mudar de `"ate_2m"` para `"ate_500k"`

**3. `supabase/functions/analyze-lead/index.ts`** (linhas 16-26)
- `FATURAMENTO_MIDPOINTS`: 5 faixas
- `FATURAMENTO_LABELS`: 5 labels correspondentes

**4. `supabase/functions/submit-lead-public/index.ts`** (linhas 17-23, 31-35, 54)
- `FATURAMENTO_MAP`: remapear labels LP → novos enum values
- `FATURAMENTO_MIDPOINTS`: 5 faixas
- Default fallback: `"ate_500k"`

**5. `src/pages/Diagnostico.tsx`** (linhas 46-54)
- `FATURAMENTO_MIDPOINTS`: já tem parcialmente os novos valores + legacy fallbacks — remover legados, manter apenas os 5 corretos

### Labels finais
| Enum | Label |
|------|-------|
| ate_500k | Até R$ 500 mil |
| 500k_2m | R$ 500 mil – R$ 2 milhões |
| 2m_5m | R$ 2 milhões – R$ 5 milhões |
| 5m_15m | R$ 5 milhões – R$ 15 milhões |
| acima_15m | Acima de R$ 15 milhões |

### Sem alteração
- Componentes que apenas leem `faturamento_faixa` do banco sem mapear (LeadSidePanel, ConvertClientModal, LeadReport) — continuam funcionando
- Routing, autenticação, demais funcionalidades preservadas

