

## Modernizar a Tela de Login (Tela de Início)

Baseado no material de marca da Focus FinTax, a tela de login será simplificada e refinada.

### Problemas atuais
- Muito texto e cards de features no painel esquerdo competem com a logo
- Cores contrastantes (vermelho nos ícones + branco + gradientes) criam ruído visual
- Logo não tem destaque suficiente — está competindo com o título e os cards

### Mudanças propostas

1. **Remover os cards de features** do painel esquerdo — simplificar para logo centralizada + tagline sutil
2. **Logo maior e centralizada** como elemento dominante do painel esquerdo
3. **Paleta mais coesa** — remover vermelho dos destaques, usar tons de branco/azul claro apenas
4. **Tagline simplificada** — "Gestão Financeira e Tributária do Varejo" (alinhado com a marca), sem título "Inteligente" em vermelho
5. **Spotlight mais sutil** — reduzir intensidade dos glows para não competir com a logo
6. **Formulário mantido** como está (já está clean), apenas ajustar o gradiente do botão para tom mais sóbrio

### Estrutura visual

```text
┌──────────────────────┬──────────────────────┐
│                      │                      │
│    (spotlight sutil)  │                      │
│                      │   Bem-vindo de volta  │
│     [LOGO GRANDE]    │   Entre com suas...  │
│                      │                      │
│   Gestão Financeira  │   [email]            │
│   e Tributária do    │   [senha]            │
│   Varejo             │   [Entrar]           │
│                      │   Esqueceu a senha?  │
│                      │                      │
└──────────────────────┴──────────────────────┘
```

### Arquivo alterado

- **`src/pages/Login.tsx`** — remover array `features`, remover cards, aumentar logo para `h-28`, centralizar verticalmente, simplificar textos, ajustar cores para paleta monocromática azul/branco

