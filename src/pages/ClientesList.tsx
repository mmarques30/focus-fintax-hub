import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2, Plus, CheckCircle2, AlertTriangle, AlertOctagon, FileText, Printer } from "lucide-react";
import { ClienteFormModal } from "@/components/clientes/ClienteFormModal";
import { formatCurrencyBR } from "@/lib/clientes-constants";
import { SEGMENTO_LABELS } from "@/lib/pipeline-constants";

export default function ClientesList() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const isComercial = userRole === "comercial";
  const [clientes, setClientes] = useState<any[]>([]);
  const [processos, setProcessos] = useState<any[]>([]);
  const [compensacoes, setCompensacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterSegmento, setFilterSegmento] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchAll = async () => {
    const [{ data: c }, { data: p }, { data: comp }] = await Promise.all([
      supabase.from("clientes").select("*").order("criado_em", { ascending: false }),
      supabase.from("processos_teses").select("id, cliente_id, valor_credito, status_contrato, status_processo, criado_em, atualizado_em, tese, nome_exibicao"),
      supabase.from("compensacoes_mensais").select("cliente_id, valor_compensado, processo_tese_id"),
    ]);
    setClientes(c || []);
    setProcessos(p || []);
    setCompensacoes(comp || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const getClienteStats = (clienteId: string) => {
    const cp = processos.filter((p) => p.cliente_id === clienteId);
    const assinados = cp.filter((p) => p.status_contrato === "assinado");
    const totalCredito = assinados.reduce((s, p) => s + Number(p.valor_credito || 0), 0);
    const totalCompensado = compensacoes
      .filter((c) => c.cliente_id === clienteId)
      .reduce((s, c) => s + Number(c.valor_compensado || 0), 0);

    const now = Date.now();
    const hasAlertAguardando = cp.some(
      (p) => p.status_contrato === "aguardando_assinatura" && (now - new Date(p.criado_em).getTime()) > 7 * 86400000
    );
    const hasAlertNaoProtocolado = cp.some(
      (p) => p.status_processo === "nao_protocolado" && (now - new Date(p.atualizado_em).getTime()) > 15 * 86400000
    );

    return { tesesAtivas: assinados.length, totalCredito, totalCompensado, saldo: totalCredito - totalCompensado, hasAlertAguardando, hasAlertNaoProtocolado };
  };

  // Global stats
  const allStats = clientes.map((c) => ({ ...c, ...getClienteStats(c.id) }));
  const totalClientes = clientes.length;
  const totalCompensando = clientes.filter((c) => c.compensando_fintax).length;
  const globalCredito = allStats.reduce((s, c) => s + c.totalCredito, 0);
  const globalCompensado = allStats.reduce((s, c) => s + c.totalCompensado, 0);

  // Filtering
  let filtered = allStats;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((c) => c.empresa?.toLowerCase().includes(q) || c.cnpj?.includes(q));
  }
  if (filterSegmento !== "all") filtered = filtered.filter((c) => c.segmento === filterSegmento);
  if (filterStatus === "compensando") filtered = filtered.filter((c) => c.compensando_fintax);
  else if (filterStatus !== "all") filtered = filtered.filter((c) => c.status === filterStatus);

  // Report data
  const reportClientes = [...allStats].sort((a, b) => b.totalCredito - a.totalCredito);
  const reportDate = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  // Breakdown por tese
  const teseBreakdown = (() => {
    const assinados = processos.filter((p) => p.status_contrato === "assinado");
    const map: Record<string, { nome: string; clientes: Set<string>; identificado: number; compensado: number }> = {};
    assinados.forEach((p) => {
      const key = p.tese || p.nome_exibicao;
      if (!map[key]) map[key] = { nome: p.nome_exibicao || p.tese, clientes: new Set(), identificado: 0, compensado: 0 };
      map[key].clientes.add(p.cliente_id);
      map[key].identificado += Number(p.valor_credito || 0);
      // sum compensações for this processo
      map[key].compensado += compensacoes
        .filter((c) => c.processo_tese_id === p.id)
        .reduce((s, c) => s + Number(c.valor_compensado || 0), 0);
    });
    return Object.values(map).sort((a, b) => b.identificado - a.identificado);
  })();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Clientes Ativos</h1>
          <Badge variant="secondary">{totalClientes}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setReportOpen(true)}>
            <FileText className="h-4 w-4 mr-1" /> Relatório da Carteira
          </Button>
          <Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4 mr-1" /> Cadastrar cliente</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Total Clientes</p><p className="text-lg font-bold">{totalClientes}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Compensando Fintax</p><p className="text-lg font-bold">{totalCompensando}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Crédito Identificado</p><p className="text-lg font-bold">{formatCurrencyBR(globalCredito)}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Já Compensado</p><p className="text-lg font-bold">{formatCurrencyBR(globalCompensado)}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Saldo Restante</p><p className="text-lg font-bold">{formatCurrencyBR(globalCredito - globalCompensado)}</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input placeholder="Buscar por nome ou CNPJ..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
        <Select value={filterSegmento} onValueChange={setFilterSegmento}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Segmento" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(SEGMENTO_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="compensando">Compensando</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="encerrado">Encerrado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead>Segmento</TableHead>
            <TableHead>Fintax</TableHead>
            <TableHead>Teses</TableHead>
            <TableHead>Crédito</TableHead>
            <TableHead>Compensado</TableHead>
            <TableHead>Saldo</TableHead>
            <TableHead>Alerta</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">Carregando...</TableCell></TableRow>
          ) : filtered.length === 0 ? (
            <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">Nenhum cliente encontrado.</TableCell></TableRow>
          ) : filtered.map((c) => (
            <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/clientes/${c.id}`)}>
              <TableCell className="font-medium">{c.empresa}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{c.cnpj}</TableCell>
              <TableCell className="text-sm">{SEGMENTO_LABELS[c.segmento] || c.segmento || "—"}</TableCell>
              <TableCell>{c.compensando_fintax ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <span className="text-muted-foreground">—</span>}</TableCell>
              <TableCell>{c.tesesAtivas}</TableCell>
              <TableCell>{formatCurrencyBR(c.totalCredito)}</TableCell>
              <TableCell>{formatCurrencyBR(c.totalCompensado)}</TableCell>
              <TableCell>{formatCurrencyBR(c.saldo)}</TableCell>
              <TableCell>
                {c.hasAlertNaoProtocolado ? <AlertOctagon className="h-4 w-4 text-red-500" /> :
                 c.hasAlertAguardando ? <AlertTriangle className="h-4 w-4 text-orange-500" /> : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ClienteFormModal open={modalOpen} onOpenChange={setModalOpen} onSuccess={fetchAll} />

      {/* Report Modal */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-[95vw] h-[90vh] overflow-auto print:max-w-full print:h-auto print:shadow-none print:border-none">
          <DialogHeader className="print:hidden">
            <div className="flex items-center justify-between">
              <DialogTitle>Relatório da Carteira</DialogTitle>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-1" /> Imprimir / PDF
              </Button>
            </div>
          </DialogHeader>

          <div id="report-content" className="space-y-6 print:space-y-4">
            {/* Title */}
            <div className="text-center border-b pb-4">
              <h2 className="text-xl font-bold text-foreground">Carteira Focus FinTax — Visão Consolidada</h2>
              <p className="text-sm text-muted-foreground mt-1">{reportDate}</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-4 gap-3">
              <Card><CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground">Total Clientes</p>
                <p className="text-lg font-bold">{totalClientes}</p>
              </CardContent></Card>
              <Card><CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground">Total Identificado</p>
                <p className="text-lg font-bold text-primary">{formatCurrencyBR(globalCredito)}</p>
              </CardContent></Card>
              <Card><CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground">Total Compensado</p>
                <p className="text-lg font-bold text-green-700">{formatCurrencyBR(globalCompensado)}</p>
              </CardContent></Card>
              <Card><CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground">Saldo Total</p>
                <p className="text-lg font-bold text-amber-600">{formatCurrencyBR(globalCredito - globalCompensado)}</p>
              </CardContent></Card>
            </div>

            {/* Client Table */}
            <div>
              <h3 className="text-sm font-semibold mb-2 text-foreground">Por Cliente</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead className="text-center">Teses</TableHead>
                    <TableHead className="text-right">Identificado</TableHead>
                    <TableHead className="text-right">Compensado</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="w-[140px]">% Recuperado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportClientes.map((c) => {
                    const pct = c.totalCredito > 0 ? Math.round((c.totalCompensado / c.totalCredito) * 100) : 0;
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium text-sm">{c.empresa}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{c.cnpj}</TableCell>
                        <TableCell className="text-center">{c.tesesAtivas}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrencyBR(c.totalCredito)}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrencyBR(c.totalCompensado)}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrencyBR(c.saldo)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={pct} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow className="font-bold">
                    <TableCell colSpan={3}>Total Geral</TableCell>
                    <TableCell className="text-right">{formatCurrencyBR(globalCredito)}</TableCell>
                    <TableCell className="text-right">{formatCurrencyBR(globalCompensado)}</TableCell>
                    <TableCell className="text-right">{formatCurrencyBR(globalCredito - globalCompensado)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={globalCredito > 0 ? Math.round((globalCompensado / globalCredito) * 100) : 0} className="h-2 flex-1" />
                        <span className="text-xs w-8 text-right">{globalCredito > 0 ? Math.round((globalCompensado / globalCredito) * 100) : 0}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>

            {/* Breakdown por tese */}
            <div>
              <h3 className="text-sm font-semibold mb-2 text-foreground">Por Tese</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tese</TableHead>
                    <TableHead className="text-center">Clientes</TableHead>
                    <TableHead className="text-right">Identificado</TableHead>
                    <TableHead className="text-right">Compensado</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teseBreakdown.map((t, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-sm">{t.nome}</TableCell>
                      <TableCell className="text-center">{t.clientes.size}</TableCell>
                      <TableCell className="text-right text-sm">{formatCurrencyBR(t.identificado)}</TableCell>
                      <TableCell className="text-right text-sm">{formatCurrencyBR(t.compensado)}</TableCell>
                      <TableCell className="text-right text-sm">{formatCurrencyBR(t.identificado - t.compensado)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-center">—</TableCell>
                    <TableCell className="text-right">{formatCurrencyBR(teseBreakdown.reduce((s, t) => s + t.identificado, 0))}</TableCell>
                    <TableCell className="text-right">{formatCurrencyBR(teseBreakdown.reduce((s, t) => s + t.compensado, 0))}</TableCell>
                    <TableCell className="text-right">{formatCurrencyBR(teseBreakdown.reduce((s, t) => s + (t.identificado - t.compensado), 0))}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
