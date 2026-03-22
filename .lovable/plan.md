

## Modernizar LP — Transicao hero/dobra 2 + paleta mais suave e profissional

### Problemas identificados

1. **Transicao hero → trust bar**: a `.hero-wave` (div com gradiente linear de navy para bg-light) cria um corte artificial e pouco elegante entre o hero dark e a secao clara
2. **Paleta vermelho + azul + branco**: muito saturada e agressiva — falta suavidade e sofisticacao
3. **Bug na linha 543**: tag `<img>` duplicada no Alcir — `...loading="lazy">" alt="Alcir Guimarães" loading="lazy">`
4. **PDF de teses**: contem informacoes sobre as teses e branding — confirma a identidade visual navy/vermelho mas sugere um tratamento mais corporativo e menos "tech startup"

### Mudancas propostas (arquivo unico: `public/lp.html`)

**1. Transicao hero → trust bar mais organica**
- Substituir a `.hero-wave` (gradiente linear) por uma transicao com SVG wave curvo ou remover completamente e usar um gradiente mais suave integrado ao final do hero
- Adicionar um `padding-bottom` maior no hero e fazer o trust-bar flutuar com overlap negativo (`margin-top: -40px`) para criar continuidade visual

**2. Paleta de cores mais suave e profissional**
- Reduzir saturacao do vermelho: `--red: #c73737` → `--red: #d04545` (mais quente e menos agressivo)
- Adicionar `--red-soft: #e06b6b` (mais rose, menos alarme)
- Suavizar o `--red-glow` para menor opacidade (`.20` em vez de `.35`)
- Reduzir intensidade dos glows radiais no hero (de `.15` para `.08`)
- Usar mais branco e tons neutros nos backgrounds claros — `--bg-light: #f8f9fd`
- Bordas e sombras mais sutis (opacidades menores)
- Textos sobre dark: subir opacidade base de `.6` para `.65` para melhor legibilidade

**3. Refinamentos visuais gerais**
- Header: reduzir opacidade do background de `.92` para `.95` — mais solido e limpo
- Hero stats: bordas mais finas e menos contrastantes
- Trust bar: sem borda explicita nos items, apenas sombra sutil
- Cards de segmento: bordas quase invisiveis, sombra mais delicada
- Opp items e caso cards: reduzir contraste das bordas sobre dark
- Steps: cores mais suaves nos numeros intermediarios
- CTA final: glow mais contido

**4. Corrigir bug da img do Alcir (linha 543)**
- Remover a parte duplicada `" alt="Alcir Guimarães" loading="lazy">`

### Resumo tecnico
- 1 arquivo alterado: `public/lp.html`
- Mudancas apenas em CSS (variaveis e classes) + fix HTML na linha 543
- Nenhuma copy alterada
- Nenhum JS alterado

