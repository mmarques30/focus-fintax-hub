

## Plano — Badge de Intimações no sidebar do ClienteDetail

### O que será feito
Adicionar um badge de alerta no sidebar do detalhe do cliente mostrando quantas intimações pendentes existem vinculadas a esse cliente (por `cliente_id` ou por `empresa_nome`).

### Correção inclusa
- Linha 286: remover o label duplicado "Comp. outro escritório" (bug visual já mapeado)

### Alterações em `src/pages/ClienteDetail.tsx`

1. **Adicionar query de intimações** — após o fetch do cliente, buscar intimações com `.or(`cliente_id.eq.${id},empresa_nome.ilike.${cliente.empresa}`)` e contar as pendentes (status in pendente, informado_aline, em_andamento)

2. **Renderizar badge** — entre o botão "Importar dados Laratex" (linha 269) e o bloco de dados (linha 271), inserir o componente de alerta vermelho com link para `/intimacoes`, conforme especificado

3. **Remover label duplicado** — deletar a linha 286 (`<span>Comp. outro escritório:</span>` duplicada)

### Arquivos modificados
| Arquivo | Ação |
|---------|------|
| `src/pages/ClienteDetail.tsx` | Editar (add intimações query + badge + fix label duplicado) |

