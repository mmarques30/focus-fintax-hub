import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, AlertTriangle, Calculator } from "lucide-react";

interface TeseConfig {
  id: string;
  tese: string;
  nome_exibicao: string;
  descricao_comercial: string | null;
  regimes_elegiveis: string[];
  segmentos_elegiveis: string[];
  percentual_min: number;
  percentual_max: number;
  ativo: boolean;
  ordem_exibicao: number;
  atualizado_em: string;
}

const REGIMES = [
  { value: "lucro_real", label: "Lucro Real" },
  { value: "lucro_presumido", label: "Lucro Presumido" },
  { value: "simples", label: "Simples Nacional" },
];

const SEGMENTOS = [
  { value: "supermercado", label: "Supermercado" },
  { value: "farmacia", label: "Farmácia" },
  { value: "pet", label: "PET" },
  { value: "materiais_construcao", label: "Mat. Construção" },
  { value: "outros", label: "Outros" },
];

const FATURAMENTO_FAIXAS = [
  { value: "ate_2m", label: "Até R$ 2M/mês", midpoint: 1_000_000 },
  { value: "2m_15m", label: "R$ 2M–15M/mês", midpoint: 3_500_000 },
  { value: "acima_15m", label: "Acima R$ 15M/mês", midpoint: 20_000_000 },
];

const emptyTese: Omit<TeseConfig, "id" | "atualizado_em"> = {
  tese: "",
  nome_exibicao: "",
  descricao_comercial: "",
  regimes_elegiveis: [],
  segmentos_elegiveis: [],
  percentual_min: 0,
  percentual_max: 0,
  ativo: true,
  ordem_exibicao: 0,
};

function formatCurrency(v: number): string {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  if (v >= 1_000) return `R$ ${Math.round(v / 1_000).toLocaleString("pt-BR")} mil`;
  return `R$ ${v}`;
}

