

## Ajustar cor do header para combinar com a marca

### Analise
O header esta com `rgba(4,14,58,0.75)` — um azul muito escuro/quase preto que destoa da identidade visual. A cor primaria da marca e `#010f69` (azul marinho).

### Correcao em `public/lp.html`

**Linha 50**: Trocar `background:rgba(4,14,58,0.75)` por `background:rgba(1,15,105,0.85)` — usa a cor primaria da marca (`#010f69` = rgb 1,15,105) com leve transparencia para manter o efeito glass, mas visualmente distinta das secoes escuras do corpo da pagina.

Apenas 1 valor CSS alterado.

