import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Send } from "lucide-react";
import { FATURAMENTO_FAIXAS, REGIMES, SEGMENTOS } from "@/lib/lead-constants";
import { z } from "zod";

const leadSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(200),
  whatsapp: z.string().trim().min(1, "WhatsApp é obrigatório").max(20),
  email: z.string().trim().email("E-mail inválido").max(255),
  empresa: z.string().trim().min(1, "Empresa é obrigatória").max(200),
  cnpj: z.string().trim().min(14, "CNPJ inválido").max(18),
  faturamento_faixa: z.string().min(1, "Selecione uma faixa"),
  regime_tributario: z.string().min(1, "Selecione o regime"),
  segmento: z.string().min(1, "Selecione o segmento"),
});

export default function LeadForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [faturamentoFaixa, setFaturamentoFaixa] = useState("");
  const [regimeTributario, setRegimeTributario] = useState("");
  const [segmento, setSegmento] = useState("");

  const isSimplesNacional = regimeTributario === "Simples Nacional";

  const handleSubmit = async () => {
    const parsed = leadSchema.safeParse({
      nome, whatsapp, email, empresa, cnpj,
      faturamento_faixa: faturamentoFaixa,
      regime_tributario: regimeTributario,
      segmento,
    });

    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setSaving(true);

    const { data: lead, error } = await supabase.from("leads").insert({
      nome: parsed.data.nome,
      whatsapp: parsed.data.whatsapp,
      email: parsed.data.email,
      empresa: parsed.data.empresa,
      cnpj: parsed.data.cnpj,
      faturamento_faixa: parsed.data.faturamento_faixa,
      regime_tributario: parsed.data.regime_tributario,
      segmento: parsed.data.segmento,
      status: "novo",
      origem: "manual",
      created_by: user?.id,
    }).select("id").single();

    if (error || !lead) {
      toast.error("Erro ao salvar lead", { description: error?.message });
      setSaving(false);
      return;
    }

    toast.success("Lead cadastrado! Iniciando análise...");

    try {
      const { error: fnErr } = await supabase.functions.invoke("analyze-lead", {
        body: { lead_id: lead.id },
      });
      if (fnErr) {
        toast.error("Erro na análise", { description: fnErr.message });
      } else {
        toast.success("Análise concluída!");
      }
    } catch {
      toast.error("Erro ao chamar análise");
    }

    setSaving(false);
    navigate("/leads");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/leads")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Novo Lead</h1>
          <p className="text-sm text-muted-foreground">Cadastro manual de lead para análise de teses</p>
        </div>
      </div>

      <Card className="border-card-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Dados do Lead</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold">Nome completo *</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do contato" maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">WhatsApp *</Label>
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(11) 99999-9999" maxLength={20} />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">E-mail *</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@empresa.com" maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Empresa *</Label>
              <Input value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Nome da empresa" maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">CNPJ *</Label>
              <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" maxLength={18} />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Faturamento mensal *</Label>
              <Select value={faturamentoFaixa} onValueChange={setFaturamentoFaixa}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {FATURAMENTO_FAIXAS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Regime tributário *</Label>
              <Select value={regimeTributario} onValueChange={setRegimeTributario}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {REGIMES.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isSimplesNacional && (
                <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded-md p-2 border border-amber-200 dark:border-amber-700">
                  ⚠ O regime Simples Nacional não se enquadra nas teses tributárias atuais. Entre em contato para uma análise personalizada.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Segmento *</Label>
              <Select value={segmento} onValueChange={setSegmento}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {SEGMENTOS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={handleSubmit} disabled={saving} className="w-full font-bold">
              <Send className="h-4 w-4 mr-2" />
              {saving ? "Salvando e analisando..." : "Cadastrar e Analisar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
