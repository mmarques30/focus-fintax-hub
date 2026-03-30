import { RecentLead, compactCurrency, fontMono, fontCondensed, SEGMENTO_CHIP, SEGMENTO_LABELS, SCORE_CHIP, getScoreLabel, timeAgo } from "../dashboard-utils";
import type { NavigateFunction } from "react-router-dom";

interface Props {
  recentLeads: RecentLead[];
  navigate: NavigateFunction;
}

export function LeadsRecentes({ recentLeads, navigate }: Props) {
  return (
    <div style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ padding: "12px 18px 10px", borderBottom: "1px solid var(--dash-border)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "var(--navy)" }}>Leads recentes</div>
      </div>
      <div style={{ padding: "8px 14px" }}>
        {recentLeads.map((l) => {
          const initials = l.empresa.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
          const scoreLetter = getScoreLabel(l.score);
          const chipStyle = SEGMENTO_CHIP[l.segmento] ?? { bg: "#f3f4f6", color: "#6b7280" };
          const scoreChip = SCORE_CHIP[scoreLetter] ?? { bg: "#f3f4f6", color: "#9ca3af" };
          return (
            <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--navy-10)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--navy)", flexShrink: 0, ...fontCondensed }}>{initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.empresa}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "1px 5px", borderRadius: 3, fontSize: 9, fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase", lineHeight: 1.5, background: chipStyle.bg, color: chipStyle.color }}>{SEGMENTO_LABELS[l.segmento] ?? l.segmento}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: 3, fontSize: 9, fontWeight: 700, ...fontCondensed, background: scoreChip.bg, color: scoreChip.color }}>{scoreLetter}</span>
                  <span style={{ fontSize: 10, color: "var(--ink-35)" }}>{timeAgo(l.criado_em)}</span>
                </div>
              </div>
              {l.potencial > 0 && <span style={{ ...fontMono, fontSize: 12, fontWeight: 700, color: "var(--dash-green)", flexShrink: 0 }}>{compactCurrency(l.potencial)}</span>}
            </div>
          );
        })}
        <a onClick={() => navigate("/pipeline")} style={{ fontSize: 11, color: "var(--navy)", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", marginTop: 8, cursor: "pointer" }}>Ver pipeline completo →</a>
      </div>
    </div>
  );
}
