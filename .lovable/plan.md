

## Pipeline Kanban — Cards mais compactos

### Arquivo alterado
`src/components/pipeline/PipelineKanban.tsx` — rewrite do `LeadCard` e ajuste no column header

### Mudanças

**1. LeadCard compacto (max ~90px)**
- Padding reduzido: `p-2` em vez de `p-3`
- Remover `mt-2` entre seções, usar `mt-1`
- Linha 1: empresa (bold, `text-xs`, truncate, flex-1) + score badge (mesmo estilo atual)
- Linha 2: segmento chip (`text-[10px]`) + score na mesma linha + se exceção → `AlertTriangle` amber h-3 w-3
- Linha 3: potencial value left (green se >= 500k, `text-muted-foreground` se abaixo) + `· Xd` right em gray `text-[10px]`
- Manter border-left para leads novos stale

**2. Detecção de exceção**
- Adicionar prop `exceptionLeadIds: Set<string>` ao `PipelineKanban`
- No `Pipeline.tsx`: fetch `lead_historico` onde `anotacao LIKE '⚠ EXCEÇÃO:%'`, extrair `lead_id`s únicos, passar como prop
- No `LeadCard`: receber `isException` boolean, mostrar `AlertTriangle` amber h-3 w-3 ao lado do score badge

**3. Column header**
- Stage name left (já existe), count badge right (já existe)
- Potencial total em `text-[10px] text-[#0a1564] font-medium` abaixo do nome (já existe mas mudar cor para navy)

### Arquivos alterados
1. `src/pages/Pipeline.tsx` — fetch exception lead IDs, passar prop
2. `src/components/pipeline/PipelineKanban.tsx` — redesign LeadCard + accept exceptionLeadIds prop

