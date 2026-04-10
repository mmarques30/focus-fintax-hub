

## Plano — Alerta de Intimações no Dashboard Operacional

### Abordagem
Buscar contagens de intimações pendentes e vencendo no `Dashboard.tsx` (junto com os dados operacionais) e passar como props para `OperationalView`, que renderiza a faixa de alerta entre o KPI strip e o restante do conteúdo.

### Alterações

**1. `src/pages/Dashboard.tsx`**
- Adicionar estado: `intimacoesPendentes` e `intimacoesVencendo`
- No `fetchData`, após dados operacionais, buscar da tabela `intimacoes`:
  - Pendentes: status IN (pendente, informado_aline, em_andamento)
  - Vencendo em 15 dias: prazo_vencimento <= hoje+15 e status não concluído/cancelado
- Passar as duas contagens como props para `OperationalView`

**2. `src/components/dashboard/operacional/OperationalView.tsx`**
- Adicionar props `intimacoesPendentes` e `intimacoesVencendo`
- Renderizar a faixa de alerta (conforme JSX especificado) entre o KPI strip e o bloco de loading/conteúdo, usando `Link` do react-router em vez de `<a>`

### Arquivos modificados
| Arquivo | Ação |
|---------|------|
| `src/pages/Dashboard.tsx` | Editar (fetch + estado + props) |
| `src/components/dashboard/operacional/OperationalView.tsx` | Editar (props + render alerta) |

