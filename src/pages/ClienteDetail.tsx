import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { ProcessosTesesTab } from "@/components/clientes/ProcessosTesesTab";
import { CompensacoesTab } from "@/components/clientes/CompensacoesTab";
import { ResumoFinanceiroTab } from "@/components/clientes/ResumoFinanceiroTab";
import { SEGMENTO_LABELS } from "@/lib/pipeline-constants";

export default function ClienteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [compensacoesTotal, setCompensacoesTotal] = useState(0);
  const obsDebounce = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!id) return;
    supabase.from("clientes").select("*").eq("id", id).single().then(({ data, error }) => {
      if (error || !data) { navigate("/clientes"); return; }
      setCliente(data);
      setLoading(false);
    });
  }, [id, navigate]);

  const updateField = async (field: string, value: any) => {
    setCliente((prev: any) => ({ ...prev, [field]: value }));
    await supabase.from("clientes").update({ [field]: value, atualizado_em: new Date().toISOString() }).eq("id", id!);
  };

  const handleObsChange = (value: string) => {
    setCliente((prev: any) => ({ ...prev, observacoes: value }));
    if (obsDebounce.current) clearTimeout(obsDebounce.current);
    obsDebounce.current = setTimeout(() => {
      supabase.from("clientes").update({ atualizado_em: new Date().toISOString() }).eq("id", id!);
    }, 800);
  };

  if (loading || !cliente) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  const whatsappLink = cliente.whatsapp
    ? `https://wa.me/55${cliente.whatsapp.replace(/\D/g, "")}`
    : null;

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-[280px] shrink-0 border-r bg-muted/30 p-4 overflow-y-auto space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/clientes")} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <h2 className="text-lg font-bold leading-tight">{cliente.empresa}</h2>
        <div className="space-y-3 text-sm">
          <div><span className="text-muted-foreground">CNPJ:</span> {cliente.cnpj}</div>
          <div><span className="text-muted-foreground">Regime:</span> {cliente.regime_tributario || "—"}</div>
          <div><span className="text-muted-foreground">Segmento:</span> {SEGMENTO_LABELS[cliente.segmento] || cliente.segmento || "—"}</div>
          <div><span className="text-muted-foreground">Responsável:</span> {cliente.nome_contato || "—"}</div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Telefone:</span>
            {whatsappLink ? (
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline flex items-center gap-1">
                {cliente.whatsapp} <MessageCircle className="h-3 w-3" />
              </a>
            ) : "—"}
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Switch checked={!!cliente.compensando_fintax} onCheckedChange={(v) => updateField("compensando_fintax", v)} />
            <Label className="text-xs">Compensando Fintax</Label>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Comp. outro escritório:</span>
            <p className="text-xs">{cliente.compensacao_outro_escritorio || "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Cadastrado em:</span>
            <p className="text-xs">{new Date(cliente.criado_em).toLocaleDateString("pt-BR")}</p>
          </div>
          {cliente.lead_id && (
            <Link to={`/pipeline`} className="text-xs text-primary hover:underline flex items-center gap-1">
              Ver lead original <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-6 overflow-y-auto">
        <Tabs defaultValue="processos">
          <TabsList>
            <TabsTrigger value="processos">Processos por Tese</TabsTrigger>
            <TabsTrigger value="compensacoes">Compensações</TabsTrigger>
            <TabsTrigger value="resumo">Resumo Financeiro</TabsTrigger>
          </TabsList>
          <TabsContent value="processos">
            <ProcessosTesesTab clienteId={id!} compensacoesTotal={compensacoesTotal} />
          </TabsContent>
          <TabsContent value="compensacoes">
            <CompensacoesTab clienteId={id!} onTotalChange={setCompensacoesTotal} />
          </TabsContent>
          <TabsContent value="resumo">
            <ResumoFinanceiroTab clienteId={id!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
