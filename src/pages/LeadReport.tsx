import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, RefreshCw } from "lucide-react";
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from "@/lib/lead-constants";
import DOMPurify from "dompurify";

interface Lead {
  id: string;
  nome: string;
  empresa: string;
  cnpj: string;
  segmento: string;
  regime_tributario: string;
  faturamento_faixa: string;
  pagou_irpj: boolean;
  score_lead: number | null;
  status: string;
}

interface Report {
  id: string;
  conteudo_html: string;
  teses_identificadas: unknown;
  estimativa_total_minima: number;
  estimativa_total_maxima: number;
  score: number;
  enviado_whatsapp: boolean;
  enviado_em: string | null;
  criado_em: string;
}

export default function LeadReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);

    const [{ data: leadData }, { data: reportData }] = await Promise.all([
      supabase.from("leads").select("*").eq("id", id).single(),
      supabase.from("relatorios_leads").select("*").eq("lead_id", id).order("criado_em", { ascending: false }).limit(1).single(),
    ]);

    setLead(leadData);
    setReport(reportData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleMarkSent = async () => {
    if (!report) return;
    await supabase.from("relatorios_leads").update({ enviado_whatsapp: true, enviado_em: new Date().toISOString() }).eq("id", report.id);
    await supabase.from("leads").update({ status: "enviado" }).eq("id", id);
    toast.success("Marcado como enviado!");
    fetchData();
  };

  const handleReprocess = async () => {
    if (!id) return;
    toast.info("Reprocessando...");
    const { error } = await supabase.functions.invoke("analyze-lead", { body: { lead_id: id } });
    if (error) toast.error("Erro ao reprocessar");
    else {
      toast.success("Reprocessado!");
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Lead não encontrado</p>
        <Button variant="ghost" onClick={() => navigate("/leads")} className="mt-4">Voltar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/leads")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{lead.empresa}</h1>
          <p className="text-sm text-muted-foreground">{lead.nome} · {lead.cnpj}</p>
        </div>
        <Badge variant="outline" className={LEAD_STATUS_COLORS[lead.status] || ""}>
          {LEAD_STATUS_LABELS[lead.status] || lead.status}
        </Badge>
      </div>

      {/* Lead info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Segmento", value: lead.segmento },
          { label: "Regime", value: lead.regime_tributario },
          { label: "Faturamento", value: lead.faturamento_faixa },
          { label: "Pagou IRPJ", value: lead.pagou_irpj ? "Sim" : "Não" },
        ].map((item) => (
          <Card key={item.label} className="border-card-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-semibold uppercase">{item.label}</p>
              <p className="text-sm font-bold text-foreground mt-1">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Score */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-card-border">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground font-semibold uppercase">Score</p>
              <p className="text-4xl font-extrabold text-primary mt-1">{report.score}</p>
            </CardContent>
          </Card>
          <Card className="border-card-border">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground font-semibold uppercase">Estimativa Mínima</p>
              <p className="text-xl font-bold text-foreground mt-1">
                R$ {Number(report.estimativa_total_minima).toLocaleString("pt-BR")}
              </p>
            </CardContent>
          </Card>
          <Card className="border-card-border">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground font-semibold uppercase">Estimativa Máxima</p>
              <p className="text-xl font-bold text-secondary mt-1">
                R$ {Number(report.estimativa_total_maxima).toLocaleString("pt-BR")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report HTML */}
      {report && (
        <Card className="border-card-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Relatório Gerado</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReprocess}>
                <RefreshCw className="h-4 w-4 mr-1" /> Reprocessar
              </Button>
              {!report.enviado_whatsapp && (
                <Button size="sm" onClick={handleMarkSent}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Marcar como Enviado
                </Button>
              )}
              {report.enviado_whatsapp && (
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Enviado em {report.enviado_em ? new Date(report.enviado_em).toLocaleDateString("pt-BR") : "—"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(report.conteudo_html) }}
            />
          </CardContent>
        </Card>
      )}

      {!report && (
        <Card className="border-card-border">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Nenhum relatório gerado ainda.</p>
            <Button className="mt-4" onClick={handleReprocess}>
              <RefreshCw className="h-4 w-4 mr-2" /> Gerar Análise
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
