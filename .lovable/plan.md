

## Relatório de Varredura 360° — Focus FinTax CRM

---

### 🔴 CRÍTICOS

**1. Ação destrutiva sem AlertDialog — usa `confirm()` nativo**
- **Categoria**: Bug / Fluxo
- **Arquivo**: `src/components/pipeline/LeadSidePanel.tsx:103`
- **Problema**: `handleMarkLost` usa `confirm()` do browser nativo em vez de `AlertDialog`, inconsistente com o padrão do projeto (compensações e processos usam AlertDialog)
- **Impacto**: UX quebrada, modal nativo feio, sem possibilidade de estilização, inconsistência com padrão estabelecido
- **Correção**: Substituir por AlertDialog como nos demais componentes

**2. `window.location.reload()` após importação CSV**
- **Categoria**: Bug
- **Arquivo**: `src/pages/ClienteDetail.tsx:202`
- **Problema**: Após importação Laratex, faz reload total da página. Perde estado, re-autentica, re-busca tudo
- **Impacto**: UX degradada — flicker visível, perda de estado de abas/sidebar
- **Correção**: Chamar as funções de fetch locais (fetchHistorico + forçar re-render das tabs)

**3. Queries sem paginação nem limit — risco de timeout com crescimento**
- **Categoria**: Performance / Bug
- **Arquivo**: `src/pages/ClientesList.tsx:41-45`, `src/pages/Dashboard.tsx:93,160-163`, `src/hooks/useNotifications.ts:49-64`
- **Problema**: Queries buscam TODOS os registros de `clientes`, `compensacoes_mensais`, `processos_teses` e `leads` sem limit. Com crescimento da base, vão estourar o limite de 1000 rows do Supabase ou causar lentidão
- **Impacto**: Dados faltando silenciosamente quando tabelas passarem de 1000 registros
- **Correção**: Adicionar `.limit()` ou paginação server-side. Para Dashboard, usar queries agregadas ou RPCs

**4. Leaked password protection desativada**
- **Categoria**: Segurança
- **Arquivo**: Configuração Supabase Auth
- **Problema**: O linter do Supabase detectou que "Leaked Password Protection" está desativada
- **Impacto**: Usuários podem usar senhas já vazadas em breaches conhecidos
- **Correção**: Habilitar leaked password protection nas configurações de auth

**5. Tabela `cliente_historico` sem foreign keys declaradas**
- **Categoria**: Banco
- **Arquivo**: Schema `cliente_historico`
- **Problema**: Colunas `cliente_id` e `usuario_id` não têm foreign keys para `clientes` e `auth.users`. Da mesma forma `lead_historico.lead_id` e `lead_historico.criado_por` não têm FKs
- **Impacto**: Dados órfãos possíveis — histórico de clientes excluídos permanece sem cascade
- **Correção**: Adicionar FKs com `ON DELETE CASCADE` para `cliente_id` e `ON DELETE SET NULL` para `usuario_id`

---

### 🟡 IMPORTANTES

**6. Componente `NavLink.tsx` nunca usado**
- **Categoria**: Código morto
- **Arquivo**: `src/components/NavLink.tsx`
- **Problema**: Componente wrapper de NavLink que não é importado por nenhum arquivo
- **Impacto**: Peso no bundle, confusão para desenvolvedores
- **Correção**: Remover o arquivo

**7. Rotas `/leads`, `/leads/novo`, `/leads/:id/relatorio` sem entrada no sidebar**
- **Categoria**: Fluxo / Design
- **Arquivo**: `src/App.tsx:45-47`, `src/components/AppSidebar.tsx`
- **Problema**: 3 rotas registradas e funcionais (`LeadQueue`, `LeadForm`, `LeadReport`) que não aparecem na navegação do sidebar. Acessíveis apenas por URL direta ou botões internos do Pipeline
- **Impacto**: Funcionalidade "escondida" — usuários não sabem que existe a fila de leads separada da pipeline
- **Correção**: Decidir se são rotas legadas (remover) ou adicionar ao sidebar

