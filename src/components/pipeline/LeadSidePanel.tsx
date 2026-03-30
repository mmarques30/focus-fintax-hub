import { useEffect, useState, useCallback, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ExternalLink, MessageCircle, Pencil, UserCheck, XCircle, ArrowRight, AlertTriangle } from "lucide-react";
import { PIPELINE_STAGES, STAGE_COLORS, SEGMENTO_LABELS, formatCurrency, daysSince } from "@/lib/pipeline-constants";
import { useAuth } from "@/hooks/useAuth";
import { canEditLead } from "@/lib/role-permissions";
import type { PipelineLead } from "@/pages/Pipeline";
import { ConvertClientModal } from "./ConvertClientModal";

interface Props {
  lead: PipelineLead | null;
  onClose: () => void;
  onRefresh: () => void;
}

interface HistoricoEntry {
  id: string;
  de_etapa: string | null;
  para_etapa: string;
  anotacao: string | null;
  criado_em: string;
}

export function LeadSidePanel({ lead, onClose, onRefresh }: Props) {
  const { user, userRole } = useAuth();
  const isEditable = lead ? canEditLead(userRole, lead.status_funil) : false;
  const isFullReadOnly = userRole === "gestor_tributario";
  const [obs, setObs] = useState("");
  const [historico, setHistorico] = useState<HistoricoEntry[]>([]);
  const [showConvert, setShowConvert] = useState(false);
  const [showException, setShowException] = useState(false);
  const [exceptionReason, setExceptionReason] = useState("");
  const [exceptionSaving, setExceptionSaving] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (lead) {
      setObs(lead.observacoes || "");
      fetchHistorico(lead.id);
    }
  }, [lead?.id]);

  const fetchHistorico = async (leadId: string) => {
    const { data } = await supabase
      .from("lead_historico")
      .select("*")
      .eq("lead_id", leadId)
      .order("criado_em", { ascending: false });
    setHistorico((data as HistoricoEntry[]) || []);
  };

  const handleObsChange = useCallback((value: string) => {
    setObs(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!lead) return;
      await supabase.from("leads").update({ observacoes: value }).eq("id", lead.id);
    }, 1000);
  }, [lead]);

  const handleStageChange = async (newStage: string) => {
    if (!lead) return;
    if (newStage === "cliente_ativo") {
      setShowConvert(true);
      return;
    }
    const oldStage = lead.status_funil;
    await supabase.from("leads").update({ status_funil: newStage, status_funil_atualizado_em: new Date().toISOString() }).eq("id", lead.id);
    await supabase.from("lead_historico").insert({ lead_id: lead.id, de_etapa: oldStage, para_etapa: newStage, criado_por: user?.id });
    toast.success("Etapa atualizada");
    onRefresh();
  };

  const handleMarkLost = async () => {
    if (!lead || !confirm("Marcar este lead como perdido?")) return;
    const oldStage = lead.status_funil;
    await supabase.from("leads").update({ status_funil: "perdido", status_funil_atualizado_em: new Date().toISOString() }).eq("id", lead.id);
    await supabase.from("lead_historico").insert({ lead_id: lead.id, de_etapa: oldStage, para_etapa: "perdido", criado_por: user?.id });
    toast.success("Lead marcado como perdido");
    onRefresh();
    onClose();
  };

  const handleExceptionApproval = async () => {
    if (!lead || !exceptionReason.trim()) return;
    setExceptionSaving(true);
    const { data: cliente, error } = await supabase.from("clientes").insert({
      lead_id: lead.id,
      empresa: lead.empresa,
      cnpj: lead.cnpj,
      nome_contato: lead.nome,
      email: lead.email,
      whatsapp: lead.whatsapp,
      segmento: lead.segmento,
      regime_tributario: lead.regime_tributario,
      faturamento_faixa: lead.faturamento_faixa,
      status: "ativo",
    }).select("id").single();

    if (error || !cliente) {
      toast.error("Erro ao converter lead", { description: error?.message });
      setExceptionSaving(false);
      return;
    }

    await supabase.from("leads").update({ status_funil: "cliente_ativo", status_funil_atualizado_em: new Date().toISOString() }).eq("id", lead.id);
    await supabase.from("lead_historico").insert({
      lead_id: lead.id,
      de_etapa: lead.status_funil,
      para_etapa: "cliente_ativo",
      anotacao: `⚠ EXCEÇÃO: ${exceptionReason.trim()}`,
      criado_por: user?.id,
    });

    toast.success("Lead aprovado por exceção e convertido em cliente!");
    setExceptionSaving(false);
    setShowException(false);
    setExceptionReason("");
    onRefresh();
    onClose();
  };

  const stageLabel = (val: string) => PIPELINE_STAGES.find((s) => s.value === val)?.label || val;
  const teses = lead?.relatorios_leads?.[0]?.teses_identificadas as any[] || [];
  const potMin = lead?.relatorios_leads?.[0]?.estimativa_total_minima || 0;
  const potMax = lead?.relatorios_leads?.[0]?.estimativa_total_maxima || 0;

  return (
    <>
      <Sheet open={!!lead} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto p-0">
          {lead && (
            <div className="flex flex-col h-full">
              <SheetHeader className="p-6 pb-4 border-b">
                <SheetTitle className="text-lg">{lead.empresa}</SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={STAGE_COLORS[lead.status_funil] || ""}>{stageLabel(lead.status_funil)}</Badge>
                  <span className="text-xs text-muted-foreground">{daysSince(lead.status_funil_atualizado_em || lead.criado_em)}d nesta etapa</span>
                </div>
              </SheetHeader>

              <Tabs defaultValue="dados" className="flex-1 flex flex-col">
                <TabsList className="mx-6 mt-4">
                  <TabsTrigger value="dados">Dados</TabsTrigger>
                  <TabsTrigger value="diagnostico">Diagnóstico</TabsTrigger>
                  <TabsTrigger value="historico">Histórico</TabsTrigger>
                </TabsList>

                {/* Dados Tab */}
                <TabsContent value="dados" className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Responsável</Label>
                      <p className="text-sm font-medium">{lead.nome}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">CNPJ</Label>
                      <p className="text-sm font-medium">{lead.cnpj}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Telefone</Label>
                      <a href={`https://wa.me/55${lead.whatsapp?.replace(/\D/g, "")}`} target="_blank" className="text-sm font-medium text-primary flex items-center gap-1">
                        {lead.whatsapp} <MessageCircle className="h-3 w-3" />
                      </a>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="text-sm font-medium truncate">{lead.email}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Regime</Label>
                      <p className="text-sm">{lead.regime_tributario}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Segmento</Label>
                      <p className="text-sm">{SEGMENTO_LABELS[lead.segmento] || lead.segmento}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Faturamento</Label>
                      <p className="text-sm">{lead.faturamento_faixa}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Fonte</Label>
                      <p className="text-sm">{lead.origem}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Cadastro</Label>
                      <p className="text-sm">{new Date(lead.criado_em).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Etapa</Label>
                    <Select value={lead.status_funil} onValueChange={handleStageChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PIPELINE_STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Observações internas</Label>
                    <Textarea value={obs} onChange={(e) => handleObsChange(e.target.value)} rows={4} placeholder="Notas internas..." />
                  </div>
                </TabsContent>

                {/* Diagnostico Tab */}
                <TabsContent value="diagnostico" className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
                  {teses.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">Nenhum diagnóstico gerado ainda.</p>
                  ) : (
                    <>
                      <div className="p-3 rounded-lg bg-primary/5 border">
                        <p className="text-xs text-muted-foreground">Potencial total estimado</p>
                        <p className="text-lg font-bold text-primary">{formatCurrency(potMin)} — {formatCurrency(potMax)}</p>
                      </div>
                      {teses.map((t: any, i: number) => {
                        const max = potMax > 0 ? (t.estimativa_maxima / potMax) * 100 : 0;
                        return (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium">{t.tese_nome}</span>
                              <span className="text-muted-foreground">{formatCurrency(t.estimativa_minima)} — {formatCurrency(t.estimativa_maxima)}</span>
                            </div>
                            <Progress value={max} className="h-1.5" />
                          </div>
                        );
                      })}
                      <a
                        href={`/diagnostico/${lead.token}`}
                        target="_blank"
                        className="text-xs text-primary flex items-center gap-1 hover:underline"
                      >
                        Ver diagnóstico completo <ExternalLink className="h-3 w-3" />
                      </a>
                    </>
                  )}
                </TabsContent>

                {/* Historico Tab */}
                <TabsContent value="historico" className="flex-1 overflow-y-auto px-6 pb-4">
                  {historico.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">Nenhum evento registrado.</p>
                  ) : (
                    <div className="space-y-0">
                      {historico.map((h) => {
                        const isException = h.anotacao?.startsWith("⚠ EXCEÇÃO:");
                        return (
                          <div key={h.id} className="flex gap-3 py-3 border-b last:border-0">
                            <div className="flex flex-col items-center">
                              {isException ? (
                                <AlertTriangle className="h-3 w-3 text-amber-500 mt-1.5" />
                              ) : (
                                <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                              )}
                              <div className="flex-1 w-px bg-border" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium flex items-center gap-1">
                                {h.de_etapa ? stageLabel(h.de_etapa) : "Criado"} <ArrowRight className="h-3 w-3" /> {stageLabel(h.para_etapa)}
                              </p>
                              {h.anotacao && <p className={`text-xs mt-0.5 ${isException ? "text-amber-700 font-medium" : "text-muted-foreground"}`}>{h.anotacao}</p>}
                              <p className="text-[10px] text-muted-foreground mt-1">{new Date(h.criado_em).toLocaleString("pt-BR")}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Exception inline form */}
              {showException && (
                <div className="border-t p-4 space-y-3 bg-amber-50/50">
                  <p className="text-xs font-medium text-amber-800">Motivo da aprovação por exceção</p>
                  <Textarea
                    value={exceptionReason}
                    onChange={(e) => setExceptionReason(e.target.value)}
                    rows={3}
                    placeholder="Descreva o motivo da exceção..."
                    className="border-amber-300 focus-visible:ring-amber-400"
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { setShowException(false); setExceptionReason(""); }}>
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                      onClick={handleExceptionApproval}
                      disabled={!exceptionReason.trim() || exceptionSaving}
                    >
                      {exceptionSaving ? "Salvando..." : "Confirmar exceção"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="border-t p-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowConvert(true)}>
                  <UserCheck className="h-4 w-4 mr-1" /> Converter
                </Button>
                {lead.status_funil === "contrato_emitido" && !showException && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-amber-400 text-amber-700 hover:bg-amber-50"
                    onClick={() => setShowException(true)}
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" /> Exceção
                  </Button>
                )}
                <Button variant="outline" size="sm" className="flex-1 text-destructive hover:text-destructive" onClick={handleMarkLost}>
                  <XCircle className="h-4 w-4 mr-1" /> Perdido
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConvertClientModal lead={showConvert ? lead : null} onClose={() => setShowConvert(false)} onRefresh={() => { onRefresh(); onClose(); }} />
    </>
  );
}
