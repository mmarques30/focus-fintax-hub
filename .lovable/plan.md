

## Trocar logo e aumentar tamanho no header do Diagnóstico

### Plano

1. **Copiar a nova logo** (`user-uploads://27-2.png`) para `src/assets/logo-focus-fintax-white.png`

2. **Editar `src/pages/Diagnostico.tsx`**:
   - Adicionar import: `import logoFocusWhite from "@/assets/logo-focus-fintax-white.png"`
   - Linha 363: trocar `src={logoFocus}` por `src={logoFocusWhite}` e aumentar height de `40` para `56`
   - Manter o logo SVG original no footer (funciona bem em fundo navy)

### Arquivos
1. `src/assets/logo-focus-fintax-white.png` — novo (cópia do upload)
2. `src/pages/Diagnostico.tsx` — import + trocar src e height no header

