

## Corrigir carregamento progressivo da foto do Alcir

### Problema
A foto do Alcir (`/images/foto-alcir.png`) carrega progressivamente (aparece linha por linha). Isso acontece porque:
1. PNG nao suporta carregamento progressivo nativo de forma eficiente
2. O atributo `loading="lazy"` atrasa o inicio do carregamento
3. A imagem provavelmente e grande em tamanho de arquivo

### Correcoes em `public/lp.html`

**1. Remover `loading="lazy"` da foto do Alcir (linha 530)**
- Como a secao "Sobre" e importante e o usuario ja scrollou ate la, o lazy loading so atrasa. Trocar por `loading="eager"` ou remover o atributo.

**2. Adicionar `decoding="async"` e `fetchpriority="high"`**
- Permite ao browser decodificar sem bloquear, mas prioriza o download

**3. Esconder a imagem ate carregar completamente (CSS + JS)**
- Adicionar ao CSS: `.alcir-photo img { opacity:0; transition:opacity .3s ease }`
- Adicionar `onload="this.style.opacity='1'"` na tag `<img>`
- Isso faz a imagem aparecer de uma vez com um fade suave, em vez de carregar progressivamente

### Resultado
A foto do Alcir fica invisivel durante o download e aparece com um fade elegante quando totalmente carregada, eliminando o efeito de carregamento progressivo.

