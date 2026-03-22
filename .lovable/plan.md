

## Simplificar Dobra 1 (Hero) — mais clean + logo decorativa no fundo

### Problema atual
A dobra 1 tem muitos elementos competindo por atencao: eyebrow badge, titulo, subtitulo, paragrafo longo, 3 stats cards e o form card grande. Visualmente pesado.

### Mudancas propostas em `public/lp.html`

**1. Remover elementos excessivos do hero**
- Remover o `.hero-eyebrow` (linha 362) — informacao redundante
- Remover os `.hero-stats` (linhas 365-378) — os numeros ja aparecem na secao "Plataforma" mais abaixo
- Manter apenas: titulo (h1), subtitulo curto (hero-desc) e form card

**2. Adicionar logo grande decorativa no fundo**
- Inserir a logo (`/images/logo-focus-fintax.png`) como elemento de background no hero
- CSS: `position:absolute`, centralizada ou levemente a esquerda, tamanho grande (~500-600px), `opacity:0.04`, `filter:blur(2px)`, `pointer-events:none`
- Efeito sutil de marca d'agua que reforca branding sem competir com o conteudo

**3. Ajustar espacamento**
- Com menos elementos, aumentar `padding` do hero para respirar mais
- Centralizar melhor o titulo verticalmente em relacao ao form

### Resultado esperado
Hero limpo com apenas titulo impactante, uma linha de subtitulo e o formulario. A logo grande e desfocada ao fundo adiciona personalidade sem poluir.

### Arquivo alterado
- `public/lp.html` (unico arquivo)