**8. Paginação hardcoded para mostrar apenas páginas 1-5**
- **Categoria**: Bug / Design
- **Arquivo**: `src/pages/ClientesList.tsx:279`
- **Problema**: `Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1)` — sempre mostra páginas 1-5, mesmo quando o usuário está na página 6+
- **Impacto**: Impossível navegar para páginas > 5 diretamente
- **Correção**: Calcular janela de páginas relativas à página atual

**9. Tipagem fraca — 55+ usos de `as any`**
- **Categoria**: Bug potencial
- **Arquivo**: Múltiplos (8 arquivos)
- **Problema**: `cliente_historico as any` (x3), `compInserts as any`, `leadsRes.data as any`, estados `useState<any[]>` em ClienteDetail, ClientesList, CompensacoesTab, ProcessosTesesTab
- **Impacto**: Erros de runtime não detectados em build, autocomplete quebrado
- **Correção**: Usar tipos gerados do Supabase (`Database['public']['Tables']`)

**10. Sidebar sem suporte mobile**
- **Categoria**: Design / Acessibilidade
- **Arquivo**: `src/components/AppSidebar.tsx:85-86`
- **Problema**: Sidebar expande por `onMouseEnter`/`onMouseLeave` — não funciona em dispositivos touch
- **Impacto**: App inacessível em mobile — sidebar permanece em 60px sem forma de navegar
- **Correção**: Adicionar hamburger menu ou drawer para viewport < 768px

**11. Queries duplicadas entre Dashboard e Pipeline**
- **Categoria**: Performance
- **Arquivo**: `src/pages/Dashboard.tsx:74-81` e `src/pages/Pipeline.tsx:50-59`
- **Problema**: Dashboard faz 10+ queries de leads; Pipeline refaz query completa dos mesmos dados. Sem cache compartilhado (React Query não usado para estas queries)
- **Impacto**: Dobro de requests ao banco, lentidão perceptível
- **Correção**: Usar React Query com chaves de cache para compartilhar dados

**12. `SEGMENTO_LABELS` duplicado em `Diagnostico.tsx`**
- **Categoria**: Código morto / Inconsistência
- **Arquivo**: `src/pages/Diagnostico.tsx:37-43`
- **Problema**: Declara constante `SEGMENTO_LABELS` local que já existe em `src/lib/pipeline-constants.ts`
- **Impacto**: Valores podem divergir com o tempo
- **Correção**: Importar de `pipeline-constants`

**13. Loading states inconsistentes**
- **Categoria**: Design
- **Arquivo**: Múltiplos
- **Problema**: Dashboard usa skeletons dedicados (SkeletonKpi, SkeletonChart); Pipeline usa `<div>Carregando...</div>`; ClienteDetail usa spinner; LeadQueue usa spinner; ResumoFinanceiro usa texto
- **Impacto**: UX inconsistente entre telas
- **Correção**: Padronizar com skeletons ou spinner com texto uniforme

**14. `useEffect` com array de dependências ausente**
- **Categoria**: Bug potencial
- **Arquivo**: `src/pages/Pipeline.tsx:70` — `useEffect(() => { fetchLeads(); ... }, [])` mas `fetchLeads` não está em deps e não é memoizado com useCallback
- **Impacto**: ESLint warning silenciado, possível stale closure
- **Correção**: Memoizar `fetchLeads` com `useCallback` ou adicionar à dep array

**15. `handleObsChange` no LeadSidePanel sem feedback visual de "Salvo"**
- **Categoria**: Fluxo / Inconsistência
- **Arquivo**: `src/components/pipeline/LeadSidePanel.tsx:80-87`
- **Problema**: Observações do lead salvam via debounce mas sem indicador "Salvo ✓" (diferente do ClienteDetail que já tem)
- **Impacto**: Usuário não sabe se salvou
- **Correção**: Adicionar feedback visual como no ClienteDetail

**16. Tabelas sem scroll horizontal em mobile**
- **Categoria**: Design
- **Arquivo**: `src/pages/ClientesList.tsx:193`, `src/pages/LeadQueue.tsx:149`, `src/pages/UserManagement.tsx`
- **Problema**: Tabelas com 10+ colunas sem wrapper `overflow-x-auto`
- **Impacto**: Conteúdo cortado em telas < 1024px
- **Correção**: Envolver tabelas em `<div className="overflow-x-auto">`

