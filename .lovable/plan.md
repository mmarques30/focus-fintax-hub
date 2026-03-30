

## Usar logo Focus FinTax no header do Diagnóstico

### Problema
O header do `/diagnostico/:token` usa um `LogoSVG` inline genérico (um leão estilizado desenhado à mão). O usuário enviou o SVG real da Focus FinTax e quer usá-lo no lugar.

### Plano

1. **Copiar o SVG** do upload (`user-uploads://25.svg`) para `src/assets/logo-focus-fintax.svg`

2. **Editar `src/pages/Diagnostico.tsx`**:
   - Importar o SVG: `import logoFocus from "@/assets/logo-focus-fintax.svg"`
   - Substituir o bloco do header (linhas 311-316) que usa `<LogoSVG />` + texto "FOCUS" / "FinTax" por uma `<img src={logoFocus} alt="Focus FinTax" />` com altura ~40px
   - Remover o componente `LogoSVG` (linhas 185-194) que não será mais usado
   - Também atualizar o footer (linha 630) para usar a mesma logo se desejado

### Arquivos alterados
1. `src/assets/logo-focus-fintax.svg` — novo (cópia do upload)
2. `src/pages/Diagnostico.tsx` — substituir LogoSVG por img da logo real

