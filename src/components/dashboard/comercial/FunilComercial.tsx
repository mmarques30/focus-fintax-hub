import { FunnelRow, compactCurrency, fontMono, fontCondensed, SEGMENTO_LABELS, SEGMENTO_BAR_COLOR, ORIGEM_LABELS } from "../dashboard-utils";
import type { NavigateFunction } from "react-router-dom";

interface Props {
  funnelData: FunnelRow[];
  maxFunnelCount: number;
  totalFunnelCount: number;
  totalFunnelPotencial: number;
  segmentoData: { segmento: string; count: number }[];
  maxSegCount: number;
  origemData: Record<string, number>;
  navigate: NavigateFunction;
}

export function FunilComercial({ funnelData, maxFunnelCount, totalFunnelCount, totalFunnelPotencial, segmentoData, maxSegCount, origemData, navigate }: Props) {
  return (
    <div style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)", borderRadius: 10, overflow: "hidden" }}>
      {/* Card header */}
      <div style={{ padding: "12px 18px 10px", borderBottom: "1px solid var(--dash-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "var(--navy)" }}>Funil comercial</div>
          <div style={{ fontSize: 11, color: "var(--ink-35)", marginTop: 2 }}>clique em uma etapa para filtrar o pipeline</div>
        </div>
      </div>

      {/* Funnel rows */}
      {funnelData.map((f) => {
        const isContrato = f.stage === "contrato_emitido" && f.count > 0;
        const isCliente = f.stage === "cliente_ativo";
        const rowBg = isContrato ? "var(--dash-amber-bg)" : "transparent";
        const nameColor = isContrato ? "var(--dash-amber)" : isCliente ? "var(--dash-green)" : "var(--ink)";
        const nameWeight = isContrato ? 700 : isCliente ? 600 : 500;
        const countColor = isContrato ? "var(--dash-amber)" : isCliente ? "var(--dash-green)" : "var(--navy)";
        const valColor = isContrato ? "var(--dash-amber)" : "var(--dash-green)";
        const suffix = isContrato ? " ⚠" : isCliente ? " ✓" : "";

        return (
          <div
            key={f.stage}
            onClick={() => navigate(f.stage === "cliente_ativo" ? "/clientes" : `/pipeline?etapa=${f.stage}`)}
            style={{ display: "flex", alignItems: "center", padding: "9px 18px", borderBottom: "1px solid rgba(0,0,0,0.04)", cursor: "pointer", transition: "background 0.12s", background: rowBg, gap: 0, minWidth: 0 }}
            onMouseEnter={e => { if (!isContrato) (e.currentTarget as HTMLElement).style.background = "var(--ink-06)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = rowBg; }}
          >
            <div style={{ width: 5, height: 26, borderRadius: 3, flexShrink: 0, marginRight: 12, background: f.color }} />
            <span style={{ fontSize: 12, fontWeight: nameWeight, color: nameColor, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>{f.label}{suffix}</span>
            <span style={{ ...fontMono, fontSize: 14, fontWeight: 700, color: countColor, width: 32, textAlign: "right", flexShrink: 0 }}>{f.count}</span>
            <span style={{ ...fontMono, fontSize: 11, fontWeight: 600, color: valColor, width: 60, textAlign: "right", flexShrink: 0, padding: "0 8px" }}>{f.potencial > 0 ? compactCurrency(f.potencial) : "—"}</span>
            <div style={{ flexShrink: 0, width: 100 }}>
              <div style={{ height: 5, background: "var(--ink-12)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 3, background: f.color, width: `${(f.count / maxFunnelCount) * 100}%` }} />
              </div>
            </div>
            <span style={{ fontSize: 10, color: isContrato ? "var(--dash-amber)" : "var(--ink-35)", width: 14, textAlign: "right", flexShrink: 0, marginLeft: 8, fontWeight: isContrato ? 700 : 400 }}>
              {isContrato ? "!" : "→"}
            </span>
          </div>
        );
      })}

      {/* Total row */}
      <div style={{ display: "flex", alignItems: "center", padding: "10px 18px", background: "var(--navy-06)", borderTop: "2px solid var(--dash-border)", gap: 0 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--ink-35)", flex: 1, paddingLeft: 17 }}>Total do pipeline</span>
        <span style={{ ...fontCondensed, fontSize: 16, fontWeight: 700, color: "var(--navy)", width: 32, textAlign: "right", flexShrink: 0 }}>{totalFunnelCount}</span>
        <span style={{ ...fontCondensed, fontSize: 16, fontWeight: 700, color: "var(--dash-green)", width: 60, textAlign: "right", flexShrink: 0, padding: "0 8px" }}>{compactCurrency(totalFunnelPotencial)}</span>
        <div style={{ width: 100, flexShrink: 0 }} />
        <div style={{ width: 22 }} />
      </div>

      {/* SEGMENTO BREAKDOWN */}
      <div style={{ padding: "12px 18px 14px", borderTop: "1px solid var(--dash-border)" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--ink-35)", marginBottom: 9 }}>Distribuição por segmento</div>
        {segmentoData.map((s) => (
          <div key={s.segmento} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "var(--ink-60)", width: 120, flexShrink: 0, fontWeight: 500 }}>{SEGMENTO_LABELS[s.segmento] ?? s.segmento}</span>
            <div style={{ flex: 1, height: 5, background: "var(--ink-12)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 3, background: SEGMENTO_BAR_COLOR[s.segmento] ?? "#6b7280", width: `${(s.count / maxSegCount) * 100}%` }} />
            </div>
            <span style={{ ...fontMono, fontSize: 10, color: "var(--navy)", fontWeight: 600, width: 24, textAlign: "right", flexShrink: 0 }}>{s.count}</span>
          </div>
        ))}
      </div>

      {/* ORIGEM DOS LEADS */}
      <div style={{ padding: "12px 18px 14px", borderTop: "1px solid var(--dash-border)" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--ink-35)", marginBottom: 9 }}>Origem dos leads</div>
        <div style={{ display: "flex", gap: 8 }}>
          {["formulario", "manual", "meta_ads"].map(key => (
            <div key={key} style={{ flex: 1, background: "var(--ink-06)", borderRadius: 8, padding: "9px 10px", textAlign: "center" }}>
              <div style={{ ...fontCondensed, fontSize: 20, fontWeight: 700, color: key === "meta_ads" ? "var(--dash-red)" : "var(--navy)", lineHeight: 1 }}>{origemData[key] ?? 0}</div>
              <div style={{ fontSize: 9, color: "var(--ink-35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 3 }}>{ORIGEM_LABELS[key] ?? key}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
