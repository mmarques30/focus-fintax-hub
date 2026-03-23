

## Adicionar botao "Focus" no header da landing page

### Mudanca em `public/lp.html`

**Linha 348 (apos o link "Sobre")**: Adicionar um botao/link estilizado "Focus" que aponta para `/auth`.

```html
<a href="/auth" style="background:#fff;color:#010f69;padding:8px 20px;border-radius:6px;font-weight:700;font-size:14px;text-decoration:none;margin-left:8px">Focus</a>
```

O botao tera fundo branco com texto na cor da marca, destacando-se dos links de navegacao. Ao clicar, o usuario sera direcionado para a pagina de login (`/auth`) onde fara autenticacao com email e senha.

