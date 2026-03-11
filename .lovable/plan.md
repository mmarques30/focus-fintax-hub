

## Modernizar a Tela de Login

O objetivo é transformar a tela de login atual (layout split rígido com card quadrado) em algo mais moderno e visualmente impactante, inspirado no componente Spline Scene do 21st.dev.

### O que muda

1. **Layout full-screen com fundo escuro (primary)** no painel esquerdo, usando efeito de spotlight/glow animado em vez de blobs estáticos
2. **Card de login com glassmorphism** — bordas arredondadas maiores (`rounded-2xl`), fundo semi-transparente com `backdrop-blur`, sombras suaves
3. **Efeito de spotlight** — componente `Spotlight` customizado com gradiente radial animado no painel de branding
4. **Texto com gradiente** no título do painel esquerdo (branco para azul claro)
5. **Inputs modernizados** — bordas mais suaves, foco com glow sutil, transições mais fluidas
6. **Botão principal com gradiente** e hover animado
7. **Cards de features** no painel esquerdo com glassmorphism (bg semi-transparente + blur)
8. **Animações de entrada** — fade-in + slide-up nos elementos do formulário

### Arquivos alterados

- `src/pages/Login.tsx` — Redesign completo do layout e estilos
- `src/index.css` — Adicionar keyframes de animação (fade-in, glow pulse)

### Abordagem técnica

- Tudo feito com Tailwind CSS puro (sem dependência externa como Spline)
- Spotlight simulado com `div` posicionado absolutamente + gradiente radial + animação CSS
- Glassmorphism via `bg-white/5 backdrop-blur-xl border border-white/10`
- Inputs com classes customizadas para o tema escuro no painel, tema claro no form
- Manter toda a lógica de autenticação existente (login, signup, forgot) intacta

