import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, LayoutGrid, List, Users, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ACTIVE_STAGES, daysSince, formatCurrency } from "@/lib/pipeline-constants";
import { PipelineKanban } from "@/components/pipeline/PipelineKanban";
import { PipelineList } from "@/components/pipeline/PipelineList";
import { LeadFormModal } from "@/components/pipeline/LeadFormModal";
import { LeadSidePanel } from "@/components/pipeline/LeadSidePanel";

export interface PipelineLead {
  id: string;
  nome: string;
  empresa: string;
  cnpj: string;
  email: string;
  whatsapp: string;
  segmento: string;
  regime_tributario: string;
  faturamento_faixa: string;
  score_lead: number | null;
  status: string;
  status_funil: string;
  status_funil_atualizado_em: string;
  origem: string;
  criado_em: string;
  observacoes: string;
  token: string;
  relatorios_leads: {
    estimativa_total_minima: number;
    estimativa_total_maxima: number;
    teses_identificadas: any;
  }[];
}

export default function Pipeline() {
  const { userRole } = useAuth();
  const [leads, setLeads] = useState<PipelineLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [showForm, setShowForm] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const [exceptionLeadIds, setExceptionLeadIds] = useState<Set<string>>(new Set());

  const fetchLeads = async () => {
    const [leadsRes, histRes] = await Promise.all([
      supabase
        .from("leads")
        .select("*, relatorios_leads(estimativa_total_minima, estimativa_total_maxima, teses_identificadas)")
        .order("criado_em", { ascending: false }),
      supabase
        .from("lead_historico")
        .select("lead_id")
        .ilike("anotacao", "⚠ EXCEÇÃO:%"),
    ]);

    if (leadsRes.error) {
      toast.error("Erro ao carregar leads");
      return;
    }
    setLeads((leadsRes.data as any) || []);
    setExceptionLeadIds(new Set(histRes.data?.map((h) => h.lead_id) || []));
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();

    const channel = supabase
      .channel("leads-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => {
        fetchLeads();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const activeLeads = useMemo(
    () => leads.filter((l) => l.status_funil !== "perdido" && l.status_funil !== "nao_vai_fazer"),
    [leads]
  );

  const newToday = useMemo(
    () => leads.filter((l) => {
      const d = new Date(l.criado_em);
      const today = new Date();
      return d.toDateString() === today.toDateString();
    }).length,
    [leads]
  );

  const totalPotencial = useMemo(
    () => activeLeads.reduce((sum, l) => {
      const r = l.relatorios_leads?.[0];
      return sum + (r?.estimativa_total_maxima || 0);
    }, 0),
    [activeLeads]
  );

  const leadsStale = useMemo(
    () => leads.filter((l) => l.status_funil === "novo" && daysSince(l.status_funil_atualizado_em || l.criado_em) > 1).length,
    [leads]
  );

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Pipeline de Leads <span className="text-muted-foreground font-normal text-lg">({activeLeads.length})</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={view === "kanban" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("kanban")}
              className="rounded-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
              className="rounded-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> Novo Lead
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{activeLeads.length}</p>
              <p className="text-xs text-muted-foreground">Leads ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{newToday}</p>
              <p className="text-xs text-muted-foreground">Novos hoje</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{formatCurrency(totalPotencial)}</p>
              <p className="text-xs text-muted-foreground">Potencial total</p>
            </div>
          </CardContent>
        </Card>
        <Card className={leadsStale > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className={`h-8 w-8 ${leadsStale > 0 ? "text-red-500" : "text-muted-foreground"}`} />
            <div>
              <p className="text-2xl font-bold">{leadsStale}</p>
              <p className="text-xs text-muted-foreground">Sem contato &gt;1d</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View */}
      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Carregando...</div>
      ) : view === "kanban" ? (
        <PipelineKanban leads={leads} onLeadClick={setSelectedLeadId} onRefresh={fetchLeads} exceptionLeadIds={exceptionLeadIds} />
      ) : (
        <PipelineList leads={leads} onLeadClick={setSelectedLeadId} />
      )}

      {/* Form Modal */}
      <LeadFormModal open={showForm} onClose={() => setShowForm(false)} onSaved={fetchLeads} />

      {/* Side Panel */}
      <LeadSidePanel lead={selectedLead} onClose={() => setSelectedLeadId(null)} onRefresh={fetchLeads} />
    </div>
  );
}
