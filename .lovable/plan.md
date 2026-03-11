

## Modernizar Tela de Login — Gráficos de fundo + Remover "do Varejo"

### Contexto visual da marca
O material da Focus FinTax usa gráficos 3D de barras/métricas em estilo "wireframe neon" azul sobre fundo escuro, posicionados atrás da logo como elemento decorativo. O efeito é de tecnologia financeira premium.

### Mudanças

1. **Remover "do Varejo"** — subtítulo fica apenas "Gestão Financeira e Tributária"

2. **Adicionar gráficos decorativos CSS** no painel esquerdo, posicionados atrás da logo, simulando o estilo wireframe/neon do material da marca:
   - Barras verticais em crescimento (usando divs com `border` em `primary-foreground/10`) posicionadas no quadrante superior direito
   - Uma linha curva ascendente (usando CSS `border` com `border-radius`) representando a seta de crescimento
   - Grid perspectiva sutil no fundo (usando `linear-gradient` repetido para criar linhas de grade)
   - Tudo em opacidade muito baixa (5-15%) para ficar discreto e clean atrás da logo

3. **Estrutura visual resultante:**

```text
┌──────────────────────────┬──────────────────────┐
│  ╱─grid perspectiva──╲   │                      │
│ │  ┃ ┃ ┃ ┃ ┃  ↗ seta │  │  Bem-vindo de volta  │
│ │  ┃ ┃ ┃ barras      │  │  credenciais...      │
│ │  ─────────────     │  │                      │
│     [LOGO h-44]         │  [email]              │
│  Gestão Financeira      │  [senha]              │
│  e Tributária           │  [Entrar]             │
│     ── separador ──      │  Esqueceu a senha?   │
└──────────────────────────┴──────────────────────┘
```

### Arquivo alterado
- **`src/pages/Login.tsx`** — remover "do Varejo", adicionar componente `BackgroundChart` com gráficos CSS decorativos (barras, linha ascendente, grid) posicionados em `absolute` com baixa opacidade

### Detalhes técnicos
- Gráficos feitos 100% em CSS (divs + borders + gradients), sem imagens externas
- Barras: 5-6 `div` com alturas crescentes, `border border-primary-foreground/10`, posicionadas `absolute top-[15%] right-[15%]`
- Linha ascendente: `div` com `border-b-2 border-primary-foreground/8` e `border-radius` para curva
- Grid: `background-image` com `repeating-linear-gradient` para linhas horizontais e verticais em perspectiva via `transform: perspective(500px) rotateX(60deg)`
- Opacidade geral do componente: 15-20% para manter discreto

