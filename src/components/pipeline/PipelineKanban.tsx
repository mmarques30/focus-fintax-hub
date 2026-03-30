import { useMemo } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { PIPELINE_STAGES, SEGMENTO_COLORS, SEGMENTO_LABELS, SCORE_CONFIG, getScoreLabel, formatCurrency, daysSince } from "@/lib/pipeline-constants";
import type { PipelineLead } from "@/pages/Pipeline";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { ConvertClientModal } from "./ConvertClientModal";

interface Props {
  leads: PipelineLead[];
  onLeadClick: (id: string) => void;
  onRefresh: () => void;
  exceptionLeadIds?: Set<string>;
}

export function PipelineKanban({ leads, onLeadClick, onRefresh, exceptionLeadIds = new Set() }: Props) {
  const { user } = useAuth();
  const [convertLead, setConvertLead] = useState<PipelineLead | null>(null);

  const grouped = useMemo(() => {
    const map: Record<string, PipelineLead[]> = {};
    PIPELINE_STAGES.forEach((s) => (map[s.value] = []));
    leads.forEach((l) => {
      const stage = l.status_funil || "novo";
      if (map[stage]) map[stage].push(l);
      else map["novo"].push(l);
    });
    return map;
  }, [leads]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const leadId = result.draggableId;
    const newStage = result.destination.droppableId;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status_funil === newStage) return;

    if (newStage === "cliente_ativo") {
      setConvertLead(lead);
      return;
    }

    await moveLeadToStage(lead, newStage);
  };

  const moveLeadToStage = async (lead: PipelineLead, newStage: string) => {
    const oldStage = lead.status_funil;

    const { error } = await supabase
      .from("leads")
      .update({ status_funil: newStage, status_funil_atualizado_em: new Date().toISOString() })
      .eq("id", lead.id);

    if (error) {
      toast.error("Erro ao mover lead");
      return;
    }

    await supabase.from("lead_historico").insert({
      lead_id: lead.id,
      de_etapa: oldStage,
      para_etapa: newStage,
      criado_por: user?.id,
    });

    onRefresh();
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 500 }}>
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = grouped[stage.value] || [];
            const totalPotencial = stageLeads.reduce((s, l) => s + (l.relatorios_leads?.[0]?.estimativa_total_maxima || 0), 0);
            return (
              <Droppable key={stage.value} droppableId={stage.value}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-shrink-0 w-[240px] rounded-lg border p-2 flex flex-col gap-2 transition-colors ${
                      snapshot.isDraggingOver ? "bg-primary/5 border-primary/30" : "bg-muted/30"
                    }`}
                  >
                    <div className="px-1 py-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">{stage.label}</h3>
                        <span className="text-xs text-muted-foreground font-medium">{stageLeads.length}</span>
                      </div>
                      {totalPotencial > 0 && (
                        <p className="text-[10px] text-[#0a1564] font-medium">{formatCurrency(totalPotencial)}</p>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col gap-2 min-h-[60px]">
                      {stageLeads.map((lead, index) => (
                        <LeadCard key={lead.id} lead={lead} index={index} onClick={() => onLeadClick(lead.id)} />
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      <ConvertClientModal lead={convertLead} onClose={() => setConvertLead(null)} onRefresh={onRefresh} />
    </>
  );
}

function LeadCard({ lead, index, onClick }: { lead: PipelineLead; index: number; onClick: () => void }) {
  const days = daysSince(lead.status_funil_atualizado_em || lead.criado_em);
  const isNew = lead.status_funil === "novo";
  const scoreLabel = getScoreLabel(lead.score_lead);
  const scoreConf = SCORE_CONFIG[scoreLabel];
  const potencialMax = lead.relatorios_leads?.[0]?.estimativa_total_maxima || 0;

  let borderClass = "";
  if (isNew && days > 3) borderClass = "border-l-4 border-l-red-500";
  else if (isNew && days > 1) borderClass = "border-l-4 border-l-orange-400";

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bg-card rounded-md border p-3 cursor-pointer hover:shadow-md transition-shadow ${borderClass} ${
            snapshot.isDragging ? "shadow-lg rotate-1" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-1">
            <p className="text-sm font-bold text-foreground leading-tight truncate flex-1">{lead.empresa}</p>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${scoreConf.color} shrink-0`}>
              {scoreLabel}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${SEGMENTO_COLORS[lead.segmento] || "bg-muted text-muted-foreground"}`}>
              {SEGMENTO_LABELS[lead.segmento] || lead.segmento}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className={`text-xs font-bold ${potencialMax >= 500_000 ? "text-green-600" : "text-foreground"}`}>
              {potencialMax > 0 ? formatCurrency(potencialMax) : "—"}
            </span>
            <div className="flex items-center gap-1">
              {isNew && days > 1 && <AlertTriangle className="h-3 w-3 text-orange-500" />}
              <span className="text-[10px] text-muted-foreground">{days}d</span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
