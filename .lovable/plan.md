

## Corrigir numeros cortados nos cards de oportunidades

### Problema
Os numeros (01–05, +38) nos cards da secao de oportunidades estao sendo cortados. A classe `.opp-num` tem `font-size:40px`, `line-height:1` e `width:44px` — largura insuficiente para numeros de 2+ digitos, e line-height:1 corta o topo dos caracteres.

### Correcao em `public/lp.html` (linha 182)

Ajustar `.opp-num`:
- `width:44px` → `width:56px` (mais espaco horizontal)
- `line-height:1` → `line-height:1.1` (evita corte vertical)
- Adicionar `min-width:56px` para garantir que "+38" tambem caiba

Apenas uma linha de CSS alterada. Nenhuma mudanca estrutural.

