

## Unificar e melhorar subtitulo do hero

### Problema
A linha 365 tem texto duplicado (dois `<p class="hero-desc">` aninhados) com a mesma frase repetida.

### Correcao em `public/lp.html`

**Linha 365**: Substituir por um unico paragrafo unificado:

```html
<p class="hero-desc">Supermercados, farmácias e PETs perdem fortunas por não fazer um diagnóstico tributário. É dinheiro seu, parado nos cofres do governo. Descubra em 30 segundos quanto você pode recuperar <strong>gratuitamente</strong>.</p>
```

Apenas 1 linha corrigida — remove a duplicacao e mantem a copy completa em um unico paragrafo.

