

## Corrigir PDF/Download do Diagnóstico

### Problema
O botão "Baixar diagnóstico" usa `window.print()`, que depende do navegador e não preserva bem backgrounds coloridos, imagens hero, bordas das teses e o layout geral — resultando num PDF visualmente diferente da página.

### Solução
Substituir `window.print()` por **html2canvas + jsPDF**, que renderiza o DOM como imagem pixel-perfect e gera um PDF fiel ao visual da tela.

### Mudanças em `src/pages/Diagnostico.tsx`

1. **Instalar dependências**: `html2canvas` e `jspdf`

2. **Criar função `handleDownloadPDF`**:
   - Captura o elemento `.dg-page` inteiro via `html2canvas` com `scale: 2`, `useCORS: true` (para imagens Unsplash), `backgroundColor: "#f7f7f5"`
   - Antes da captura: ocultar botões CTA, desabilitar animações, forçar barras de progresso a width final
   - Gera PDF A4 com `jsPDF`, quebrando em múltiplas páginas se necessário
   - Restaura elementos após captura
   - Salva como `diagnostico-{empresa}.pdf`

3. **Melhorar `@media print`** (fallback caso alguém use Ctrl+P):
   - Adicionar `@page { margin: 0; size: A4; }`
   - Wildcard `* { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }`
   - Reduzir hero height para 160px no print
   - Desabilitar animações e transitions no print
   - Ocultar `.dg-cta-section` e `.dg-cta-buttons`

4. **Trocar o `onClick`** do botão "Baixar diagnóstico" de `window.print()` para `handleDownloadPDF()`

### Arquivos
1. `package.json` — adicionar `html2canvas` e `jspdf`
2. `src/pages/Diagnostico.tsx` — importar libs, adicionar função de download, melhorar print CSS, trocar onClick

