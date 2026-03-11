

## Aumentar Visibilidade dos Gráficos Decorativos

As opacidades atuais estão extremamente baixas (6-12%), tornando os elementos praticamente invisíveis. Vou aumentar significativamente para ficarem visíveis mas ainda discretos.

### Mudanças em `src/pages/Login.tsx` — componente `BackgroundChart`

| Elemento | Opacidade atual | Nova opacidade |
|----------|----------------|----------------|
| Grid perspectiva | `0.06` | `0.18` |
| Barras do gráfico | `0.12` + `border-primary-foreground/30` + `bg-primary-foreground/5` | `0.35` + `border-primary-foreground/50` + `bg-primary-foreground/15` |
| Linha ascendente (SVG) | `0.10` + `strokeWidth="2"` | `0.30` + `strokeWidth="2.5"` |
| Círculos flutuantes | `0.10` / `0.12` | `0.25` / `0.28` |
| Linhas horizontais | `0.07` | `0.20` |

Também aumentar os valores internos dos gradientes das linhas horizontais (`from-primary-foreground/40` → `from-primary-foreground/60`).

