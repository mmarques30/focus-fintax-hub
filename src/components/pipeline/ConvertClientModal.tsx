import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { PipelineLead } from "@/pages/Pipeline";

interface Props {
  lead: PipelineLead | null;
  onClose: () => void;
  onRefresh: () => void;
}

export function ConvertClientModal({ lead, onClose, onRefresh }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleConvert = async () => {
    if (!lead) return;
    setSaving(true);

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
      setSaving(false);
      return;
    }

    await supabase.from("leads").update({
      status_funil: "cliente_ativo",
      status_funil_atualizado_em: new Date().toISOString(),
    }).eq("id", lead.id);

    await supabase.from("lead_historico").insert({
      lead_id: lead.id,
      de_etapa: lead.status_funil,
      para_etapa: "cliente_ativo",
      anotacao: "Lead convertido em cliente",
      criado_por: user?.id,
    });

    toast.success("Lead convertido em cliente!");
    setSaving(false);
    onClose();
    onRefresh();
    navigate(`/clientes`);
  };

  const handleJustMove = async () => {
    if (!lead) return;
    const oldStage = lead.status_funil;
    await supabase.from("leads").update({
      status_funil: "cliente_ativo",
      status_funil_atualizado_em: new Date().toISOString(),
    }).eq("id", lead.id);
    await supabase.from("lead_historico").insert({
      lead_id: lead.id,
      de_etapa: oldStage,
      para_etapa: "cliente_ativo",
      criado_por: user?.id,
    });
    toast.success("Lead movido para Cliente Ativo");
    onClose();
    onRefresh();
  };

  return (
    <Dialog open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Converter em cliente ativo?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Deseja converter <strong>{lead?.empresa}</strong> em cliente ativo? Isso criará um registro na base de clientes.
        </p>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleJustMove}>Apenas mover</Button>
          <Button onClick={handleConvert} disabled={saving}>
            {saving ? "Convertendo..." : "Sim, converter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
