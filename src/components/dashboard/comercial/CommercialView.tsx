import type { NavigateFunction } from "react-router-dom";
import type { FunnelRow, RecentLead } from "../dashboard-utils";
import { anim } from "../dashboard-utils";
import { KpiStripComercial } from "./KpiStripComercial";
import { AlertasBanner } from "./AlertasBanner";
import { FunilComercial } from "./FunilComercial";
import { LeadsRecentes } from "./LeadsRecentes";
import { QualidadeCarteira } from "./QualidadeCarteira";
import { MotorPerformance } from "./MotorPerformance";
import { BottomStripComercial } from "./BottomStripComercial";

interface Props {
  comLeads: number;
  comNewWeek: number;
  trendDiff: number;
  comPotencial: number;
  comContratos: number;
  comTaxaConversao: number;
  comClientesAtivos: number;
  stalledLeads: { empresa: string; days: number; id: string }[];
  funnelData: FunnelRow[];
  maxFunnelCount: number;
  totalFunnelCount: number;
  totalFunnelPotencial: number;
  segmentoData: { segmento: string; count: number }[];
  maxSegCount: number;
  origemData: Record<string, number>;
  recentLeads: RecentLead[];
  scoreDistribution: Record<string, number>;
  motorDiagnosticos: number;
  motorTesesAtivas: number;
  navigate: NavigateFunction;
}

export function CommercialView(props: Props) {
  return (
    <>
      <KpiStripComercial
        comLeads={props.comLeads} comNewWeek={props.comNewWeek} trendDiff={props.trendDiff}
        comPotencial={props.comPotencial} comContratos={props.comContratos} comTaxaConversao={props.comTaxaConversao}
      />
      <AlertasBanner stalledLeads={props.stalledLeads} />

      <div style={{ ...anim(140), display: "grid", gridTemplateColumns: "1fr 320px", gap: 14, marginBottom: 14 }}>
        <FunilComercial
          funnelData={props.funnelData} maxFunnelCount={props.maxFunnelCount}
          totalFunnelCount={props.totalFunnelCount} totalFunnelPotencial={props.totalFunnelPotencial}
          segmentoData={props.segmentoData} maxSegCount={props.maxSegCount}
          origemData={props.origemData} navigate={props.navigate}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <LeadsRecentes recentLeads={props.recentLeads} navigate={props.navigate} />
          <QualidadeCarteira scoreDistribution={props.scoreDistribution} />
          <MotorPerformance motorDiagnosticos={props.motorDiagnosticos} motorTesesAtivas={props.motorTesesAtivas} />
        </div>
      </div>

      <BottomStripComercial
        comLeads={props.comLeads} comContratos={props.comContratos}
        comClientesAtivos={props.comClientesAtivos} comPotencial={props.comPotencial}
        comTaxaConversao={props.comTaxaConversao}
      />
    </>
  );
}
