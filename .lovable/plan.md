

## Igualar visualmente o footer ao header

### Problema
Ambos usam `rgba(1,15,105,0.85)` com transparencia, mas o conteudo atras de cada um e diferente — o header tem o hero (mais claro) por tras, e o footer tem secoes escuras. Isso faz o footer parecer mais escuro.

### Correcao em `public/lp.html`

**Linha 281**: Trocar `background:rgba(1,15,105,0.85)` por `background:#0a1a6e` — uma cor solida que corresponde a aparencia visual do header (o azul marinho da marca ligeiramente mais claro). Remover o backdrop-filter do footer ja que nao e mais necessario com cor solida.

Apenas 1 linha alterada.

