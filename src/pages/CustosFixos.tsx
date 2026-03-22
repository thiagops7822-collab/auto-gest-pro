import { useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, type CustoFixo } from "@/lib/mock-data";
import { useData } from "@/contexts/DataContext";

const statusColors: Record<string, string> = {
  'Pago': 'badge-success',
  'Pendente': 'badge-warning',
  'Vencido': 'badge-danger',
  'Isento': 'bg-muted text-muted-foreground border-border',
};

const emptyForm = { nome: '', categoria: '', valorPrevisto: '', diaVencimento: '', recorrencia: '' };

export default function CustosFixos() {
  const [catFilter, setCatFilter] = useState("todos");
  const { custosList, setCustosList } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const filtered = custosList.filter(c => catFilter === "todos" || c.categoria === catFilter);
  const totalFixo = filtered.filter(c => c.categoria.startsWith('Fixo')).reduce((s, c) => s + c.valorPrevisto, 0);
  const totalVariavel = filtered.filter(c => c.categoria === 'Variável').reduce((s, c) => s + c.valorPrevisto, 0);
  const totalImposto = filtered.filter(c => c.categoria === 'Imposto').reduce((s, c) => s + c.valorPrevisto, 0);
  const totalGeral = filtered.reduce((s, c) => s + c.valorPrevisto, 0);

  const handleCreate = () => {
    if (!form.nome || !form.categoria || !form.valorPrevisto) {
      toast({ title: "Campos obrigatórios", description: "Preencha nome, categoria e valor.", variant: "destructive" });
      return;
    }
    const novo: CustoFixo = {
      id: crypto.randomUUID(),
      nome: form.nome.toUpperCase(),
      categoria: form.categoria as CustoFixo['categoria'],
      valorPrevisto: parseFloat(form.valorPrevisto) || 0,
      diaVencimento: parseInt(form.diaVencimento) || 1,
      recorrencia: form.recorrencia || 'Mensal',
      statusPagamento: 'Pendente',
    };
    setCustosList(prev => [novo, ...prev]);
    setForm(emptyForm);
    setDialogOpen(false);
    toast({ title: "Custo cadastrado!", description: `${novo.nome} adicionado com sucesso.` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Custos Fixos e Variáveis</h1>
          <p className="text-muted-foreground text-sm">Controle de despesas operacionais</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Novo Custo</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Cadastrar Custo</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="sm:col-span-2"><Label>Nome *</Label><Input placeholder="Ex: Aluguel" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} /></div>
              <div>
                <Label>Categoria *</Label>
                <Select value={form.categoria} onValueChange={v => setForm(p => ({ ...p, categoria: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fixo Mensal">Fixo Mensal</SelectItem>
                    <SelectItem value="Fixo Anual">Fixo Anual</SelectItem>
                    <SelectItem value="Variável">Variável</SelectItem>
                    <SelectItem value="Imposto">Imposto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Valor Previsto (R$) *</Label><Input type="number" placeholder="0,00" value={form.valorPrevisto} onChange={e => setForm(p => ({ ...p, valorPrevisto: e.target.value }))} /></div>
              <div><Label>Dia de Vencimento</Label><Input type="number" placeholder="10" value={form.diaVencimento} onChange={e => setForm(p => ({ ...p, diaVencimento: e.target.value }))} /></div>
              <div>
                <Label>Recorrência</Label>
                <Select value={form.recorrencia} onValueChange={v => setForm(p => ({ ...p, recorrencia: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mensal">Mensal</SelectItem>
                    <SelectItem value="Bimestral">Bimestral</SelectItem>
                    <SelectItem value="Trimestral">Trimestral</SelectItem>
                    <SelectItem value="Semestral">Semestral</SelectItem>
                    <SelectItem value="Anual">Anual</SelectItem>
                    <SelectItem value="Único">Único</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full mt-4" onClick={handleCreate}>Cadastrar</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="stat-card"><p className="text-xs text-muted-foreground">Custos Fixos</p><p className="text-xl font-bold text-info mt-1">{formatCurrency(totalFixo)}</p></div>
        <div className="stat-card"><p className="text-xs text-muted-foreground">Custos Variáveis</p><p className="text-xl font-bold text-warning mt-1">{formatCurrency(totalVariavel)}</p></div>
        <div className="stat-card"><p className="text-xs text-muted-foreground">Impostos</p><p className="text-xl font-bold text-destructive mt-1">{formatCurrency(totalImposto)}</p></div>
        <div className="stat-card"><p className="text-xs text-muted-foreground">Total Geral</p><p className="text-xl font-bold text-primary mt-1">{formatCurrency(totalGeral)}</p></div>
      </div>

      <Select value={catFilter} onValueChange={setCatFilter}>
        <SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todas as categorias</SelectItem>
          <SelectItem value="Fixo Mensal">Fixo Mensal</SelectItem>
          <SelectItem value="Fixo Anual">Fixo Anual</SelectItem>
          <SelectItem value="Variável">Variável</SelectItem>
          <SelectItem value="Imposto">Imposto</SelectItem>
        </SelectContent>
      </Select>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor Previsto</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Recorrência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor Pago</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.id} className="border-border">
                  <TableCell className="font-medium">{c.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{c.categoria}</TableCell>
                  <TableCell className="text-right">{formatCurrency(c.valorPrevisto)}</TableCell>
                  <TableCell className="text-muted-foreground">Dia {c.diaVencimento}</TableCell>
                  <TableCell className="text-muted-foreground">{c.recorrencia}</TableCell>
                  <TableCell><Badge variant="outline" className={statusColors[c.statusPagamento]}>{c.statusPagamento}</Badge></TableCell>
                  <TableCell className="text-right">{c.valorPago ? formatCurrency(c.valorPago) : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
