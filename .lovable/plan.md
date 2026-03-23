

## Simplificar tela de login — remover painel lateral

### Mudancas em `src/pages/Login.tsx`

1. **Remover componentes decorativos**: Eliminar `Spotlight`, `BackgroundChart` e os imports de `logoWhite` (nao mais usados).

2. **Remover painel esquerdo** (linhas 117-136): Eliminar toda a div `lg:w-[55%]` com branding/charts.

3. **Centralizar formulario**: O layout passa de split (dois paineis) para tela cheia centralizada. A div principal vira `min-h-screen flex items-center justify-center bg-background`.

4. **Manter**: Logo (para todos os tamanhos), formulario de email/senha, botao entrar, link "Esqueceu a senha?", e o modo de recuperacao de senha.

### Resultado
Tela limpa e centralizada, apenas com o logo e o formulario de acesso, sem divisoria nem painel decorativo.

