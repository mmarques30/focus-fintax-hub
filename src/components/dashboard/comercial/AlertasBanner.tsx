import { animDelay } from "../dashboard-utils";

interface StalledLead {
  empresa: string;
  days: number;
  id: string;
}

interface Props {
  stalledLeads: StalledLead[];
}

export function AlertasBanner({ stalledLeads }: Props) {
  if (stalledLeads.length === 0) return null;

  return (
    <div className="animate-dash-in bg-white border border-[rgba(180,83,9,0.2)] rounded-[10px] overflow-hidden mb-3.5" style={animDelay(90)}>
      <div className="px-[18px] py-2.5 bg-[rgba(251,191,36,0.12)] border-b border-[rgba(180,83,9,0.12)] flex items-center gap-2">
        <span className="w-[7px] h-[7px] rounded-full bg-dash-amber shrink-0" />
        <span className="text-[11px] font-bold tracking-[0.8px] uppercase text-dash-amber">
          Requer atenção — {stalledLeads.length} lead{stalledLeads.length > 1 ? "s" : ""} sem movimentação
        </span>
      </div>
      {stalledLeads.slice(0, 5).map((l, i) => (
        <div key={i} className="flex items-center px-[18px] py-2 border-b border-[rgba(0,0,0,0.04)] gap-3">
          <span className="text-xs font-semibold text-ink w-[220px] shrink-0 overflow-hidden text-ellipsis whitespace-nowrap">{l.empresa}</span>
          <span className="text-[11px] text-ink-60 flex-1">Em Contrato Emitido sem atualização</span>
          <span className="font-mono-dm tabular-nums text-[10px] text-dash-amber font-semibold bg-[rgba(180,83,9,0.10)] px-[7px] py-[2px] rounded shrink-0">há {l.days} dias</span>
        </div>
      ))}
    </div>
  );
}
