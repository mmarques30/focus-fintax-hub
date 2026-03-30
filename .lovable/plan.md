

## Dashboard Visão Operacional — Dados reais

### Arquivo alterado
`src/pages/Dashboard.tsx` — atualizar queries e visual da tab operacional

### Mudanças

**1. Queries ajustadas no `fetchData`** (linhas 202-258)

- **Card 1**: Mudar de `clientes.status = 'ativo'` para `clientes.compensando_fintax = true` (label "Clientes compensando")
- **Card 3 "Honorários"**: Já usa `valor_nf_servico` — correto
- **Card 5 "Saldo"**: Mudar cálculo para usar `clientes.total_credito_identificado - clientes.total_compensado` direto da tabela `clientes` (porém essas colunas não existem no schema). Manter cálculo atual via `processos_teses.valor_credito - sum(compensacoes)`.
- **Monthly bars**: Mudar para grouped bars — coletar tanto `valor_compensado` quanto `valor_nf_servico` por mês. Novo tipo: `{ month, label, valor, honorarios }`
- **Top compensado**: Adicionar `honorarios` por cliente (sum `valor_nf_servico` grouped by `cliente_id`)
- **Tooltip do saldo**: Mudar texto para "Créditos identificados ainda não compensados — potencial de honorários futuros"

**2. MonthBar type** (linha 98)
Adicionar `honorarios: number` ao tipo

**3. Chart — grouped bar** (linhas 458-473)
- Adicionar segunda `<Bar>` para honorários: `dataKey="honorarios"`, fill `#c8001e`, maxBarSize 32, radius
- Navy bar = `valor` (compensado), red bar = `honorarios`
- Labels de valor em cima de cada barra
- Y axis formatter em "R$ mil"

**4. KPI "Clientes compensando"** (linha 429)
Mudar label e query

**5. Top compensado table** (linhas 480-503)
Adicionar coluna honorários em navy small entre compensado e saldo

**6. Bottom strip** (linhas 530-545)
Mudar para: "27 clientes na carteira" / "R$ 8,1mi compensados" / "R$ 17,8mi saldo disponível" — usar valores dinâmicos

### Sem migration — usa tabelas existentes

