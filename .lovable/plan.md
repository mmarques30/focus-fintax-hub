

## Ajustar tela de Login

### Mudanças

1. **Remover modo "signup"** — o state `mode` passa a ser `"login" | "forgot"` apenas. Remover `handleSignup`, remover opção "Cadastre-se".

2. **Mover "Esqueceu a senha?"** para depois do botão "Entrar" (abaixo do `<Button>`), centralizado.

3. **No modo "forgot"**, manter link "Voltar ao login" abaixo.

### Arquivo alterado

- `src/pages/Login.tsx`

