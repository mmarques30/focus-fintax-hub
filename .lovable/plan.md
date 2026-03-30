

## Cobertura por Perfil — Remover espaço lateral

### Problema
O grid "Cobertura por Perfil" tem `maxWidth: 400` hardcoded (linha 408), deixando ~70% do card vazio à direita.

### Solução
Expandir o card para layout de 2 colunas: grid de cobertura à esquerda + resumo útil à direita com estatísticas das teses por regime e segmento.

### Mudança (`src/pages/MotorConfig.tsx`, linhas 400-467)

**Layout**: Card com `grid grid-cols-2 gap-6` interno:
- **Coluna esquerda**: Grid de cobertura atual, remover `maxWidth: 400`, manter `grid-cols-4`
- **Coluna direita**: "Resumo por Regime" — 3 mini-cards (LR, LP, SN) mostrando quantas teses ativas cobrem cada regime, e abaixo "Resumo por Segmento" — lista dos 5 segmentos com count de teses e barra de progresso (count / total teses ativas)

Isso preenche o espaço vazio com dados úteis e complementares ao grid de cobertura.

### Detalhes
- Remover `style={{ maxWidth: 400 }}` da linha 408
- Envolver conteúdo do CardContent em `grid grid-cols-1 lg:grid-cols-2 gap-6`
- Coluna direita: calcular counts a partir do `coverageGrid` já existente — sem novas queries
- Texto footer "X de 15 combinações" move para abaixo do grid esquerdo

