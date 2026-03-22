

## Remover botao "Diagnostico gratuito" do menu e adicionar CTAs em dobras estrategicas

### O que muda

**1. Remover do header (linha 346-349)**
- Eliminar o link `<a href="#inicio" class="btn-diag">...Diagnóstico gratuito</a>` do nav

**2. Adicionar botao CTA nas seguintes dobras:**

- **Apos secao "Para quem" (linha ~483)**: inserir um CTA centralizado "Solicitar diagnóstico gratuito" com link para `#inicio` (scroll ao form do hero), estilo pill vermelho similar ao antigo `.btn-diag`

- **Apos secao "Processo" (linha ~522, depois dos steps)**: inserir CTA "Quero meu diagnóstico gratuito" linkando para `#inicio`

- **Apos secao "Casos reais" (linha ~599)**: inserir CTA "Fazer meu diagnóstico agora" linkando para `#inicio`

**3. Estilo dos CTAs**
- Reutilizar o CSS existente do `.btn-diag` (pill vermelho com hover)
- Criar classe `.section-cta-btn` para centralizar e dar espaçamento adequado dentro das secoes
- Visual consistente com o branding

### Arquivo alterado
- `public/lp.html` (unico arquivo — HTML + CSS inline)

