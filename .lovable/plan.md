

## Remover faixa azul do Dashboard e redesenhar header

### Problema
A faixa navy (`bg-[#0a1564] h-16`) no topo do dashboard duplica visualmente o header da aplicação (AppHeader), criando uma barra azul estranha.

### Mudança

**`src/pages/Dashboard.tsx`** (linhas 287-305)

Substituir o bloco `div.bg-[#0a1564]` por um header limpo em fundo branco, integrado ao layout:

- Greeting + data: texto em `text-gray-900` (bold) e `text-gray-500` (data), alinhados à esquerda
- Role badge + horário: pills com borda cinza clara (`border border-gray-200`), texto navy, alinhados à direita
- Fundo: `bg-white` com `border-b border-gray-200`, mesma altura (`h-16`)
- Remove o contraste navy que conflita com o AppHeader acima

Resultado: header clean em branco que não compete com a sidebar/header do app.

