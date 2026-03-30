

## Refinamento de Papeis por Nivel de Acesso

### Resumo
Implementar controle granular de acesso por role (comercial, gestor_tributario) no frontend: sidebar com lock icons, restrições de edição no pipeline, bloqueio de acesso a /clientes/:id para comercial, e pipeline read-only para gestor_tributario.

### Arquivos alterados

**1. `src/lib/role-permissions.ts`** (novo)
Centralizar permissões num único arquivo:
```
EDITABLE_STAGES_COMERCIAL = ["qualificado", "levantamento_teses", "em_apresentacao", "contrato_emitido"]

canEditLead(role, stage) — comercial só edita nos stages acima; admin/pmo sempre
canAccessRoute(role, path) — mapa de acesso por role
isReadOnly(role, path) — true se o role pode ver mas não editar
```

**2. `src/components/AppSidebar.tsx`**
- Adicionar campo `readOnlyRoles` ao `MenuItem` interface
- Clientes: visível para comercial como read-only (adicionar `readOnlyRoles: ["comercial"]`)
- Pipeline: visível para gestor_tributario como read-only (adicionar `readOnlyRoles: ["gestor_tributario"]`)
- Itens read-only mostram um `Lock` icon (lucide) ao lado do título (pequeno, opacity 60%)
- Itens sem acesso continuam ocultos (benchmarks, motor, usuarios para comercial/gestor)

Mapa final de visibilidade:
| Menu | admin | comercial | gestor_tributario | pmo |
|------|-------|-----------|-------------------|-----|
| Dashboard | full | full | full | full |
| Pipeline | full | full | read-only + lock | full |
| Clientes | full | read-only + lock | full | full |
| Benchmarks | full | hidden | hidden | hidden |
| Motor | full | hidden | hidden | full |
| Usuarios | full | hidden | hidden | full |

**3. `src/components/pipeline/PipelineKanban.tsx`**
- Receber `userRole` prop
- Comercial: desabilitar drag para stages fora de `EDITABLE_STAGES_COMERCIAL`; cards em `cliente_ativo` ficam sem drag handle
- Gestor_tributario: desabilitar todo drag (read-only)
- Cards `cliente_ativo` para comercial: adicionar `Tooltip` "Gerenciado pelo time operacional" com cursor-default

**4. `src/components/pipeline/LeadSidePanel.tsx`**
- Importar `useAuth` (já importa) e usar `userRole`
- Comercial: ocultar botões "Converter", "Exceção", "Perdido" em stages fora dos editáveis
- Comercial em `cliente_ativo`: todo o painel fica read-only (sem textarea editável, sem select de etapa, sem botões de ação)
- Gestor_tributario: todo o painel read-only (sem botões, textarea disabled, select disabled)

**5. `src/pages/Pipeline.tsx`**
- Passar `userRole` para `PipelineKanban`
- Gestor_tributario: ocultar botão "Novo lead"
- Comercial: ocultar botão "Novo lead" se necessário (confirmar — o user disse "can edit leads in stages", implica que pode criar)

**6. `src/pages/ClienteDetail.tsx`**
- Adicionar guard: se `userRole === "comercial"`, redirecionar para `/clientes` com toast "Acesso restrito"
- Alternativa: renderizar read-only (sem botões de ação), mas o user disse "cannot access detail pages" → redirect

**7. `src/pages/ClientesList.tsx`**
- Comercial: ocultar botão "Cadastrar cliente" e "Relatório da Carteira"
- Links para `/clientes/:id` para comercial: não navegar, mostrar tooltip "Acesso restrito ao time operacional"

### Detalhes Técnicos
- Toda lógica de permissão concentrada em `role-permissions.ts` para manutenibilidade
- Sem alterações no banco — controle apenas no frontend (RLS já protege no backend)
- `useAuth().userRole` já disponível em todos os componentes necessários
- Import `Lock` de lucide-react no sidebar
- Import `Tooltip` components para cards read-only no kanban

