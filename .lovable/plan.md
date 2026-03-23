

## Melhorar Hero: imagem de fundo IA + logo no header

### Mudancas

**1. Gerar imagem de fundo para o hero via IA**
- Gerar uma imagem atmosferica no estilo dark/navy que remeta ao nicho tributario/financeiro do varejo (graficos, numeros, documentos fiscais em composicao abstrata)
- Salvar em `public/images/hero-bg.png`
- Aplicar como background da secao `.hero` com `opacity` baixa (~0.15) para nao competir com o texto
- Remover a logo watermark atual (`hero-watermark`) que nao ficou boa

**2. Trocar logo no header pelo arquivo enviado**
- Copiar a logo do anexo (`32-3.png` — logo branca Focus FinTax) para `public/images/logo-focus-fintax-white.png`
- No header (linha 341), trocar o texto "Focus FinTax" por `<img>` com a nova logo, altura ~36px

### Arquivos alterados
- `public/lp.html` — CSS do hero + HTML do header
- `public/images/hero-bg.png` — nova imagem gerada por IA
- `public/images/logo-focus-fintax-white.png` — logo do anexo

