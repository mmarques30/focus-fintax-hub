

## Remover grid de Cobertura por Perfil — manter apenas Resumos

### Resumo
Remover o card "Cobertura por Perfil" (grid colorido de combinações regime×segmento) e manter apenas as seções "Resumo por Regime" e "Resumo por Segmento" como um card independente que ocupa toda a largura.

### Mudanças (`src/pages/MotorConfig.tsx`)

**Linhas 400-515** — Substituir o card inteiro:
- Remover o `<div ref={coverageRef}>` wrapper e o grid de cobertura (linhas 408-468)
- Manter "Resumo por Regime" e "Resumo por Segmento" dentro de um novo card com título "Resumo de Cobertura"
- Layout: `grid grid-cols-1 lg:grid-cols-2 gap-6` — Regime à esquerda, Segmento à direita, ocupando largura total
- Remover a referência `coverageRef` e `coveredCount` se não forem usados em outro lugar
- Remover imports não utilizados (`CheckCircle2`, `AlertTriangle`, `TooltipProvider`, etc.) se ficarem sem uso

### Resultado
Card limpo com dois resumos lado a lado usando toda a largura disponível da página.

