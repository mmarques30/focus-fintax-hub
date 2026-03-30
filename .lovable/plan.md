

## Dashboard Completo — `/dashboard`

### Contexto
O Dashboard atual (`src/pages/Dashboard.tsx`) é básico: 4 cards genéricos + lista de leads recentes. O prompt pede um dashboard completo com saudação dinâmica, 6 KPIs com variação 30d, alertas operacionais, funil comercial, cards laterais e métricas do motor — tudo filtrado por role.

### 1. Rewrite `src/pages/Dashboard.tsx`

**Saudação dinâmica**: Usa `useAuth()` para nome e role. Horário local determina "Bom dia/Boa tarde/Boa noite". Data formatada abaixo.

**6 KPI cards** em grid responsivo (scroll horizontal em mobile):
- Leads no pipeline (status_funil NOT IN perdido, nao_vai_fazer)
- Novos leads 7d (criado_em > now - 7 days)
- Clientes ativos (clientes WHERE status = 'ativo')
- Potencial total carteira (soma de estimativa_total_maxima dos relatorios_leads dos leads ativos)
- Total já compensado (soma compensacoes_mensais.valor_compensado)
- Honorários a receber (soma processos_teses.valor_honorario WHERE status_processo IN compensando, pedido_feito_receita)

Cada KPI calcula variação 30d comparando período atual vs anterior. Skeleton loading. Contador animado com requestAnimationFrame.

**Filtragem por role**:
- `comercial`: mostra apenas KPIs de leads/pipeline (4 primeiros), funil, leads recentes
- `gestor_tributario`: mostra apenas KPIs de clientes/processos (3 últimos), compensações, alertas de processos
- `admin`/`pmo`: tudo

**Alertas operacionais**: Card com borda esquerda vermelha. Query leads WHERE status_funil = 'novo' AND status_funil_atualizado_em < now - 1 day. Query processos_teses WHERE (status_processo = 'nao_protocolado' AND atualizado_em < now - 15 days) OR (status_contrato = 'aguardando_assinatura' AND atualizado_em < now - 7 days). Merge, sort por urgência, limit 8. Links para /pipeline e /clientes/:id.

**Funil comercial**: Barras horizontais com contagem por etapa (6 etapas ativas). Barra proporcional ao max. onClick navega para `/pipeline?etapa=xxx`.

**Cards lado a lado**:
- Esquerdo: 5 leads recentes com empresa, segmento, potencial, tempo relativo. Footer link "/pipeline"
- Direito: Compensações do mês atual. Total destacado. Footer link "/clientes"

**Performance do motor**: 3 métricas — total diagnósticos (count distinct lead_id em relatorios_leads), leads formulario_lp 30d, taxa conversão LP→Cliente.

**Realtime**: Subscribe to `leads` e `compensacoes_mensais` changes para refresh automático dos contadores.

### 2. Rota padrão pós-login

Em `src/pages/Login.tsx` (ou `ProtectedRoute`), garantir que após login redireciona para `/dashboard`. Verificar se `src/pages/Index.tsx` já redireciona autenticados para `/dashboard`.

### Arquivos alterados
1. `src/pages/Dashboard.tsx` — rewrite completo
2. `src/pages/Login.tsx` — verificar redirect pós-login aponta para `/dashboard`

