

## Redesign do Motor de Cálculo + Bloqueio Simples Nacional

### Decisão: Simples Nacional
Opção A — bloquear no formulário público com mensagem explicativa. Será implementado no `submit-lead-public` e no formulário `LeadForm.tsx`.

### Mudanças em `src/pages/MotorConfig.tsx` (rewrite visual, preservar lógica)

**1. Top section — 3 stat cards em linha**
- "Teses Ativas": count de `teses.filter(t => t.ativo).length`, número grande, fundo escuro (`bg-[#0a1a6e]`)
- "Perfis Cobertos": contagem de combinações regime×segmento com ≥1 tese ativa, mostrado como `X / 15`
- "Última Atualização": data mais recente de `atualizado_em` formatada como relativa ("há 2 dias")

**2. Simulator — linha única compacta, full-width**
- Label sutil "Simulador ao vivo" à esquerda
- 3 selects inline (Segmento, Regime, Faturamento) horizontais
- Resultado à direita na mesma linha: `Estimativa: R$ X,X mi → R$ X,X mi · Multiplicador: X,Xx`
- Fundo sutil `bg-muted/50`, sem card title separado

**3. Alert banner — condicional**
- Só aparece se alguma combinação tem 0 teses
- Amber banner compacto: "X combinações sem cobertura — leads com esse perfil receberão diagnóstico vazio."
- Botão "Ver quais" que faz scroll até o grid de cobertura

**4. Teses table — compacta e densa**
- Colunas: #, Nome da Tese, Regimes (chips coloridos: LR=azul escuro, LP=azul médio, SN=cinza), Segmentos (chips pequenos coloridos), % Mín, % Máx, Ativo (toggle pequeno), Última edição (tempo relativo)
- Row height compacto, sem padding excessivo
- Click na row abre modal de edição
- Botão "Nova tese" no header

**5. Coverage panel — grid compacto 5×3**
- Tiles ~80×56px: label segmento, abreviação regime (LR/LP/SN), número grande no centro
- Verde com check se ≥1 tese, vermelho com warning se 0
- 3 colunas (LR, LP, SN) × 5 linhas (segmentos)
- Texto abaixo: "X de 15 combinações com cobertura ativa."

### Mudanças para bloqueio Simples Nacional

**6. `supabase/functions/submit-lead-public/index.ts`**
- Após mapear regime, se for `simples`: retornar redirect para uma URL com query param `?blocked=simples` em vez de inserir lead

**7. `src/pages/LeadForm.tsx`**
- Ao selecionar "Simples Nacional" no regime, mostrar alerta inline e desabilitar botão submit

**8. `public/lp.html`** (se existir formulário lá)
- Adicionar validação similar no frontend da LP

### Helpers adicionados
- Função `timeAgo(dateStr)` para formatar datas relativas ("há 2 dias", "há 1 mês")
- Regime abbreviation map: `{ lucro_real: "LR", lucro_presumido: "LP", simples: "SN" }`
- Regime chip colors: `{ lucro_real: "bg-blue-900 text-white", lucro_presumido: "bg-blue-500 text-white", simples: "bg-gray-400 text-white" }`

### Arquivos alterados
1. `src/pages/MotorConfig.tsx` — rewrite visual completo (preservar toda lógica de dados)
2. `supabase/functions/submit-lead-public/index.ts` — bloqueio Simples Nacional
3. `src/pages/LeadForm.tsx` — alerta para Simples Nacional
4. `public/lp.html` — validação Simples Nacional (se aplicável)

