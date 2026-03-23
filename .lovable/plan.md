

## Diferenciar footer da ultima dobra (CTA final)

### Problema
A secao CTA final (`.section-cta`) e o footer (`.footer`) usam backgrounds muito similares (navy/navy-dark), sem separacao visual clara entre eles.

### Correcoes em `public/lp.html`

**1. Adicionar separador visual entre CTA e footer**
- Inserir uma linha fina `border-top` no footer: `border-top: 1px solid rgba(255,255,255,0.08)`

**2. Mudar background do footer para mais escuro/diferente**
- Footer: `background: #040e3a` (mais escuro que o navy-dark) para criar contraste sutil

**3. Adicionar a logo no footer**
- Substituir o texto "Focus FinTax" por `<img src="/images/logo-focus-fintax-white.png" height="28">` para consistencia com o header

**4. Adicionar rodape inferior (copyright bar)**
- Apos o `.footer-grid`, adicionar uma barra inferior com copyright e "Grupo Focus" em texto pequeno, separada por `border-top` sutil
- Padding menor (`20px 0`), texto centralizado, `font-size:12px`, `color:rgba(255,255,255,.3)`

### Resultado
Footer visualmente distinto da CTA final, com logo da marca, separadores sutis e barra de copyright clean.