**17. KPI grid em Pipeline fixo em `grid-cols-4` sem responsividade**
- **Categoria**: Design
- **Arquivo**: `src/pages/Pipeline.tsx:149`
- **Problema**: `grid grid-cols-4` fixo, sem breakpoints para mobile
- **Impacto**: Cards de KPI comprimidos e ilegíveis em telas < 768px
- **Correção**: Usar `grid-cols-2 md:grid-cols-4`

---

### 🟢 MENORES

**18. `console.error` no NotFound.tsx**
- **Categoria**: Código morto
- **Arquivo**: `src/pages/NotFound.tsx:8`
- **Problema**: `console.error` em produção para rotas 404
- **Impacto**: Poluição do console
- **Correção**: Remover ou condicionar a `import.meta.env.DEV`

**19. `console.error` no Diagnostico.tsx**
- **Categoria**: Código morto
- **Arquivo**: `src/pages/Diagnostico.tsx:323`
- **Problema**: `console.error('PDF generation error:', err)` em produção
- **Impacto**: Menor — só aparece em erro de PDF
- **Correção**: Condicionar a DEV

**20. Campo `compensando_fintax` ainda no UI mas semanticamente deprecado**
- **Categoria**: Código morto / Inconsistência
- **Arquivo**: `src/pages/ClienteDetail.tsx:267-270`, `src/pages/ClientesList.tsx:219`
- **Problema**: Toggle "Compensando Fintax" e coluna na lista ainda existem, mas Dashboard já usa dados reais de compensação
- **Impacto**: Confusão para usuários — dois indicadores contraditórios
- **Correção**: Remover toggle e coluna, ou documentar claramente como "marcação interna"

**21. Debug block em CompensacoesTab visível em DEV**
- **Categoria**: Código morto
- **Arquivo**: `src/components/clientes/CompensacoesTab.tsx:172-176`
- **Problema**: Bloco amarelo de debug com `import.meta.env.DEV` mostrando `clienteId`
- **Impacto**: Menor — só visível em dev, mas pode confundir
- **Correção**: Remover após bugs de FK resolvidos

**22. `FATURAMENTO_MIDPOINTS` duplicado em Diagnostico.tsx**
- **Categoria**: Código morto
- **Arquivo**: `src/pages/Diagnostico.tsx:45-50`
- **Problema**: Constante duplicada que também existe em `submit-lead-public/index.ts`
- **Impacto**: Manutenção duplicada
- **Correção**: Extrair para arquivo compartilhado (ou aceitar duplicação frontend/edge)

**23. Fontes sem `font-display: swap` no CSS**
- **Categoria**: Performance
- **Arquivo**: `src/index.css:2`
- **Problema**: Google Fonts importado com `&display=swap` mas o CSS não define `font-display` como fallback
- **Impacto**: Menor — Google Fonts já inclui swap via parâmetro
- **Correção**: Nenhuma ação necessária (já está no URL)

**24. Tooltip em TableRow usa `title` nativo**
- **Categoria**: Design
- **Arquivo**: `src/pages/ClientesList.tsx:215`
- **Problema**: `title="Acesso restrito ao time operacional"` — tooltip nativo do browser, não estilizado
- **Impacto**: Inconsistência visual menor
- **Correção**: Usar componente Tooltip do shadcn

---

### RESUMO

| Severidade | Total |
|------------|-------|
| 🔴 Crítico | 5 |
| 🟡 Importante | 12 |
| 🟢 Menor | 7 |
| **Total** | **24** |

| Categoria | Total |
|-----------|-------|
| Bug / Bug potencial | 7 |
| Design / UI | 6 |
| Código morto | 5 |
| Performance | 3 |
| Segurança | 1 |
| Fluxo | 1 |
| Banco | 1 |

### Top 5 Prioridades de Correção Imediata

1. **Queries sem limit** (🔴 #3) — dados vão sumir silenciosamente quando tabelas crescerem além de 1000 rows
2. **FKs ausentes em histórico** (🔴 #5) — dados órfãos se acumulando
3. **`confirm()` nativo no Lead perdido** (🔴 #1) — inconsistência funcional crítica
4. **`window.location.reload()`** (🔴 #2) — UX degradada em fluxo frequente
5. **Leaked password protection** (🔴 #4) — risco de segurança passivo

