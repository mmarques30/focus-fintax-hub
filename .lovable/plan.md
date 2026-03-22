

## Corrigir CTAs inline que herdaram estilo da secao CTA final

### Problema
A classe `.section-cta` e usada tanto nos botoes inline (linhas 483, 522, 601) quanto na secao CTA final (linha 644). O CSS da linha 269 aplica `padding:120px`, background navy e glow radial a TODOS os `.section-cta` — por isso os botoes inline viraram "caixas enormes".

### Correcao em `public/lp.html`

**1. Renomear a classe dos CTAs inline**
- Linhas 483, 522, 601: trocar `class="section-cta"` por `class="inline-cta"`

**2. Ajustar CSS (linha 64-65)**
- Renomear `.section-cta` para `.inline-cta` nas regras inline do topo:
  ```css
  .inline-cta{text-align:center;padding:32px 0 0}
  .inline-cta .btn-diag{font-size:15px;padding:14px 32px}
  ```

Isso separa os botoes simples da secao CTA final, que mantem seu estilo dark com glow.

