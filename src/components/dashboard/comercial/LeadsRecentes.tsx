import { RecentLead, compactCurrency, SEGMENTO_CHIP, SEGMENTO_LABELS, SCORE_CHIP, getScoreLabel, timeAgo } from "../dashboard-utils";
import type { NavigateFunction } from "react-router-dom";

interface Props {
  recentLeads: RecentLead[];
  navigate: NavigateFunction;
}

export function LeadsRecentes({ recentLeads, navigate }: Props) {
  return (
    <div className="bg-white border border-[rgba(10,21,100,0.10)] rounded-[10px] overflow-hidden">
      <div className="px-[18px] pt-3 pb-2.5 border-b border-[rgba(10,21,100,0.10)]">
        <div className="text-[11px] font-bold tracking-[0.8px] uppercase text-navy">Leads recentes</div>
      </div>
      <div className="px-3.5 py-2">
        {recentLeads.map((l) => {
          const initials = l.empresa.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
          const scoreLetter = getScoreLabel(l.score);
          const chipStyle = SEGMENTO_CHIP[l.segmento] ?? { bg: "#f3f4f6", color: "#6b7280" };
          const scoreChip = SCORE_CHIP[scoreLetter] ?? { bg: "#f3f4f6", color: "#9ca3af" };
          return (
            <div key={l.id} className="flex items-center gap-2.5 py-2 border-b border-[rgba(0,0,0,0.04)]">
              <div className="w-7 h-7 rounded-md bg-[rgba(10,21,100,0.08)] flex items-center justify-center text-[11px] font-bold text-navy shrink-0 font-display">{initials}</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-ink overflow-hidden text-ellipsis whitespace-nowrap">{l.empresa}</div>
                <div className="flex items-center gap-[5px] mt-0.5">
                  <span className="inline-flex items-center px-[5px] py-[1px] rounded-[3px] text-[9px] font-semibold tracking-[0.4px] uppercase leading-[1.5]" style={{ background: chipStyle.bg, color: chipStyle.color }}>{SEGMENTO_LABELS[l.segmento] ?? l.segmento}</span>
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-[3px] text-[9px] font-bold font-display" style={{ background: scoreChip.bg, color: scoreChip.color }}>{scoreLetter}</span>
                  <span className="text-[10px] text-ink-35">{timeAgo(l.criado_em)}</span>
                </div>
              </div>
              {l.potencial > 0 && <span className="font-mono-dm tabular-nums text-xs font-bold text-dash-green shrink-0">{compactCurrency(l.potencial)}</span>}
            </div>
          );
        })}
        <a onClick={() => navigate("/pipeline")} className="text-[11px] text-navy font-semibold no-underline inline-flex items-center mt-2 cursor-pointer">Ver pipeline completo →</a>
      </div>
    </div>
  );
}
