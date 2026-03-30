

## Redesign Diagnóstico — Light theme com hero image

### Contexto
Substituir toda a camada visual do `src/pages/Diagnostico.tsx` (atualmente dark/Barlow) pelo novo design light (DM Sans/DM Serif Display, fundo #f7f7f5, cards brancos). Preservar integralmente: routing, `useParams`, RPC `get_diagnostico_by_token`, interfaces, estados loading/error.

### Mudanças no `src/pages/Diagnostico.tsx` (rewrite)

**Fonts**: Trocar Google Fonts link para `DM Sans:wght@300;400;500;600`, `DM Serif Display:ital@0;1`, `DM Mono:wght@400;500`.

**Faturamento midpoints**: Atualizar `FATURAMENTO_MIDPOINTS` para os novos valores:
- `ate_500k` → 250000, `500k_2m` → 1250000, `2m_5m` → 3500000, `5m_15m` → 10000000, `acima_15m` → 20000000
- Manter os antigos (`ate_2m`, `2m_15m`, `acima_15m`) como fallback.

**Niche images map**: Novo objeto com URLs Unsplash por segmento (supermercado, farmacia, pet, materiais_construcao, outros).

**CSS tokens injetados via `useStyles`**: Todas as variáveis CSS do template (--navy, --red, --ink, --surface, --page, --gold, --green, --border, --ink-60, --ink-30, --ink-10). Animação `fadeUp` (opacity 0→1, translateY 16→0, 0.55s). Print styles com `print-color-adjust: exact`, hide CTAs, white background. Responsive ≤600px.

**Estrutura visual (DiagnosticoContent)**:

1. **Page wrapper**: `background: #f7f7f5` (light), sem radial gradients
2. **Header**: Navy bar (#0a1564) com logo (lion icon + FOCUS FinTax) esquerda, pill "Diagnóstico Gerado" direita
3. **Hero image section**: 240px, `<img>` de Unsplash por segmento, overlay gradient navy, conteúdo posicionado no bottom: tag mono "Diagnóstico Tributário · Estimativa Preliminar", empresa em DM Serif Display 36px, italic "identificamos oportunidades reais", subtitle com regime + 60 meses
4. **Content wrapper**: max-width 800px, padding 40px 24px
5. **Total card**: Fundo navy (#0a1564), border-radius 16px. Layout flex: left (eyebrow mono, range min→max em DM Serif 44px, caption), right (gold box com multiplier). Animated counters para min/max.
6. **Section row**: "X teses identificadas" — line — "Regime · Segmento" em DM Mono 9px
7. **Tese cards**: White background, border `rgba(17,24,39,0.09)`, border-radius 12px, left red stripe (rank 1 = red, rank 2 = navy, rank 3+ = lighter). Grid 1fr auto. Left: tese number (DM Mono red), name (600 weight), description (#ink-60), thin progress bar (red gradient). Right: label "Estimativa 5 anos", min value, "até", max value bold.
8. **Disclaimer**: Gold-bordered box (`background: rgba(184,134,11,0.12)`, left border gold)
9. **CTA block**: DM Serif heading "Transforme esse potencial...", subtitle, two buttons (WhatsApp red + download ghost). Stamps row below.
10. **Footer**: Navy background, brand text left, date right

**Animations**: All sections get `fade-up` class with staggered delays (d1–d8). Counters animate via existing `useAnimatedCounter` (1600ms, ease-out-quart).

**Print**: Hide CTAs, force white background, `print-color-adjust: exact` on colored elements, disable animations.

### Arquivos alterados
1. `src/pages/Diagnostico.tsx` — rewrite completo (visual only, preserve data layer)

