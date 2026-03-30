import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { MonthBar, compactCurrency, fullCurrency, fontMono, fontCondensed } from "../dashboard-utils";

interface Props {
  monthlyBars: MonthBar[];
  avgMensal: number;
  nextMonthLabel: string;
  periodLabel: string;
  trendPct: number;
  taxaHon: number;
  insightVar: string;
  insightVarLabel: string;
}

export function ChartEvolucao({ monthlyBars, avgMensal, nextMonthLabel, periodLabel, trendPct, taxaHon, insightVar, insightVarLabel }: Props) {
  return (
    <div style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ padding: "12px 18px 10px", borderBottom: "1px solid var(--dash-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "var(--navy)" }}>Evolução mensal — compensações realizadas</div>
          <div style={{ fontSize: 11, color: "var(--ink-35)", marginTop: 2 }}>receita da Focus FinTax vs economia bruta dos clientes</div>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", background: "var(--navy-10)", borderRadius: 5, padding: "2px 8px", fontSize: 10, fontWeight: 600, color: "var(--navy)", ...fontMono }}>{periodLabel}</span>
      </div>

      {monthlyBars.length === 0 ? (
        <div style={{ padding: "40px 18px", textAlign: "center", fontSize: 12, color: "var(--ink-35)" }}>Nenhuma compensação registrada.</div>
      ) : (
        <>
          <div style={{ padding: "10px 18px 0", height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...monthlyBars, { month: "proj", label: nextMonthLabel, valor: avgMensal, honorarios: 0, isProjection: true }]} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ink-12)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--ink-35)", fontFamily: "'DM Mono', monospace", fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--ink-35)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => compactCurrency(v)} width={60} />
                <RechartsTooltip formatter={(v: number) => fullCurrency(v)} />
                <Bar dataKey="valor" name="Compensado" fill="var(--navy)" radius={[3, 3, 0, 0]} maxBarSize={36} label={{ position: "top", fontSize: 9, fill: "var(--ink-60)", fontFamily: "'DM Mono', monospace", formatter: (v: number) => compactCurrency(v) }} />
                <Bar dataKey="honorarios" name="Honorários" fill="var(--dash-red)" radius={[3, 3, 0, 0]} maxBarSize={28} opacity={0.65} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div style={{ display: "flex", gap: 14, padding: "8px 18px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--ink-60)" }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: "var(--navy)" }} />Compensado
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--ink-60)" }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: "var(--dash-red)", opacity: 0.65 }} />Honorários Focus
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--ink-60)" }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, border: "2px dashed var(--navy)", background: "transparent" }} />Projeção
            </div>
          </div>
          {/* Insight strip */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--dash-border)" }}>
            <div style={{ padding: "10px 14px", borderRight: "1px solid var(--dash-border)", textAlign: "center" }}>
              <div style={{ ...fontCondensed, fontSize: 18, fontWeight: 700, color: trendPct < 0 ? "var(--dash-red)" : trendPct > 0 ? "var(--dash-green)" : "var(--navy)", lineHeight: 1 }}>{insightVar}</div>
              <div style={{ fontSize: 9, color: "var(--ink-35)", letterSpacing: 0.8, textTransform: "uppercase", marginTop: 3, fontWeight: 600 }}>{insightVarLabel}</div>
            </div>
            <div style={{ padding: "10px 14px", borderRight: "1px solid var(--dash-border)", textAlign: "center" }}>
              <div style={{ ...fontCondensed, fontSize: 18, fontWeight: 700, color: "var(--navy)", lineHeight: 1 }}>{(taxaHon * 100).toFixed(1)}%</div>
              <div style={{ fontSize: 9, color: "var(--ink-35)", letterSpacing: 0.8, textTransform: "uppercase", marginTop: 3, fontWeight: 600 }}>Taxa hon. média</div>
            </div>
            <div style={{ padding: "10px 14px", textAlign: "center" }}>
              <div style={{ ...fontCondensed, fontSize: 18, fontWeight: 700, color: "var(--dash-green)", lineHeight: 1 }}>{compactCurrency(avgMensal)}</div>
              <div style={{ fontSize: 9, color: "var(--ink-35)", letterSpacing: 0.8, textTransform: "uppercase", marginTop: 3, fontWeight: 600 }}>Média mensal</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
