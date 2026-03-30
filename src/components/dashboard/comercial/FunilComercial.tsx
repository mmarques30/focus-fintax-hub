import { FunnelRow, compactCurrency, SEGMENTO_LABELS, SEGMENTO_BAR_COLOR, ORIGEM_LABELS } from "../dashboard-utils";
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
    <div className="bg-white border border-[rgba(10,21,100,0.10)] rounded-[10px] overflow-hidden">
      {/* Card header */}
      <div className="px-[18px] pt-3 pb-2.5 border-b border-[rgba(10,21,100,0.10)] flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold tracking-[0.8px] uppercase text-navy">Funil comercial</div>
          <div className="text-[11px] text-ink-35 mt-0.5">clique em uma etapa para filtrar o pipeline</div>
        </div>
      </div>

      {/* Funnel rows */}
      {funnelData.map((f) => {
        const isContrato = f.stage === "contrato_emitido" && f.count > 0;
        const isCliente = f.stage === "cliente_ativo";
        const rowBg = isContrato ? "var(--dash-amber-bg)" : "transparent";
        const suffix = isContrato ? " ⚠" : isCliente ? " ✓" : "";

        return (
          <div
            key={f.stage}
            onClick={() => navigate(f.stage === "cliente_ativo" ? "/clientes" : `/pipeline?etapa=${f.stage}`)}
            className="flex items-center px-[18px] py-[9px] border-b border-[rgba(0,0,0,0.04)] cursor-pointer transition-colors duration-[120ms] min-w-0"
            style={{ background: rowBg }}
            onMouseEnter={e => { if (!isContrato) (e.currentTarget as HTMLElement).style.background = "var(--ink-06)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = rowBg; }}
          >
            <div className="w-[5px] h-[26px] rounded-[3px] shrink-0 mr-3" style={{ background: f.color }} />
            <span className={`text-xs flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap pr-2 ${isContrato ? "font-bold text-dash-amber" : isCliente ? "font-semibold text-dash-green" : "font-medium text-ink"}`}>{f.label}{suffix}</span>
            <span className={`font-mono-dm tabular-nums text-sm font-bold w-8 text-right shrink-0 ${isContrato ? "text-dash-amber" : isCliente ? "text-dash-green" : "text-navy"}`}>{f.count}</span>
            <span className={`font-mono-dm tabular-nums text-[11px] font-semibold w-[60px] text-right shrink-0 px-2 ${isContrato ? "text-dash-amber" : "text-dash-green"}`}>{f.potencial > 0 ? compactCurrency(f.potencial) : "—"}</span>
            <div className="shrink-0 w-[100px]">
              <div className="h-[5px] bg-ink-12 rounded-[3px] overflow-hidden">
                <div className="h-full rounded-[3px]" style={{ background: f.color, width: `${(f.count / maxFunnelCount) * 100}%` }} />
              </div>
            </div>
            <span className={`text-[10px] w-3.5 text-right shrink-0 ml-2 ${isContrato ? "text-dash-amber font-bold" : "text-ink-35 font-normal"}`}>
              {isContrato ? "!" : "→"}
            </span>
          </div>
        );
      })}

      {/* Total row */}
      <div className="flex items-center px-[18px] py-2.5 bg-[rgba(10,21,100,0.05)] border-t-2 border-[rgba(10,21,100,0.10)]">
        <span className="text-[10px] font-bold tracking-[1px] uppercase text-ink-35 flex-1 pl-[17px]">Total do pipeline</span>
        <span className="font-display text-base font-bold text-navy w-8 text-right shrink-0">{totalFunnelCount}</span>
        <span className="font-display text-base font-bold text-dash-green w-[60px] text-right shrink-0 px-2">{compactCurrency(totalFunnelPotencial)}</span>
        <div className="w-[100px] shrink-0" />
        <div className="w-[22px]" />
      </div>

      {/* SEGMENTO BREAKDOWN */}
      <div className="px-[18px] pt-3 pb-3.5 border-t border-[rgba(10,21,100,0.10)]">
        <div className="text-[10px] font-bold tracking-[1.2px] uppercase text-ink-35 mb-[9px]">Distribuição por segmento</div>
        {segmentoData.map((s) => (
          <div key={s.segmento} className="flex items-center gap-2.5 mb-1.5">
            <span className="text-[11px] text-ink-60 w-[120px] shrink-0 font-medium">{SEGMENTO_LABELS[s.segmento] ?? s.segmento}</span>
            <div className="flex-1 h-[5px] bg-ink-12 rounded-[3px] overflow-hidden">
              <div className="h-full rounded-[3px]" style={{ background: SEGMENTO_BAR_COLOR[s.segmento] ?? "#6b7280", width: `${(s.count / maxSegCount) * 100}%` }} />
            </div>
            <span className="font-mono-dm tabular-nums text-[10px] text-navy font-semibold w-6 text-right shrink-0">{s.count}</span>
          </div>
        ))}
      </div>

      {/* ORIGEM DOS LEADS */}
      <div className="px-[18px] pt-3 pb-3.5 border-t border-[rgba(10,21,100,0.10)]">
        <div className="text-[10px] font-bold tracking-[1.2px] uppercase text-ink-35 mb-[9px]">Origem dos leads</div>
        <div className="flex gap-2">
          {["formulario", "manual", "meta_ads"].map(key => (
            <div key={key} className="flex-1 bg-[rgba(15,17,23,0.05)] rounded-lg px-2.5 py-[9px] text-center">
              <div className={`font-display text-xl font-bold leading-none ${key === "meta_ads" ? "text-dash-red" : "text-navy"}`}>{origemData[key] ?? 0}</div>
              <div className="text-[9px] text-ink-35 font-semibold uppercase tracking-[0.8px] mt-[3px]">{ORIGEM_LABELS[key] ?? key}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
