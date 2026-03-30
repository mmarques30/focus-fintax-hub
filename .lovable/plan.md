

## Corrigir divisória e espaçamento das tabs do Dashboard

### Problema
O header (saudação) e o tab switcher estão em dois blocos separados com `background: var(--dash-surface)` e `borderBottom`, criando uma linha divisória branca duplicada entre eles. As tabs têm padding excessivo vertical e ficam apertadas.

### Mudança (`src/pages/Dashboard.tsx`, linhas 336-356)

Unificar header e tabs em um único bloco branco com uma única borda inferior:

- Remover `borderBottom` do header (linha 336)
- Remover `background` e `borderBottom` do wrapper das tabs (linha 349), deixando-o dentro do mesmo bloco branco do header
- Envolver header + tabs em um único `<div>` com `background: var(--dash-surface)` e `borderBottom: 1px solid var(--dash-border)`
- Aumentar padding horizontal das tabs para `padding: 12px 32px` e adicionar `gap: 8px` no container flex

### Resultado
Header e tabs em um bloco contínuo branco, sem divisória duplicada, com tabs mais espaçadas.

### Arquivo alterado
1. `src/pages/Dashboard.tsx` — linhas 336-356

