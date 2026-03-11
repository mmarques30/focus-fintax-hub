

## Aumentar o tamanho da logo na tela de login

Alteração simples em `src/pages/Login.tsx`:

- **Linha 87:** Trocar `className="h-14"` por `className="h-20"` na tag `<img>` da logo branca no painel esquerdo
- **Linha 133:** Verificar também a logo mobile e aumentar de `h-10` para `h-14` se necessário

Isso aumenta a logo de 56px para 80px de altura no painel de branding, mantendo proporções via `object-contain`.

