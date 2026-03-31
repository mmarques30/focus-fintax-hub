import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logClienteHistorico } from "@/lib/cliente-historico";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}

interface ParsedRow {
  empresa: string;
  cnpj: string;
  cnpjNorm: string;
  dez: number;
  jan: number;
  fev: number;
  honorario: number;
  saldo: number;
  clienteId?: string;
  matched: boolean;
}

function normCnpj(raw: string): string {
  return (raw || "").replace(/[^\d]/g, "");
}

function parseMoneyCell(val: any): number {
  if (val == null) return 0;
  if (typeof val === "number") return val;
  const s = String(val).replace(/R\$\s*/g, "").replace(/\./g, "").replace(",", ".").replace("-", "0").trim();
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

export function ImportCompensacoesModal({ open, onOpenChange, onImported }: Props) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [step, setStep] = useState<"upload" | "preview" | "importing" | "done">("upload");
  const [result, setResult] = useState({ compensacoes: 0, clientes: 0 });

  const handleFile = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const jsonData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

    // Find header row
    const headerIdx = jsonData.findIndex(row =>
      row.some((cell: any) => String(cell).toUpperCase().includes("EMPRESAS"))
    );
    if (headerIdx < 0) {
      toast.error("Formato inválido — não encontrei a coluna EMPRESAS");
      return;
    }

    const headerRow = jsonData[headerIdx].map((c: any) => String(c).toUpperCase().trim());

    // Find column indices
    const colEmpresa = headerRow.findIndex((h: string) => h.includes("EMPRESA"));
    const colCnpj = headerRow.findIndex((h: string) => h.includes("CNPJ"));
    const colDez = headerRow.findIndex((h: string) => h === "DEZ" || h.includes("DEZEMBRO"));
    const colJan = headerRow.findIndex((h: string) => h === "JAN" || h.includes("JANEIRO"));
    const colFev = headerRow.findIndex((h: string) => h === "FEV" || h.includes("FEVEREIRO"));
    const colHonorario = headerRow.findIndex((h: string) => h.includes("HONORARIO") || h.includes("HONORÁRIO"));
    const colSaldo = headerRow.findIndex((h: string) => h.includes("SALDO"));

    if (colEmpresa < 0 || colCnpj < 0) {
      toast.error("Colunas EMPRESAS e CNPJ são obrigatórias");
      return;
    }

    const dataRows = jsonData.slice(headerIdx + 1).filter(row => {
      const cnpj = normCnpj(String(row[colCnpj] || ""));
      return cnpj.length >= 11 && String(row[colEmpresa] || "").trim().length > 0;
    });

    const parsed: ParsedRow[] = dataRows.map(row => ({
      empresa: String(row[colEmpresa] || "").trim(),
      cnpj: String(row[colCnpj] || "").trim(),
      cnpjNorm: normCnpj(String(row[colCnpj] || "")),
      dez: colDez >= 0 ? parseMoneyCell(row[colDez]) : 0,
      jan: colJan >= 0 ? parseMoneyCell(row[colJan]) : 0,
      fev: colFev >= 0 ? parseMoneyCell(row[colFev]) : 0,
      honorario: colHonorario >= 0 ? parseMoneyCell(row[colHonorario]) : 0,
      saldo: colSaldo >= 0 ? parseMoneyCell(row[colSaldo]) : 0,
      matched: false,
    }));

    // Match with DB clients
    const { data: clientes } = await supabase.from("clientes").select("id, cnpj, empresa");
    const clienteMap = new Map<string, string>();
    (clientes || []).forEach(c => clienteMap.set(normCnpj(c.cnpj), c.id));

    parsed.forEach(r => {
      const id = clienteMap.get(r.cnpjNorm);
      if (id) {
        r.clienteId = id;
        r.matched = true;
      }
    });

    setRows(parsed);
    setStep("preview");
  };

  const handleImport = async () => {
    setStep("importing");
    const matched = rows.filter(r => r.matched && r.clienteId);
    let totalComp = 0;
    const clienteIds = new Set<string>();

    for (const row of matched) {
      const clienteId = row.clienteId!;

      // Get or create a process for this client
      const { data: procs } = await supabase
        .from("processos_teses")
        .select("id")
        .eq("cliente_id", clienteId)
        .limit(1);

      let processoId: string;
      if (procs && procs.length > 0) {
        processoId = procs[0].id;
      } else {
        const { data: newProc } = await supabase
          .from("processos_teses")
          .insert({
            cliente_id: clienteId,
            tese: "importacao_xlsx",
            nome_exibicao: "Importação Planilha",
            status_contrato: "assinado",
            status_processo: "compensando",
            valor_credito: row.saldo + row.dez + row.jan + row.fev,
          })
          .select("id")
          .single();
        processoId = newProc?.id || "";
      }

      if (!processoId) continue;

      const months: { date: string; value: number }[] = [];
      if (row.dez > 0) months.push({ date: "2024-12-01", value: row.dez });
      if (row.jan > 0) months.push({ date: "2025-01-01", value: row.jan });
      if (row.fev > 0) months.push({ date: "2025-02-01", value: row.fev });

      if (months.length === 0) continue;

      const honorarioPorMes = months.length > 0 ? row.honorario / months.length : 0;

      const inserts = months.map(m => ({
        cliente_id: clienteId,
        processo_tese_id: processoId,
        mes_referencia: m.date,
        valor_compensado: m.value,
        valor_nf_servico: Math.round(honorarioPorMes * 100) / 100,
        status_pagamento: "pendente" as const,
        observacao: "Importado via planilha XLSX",
      }));

      const { error } = await supabase.from("compensacoes_mensais").insert(inserts);
      if (!error) {
        totalComp += inserts.length;
        clienteIds.add(clienteId);
        const totalVal = months.reduce((s, m) => s + m.value, 0);
        await logClienteHistorico(
          clienteId,
          "compensacao_adicionada",
          `Importação em lote: ${inserts.length} meses, total ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalVal)}`
        );
      }
    }

    setResult({ compensacoes: totalComp, clientes: clienteIds.size });
    setStep("done");
  };

  const handleClose = () => {
    onOpenChange(false);
    if (step === "done") onImported();
    setTimeout(() => {
      setRows([]);
      setStep("upload");
      setResult({ compensacoes: 0, clientes: 0 });
    }, 300);
  };

  const matchedCount = rows.filter(r => r.matched).length;
  const unmatchedCount = rows.length - matchedCount;
  const totalMeses = rows.filter(r => r.matched).reduce((s, r) => s + (r.dez > 0 ? 1 : 0) + (r.jan > 0 ? 1 : 0) + (r.fev > 0 ? 1 : 0), 0);

  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-navy">Importar Compensações (XLSX)</DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              Selecione a planilha de compensações.<br />
              Formato esperado: EMPRESAS, CNPJ, meses (DEZ, JAN, FEV...), HONORARIO, SALDO
            </p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              <Button asChild variant="outline">
                <span>Selecionar arquivo .xlsx</span>
              </Button>
            </label>
          </div>
        )}

        {step === "preview" && (
          <>
            <div className="flex gap-3 mb-3">
              <Badge variant="secondary" className="bg-dash-green/10 text-dash-green">
                <CheckCircle2 className="h-3 w-3 mr-1" /> {matchedCount} encontrados
              </Badge>
              {unmatchedCount > 0 && (
                <Badge variant="secondary" className="bg-dash-red/10 text-dash-red">
                  <XCircle className="h-3 w-3 mr-1" /> {unmatchedCount} não encontrados
                </Badge>
              )}
              <Badge variant="secondary">
                {totalMeses} registros a importar
              </Badge>
            </div>

            <div className="border rounded-md overflow-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>DEZ</TableHead>
                    <TableHead>JAN</TableHead>
                    <TableHead>FEV</TableHead>
                    <TableHead>Honorário</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow key={i} className={!r.matched ? "opacity-50" : ""}>
                      <TableCell className="text-xs font-medium">{r.empresa}</TableCell>
                      <TableCell className="text-xs font-mono">{r.cnpj}</TableCell>
                      <TableCell className="text-xs">{r.dez > 0 ? fmt(r.dez) : "—"}</TableCell>
                      <TableCell className="text-xs">{r.jan > 0 ? fmt(r.jan) : "—"}</TableCell>
                      <TableCell className="text-xs">{r.fev > 0 ? fmt(r.fev) : "—"}</TableCell>
                      <TableCell className="text-xs">{fmt(r.honorario)}</TableCell>
                      <TableCell>
                        {r.matched ? (
                          <Badge variant="secondary" className="bg-dash-green/10 text-dash-green text-[10px]">
                            <CheckCircle2 className="h-3 w-3 mr-0.5" /> OK
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-dash-red/10 text-dash-red text-[10px]">
                            <XCircle className="h-3 w-3 mr-0.5" /> Não encontrado
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button onClick={handleImport} disabled={matchedCount === 0}>
                Confirmar importação ({matchedCount} clientes)
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "importing" && (
          <div className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Importando compensações...</p>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle2 className="h-12 w-12 text-dash-green" />
            <p className="text-lg font-display font-bold text-navy">Importação concluída!</p>
            <p className="text-sm text-muted-foreground">
              {result.compensacoes} compensações importadas para {result.clientes} clientes
            </p>
            <Button onClick={handleClose}>Fechar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
