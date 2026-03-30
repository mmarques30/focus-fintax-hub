import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { formatCurrencyBR, getStatusPagamentoConfig, STATUS_PAGAMENTO } from "@/lib/clientes-constants";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  clienteId: string;
  onTotalChange?: (total: number) => void;
}

export function CompensacoesTab({ clienteId, onTotalChange }: Props) {
  const [compensacoes, setCompensacoes] = useState<any[]>([]);
  const [processos, setProcessos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterTese, setFilterTese] = useState("all");
  const [form, setForm] = useState({
    processo_tese_id: "",
    mes_referencia: "",
    valor_compensado: "",
    status_pagamento: "pendente",
    valor_nf_servico: "",
    observacao: "",
  });

  const fetch = useCallback(async () => {
    const [{ data: comp }, { data: proc }] = await Promise.all([
      supabase
        .from("compensacoes_mensais")
        .select("*, processos_teses(nome_exibicao, tese)")
        .eq("cliente_id", clienteId)
        .order("mes_referencia", { ascending: false }),
      supabase.from("processos_teses").select("id, nome_exibicao, tese").eq("cliente_id", clienteId),
    ]);
    setCompensacoes(comp || []);
    setProcessos(proc || []);
    setLoading(false);
    const total = (comp || []).reduce((s: number, c: any) => s + Number(c.valor_compensado || 0), 0);
    onTotalChange?.(total);
  }, [clienteId, onTotalChange]);

  useEffect(() => { fetch(); }, [fetch]);

  const filtered = filterTese === "all" ? compensacoes : compensacoes.filter((c) => c.processo_tese_id === filterTese);
  const totalFiltered = filtered.reduce((s, c) => s + Number(c.valor_compensado || 0), 0);

  const handleSave = async () => {
    if (!form.processo_tese_id || !form.mes_referencia) {
      toast.error("Processo e mês são obrigatórios.");
      return;
    }
    const { error } = await supabase.from("compensacoes_mensais").insert({
      cliente_id: clienteId,
      processo_tese_id: form.processo_tese_id,
      mes_referencia: form.mes_referencia + "-01",
      valor_compensado: Number(form.valor_compensado) || 0,
      status_pagamento: form.status_pagamento,
      valor_nf_servico: Number(form.valor_nf_servico) || 0,
      observacao: form.observacao,
    });
    if (error) { toast.error("Erro ao registrar."); return; }
    toast.success("Compensação registrada!");
    setModalOpen(false);
    setForm({ processo_tese_id: "", mes_referencia: "", valor_compensado: "", status_pagamento: "pendente", valor_nf_servico: "", observacao: "" });
    fetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Select value={filterTese} onValueChange={setFilterTese}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filtrar por tese" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as teses</SelectItem>
            {processos.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome_exibicao}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={() => setModalOpen(true)}><Plus className="h-4 w-4 mr-1" /> Registrar compensação</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mês Ref.</TableHead>
            <TableHead>Tese</TableHead>
            <TableHead>Valor Compensado</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>NF Serviço</TableHead>
            <TableHead>Obs.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Carregando...</TableCell></TableRow>
          ) : filtered.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhuma compensação registrada.</TableCell></TableRow>
          ) : filtered.map((c) => {
            const sp = getStatusPagamentoConfig(c.status_pagamento);
            return (
              <TableRow key={c.id}>
                <TableCell>{format(new Date(c.mes_referencia), "MMM/yyyy", { locale: ptBR })}</TableCell>
                <TableCell>{c.processos_teses?.nome_exibicao || "—"}</TableCell>
                <TableCell className="font-medium">{formatCurrencyBR(Number(c.valor_compensado || 0))}</TableCell>
                <TableCell><Badge variant="outline" className={sp.color}>{sp.label}</Badge></TableCell>
                <TableCell>{formatCurrencyBR(Number(c.valor_nf_servico || 0))}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-32 truncate">{c.observacao || "—"}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        {filtered.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2} className="font-medium">Total</TableCell>
              <TableCell className="font-bold">{formatCurrencyBR(totalFiltered)}</TableCell>
              <TableCell colSpan={3}></TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Registrar Compensação</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Processo / Tese *</Label>
              <Select value={form.processo_tese_id} onValueChange={(v) => setForm((p) => ({ ...p, processo_tese_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{processos.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome_exibicao}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Mês de Referência *</Label>
              <Input type="month" value={form.mes_referencia} onChange={(e) => setForm((p) => ({ ...p, mes_referencia: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Valor Compensado (R$)</Label>
              <Input type="number" value={form.valor_compensado} onChange={(e) => setForm((p) => ({ ...p, valor_compensado: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Status Pagamento</Label>
              <Select value={form.status_pagamento} onValueChange={(v) => setForm((p) => ({ ...p, status_pagamento: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_PAGAMENTO.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Valor NF de Serviço (R$)</Label>
              <Input type="number" value={form.valor_nf_servico} onChange={(e) => setForm((p) => ({ ...p, valor_nf_servico: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Observação</Label>
              <Textarea value={form.observacao} onChange={(e) => setForm((p) => ({ ...p, observacao: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
