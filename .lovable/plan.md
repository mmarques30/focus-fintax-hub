

## Sidebar Estilo Aceternity — Expande ao Hover

### Conceito
Replicar o layout da sidebar Aceternity: fina com apenas ícones no estado padrão, expande suavemente ao passar o mouse mostrando labels. Perfil do usuário fixo no rodapé. Visual clean e moderno.

### Mudanças

1. **`src/components/AppSidebar.tsx`** — Reescrever completamente:
   - Sidebar custom (não usar o shadcn sidebar) com estado `open` controlado por `onMouseEnter`/`onMouseLeave`
   - Largura collapsed: `w-[60px]`, expanded: `w-[250px]` com `transition-all duration-300`
   - Logo: ícone "F" quando collapsed, logo completa quando expanded
   - Links: ícone sempre visível, label aparece com `opacity` transition quando expanded
   - Rodapé: avatar do usuário + nome (quando expanded) + botão logout
   - Background escuro (usando as variáveis `--sidebar-*` existentes)

2. **`src/components/AppLayout.tsx`** — Ajustar layout:
   - Remover `SidebarProvider` do shadcn (sidebar agora é custom)
   - Content area com `rounded-tl-2xl` e background claro, similar ao Aceternity

3. **`src/components/AppHeader.tsx`** — Simplificar:
   - Remover `SidebarTrigger` (sidebar agora expande por hover)
   - Manter notificação e info do usuário

### Estrutura visual

```text
Collapsed:              Expanded (hover):
┌──┬──────────────┐    ┌─────────┬──────────────┐
│🏠│              │    │🏠 Dashboard             │
│🏢│  Content     │    │🏢 Empresas   Content    │
│📄│  (rounded    │    │📄 Obrigações (rounded   │
│💰│   top-left)  │    │💰 Fiscal      top-left) │
│📊│              │    │📊 Relatórios            │
│👤│              │    │👤 Usuários              │
│⚙️│              │    │⚙️ Config                │
│──│              │    │─────────│              │
│🔵│              │    │🔵 Nome  │              │
└──┴──────────────┘    └─────────┴──────────────┘
```

### Arquivos alterados
- `src/components/AppSidebar.tsx` — sidebar custom com hover expand
- `src/components/AppLayout.tsx` — remover SidebarProvider, ajustar layout
- `src/components/AppHeader.tsx` — remover SidebarTrigger

