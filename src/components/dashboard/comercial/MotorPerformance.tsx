interface Props {
  motorDiagnosticos: number;
  motorTesesAtivas: number;
}

export function MotorPerformance({ motorDiagnosticos, motorTesesAtivas }: Props) {
  return (
    <div className="bg-navy rounded-[14px] px-4 py-3.5">
      <div className="text-[9px] font-bold tracking-[2px] uppercase opacity-50 text-white mb-3">Performance do motor</div>
      <div className="grid grid-cols-3">
        {[
          { val: motorDiagnosticos, label: "Diagnósticos", highlight: false },
          { val: motorTesesAtivas, label: "Teses ativas", highlight: false },
          { val: 0, label: "Sem cobertura", highlight: true },
        ].map((m, i) => (
          <div key={i} className={`px-2.5 text-center ${i < 2 ? "border-r border-[rgba(255,255,255,0.12)]" : ""}`}>
            <div className={`font-display text-2xl font-bold leading-none ${m.highlight ? "text-red-300" : "text-white"}`}>{m.val}</div>
            <div className="text-[9px] opacity-50 mt-[3px] uppercase tracking-[0.8px] font-semibold text-white">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
