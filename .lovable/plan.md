

## Corrigir Tamanho da Logo na Sidebar Expandida

A logo está com `h-8` (32px) quando a sidebar abre — muito pequena para o espaço disponível de 250px.

### Mudança em `src/components/AppSidebar.tsx`
- Linha 43: Aumentar a logo de `h-8` para `h-12` (48px) quando expandida
- Aumentar a altura do container da logo de `h-16` para `h-20` para acomodar melhor

