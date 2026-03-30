import { useEffect, useState, useMemo, useCallback } from "react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Calculator, AlertTriangle, CheckCircle2 } from "lucide-react";

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
  atualizado_por: string | null;
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

const emptyTese: Omit<TeseConfig, "id" | "atualizado_em" | "atualizado_por"> = {
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
  const [editData, setEditData] = useState<Omit<TeseConfig, "id" | "atualizado_em" | "atualizado_por"> & { id?: string }>(emptyTese);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [simSegmento, setSimSegmento] = useState("supermercado");
  const [simRegime, setSimRegime] = useState("lucro_real");
  const [simFaturamento, setSimFaturamento] = useState("ate_2m");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const fetchTeses = async () => {
    const { data } = await supabase
      .from("motor_teses_config")
      .select("*")
      .order("ordem_exibicao", { ascending: true });
    setTeses((data as any[] || []).map((d) => ({
      ...d,
      percentual_min: Number(d.percentual_min),
      percentual_max: Number(d.percentual_max),
    })));
    setLoading(false);
  };

  useEffect(() => { fetchTeses(); }, []);

  const midpoint = FATURAMENTO_FAIXAS.find((f) => f.value === simFaturamento)?.midpoint || 1_000_000;

  const simulation = useMemo(() => {
    const eligible = teses.filter(
      (t) => t.ativo && t.regimes_elegiveis.includes(simRegime) && t.segmentos_elegiveis.includes(simSegmento)
    );
    const totalMin = eligible.reduce((s, t) => s + Math.round(midpoint * 60 * t.percentual_min), 0);
    const totalMax = eligible.reduce((s, t) => s + Math.round(midpoint * 60 * t.percentual_max), 0);
    const multMin = midpoint > 0 ? totalMin / midpoint : 0;
    const multMax = midpoint > 0 ? totalMax / midpoint : 0;
    return { eligible: eligible.length, totalMin, totalMax, multMin, multMax };
  }, [teses, simSegmento, simRegime, midpoint]);

  // Coverage grid
  const coverageGrid = useMemo(() => {
    const grid: Record<string, Record<string, { count: number; teses: string[] }>> = {};
    for (const s of SEGMENTOS) {
      grid[s.value] = {};
      for (const r of REGIMES) {
        const matching = teses.filter(
          (t) => t.ativo && t.regimes_elegiveis.includes(r.value) && t.segmentos_elegiveis.includes(s.value)
        );
        grid[s.value][r.value] = { count: matching.length, teses: matching.map((t) => t.nome_exibicao) };
      }
    }
    return grid;
  }, [teses]);

  const inlineSave = useCallback(async (id: string, fields: Record<string, any>) => {
    await supabase.from("motor_teses_config").update({
      ...fields,
      atualizado_em: new Date().toISOString(),
      atualizado_por: userId,
    }).eq("id", id);
    fetchTeses();
  }, [userId]);

  const toggleArrayField = useCallback(async (t: TeseConfig, field: "regimes_elegiveis" | "segmentos_elegiveis", item: string) => {
    const arr = t[field];
    const updated = arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
    await inlineSave(t.id, { [field]: updated });
  }, [inlineSave]);

  const toggleAtivo = async (t: TeseConfig) => {
    await inlineSave(t.id, { ativo: !t.ativo });
  };

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
      atualizado_por: userId,
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

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  if (loading) return <div className="p-8 text-muted-foreground">Carregando...</div>;

  const segLabel = SEGMENTOS.find((s) => s.value === simSegmento)?.label || simSegmento;
  const regLabel = REGIMES.find((r) => r.value === simRegime)?.label || simRegime;
  const fatLabel = FATURAMENTO_FAIXAS.find((f) => f.value === simFaturamento)?.label || simFaturamento;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Motor de Cálculo — Configuração de Teses</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Os percentuais abaixo são aplicados sobre o faturamento declarado × 60 meses para gerar a estimativa de cada tese no diagnóstico do lead. Ajuste com base nos casos reais da carteira para manter a precisão das estimativas.
        </p>
      </div>

      {/* Simulation Card — dark premium */}
      <div className="rounded-xl bg-[#0a1a6e] text-white p-6">
        <div className="flex items-center gap-2 mb-1">
          <Calculator className="h-5 w-5 text-blue-300" />
          <h2 className="font-semibold text-lg">Simulação ao Vivo</h2>
        </div>
        <p className="text-blue-200 text-sm mb-4">
          Para um <strong>{segLabel}</strong> em <strong>{regLabel}</strong> faturando <strong>{fatLabel}</strong>, o diagnóstico atual geraria:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <Label className="text-xs text-blue-200">Segmento</Label>
            <Select value={simSegmento} onValueChange={setSimSegmento}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SEGMENTOS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-blue-200">Regime</Label>
            <Select value={simRegime} onValueChange={setSimRegime}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {REGIMES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-blue-200">Faturamento</Label>
            <Select value={simFaturamento} onValueChange={setSimFaturamento}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {FATURAMENTO_FAIXAS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg bg-white/10 p-5 text-center">
          <p className="text-blue-200 text-sm mb-1">{simulation.eligible} teses elegíveis → Estimativa total (5 anos):</p>
          <p className="text-3xl font-bold">
            {formatCurrency(simulation.totalMin)} — {formatCurrency(simulation.totalMax)}
          </p>
          <p className="text-blue-300 text-sm mt-2">
            equivale a {simulation.multMin.toFixed(1)}–{simulation.multMax.toFixed(1)} faturamentos mensais
          </p>
        </div>
      </div>

      {/* Teses Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Teses Configuradas</CardTitle>
          <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Nova tese</Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tese</TableHead>
                  <TableHead>Regimes</TableHead>
                  <TableHead>Segmentos</TableHead>
                  <TableHead className="text-right w-[100px]">% Mín</TableHead>
                  <TableHead className="text-right w-[100px]">% Máx</TableHead>
                  <TableHead className="text-center">Ativo</TableHead>
                  <TableHead>Atualizado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teses.map((t) => (
                  <TeseRow
                    key={t.id}
                    tese={t}
                    onToggleAtivo={() => toggleAtivo(t)}
                    onToggleRegime={(r) => toggleArrayField(t, "regimes_elegiveis", r)}
                    onToggleSegmento={(s) => toggleArrayField(t, "segmentos_elegiveis", s)}
                    onInlineSave={inlineSave}
                    onEdit={() => openEdit(t)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Coverage Panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Cobertura por Perfil de Lead</CardTitle>
          <CardDescription>Cada célula mostra quantas teses ativas cobrem aquela combinação. Vermelho = diagnóstico vazio.</CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2 font-medium text-muted-foreground">Segmento</th>
                    {REGIMES.map((r) => (
                      <th key={r.value} className="p-2 font-medium text-muted-foreground text-center">{r.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SEGMENTOS.map((s) => (
                    <tr key={s.value}>
                      <td className="p-2 font-medium">{s.label}</td>
                      {REGIMES.map((r) => {
                        const cell = coverageGrid[s.value]?.[r.value];
                        const count = cell?.count || 0;
                        const names = cell?.teses || [];
                        return (
                          <td key={r.value} className="p-2 text-center">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold cursor-default ${
                                  count > 0
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                }`}>
                                  {count > 0 ? (
                                    <><CheckCircle2 className="h-3.5 w-3.5" />{count}</>
                                  ) : (
                                    <><AlertTriangle className="h-3.5 w-3.5" />0</>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[220px]">
                                {count > 0 ? (
                                  <div>
                                    <p className="font-medium mb-1">{count} tese(s) ativa(s):</p>
                                    <ul className="text-xs space-y-0.5">
                                      {names.map((n) => <li key={n}>• {n}</li>)}
                                    </ul>
                                  </div>
                                ) : (
                                  <p>Nenhuma tese ativa. Leads com esse perfil receberão diagnóstico vazio.</p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TooltipProvider>
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

/* ─── Inline-editable row component ─── */
function TeseRow({
  tese: t,
  onToggleAtivo,
  onToggleRegime,
  onToggleSegmento,
  onInlineSave,
  onEdit,
}: {
  tese: TeseConfig;
  onToggleAtivo: () => void;
  onToggleRegime: (r: string) => void;
  onToggleSegmento: (s: string) => void;
  onInlineSave: (id: string, fields: Record<string, any>) => Promise<void>;
  onEdit: () => void;
}) {
  const [minVal, setMinVal] = useState(String((t.percentual_min * 100).toFixed(2)));
  const [maxVal, setMaxVal] = useState(String((t.percentual_max * 100).toFixed(2)));

  useEffect(() => {
    setMinVal(String((t.percentual_min * 100).toFixed(2)));
    setMaxVal(String((t.percentual_max * 100).toFixed(2)));
  }, [t.percentual_min, t.percentual_max]);

  const saveMin = () => {
    const v = parseFloat(minVal) / 100;
    if (!isNaN(v) && v !== t.percentual_min) onInlineSave(t.id, { percentual_min: v });
  };
  const saveMax = () => {
    const v = parseFloat(maxVal) / 100;
    if (!isNaN(v) && v !== t.percentual_max) onInlineSave(t.id, { percentual_max: v });
  };

  return (
    <TableRow className={!t.ativo ? "opacity-50" : ""}>
      <TableCell className="font-medium max-w-[200px]">
        <div className="truncate">{t.nome_exibicao}</div>
        <div className="text-xs text-muted-foreground truncate">{t.tese}</div>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {REGIMES.map((r) => (
            <Badge
              key={r.value}
              variant={t.regimes_elegiveis.includes(r.value) ? "default" : "outline"}
              className="text-[10px] px-1.5 py-0 cursor-pointer select-none"
              onClick={() => onToggleRegime(r.value)}
            >
              {r.label}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {SEGMENTOS.map((s) => (
            <Badge
              key={s.value}
              variant={t.segmentos_elegiveis.includes(s.value) ? "default" : "outline"}
              className="text-[10px] px-1.5 py-0 cursor-pointer select-none"
              onClick={() => onToggleSegmento(s.value)}
            >
              {s.label}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Input
          type="number"
          step="0.01"
          value={minVal}
          onChange={(e) => setMinVal(e.target.value)}
          onBlur={saveMin}
          className="w-20 text-right text-sm h-8 ml-auto"
        />
      </TableCell>
      <TableCell className="text-right">
        <Input
          type="number"
          step="0.01"
          value={maxVal}
          onChange={(e) => setMaxVal(e.target.value)}
          onBlur={saveMax}
          className="w-20 text-right text-sm h-8 ml-auto"
        />
      </TableCell>
      <TableCell className="text-center">
        <Switch checked={t.ativo} onCheckedChange={onToggleAtivo} />
      </TableCell>
      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
        {new Date(t.atualizado_em).toLocaleDateString("pt-BR")}
      </TableCell>
      <TableCell>
        <Button size="icon" variant="ghost" onClick={onEdit}><Pencil className="h-4 w-4" /></Button>
      </TableCell>
    </TableRow>
  );
}
