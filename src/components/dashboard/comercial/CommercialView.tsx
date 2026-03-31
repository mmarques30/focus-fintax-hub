import type { NavigateFunction } from "react-router-dom";
import type { FunnelRow, RecentLead } from "../dashboard-utils";
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

      <div className="animate-slide-up delay-3 grid grid-cols-[1fr_320px] gap-3.5 mb-3.5">
        <FunilComercial
          funnelData={props.funnelData} maxFunnelCount={props.maxFunnelCount}
          totalFunnelCount={props.totalFunnelCount} totalFunnelPotencial={props.totalFunnelPotencial}
          segmentoData={props.segmentoData} maxSegCount={props.maxSegCount}
          origemData={props.origemData} navigate={props.navigate}
        />
        <div className="flex flex-col gap-3">
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
