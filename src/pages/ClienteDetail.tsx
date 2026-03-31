import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, MessageCircle, Upload, Pencil, Trash2, Clock, AlertTriangle, FileText, Mail } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ProcessosTesesTab } from "@/components/clientes/ProcessosTesesTab";
import { CompensacoesTab } from "@/components/clientes/CompensacoesTab";
import { ResumoFinanceiroTab } from "@/components/clientes/ResumoFinanceiroTab";
import { SEGMENTO_LABELS } from "@/lib/pipeline-constants";
import { formatCurrencyBR } from "@/lib/clientes-constants";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle as AlertTitle } from "@/components/ui/alert-dialog";
import { ClienteFormModal } from "@/components/clientes/ClienteFormModal";

export default function ClienteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userRole, permissions } = useAuth();
  const [cliente, setCliente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [compensacoesTotal, setCompensacoesTotal] = useState(0);
  const obsDebounce = useRef<NodeJS.Timeout>();

  // Laratex CSV import state
  const [laratexOpen, setLatatexOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingCliente, setDeletingCliente] = useState(false);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({ tese: "", valor_credito: "", mes_referencia: "", valor_compensado: "" });
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (userRole === "comercial") {
      toast.error("Acesso restrito");
      navigate("/clientes");
      return;
    }
    if (!id) return;
    supabase.from("clientes").select("*").eq("id", id).single().then(({ data, error }) => {
      if (error || !data) { navigate("/clientes"); return; }
      setCliente(data);
      setLoading(false);
    });
  }, [id, navigate, userRole]);

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

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) { toast.error("CSV vazio ou inválido"); return; }
      const sep = lines[0].includes(";") ? ";" : ",";
      const headers = lines[0].split(sep).map((h) => h.trim().replace(/^"|"$/g, ""));
      const rows = lines.slice(1).map((l) => l.split(sep).map((c) => c.trim().replace(/^"|"$/g, "")));
      setCsvHeaders(headers);
      setCsvData(rows);
      setColumnMap({ tese: "", valor_credito: "", mes_referencia: "", valor_compensado: "" });
    };
    reader.readAsText(file, "utf-8");
  };

  const parseCurrency = (v: string) => {
    if (!v) return 0;
    return Number(v.replace(/[R$\s.]/g, "").replace(",", ".")) || 0;
  };

  const handleImport = async () => {
    if (!columnMap.tese) { toast.error("Mapeie ao menos a coluna Tese"); return; }
    setImporting(true);
    try {
      const teseIdx = csvHeaders.indexOf(columnMap.tese);
      const creditoIdx = columnMap.valor_credito ? csvHeaders.indexOf(columnMap.valor_credito) : -1;
      const mesIdx = columnMap.mes_referencia ? csvHeaders.indexOf(columnMap.mes_referencia) : -1;
      const compIdx = columnMap.valor_compensado ? csvHeaders.indexOf(columnMap.valor_compensado) : -1;

      // Group by tese name, sum valor_credito
      const teseMap: Record<string, number> = {};
      csvData.forEach((row) => {
        const tese = row[teseIdx]?.trim();
        if (!tese) return;
        const val = creditoIdx >= 0 ? parseCurrency(row[creditoIdx]) : 0;
        teseMap[tese] = (teseMap[tese] || 0) + val;
      });

      // Insert processos_teses
      const processoInserts = Object.entries(teseMap).map(([tese, total]) => ({
        cliente_id: id!,
        tese: tese.toLowerCase().replace(/\s+/g, "_"),
        nome_exibicao: tese,
        valor_credito: total,
        status_contrato: "assinado" as const,
      }));

      const { data: insertedProcessos, error: pErr } = await supabase
        .from("processos_teses")
        .insert(processoInserts)
        .select("id, nome_exibicao");

      if (pErr) throw pErr;

      // Insert compensações if mapped
      if (mesIdx >= 0 && compIdx >= 0 && insertedProcessos) {
        const processoIdMap: Record<string, string> = {};
        insertedProcessos.forEach((p) => { processoIdMap[p.nome_exibicao] = p.id; });

        const compInserts = csvData
          .filter((row) => row[teseIdx]?.trim() && row[mesIdx]?.trim() && parseCurrency(row[compIdx]) > 0)
          .map((row) => {
            const tese = row[teseIdx].trim();
            const processoId = processoIdMap[tese];
            if (!processoId) return null;
            let mesRef = row[mesIdx].trim();
            // Try to parse date formats: dd/mm/yyyy, mm/yyyy, yyyy-mm-dd
            if (/^\d{2}\/\d{4}$/.test(mesRef)) mesRef = `${mesRef.slice(3)}-${mesRef.slice(0, 2)}-01`;
            else if (/^\d{2}\/\d{2}\/\d{4}$/.test(mesRef)) mesRef = `${mesRef.slice(6)}-${mesRef.slice(3, 5)}-01`;
            return {
              cliente_id: id!,
              processo_tese_id: processoId,
              mes_referencia: mesRef,
              valor_compensado: parseCurrency(row[compIdx]),
            };
          })
          .filter(Boolean);

        if (compInserts.length > 0) {
          const { error: cErr } = await supabase.from("compensacoes_mensais").insert(compInserts as any);
          if (cErr) throw cErr;
        }
        toast.success(`Importados: ${processoInserts.length} processos, ${compInserts.length} compensações`);
      } else {
        toast.success(`Importados: ${processoInserts.length} processos`);
      }

      setLatatexOpen(false);
      setCsvData([]);
      setCsvHeaders([]);
      // Reload page data
      window.location.reload();
    } catch (err: any) {
      toast.error("Erro na importação: " + (err.message || err));
    } finally {
      setImporting(false);
    }
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

        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => setEditOpen(true)}>
            <Pencil className="h-3.5 w-3.5" /> Editar
          </Button>
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive gap-1" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-3.5 w-3.5" /> Excluir
          </Button>
        </div>

        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={() => setLatatexOpen(true)}>
          <Upload className="h-4 w-4" /> Importar dados Laratex
        </Button>

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
          <p className="text-[10px] text-muted-foreground -mt-2">Marcação interna — filtros baseados em dados reais de compensação.</p>
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
        {(() => {
          const canTab = (key: string) => {
            const p = permissions.find((pp) => pp.screen_key === key);
            return !p || p.can_access;
          };
          const tabs = [
            { value: "processos", label: "Processos por Tese", key: "clientes.processos" },
            { value: "compensacoes", label: "Compensações", key: "clientes.compensacoes" },
            { value: "resumo", label: "Resumo Financeiro", key: "clientes.resumo" },
          ].filter((t) => canTab(t.key));
          if (tabs.length === 0) return <p className="text-muted-foreground text-sm">Nenhuma aba disponível.</p>;
          const defaultVal = tabs[0].value;
          return (
            <Tabs defaultValue={defaultVal}>
              <TabsList>
                {tabs.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
              </TabsList>
              {tabs.some((t) => t.value === "processos") && (
                <TabsContent value="processos"><ProcessosTesesTab clienteId={id!} compensacoesTotal={compensacoesTotal} /></TabsContent>
              )}
              {tabs.some((t) => t.value === "compensacoes") && (
                <TabsContent value="compensacoes"><CompensacoesTab clienteId={id!} cliente={cliente} onTotalChange={setCompensacoesTotal} /></TabsContent>
              )}
              {tabs.some((t) => t.value === "resumo") && (
                <TabsContent value="resumo"><ResumoFinanceiroTab clienteId={id!} cliente={cliente} /></TabsContent>
              )}
            </Tabs>
          );
        })()}
      </div>

      {/* Mapa Tributário Modal */}

      {/* Laratex CSV Import Modal */}
      <Dialog open={laratexOpen} onOpenChange={(v) => { setLatatexOpen(v); if (!v) { setCsvData([]); setCsvHeaders([]); } }}>
        <DialogContent className="max-w-[700px] max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Importação temporária de dados — aguardando integração direta com Laratex</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Upload area */}
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">Exporte os dados do cliente no Laratex em formato CSV e importe aqui.</p>
              <label className="cursor-pointer">
                <span className="text-sm text-primary hover:underline">Selecionar arquivo CSV</span>
                <input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
              </label>
            </div>

            {/* Preview */}
            {csvHeaders.length > 0 && (
              <>
                <div className="rounded border overflow-auto max-h-[200px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {csvHeaders.map((h, i) => <TableHead key={i} className="text-xs whitespace-nowrap">{h}</TableHead>)}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvData.slice(0, 5).map((row, ri) => (
                        <TableRow key={ri}>
                          {row.map((cell, ci) => <TableCell key={ci} className="text-xs py-1">{cell}</TableCell>)}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground">{csvData.length} linhas detectadas · Mostrando primeiras 5</p>

                {/* Column mapping */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "tese", label: "Tese *" },
                    { key: "valor_credito", label: "Valor Crédito" },
                    { key: "mes_referencia", label: "Mês Referência" },
                    { key: "valor_compensado", label: "Valor Compensado" },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-1">
                      <label className="text-xs font-medium">{label}</label>
                      <Select value={columnMap[key]} onValueChange={(v) => setColumnMap((prev) => ({ ...prev, [key]: v === "__ignore__" ? "" : v }))}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="— Ignorar —" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__ignore__">— Ignorar —</SelectItem>
                          {csvHeaders.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <Button onClick={handleImport} disabled={importing || !columnMap.tese} className="w-full">
                  {importing ? "Importando..." : "Confirmar importação"}
                </Button>
              </>
            )}

            <p className="text-xs text-muted-foreground italic text-center">
              Esta importação será substituída pela integração automática com Laratex quando disponível.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <ClienteFormModal open={editOpen} onOpenChange={setEditOpen} onSuccess={() => {
        supabase.from("clientes").select("*").eq("id", id!).single().then(({ data }) => { if (data) setCliente(data); });
      }} cliente={cliente} />

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertTitle>Excluir cliente</AlertTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{cliente.empresa}</strong>? Todos os processos e compensações associados serão removidos. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingCliente}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={deletingCliente} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={async () => {
              setDeletingCliente(true);
              await supabase.from("compensacoes_mensais").delete().eq("cliente_id", id!);
              await supabase.from("processos_teses").delete().eq("cliente_id", id!);
              const { error } = await supabase.from("clientes").delete().eq("id", id!);
              setDeletingCliente(false);
              if (error) { toast.error("Erro ao excluir cliente."); return; }
              toast.success("Cliente excluído com sucesso!");
              navigate("/clientes");
            }}>{deletingCliente ? "Excluindo..." : "Excluir"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
