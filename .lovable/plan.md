

## Instalar Google Tag de conversão na landing page

### Mudança em `public/lp.html`

Adicionar o script do Google Tag (gtag.js) no `<head>` do arquivo, antes do fechamento `</head>`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18023300272"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-18023300272');
</script>
```

Também adicionar no `index.html` (pois a rota `/` é servida pelo React que carrega o `lp.html` via fetch, e scripts injetados via innerHTML nem sempre executam corretamente). Colocar no `<head>` do `index.html` garante que o gtag carregue em todas as páginas.

### Arquivos alterados
1. `index.html` — adicionar gtag no `<head>`
2. `public/lp.html` — adicionar gtag no `<head>`

