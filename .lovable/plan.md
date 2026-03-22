

## Corrigir foto do Alcir — imagem não carrega + corte inferior

### Problemas
1. **Alt text aparecendo**: a imagem `/images/foto-alcir.png` não está carregando corretamente, exibindo o texto alternativo no lugar
2. **Corte na parte inferior**: o CSS `aspect-ratio:3/4` + `object-fit:cover` recorta a foto; a foto real pode ter proporção diferente

### Correções em `public/lp.html`

**1. Verificar/recriar o arquivo de imagem**
- O arquivo existe em `public/images/foto-alcir.png` mas pode estar corrompido ou com formato incorreto
- Recriar a partir do upload original `user-uploads://foto_alcir.png`

**2. Ajustar CSS da `.alcir-photo img` (linha 219)**
- Remover `aspect-ratio:3/4` para não forçar corte
- Manter `object-fit:cover` mas com `object-position:top center` para priorizar o rosto
- Adicionar `max-height:480px` para limitar sem cortar bruscamente
- Garantir integração visual com a dobra: adicionar um gradiente no bottom da foto que se funde com o background navy (`mask-image: linear-gradient(to bottom, black 80%, transparent 100%)`)

**3. Integração com a dobra**
- Aplicar `mask-image` CSS na imagem para que a parte inferior se dissolva no fundo navy, eliminando o corte abrupto
- Remover borda dura e deixar a foto "fluir" para o background

