

## Aprimorar Motor de Cálculo — `/configuracoes/motor`

### Contexto
A página já existe com simulador, tabela e modal. O prompt pede melhorias visuais e funcionais específicas.

### Mudanças no `src/pages/MotorConfig.tsx` (rewrite)

**1. Simulador ao vivo — visual premium**
- Card com fundo azul escuro (`bg-[#0a1a6e]` text-white) em vez do card neutro atual
- Adicionar linha "equivale a X,X faturamentos mensais" abaixo dos valores
- Selects de segmento e regime dentro do card (já existem, mover para dentro do card escuro)

**2. Tabela — edição inline + chips clicáveis**
- Campos `% Mín` e `% Máx` editáveis inline diretamente na tabela (Input no lugar do texto)
- Nome de exibição editável inline ao clicar
- Chips de regimes/segmentos clicáveis na própria tabela (toggle on/off ao clicar)
- Auto-save ao `onBlur` com `atualizado_em` e `atualizado_por` (uid do usuário logado)
- Toggle ativo já existe, manter

**3. Painel de cobertura (novo)**
- Grid 5×3 (segmentos × regimes) abaixo da tabela
- Célula verde com contador de teses, vermelha com alerta se zero
- Tooltip ao hover listando teses que cobrem aquela combinação
- Substituir o alert textual atual por este grid visual

**4. Subtítulo expandido**
- Atualizar texto do subtítulo conforme especificado no prompt

### Arquivos alterados
1. `src/pages/MotorConfig.tsx` — rewrite com melhorias acima

### Fora de escopo (já existem)
- Rota `/configuracoes/motor` já configurada em App.tsx
- Item "Motor de Cálculo" já na sidebar com roles corretas
- Modal de criação/edição já funcional
- Histórico de alterações (drawer) será omitido — requer nova tabela de audit log que não está no schema atual

