

## Corrigir botoes CTA — remover caixas azuis

### Problema
Os `div.inline-cta` estao posicionados dentro das sections (que tem backgrounds navy/light com padding grande), criando o efeito de "caixa azul" ao redor do botao. Na secao "Para quem" (linha 470), o div esta fora do `.container`, agravando o problema.

### Correcoes em `public/lp.html`

**1. Mover os `inline-cta` para dentro dos `.container`**
- Linha 470: mover o `<div class="inline-cta">` para antes do `</div>` do container (linha 469), nao depois

**2. Reduzir padding do `.inline-cta`**
- Linha 64: trocar `padding:32px 0 0` por `padding:24px 0 0` — so um respiro acima do botao, sem criar area vazia grande

**3. Nas secoes dark (Casos, linha 588)**: o botao ja esta dentro do container, so precisa do ajuste de padding

### Resultado
Botoes aparecem como elementos inline discretos dentro das secoes, sem criar blocos visuais separados.

