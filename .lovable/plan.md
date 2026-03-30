

## Redesign da página /diagnostico/:token — Visual premium

### Contexto
A página atual (`src/pages/Diagnostico.tsx`) usa componentes shadcn com fundo branco. O usuário forneceu um template HTML com visual dark/premium (fundo azul escuro, tipografia Barlow/Bebas Neue, animações, contadores). A estrutura de dados já existe: a RPC `get_diagnostico_by_token` retorna `lead` + `relatorio` com `teses_identificadas` (array de objetos com `tese_nome`, `estimativa_minima`, `estimativa_maxima`).

Nao existem tabelas `diagnosticos_leads` nem `motor_teses_config` no banco — os dados vem de `relatorios_leads.teses_identificadas` (JSONB). Nenhuma mudanca de banco necessaria.

### Plano

**Arquivo unico alterado: `src/pages/Diagnostico.tsx`**

Reescrever completamente o componente para replicar o visual do template HTML fornecido, usando CSS inline/styled dentro do proprio componente (ou um bloco `<style>` injetado via useEffect). Nao usar componentes shadcn — a pagina e standalone.

**Estrutura da nova pagina:**

1. **Fontes**: Adicionar link do Google Fonts (Barlow, Barlow Condensed, Bebas Neue) via `<link>` injetado no head com useEffect
2. **Header**: Logo SVG do leao + "FOCUS" / "FinTax" + badge "Diagnostico Gerado" com ponto verde pulsante
3. **Intro**: Badge vermelho, titulo com nome da empresa + "oportunidades reais" em dourado, subtitulo com regime e periodo
4. **Hero card**: Gradiente vermelho/azul, valores totais com contadores animados (requestAnimationFrame, easing out-quart, 1800ms), caption com N teses, multiplicador dourado calculado dinamicamente
5. **Section label**: "X TESES IDENTIFICADAS" + linha + "regime · segmento"
6. **Cards de teses**: Iterar `teses_identificadas`, exibir badge TESE 0X, nome, descricao, barra de progresso animada, valores formatados (mil/mi)
7. **Disclaimer**: Card com borda dourada, icone atencao, texto completo
8. **CTAs**: Botao vermelho WhatsApp + botao secundario "Baixar diagnostico" (window.print)
9. **Selos**: 4 itens com ponto vermelho
10. **Footer**: Texto Focus FinTax LTDA

**Logica de dados (mantida):**
- Busca via `supabase.rpc("get_diagnostico_by_token", { _token: token })`
- Filtra teses com `estimativa_maxima > 0`
- Calcula multiplicador: `maxTotal / faturamentoMidpoint` onde midpoints sao `ate_2m=1000000, 2m_15m=8500000, acima_15m=20000000`
- Formata valores: < 1M = "R$ X mil", >= 1M = "R$ X,X mi"

**Animacoes (implementadas em React):**
- useEffect com IntersectionObserver ou timeout para fadeUp escalonado
- useRef + requestAnimationFrame para contadores do hero
- setTimeout escalonado para barras de progresso (CSS transition width)

**Print styles**: Fundo branco, esconder CTAs, preservar cores dos cards

**Responsivo**: < 640px: cards em coluna unica, botoes empilhados, padding reduzido

### Resultado
Pagina visualmente identica ao template HTML fornecido, mas alimentada dinamicamente pelos dados do banco via RPC existente. Nenhuma outra rota ou arquivo alterado.

