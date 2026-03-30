import { SCORE_VAL_COLOR } from "../dashboard-utils";

interface Props {
  scoreDistribution: Record<string, number>;
}

export function QualidadeCarteira({ scoreDistribution }: Props) {
  return (
    <div className="bg-white border border-[rgba(10,21,100,0.10)] rounded-[10px] overflow-hidden">
      <div className="px-[18px] pt-3 pb-2.5 border-b border-[rgba(10,21,100,0.10)]">
        <div className="text-[11px] font-bold tracking-[0.8px] uppercase text-navy">Qualidade da carteira</div>
      </div>
      <div className="px-3.5 py-2">
        {[
          { key: "A", emoji: "🔴", label: "Score A — alto potencial" },
          { key: "B", emoji: "🟠", label: "Score B — médio" },
          { key: "C", emoji: "🟡", label: "Score C — regular" },
          { key: "D", emoji: "⚪", label: "Score D — mínimo" },
        ].map(s => (
          <div key={s.key} className="flex items-center justify-between py-[7px] border-b border-[rgba(0,0,0,0.04)]">
            <span className="text-xs font-medium text-ink-60">{s.emoji} {s.label}</span>
            <span className="font-display text-lg font-bold" style={{ color: SCORE_VAL_COLOR[s.key] }}>{scoreDistribution[s.key] ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
