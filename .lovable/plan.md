

## Aprovação por exceção no pipeline

### Arquivo alterado
`src/components/pipeline/LeadSidePanel.tsx`

### Plano

**1. Novo estado**
- `showException` (boolean) — mostra form inline de exceção
- `exceptionReason` (string) — motivo digitado
- `exceptionSaving` (boolean) — loading

**2. Footer — botão condicional**
Quando `lead.status_funil === "contrato_emitido"`, adicionar entre os botões existentes um botão amber:
```
<Button variant="outline" className="flex-1 border-amber-400 text-amber-700 hover:bg-amber-50">
  <AlertTriangle /> Aprovar por exceção
</Button>
```
Ao clicar, seta `showException = true` e exibe inline (acima do footer) um form com:
- Textarea obrigatória "Motivo da aprovação por exceção"
- Botões "Cancelar" e "Confirmar" (amber)

**3. Lógica ao confirmar**
- Inserir em `clientes` (mesma lógica do `ConvertClientModal.handleConvert`)
- Atualizar lead `status_funil = "cliente_ativo"`
- Inserir `lead_historico` com `anotacao = "⚠ EXCEÇÃO: {motivo}"`
- Toast, refresh, close

**4. Histórico tab — ícone amber para exceções**
No render de cada `HistoricoEntry`, verificar se `h.anotacao?.startsWith("⚠ EXCEÇÃO:")`. Se sim:
- Trocar o dot azul por `AlertTriangle` amber (h-3 w-3 text-amber-500)
- Mostrar anotação com `text-amber-700` em vez de muted

**5. Import adicional**
- `AlertTriangle` de lucide-react (já importado? Verificar — não está no import atual, adicionar)

