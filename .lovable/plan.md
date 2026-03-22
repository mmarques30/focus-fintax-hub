

## Ajustes na Landing Page

### 1. Substituir logo no header
O header atual (linhas 340-349) usa um SVG inline + texto "Focus FinTax". Substituir pelo logo real enviado pelo usuario (`user-uploads://32.png`).
- Copiar a imagem para `public/images/logo-focus-fintax.png`
- Substituir o SVG + `.logo-wordmark` por uma tag `<img>` com altura ~40px
- Ajustar CSS do `.logo` para acomodar imagem

### 2. Remover barra inferior vermelha (footer-bar)
- Remover o bloco HTML `.footer-bar` (linhas 707-709)
- Remover CSS da `.footer-bar` (linhas 292-293)

### 3. Substituir foto do Alcir
A foto atual é um base64 quebrado/pesado. Substituir pela imagem real enviada (`user-uploads://foto_alcir.png`).
- Copiar a imagem para `public/images/foto-alcir.png`
- Substituir o `src="data:image/png;base64,..."` por `src="/images/foto-alcir.png"`
- Ajustar CSS do `.alcir-photo img` para melhor apresentacao com foto real (remover `mix-blend-mode: lighten` que nao combina com foto com fundo branco)

### Arquivo alterado
- `public/lp.html` (unico arquivo)