export default function MotorConfig() {
  const [teses, setTeses] = useState<TeseConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<Omit<TeseConfig, "id" | "atualizado_em"> & { id?: string }>(emptyTese);
  const [saving, setSaving] = useState(false);

  // Simulation state
  const [simSegmento, setSimSegmento] = useState("supermercado");
  const [simRegime, setSimRegime] = useState("lucro_real");
  const [simFaturamento, setSimFaturamento] = useState("ate_2m");

  const fetchTeses = async () => {
    const { data } = await supabase
      .from("motor_teses_config")
      .select("*")
      .order("ordem_exibicao", { ascending: true });
    setTeses((data as any[] || []).map((d) => ({ ...d, percentual_min: Number(d.percentual_min), percentual_max: Number(d.percentual_max) })));
    setLoading(false);
  };

  useEffect(() => { fetchTeses(); }, []);

  // Simulation
  const simulation = useMemo(() => {
    const midpoint = FATURAMENTO_FAIXAS.find((f) => f.value === simFaturamento)?.midpoint || 1_000_000;
    const eligible = teses.filter(
      (t) => t.ativo && t.regimes_elegiveis.includes(simRegime) && t.segmentos_elegiveis.includes(simSegmento)
    );
    const totalMin = eligible.reduce((s, t) => s + Math.round(midpoint * 60 * t.percentual_min), 0);
    const totalMax = eligible.reduce((s, t) => s + Math.round(midpoint * 60 * t.percentual_max), 0);
    return { eligible: eligible.length, totalMin, totalMax };
  }, [teses, simSegmento, simRegime, simFaturamento]);

  // Coverage gaps
  const gaps = useMemo(() => {
    const missing: string[] = [];
    for (const r of REGIMES) {
      for (const s of SEGMENTOS) {
        const has = teses.some(
          (t) => t.ativo && t.regimes_elegiveis.includes(r.value) && t.segmentos_elegiveis.includes(s.value)
        );
        if (!has) missing.push(`${r.label} + ${s.label}`);
      }
    }
    return missing;
  }, [teses]);

  const openCreate = () => {
    setEditData({ ...emptyTese });
    setEditOpen(true);
  };

  const openEdit = (t: TeseConfig) => {
    setEditData({
      id: t.id,
      tese: t.tese,
      nome_exibicao: t.nome_exibicao,
      descricao_comercial: t.descricao_comercial || "",
      regimes_elegiveis: [...t.regimes_elegiveis],
      segmentos_elegiveis: [...t.segmentos_elegiveis],
      percentual_min: t.percentual_min,
      percentual_max: t.percentual_max,
      ativo: t.ativo,
      ordem_exibicao: t.ordem_exibicao,
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!editData.tese || !editData.nome_exibicao) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      tese: editData.tese,
      nome_exibicao: editData.nome_exibicao,
      descricao_comercial: editData.descricao_comercial || null,
      regimes_elegiveis: editData.regimes_elegiveis,
      segmentos_elegiveis: editData.segmentos_elegiveis,
      percentual_min: editData.percentual_min,
      percentual_max: editData.percentual_max,
      ativo: editData.ativo,
      ordem_exibicao: editData.ordem_exibicao,
      atualizado_em: new Date().toISOString(),
    };

    let error;
    if (editData.id) {
      ({ error } = await supabase.from("motor_teses_config").update(payload).eq("id", editData.id));
    } else {
      ({ error } = await supabase.from("motor_teses_config").insert(payload));
    }

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tese salva com sucesso" });
      setEditOpen(false);
      fetchTeses();
    }
    setSaving(false);
  };

  const toggleAtivo = async (t: TeseConfig) => {
    await supabase.from("motor_teses_config").update({ ativo: !t.ativo, atualizado_em: new Date().toISOString() }).eq("id", t.id);
    fetchTeses();
  };

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  if (loading) return <div className="p-8 text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Motor de Cálculo — Configuração de Teses</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Os percentuais abaixo são aplicados sobre o faturamento declarado × 60 meses para gerar a estimativa de cada tese no diagnóstico do lead. Ajuste com base nos casos reais da carteira.
        </p>
      </div>

      {/* Simulation Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Calculator className="h-4 w-4" /> Simulação ao Vivo</CardTitle>
          <CardDescription>Veja o resultado do diagnóstico para um perfil específico</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <Label className="text-xs">Segmento</Label>
              <Select value={simSegmento} onValueChange={setSimSegmento}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEGMENTOS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Regime</Label>
              <Select value={simRegime} onValueChange={setSimRegime}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REGIMES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Faturamento</Label>
              <Select value={simFaturamento} onValueChange={setSimFaturamento}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FATURAMENTO_FAIXAS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">{simulation.eligible} teses elegíveis → Estimativa total:</p>
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(simulation.totalMin)} — {formatCurrency(simulation.totalMax)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Gaps Alert */}
      {gaps.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Combinações sem tese ativa:</strong> {gaps.join(", ")}. Leads com esses perfis receberão diagnóstico vazio.
          </AlertDescription>
        </Alert>
      )}

      {/* Teses Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Teses Configuradas</CardTitle>
          <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Adicionar tese</Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tese</TableHead>
                  <TableHead>Regimes</TableHead>
                  <TableHead>Segmentos</TableHead>
                  <TableHead className="text-right">% Mín</TableHead>
                  <TableHead className="text-right">% Máx</TableHead>
                  <TableHead className="text-center">Ativo</TableHead>
                  <TableHead>Atualizado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teses.map((t) => (
                  <TableRow key={t.id} className={!t.ativo ? "opacity-50" : ""}>
                    <TableCell className="font-medium max-w-[200px]">
                      <div className="truncate">{t.nome_exibicao}</div>
                      <div className="text-xs text-muted-foreground truncate">{t.tese}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {t.regimes_elegiveis.map((r) => (
                          <Badge key={r} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {REGIMES.find((x) => x.value === r)?.label || r}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {t.segmentos_elegiveis.map((s) => (
                          <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0">
                            {SEGMENTOS.find((x) => x.value === s)?.label || s}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">{(t.percentual_min * 100).toFixed(2)}%</TableCell>
                    <TableCell className="text-right font-mono text-sm">{(t.percentual_max * 100).toFixed(2)}%</TableCell>
                    <TableCell className="text-center">
                      <Switch checked={t.ativo} onCheckedChange={() => toggleAtivo(t)} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(t.atualizado_em).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit/Create Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editData.id ? "Editar Tese" : "Nova Tese"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Identificador (slug)</Label>
                <Input value={editData.tese} onChange={(e) => setEditData({ ...editData, tese: e.target.value })} placeholder="pis_cofins_insumos" />
              </div>
              <div>
                <Label>Ordem de exibição</Label>
                <Input type="number" value={editData.ordem_exibicao} onChange={(e) => setEditData({ ...editData, ordem_exibicao: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label>Nome de exibição</Label>
              <Input value={editData.nome_exibicao} onChange={(e) => setEditData({ ...editData, nome_exibicao: e.target.value })} placeholder="PIS/COFINS Insumos" />
            </div>
            <div>
              <Label>Descrição comercial</Label>
              <Textarea value={editData.descricao_comercial || ""} onChange={(e) => setEditData({ ...editData, descricao_comercial: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>% Mínimo (decimal)</Label>
                <Input type="number" step="0.0001" value={editData.percentual_min} onChange={(e) => setEditData({ ...editData, percentual_min: Number(e.target.value) })} />
                <span className="text-xs text-muted-foreground">{(editData.percentual_min * 100).toFixed(2)}%</span>
              </div>
              <div>
                <Label>% Máximo (decimal)</Label>
                <Input type="number" step="0.0001" value={editData.percentual_max} onChange={(e) => setEditData({ ...editData, percentual_max: Number(e.target.value) })} />
                <span className="text-xs text-muted-foreground">{(editData.percentual_max * 100).toFixed(2)}%</span>
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Regimes elegíveis</Label>
              <div className="flex flex-wrap gap-3">
                {REGIMES.map((r) => (
                  <label key={r.value} className="flex items-center gap-1.5 text-sm">
                    <Checkbox
                      checked={editData.regimes_elegiveis.includes(r.value)}
                      onCheckedChange={() => setEditData({ ...editData, regimes_elegiveis: toggleArrayItem(editData.regimes_elegiveis, r.value) })}
                    />
                    {r.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Segmentos elegíveis</Label>
              <div className="flex flex-wrap gap-3">
                {SEGMENTOS.map((s) => (
                  <label key={s.value} className="flex items-center gap-1.5 text-sm">
                    <Checkbox
                      checked={editData.segmentos_elegiveis.includes(s.value)}
                      onCheckedChange={() => setEditData({ ...editData, segmentos_elegiveis: toggleArrayItem(editData.segmentos_elegiveis, s.value) })}
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
