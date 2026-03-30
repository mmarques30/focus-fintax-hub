import type { NavigateFunction } from "react-router-dom";
import { anim, fontMono, compactCurrency, fullCurrency, type ClientRank } from "../dashboard-utils";

interface Props {
  fullRanking: ClientRank[];
  numMonths: number;
  navigate: NavigateFunction;
}

export function RankingTable({ fullRanking, numMonths, navigate }: Props) {
  return (
    <div style={{ ...anim(240), background: "var(--dash-surface)", border: "1px solid var(--dash-border)", borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
      <div style={{ padding: "12px 18px 10px", borderBottom: "1px solid var(--dash-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "var(--navy)" }}>Ranking de compensações</div>
          <div style={{ fontSize: 11, color: "var(--ink-35)", marginTop: 2 }}>economia bruta acumulada · {numMonths} meses · % do crédito identificado utilizado</div>
        </div>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["#", "Empresa", "Total compensado", "Honorários", "Economia líquida", "% utilizado", "Progresso", "Saldo restante"].map((h, i) => (
              <th key={i} style={{ padding: "7px 12px", textAlign: i === 7 ? "right" : "left", fontSize: 9, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: "var(--ink-35)", borderBottom: "1px solid var(--dash-border)", background: "var(--ink-06)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fullRanking.map((c, i) => {
            const pctUsed = c.identificado > 0 ? Math.round((c.compensado / c.identificado) * 100) : 0;
            const econLiquida = c.compensado - c.honorarios;
            return (
              <tr key={c.id} onClick={() => navigate(`/clientes/${c.id}`)} style={{ cursor: "pointer" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--ink-06)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}>
                <td style={{ padding: "8px 12px", fontSize: 10, color: "var(--ink-35)", borderBottom: "1px solid rgba(0,0,0,0.04)", ...fontMono }}>{i + 1}</td>
                <td style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600, color: "var(--ink)", borderBottom: "1px solid rgba(0,0,0,0.04)", maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.empresa}</td>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid rgba(0,0,0,0.04)", ...fontMono, fontWeight: 700, color: "var(--dash-green)", fontSize: 12 }}>{fullCurrency(c.compensado)}</td>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid rgba(0,0,0,0.04)", ...fontMono, fontWeight: 400, color: "var(--ink-35)", fontSize: 10 }}>{fullCurrency(c.honorarios)}</td>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid rgba(0,0,0,0.04)", ...fontMono, fontWeight: 600, color: "var(--navy)", fontSize: 11 }}>{fullCurrency(econLiquida)}</td>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid rgba(0,0,0,0.04)", ...fontMono, fontWeight: 400, color: "var(--ink-35)", fontSize: 10 }}>{pctUsed}%</td>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                  <span style={{ width: 50, height: 4, background: "var(--ink-12)", borderRadius: 2, overflow: "hidden", display: "inline-block" }}>
                    <span style={{ height: "100%", borderRadius: 2, background: "var(--dash-green)", display: "block", width: `${Math.min(pctUsed, 100)}%` }} />
                  </span>
                </td>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid rgba(0,0,0,0.04)", textAlign: "right", ...fontMono, fontWeight: 700, color: c.saldo > 500000 ? "var(--dash-red)" : "var(--ink-35)", fontSize: 12 }}>
                  {c.saldo > 0 ? compactCurrency(c.saldo) : fullCurrency(0)}
                </td>
              </tr>
            );
          })}
          {fullRanking.length === 0 && (
            <tr><td colSpan={8} style={{ padding: "20px", textAlign: "center", fontSize: 12, color: "var(--ink-35)" }}>Nenhuma compensação registrada.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
