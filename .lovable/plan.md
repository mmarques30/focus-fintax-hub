

## BUG FIX 1 — handleObsChange com feedback visual "Salvo"

### Situação Atual
- `handleObsChange` (linha 79-85) já salva `observacoes` corretamente no banco (fix anterior aplicado)
- Porém **não existe textarea no sidebar** — a função existe mas nunca é chamada na UI
- Não há feedback visual de salvamento

### Mudanças em `src/pages/ClienteDetail.tsx`

**1. Adicionar estado `obsSaved`** (junto aos outros estados, ~linha 35)

**2. Atualizar `handleObsChange`** para:
- Setar `obsSaved = false` ao iniciar
- Após o debounce, verificar `error` e setar `obsSaved = true` por 2 segundos

**3. Adicionar textarea com indicador "Salvo"** no sidebar, após a seção "Comp. outro escritório" (após linha 253):
- Label "Observações"
- `<textarea>` com value `cliente.observacoes`, onChange chamando handleObsChange
- Span "Salvo" com opacity transition baseado em `obsSaved`

### Arquivo modificado
1. `src/pages/ClienteDetail.tsx`

