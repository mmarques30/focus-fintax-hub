import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Eye, RefreshCw, Search, Users } from "lucide-react";
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from "@/lib/lead-constants";

interface Lead {
  id: string;
  nome: string;
  empresa: string;
  cnpj: string;
  score_lead: number | null;
  status: string;
  criado_em: string;
  segmento: string;
}

export default function LeadQueue() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchLeads = async () => {
    setLoading(true);
    let query = supabase
      .from("leads")
      .select("id, nome, empresa, cnpj, score_lead, status, criado_em, segmento")
      .order("criado_em", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (error) {
      toast.error("Erro ao carregar leads");
    }
    setLeads(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const handleReprocess = async (leadId: string) => {
    toast.info("Reprocessando...");
    try {
      const { error } = await supabase.functions.invoke("analyze-lead", {
        body: { lead_id: leadId },
      });
      if (error) {
        toast.error("Erro ao reprocessar");
      } else {
        toast.success("Reprocessado com sucesso!");
        fetchLeads();
      }
    } catch {
      toast.error("Erro ao reprocessar");
    }
  };

  const filtered = leads.filter(
    (l) =>
      l.nome.toLowerCase().includes(search.toLowerCase()) ||
      l.empresa.toLowerCase().includes(search.toLowerCase()) ||
      l.cnpj.includes(search)
  );

  const stats = {
    total: leads.length,
    novos: leads.filter((l) => l.status === "novo").length,
    gerados: leads.filter((l) => l.status === "relatorio_gerado").length,
    enviados: leads.filter((l) => l.status === "enviado").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          <p className="text-sm text-muted-foreground">Fila de processamento e análise de teses</p>
        </div>
        <Button onClick={() => navigate("/leads/novo")} className="font-semibold">
          <Plus className="h-4 w-4 mr-2" />
          Novo Lead
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total },
          { label: "Novos", value: stats.novos },
          { label: "Relatórios", value: stats.gerados },
          { label: "Enviados", value: stats.enviados },
        ].map((s) => (
          <Card key={s.label} className="border-card-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="border-card-border">
        <CardHeader className="flex flex-row items-center justify-between pb-4 gap-4 flex-wrap">
          <CardTitle className="text-lg font-bold">Lista de Leads</CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filtrar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(LEAD_STATUS_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold uppercase tracking-wider text-xs">Nome</TableHead>
                  <TableHead className="font-semibold uppercase tracking-wider text-xs">Empresa</TableHead>
                  <TableHead className="font-semibold uppercase tracking-wider text-xs">CNPJ</TableHead>
                  <TableHead className="font-semibold uppercase tracking-wider text-xs">Score</TableHead>
                  <TableHead className="font-semibold uppercase tracking-wider text-xs">Status</TableHead>
                  <TableHead className="font-semibold uppercase tracking-wider text-xs">Data</TableHead>
                  <TableHead className="font-semibold uppercase tracking-wider text-xs text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhum lead encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-semibold text-foreground">{l.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{l.empresa}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">{l.cnpj}</TableCell>
                      <TableCell>
                        {l.score_lead != null ? (
                          <span className="font-bold text-foreground">{l.score_lead}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={LEAD_STATUS_COLORS[l.status] || ""}>
                          {LEAD_STATUS_LABELS[l.status] || l.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(l.criado_em).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        {["relatorio_gerado", "enviado"].includes(l.status) && (
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/leads/${l.id}/relatorio`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {["novo", "processando"].includes(l.status) && (
                          <Button variant="ghost" size="icon" onClick={() => handleReprocess(l.id)}>
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
