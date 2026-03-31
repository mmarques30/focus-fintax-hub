

## IMPROVEMENT 5 — Indicador de Saúde por Cliente

### Mudanças em `src/pages/ClientesList.tsx`

**1. Adicionar coluna "Saúde" no header** (após "Saldo", antes de "Alerta" — linha 197)
- Nova `<TableHead>Saúde</TableHead>`

**2. Função `getClienteHealth`** — calcular saúde com base nos dados já disponíveis em cada row (`totalCredito`, `totalCompensado`, `saldo`):
- `saldo <= 0` → `amarelo` (zerado, precisa nova tese)
- `totalCredito > 0 && (totalCompensado / totalCredito) < 0.05` → `vermelho` (mal começou)
- Senão → `verde` (compensando ativamente)

**3. Renderizar dot colorido com tooltip** (nova `<TableCell>` após saldo, linha ~216):
- Dot `w-2.5 h-2.5 rounded-full` com cores do design system (`dash-green`, `dash-amber`, `dash-red`)
- `title` attribute com descrição textual

**4. Atualizar `colSpan`** nas linhas de loading/empty (203-205) de 10/9 para 11/10.

### Arquivo modificado
1. `src/pages/ClientesList.tsx`

