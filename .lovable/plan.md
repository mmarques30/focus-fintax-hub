

## PART 3 — Visual Consistency Fixes

### Summary
Standardize KPI strips, page headers, and table hover states across all pages to match the dashboard design system.

### 1. Table hover state — `src/components/ui/table.tsx` (line 37)

Change `TableRow` default hover from `hover:bg-muted/50` to `hover:bg-[rgba(10,21,100,0.03)]`.

### 2. Pipeline KPI strip — `src/pages/Pipeline.tsx` (lines 149-188)

Replace the 4 separate `<Card>` KPI cards with a single dashboard-style KPI strip:
```
<div className="bg-white border border-[rgba(10,21,100,0.10)] rounded-[10px] grid grid-cols-4 overflow-hidden">
  <KpiBox label="Leads ativos" value={...} sub="excluindo perdidos" />
  <KpiBox label="Novos hoje" value={...} sub="captados hoje" />
  <KpiBox label="Potencial total" value={...} sub="soma do potencial máx." colorClass="green" />
  <KpiBox label="Sem contato >1d" value={...} sub="leads parados" colorClass="red" last />
</div>
```
Import `KpiBox` and `compactCurrency` from `@/components/dashboard/dashboard-utils`. Remove `Card/CardContent` imports and icon imports (`Users, TrendingUp, AlertTriangle, Sparkles`) if no longer used.

### 3. Pipeline header — `src/pages/Pipeline.tsx` (lines 116-121)

Replace:
```
<h1 className="text-2xl font-bold text-foreground">Pipeline de Leads ...</h1>
```
With:
```
<h1 className="font-display text-xl font-bold text-navy">Pipeline de Leads</h1>
<p className="text-xs text-muted-foreground uppercase tracking-widest">gerenciamento de leads e oportunidades</p>
```

### 4. ClientesList header — `src/pages/ClientesList.tsx` (lines 111-127)

Replace the Building2 icon + h1 + Badge pattern with:
```
<div>
  <h1 className="font-display text-xl font-bold text-navy">Clientes Ativos</h1>
  <p className="text-xs text-muted-foreground uppercase tracking-widest">carteira de clientes e compensações</p>
</div>
```
Keep action buttons right-aligned.

### 5. ClientesList KPI strip — `src/pages/ClientesList.tsx` (lines 130-136)

Replace 5 separate `<Card>` components with a single dashboard-style strip:
```
<div className="bg-white border border-[rgba(10,21,100,0.10)] rounded-[10px] grid grid-cols-5 overflow-hidden">
  <KpiBox label="Total clientes" value={...} sub="cadastrados" />
  <KpiBox label="Compensando Fintax" value={...} sub="clientes ativos" />
  <KpiBox label="Crédito identificado" value={...} sub="total identificado" colorClass="red" />
  <KpiBox label="Já compensado" value={...} sub="realizado" colorClass="green" />
  <KpiBox label="Saldo restante" value={...} sub="disponível" colorClass="red" last />
</div>
```

### 6. UserManagement header — `src/pages/UserManagement.tsx` (lines 236-240)

Replace:
```
<h1 className="text-2xl font-bold text-foreground">Gestão de Usuários</h1>
<p className="text-body-text text-sm mt-1">...</p>
```
With:
```
<h1 className="font-display text-xl font-bold text-navy">Gestão de Usuários</h1>
<p className="text-xs text-muted-foreground uppercase tracking-widest">permissões e acessos do sistema</p>
```
Also update the non-admin view header (line 222).

### 7. Benchmarks header — `src/pages/Benchmarks.tsx` (lines 143-146)

Replace with:
```
<h1 className="font-display text-xl font-bold text-navy">Benchmarks de Teses</h1>
<p className="text-xs text-muted-foreground uppercase tracking-widest">percentuais históricos para estimativas</p>
```
Also update non-admin view (line 130).

### 8. MotorConfig header — `src/pages/MotorConfig.tsx` (lines 269-274)

Replace with:
```
<h1 className="font-display text-xl font-bold text-navy">Motor de Cálculo</h1>
<p className="text-xs text-muted-foreground uppercase tracking-widest">teses, percentuais e cobertura por perfil</p>
```

### Files modified
1. `src/components/ui/table.tsx` — hover state
2. `src/pages/Pipeline.tsx` — KPI strip + header
3. `src/pages/ClientesList.tsx` — KPI strip + header
4. `src/pages/UserManagement.tsx` — header
5. `src/pages/Benchmarks.tsx` — header
6. `src/pages/MotorConfig.tsx` — header

### Preserved
- All data logic, queries, state — untouched
- Functional behavior — identical
- Only visual/structural changes to match dashboard design system

