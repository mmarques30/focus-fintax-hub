

## FIX 2 — Resumo Financeiro Redesign + FIX 3 — Remove Emojis

### FIX 2 — Resumo Financeiro Complete Redesign

**Current state**: `ResumoFinanceiroTab.tsx` is a simple component (80 lines) with 4 KPI cards and a basic bar chart. It fetches its own data via `clienteId` prop. The DB column for honorários is `valor_nf_servico` (not `valor_nfse` as in the user's pseudocode).

**Changes to `src/components/clientes/ResumoFinanceiroTab.tsx`** — full rewrite:

1. **KPI Strip** — 5 cards in a responsive grid (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`):
   - Total Identificado, Total Compensado, Honorários Focus, Economia Líquida, Saldo Restante
   - Each with colored number using the dashboard design system (`font-display text-[26px] font-bold`)

2. **Progress Section** — `card-base` with:
   - Progress bar showing `pctUtilizado` (compensado / identificado)
   - Dynamic bar color: green >80%, navy >40%, amber otherwise
   - Stats: percentage + taxa de honorários

3. **Monthly Chart** — dual-bar Recharts (`compensado` + `honorarios`) with legend, using `valor_nf_servico` column
   - Empty state via `EmptyState` component when no data

4. **Compensações Table** — full table with columns: Competência, Tese, Tributo, Valor compensado, Honorários, Economia, Status
   - Footer row with totals
   - Status badges (Pago/Pendente)

5. **Print Support**:
   - Print header (hidden on screen): "Resumo Financeiro — Focus FinTax", empresa, CNPJ, date
   - Print footer: "Focus FinTax · Grupo Focus"
   - Export PDF button calling `window.print()`

6. **Data**: Keep current fetch pattern (fetches processos + compensacoes by `clienteId`). Honorários = `valor_nf_servico`. Economia = compensado - honorários.

**Changes to `src/index.css`** — add print styles:
```css
@media print {
  /* existing print rules stay */
  /* add: */
  [data-sidebar], .app-header, nav { display: none !important; }
  .main-content { padding: 0 !important; margin: 0 !important; }
  .card-base { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
}
```

---

### FIX 3 — Remove All Emojis

**Files with emojis to replace:**

1. **`src/components/dashboard/comercial/QualidadeCarteira.tsx`** (lines 15-18)
   - Replace `emoji: "🔴"` etc. with colored CSS dots: `<span className="w-2 h-2 rounded-full" style={{ background: color }} />`
   - Colors: A=`#c8001e`, B=`#b45309`, C=`#ca8a04`, D=`rgba(15,17,23,0.25)`

2. **`src/components/dashboard/operacional/UrgencyClients.tsx`** (line 16)
   - Replace `🎯` with a Lucide `Target` icon (`<Target className="w-3.5 h-3.5 text-dash-red" />`)

3. **`src/components/dashboard/operacional/DistribuicaoSaldo.tsx`** (line 44)
   - Replace `⚠ Atenção estratégica` with `<AlertTriangle className="w-3 h-3 text-dash-red inline" /> Atenção estratégica`

4. **`src/pages/LeadForm.tsx`** (line 157)
   - Replace `⚠ O regime...` with `<AlertTriangle /> O regime...` icon

5. **`src/pages/Diagnostico.tsx`** (line 594)
   - Replace `⚠` div with `<AlertTriangle />` or an SVG equivalent

6. **`src/components/pipeline/LeadSidePanel.tsx`** (lines 121, 260) and **`src/pages/Pipeline.tsx`** (line 58)
   - These use `⚠ EXCEÇÃO:` as a data marker in `anotacao` field — **keep as-is** since it's stored data, not UI display. Changing it would break existing records.

### Files modified
1. `src/components/clientes/ResumoFinanceiroTab.tsx` — full rewrite
2. `src/index.css` — add print styles
3. `src/components/dashboard/comercial/QualidadeCarteira.tsx` — colored dots
4. `src/components/dashboard/operacional/UrgencyClients.tsx` — Lucide icon
5. `src/components/dashboard/operacional/DistribuicaoSaldo.tsx` — Lucide icon
6. `src/pages/LeadForm.tsx` — Lucide icon
7. `src/pages/Diagnostico.tsx` — SVG/Lucide icon

