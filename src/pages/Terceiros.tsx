import { useState } from "react";
import { Plus, Phone, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, type Terceiro } from "@/lib/mock-data";
import { useData } from "@/contexts/DataContext";

const tipoColors: Record<string, string> = {
  'Fornecedor de Peças': 'badge-info',
  'Prestador de Serviço': 'badge-warning',
  'Ambos': 'bg-primary/15 text-primary border-primary/30',
};

const emptyForm = { nome: '', tipo: '', telefone: '', especialidade: '' };

export default function Terceiros() {
  const { terceirosList, setTerceirosList, osList } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const handleCreate = () => {
    if (!form.nome || !form.tipo) {
      toast({ title: "Campos obrigatórios", description: "Preencha nome e tipo.", variant: "destructive" });
      return;
    }
    const novo: Terceiro = {
      id: crypto.randomUUID(),
      nome: form.nome.toUpperCase(),
      tipo: form.tipo as Terceiro['tipo'],
      telefone: form.telefone,
      especialidade: form.especialidade.toUpperCase(),
    };
    setTerceirosList(prev => [...prev, novo]);
    setForm(emptyForm);
    setDialogOpen(false);
    toast({ title: "Terceiro cadastrado!", description: `${novo.nome} adicionado.` });
  };

  const stats = terceirosList.map(t => {
    const osComTerceiro = osList.filter(os => os.pecas.some(p => p.fornecedor === t.nome));
    const totalPago = osComTerceiro.flatMap(os => os.pecas.filter(p => p.fornecedor === t.nome)).reduce((s, p) => s + p.valor, 0);
    const totalCobrado = osComTerceiro.reduce((s, os) => s + os.valorOrcado, 0);
    return { ...t, osCount: osComTerceiro.length, totalPago, totalCobrado, margem: totalCobrado - totalPago };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Terceiros e Fornecedores</h1>
          <p className="text-muted-foreground text-sm">{terceirosList.length} cadastrados</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Novo Terceiro</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Cadastrar Terceiro/Fornecedor</DialogTitle></DialogHeader>
            <div className="grid gap-4 mt-4">
              <div><Label>Nome *</Label><Input placeholder="Nome da empresa ou pessoa" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} /></div>
              <div>
                <Label>Tipo *</Label>
                <Select value={form.tipo} onValueChange={v => setForm(p => ({ ...p, tipo: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fornecedor de Peças">Fornecedor de Peças</SelectItem>
                    <SelectItem value="Prestador de Serviço">Prestador de Serviço</SelectItem>
                    <SelectItem value="Ambos">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Telefone/WhatsApp</Label><Input placeholder="(11) 99999-9999" value={form.telefone} onChange={e => setForm(p => ({ ...p, telefone: e.target.value }))} /></div>
              <div><Label>Especialidade</Label><Input placeholder="Ex: Vidros automotivos" value={form.especialidade} onChange={e => setForm(p => ({ ...p, especialidade: e.target.value }))} /></div>
            </div>
            <Button className="w-full mt-4" onClick={handleCreate}>Cadastrar</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(t => (
          <div key={t.id} className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{t.nome}</h3>
                  <p className="text-xs text-muted-foreground">{t.especialidade}</p>
                </div>
              </div>
              <Badge variant="outline" className={tipoColors[t.tipo]}>{t.tipo.split(' ')[0]}</Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Phone className="w-3 h-3" /> {t.telefone}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-secondary/50 rounded">
                <p className="text-xs text-muted-foreground">OS</p>
                <p className="font-bold text-foreground">{t.osCount}</p>
              </div>
              <div className="p-2 bg-secondary/50 rounded">
                <p className="text-xs text-muted-foreground">Pago</p>
                <p className="font-bold text-destructive text-sm">{formatCurrency(t.totalPago)}</p>
              </div>
              <div className="p-2 bg-secondary/50 rounded">
                <p className="text-xs text-muted-foreground">Margem</p>
                <p className={`font-bold text-sm ${t.margem >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(t.margem)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
