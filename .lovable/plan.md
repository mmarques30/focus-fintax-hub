

## Modernizar Landing Page — Inspiracao Behance + Branding Focus FinTax

### O que muda (sem alterar copy)

**1. Remover top bar de email/telefone**
- Eliminar a div `.top-bar` com email e telefone (linhas 310-321)
- Contato fica apenas no footer e CTA WhatsApp

**2. Modernizar o header/nav**
- Fundo escuro navy (#010f69) ao inves de branco translucido
- Logo branco com "Tax" em vermelho (como no branding)
- Links de navegacao em branco com hover sutil
- Botao CTA "Diagnostico gratuito" com estilo pill vermelho
- Sem barra divisoria acima do menu

**3. Hero section — estilo dark imersivo (referencia Behance)**
- Background escuro navy com gradiente sutil e efeitos de luz (glow radial azul/vermelho)
- Grid pattern sutil no fundo (como ja tem nas secoes dark, mas mais refinado)
- Textos em branco, highlights em vermelho
- Form card mantido mas com estilo glassmorphism (fundo semi-transparente, borda luminosa sutil, backdrop-blur)
- Stats com visual mais impactante — numeros grandes brancos sobre cards translucidos

**4. Secoes intermediarias — fluidez visual**
- Transicoes entre secoes mais suaves (sem cortes bruscos de cor)
- Secao "Para quem" — cards com hover mais dramatico, icones em circulos com glow
- Secao "Oportunidades" — manter dark, adicionar linhas de grid animadas sutis
- Secao "Processo" — steps com visual mais conectado, linha de progresso mais visivel
- Secao "Plataforma" — numeros com efeito gradient mais pronunciado

**5. Secao Alcir — modernizar**
- Manter layout, melhorar tratamento da foto (borda com glow vermelho sutil)
- Tags com estilo mais moderno (glass effect)

**6. Secao Casos, Seguranca, CTA — refinamentos**
- Cards de casos com gradiente de borda sutil
- Tabela comparativa com visual mais clean
- CTA final com efeito de glow radial mais intenso

**7. Footer — simplificar**
- Manter conteudo, visual mais limpo e moderno

### Detalhes tecnicos

- Arquivo alterado: `public/lp.html` (unico arquivo)
- Font: manter Inter (ja em uso) — compativel com Montserrat da marca
- Cores: navy #010f69 como primario dark, #c73737 como accent, brancos e cinzas para texto
- Adicionar efeitos CSS: `backdrop-filter`, gradientes radiais, animacoes de glow sutis, grid patterns
- Toda a copy permanece identica — apenas CSS e estrutura HTML do top-bar/header mudam
- Formulario e script JS permanecem identicos
- Responsivo mantido

### Ordem de execucao
1. Remover top-bar
2. Reescrever CSS do header (dark nav)
3. Reescrever CSS do hero (dark imersivo + glassmorphism form)
4. Atualizar CSS das demais secoes (transicoes, efeitos modernos)
5. Ajustar footer

