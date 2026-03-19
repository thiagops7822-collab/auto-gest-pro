import { useState } from "react";
import { Search, Plus, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ordensServico as initialData, formatCurrency, formatDate, getTotalRecebido, getSaldoPendente, getStatusPagamento, getTotalPecas, type OrdemServico } from "@/lib/mock-data";

const statusColors: Record<string, string> = {
  'Em Andamento': 'badge-info',
  'Aguardando Peça': 'badge-warning',
  'Pronto para Entrega': 'badge-success',
  'Finalizado': 'bg-muted text-muted-foreground border-border',
  'Cancelado': 'badge-danger',
};

const pagamentoColors: Record<string, string> = {
  'Pago': 'badge-success',
  'Pago Parcial': 'badge-warning',
  'Pendente': 'badge-danger',
};

const emptyForm = { placa: '', modelo: '', ano: '', cor: '', cliente: '', telefone: '', tipoServico: '', valorOrcado: '', descricao: '' };

export default function OrdensServico() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [selectedOS, setSelectedOS] = useState<OrdemServico | null>(null);
  const [osList, setOsList] = useState<OrdemServico[]>(initialData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const filtered = osList.filter(os => {
    const matchSearch = os.placa.toLowerCase().includes(search.toLowerCase()) ||
      os.cliente.toLowerCase().includes(search.toLowerCase()) ||
      os.numero.toString().includes(search);
    const matchStatus = statusFilter === "todos" || os.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleChange = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value.toUpperCase() }));

  const handleCreate = () => {
    if (!form.placa || !form.cliente || !form.modelo || !form.valorOrcado) {
      toast({ title: "Campos obrigatórios", description: "Preencha placa, cliente, modelo e valor orçado.", variant: "destructive" });
      return;
    }
    const nextNumero = Math.max(...osList.map(o => o.numero), 1000) + 1;
    const newOS: OrdemServico = {
      id: crypto.randomUUID(),
      numero: nextNumero,
      dataEntrada: new Date().toISOString().split('T')[0],
      placa: form.placa,
      modelo: form.modelo,
      ano: form.ano,
      cor: form.cor,
      cliente: form.cliente,
      telefone: form.telefone,
      tipoServico: form.tipoServico || 'Combinado',
      descricao: form.descricao,
      valorOrcado: parseFloat(form.valorOrcado) || 0,
      status: 'Em Andamento',
      pecas: [],
      pagamentos: [],
    };
    setOsList(prev => [newOS, ...prev]);
    setForm(emptyForm);
    setDialogOpen(false);
    toast({ title: "OS criada com sucesso!", description: `Ordem de Serviço #${nextNumero} cadastrada.` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ordens de Serviço</h1>
          <p className="text-muted-foreground text-sm">{osList.length} ordens cadastradas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Nova OS</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Ordem de Serviço</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div><Label>Placa *</Label><Input placeholder="ABC-1234" value={form.placa} onChange={e => handleChange('placa', e.target.value)} /></div>
              <div><Label>Modelo *</Label><Input placeholder="Ex: Honda Civic" value={form.modelo} onChange={e => handleChange('modelo', e.target.value)} /></div>
              <div><Label>Ano</Label><Input placeholder="2022" value={form.ano} onChange={e => handleChange('ano', e.target.value)} /></div>
              <div><Label>Cor</Label><Input placeholder="Prata" value={form.cor} onChange={e => handleChange('cor', e.target.value)} /></div>
              <div><Label>Cliente *</Label><Input placeholder="Nome completo" value={form.cliente} onChange={e => handleChange('cliente', e.target.value)} /></div>
              <div><Label>Telefone/WhatsApp</Label><Input placeholder="(11) 99999-9999" value={form.telefone} onChange={e => handleChange('telefone', e.target.value)} /></div>
              <div>
                <Label>Tipo de Serviço</Label>
                <Select value={form.tipoServico} onValueChange={v => handleChange('tipoServico', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Funilaria">Funilaria</SelectItem>
                    <SelectItem value="Pintura">Pintura</SelectItem>
                    <SelectItem value="Estética">Estética</SelectItem>
                    <SelectItem value="Combinado">Combinado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Valor Orçado (R$) *</Label><Input placeholder="0,00" type="number" value={form.valorOrcado} onChange={e => handleChange('valorOrcado', e.target.value)} /></div>
              <div className="sm:col-span-2"><Label>Descrição do Serviço</Label><Textarea placeholder="Descreva o serviço..." value={form.descricao} onChange={e => handleChange('descricao', e.target.value)} /></div>
            </div>
            <Button className="w-full mt-4" onClick={handleCreate}>Criar Ordem de Serviço</Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar por placa, cliente ou nº OS..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="Em Andamento">Em Andamento</SelectItem>
            <SelectItem value="Aguardando Peça">Aguardando Peça</SelectItem>
            <SelectItem value="Pronto para Entrega">Pronto para Entrega</SelectItem>
            <SelectItem value="Finalizado">Finalizado</SelectItem>
            <SelectItem value="Cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Nº OS</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead className="hidden md:table-cell">Modelo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Recebido</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Pendente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(os => {
                const statusPag = getStatusPagamento(os);
                return (
                  <TableRow key={os.id} className="border-border">
                    <TableCell className="font-mono font-semibold text-primary">#{os.numero}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(os.dataEntrada)}</TableCell>
                    <TableCell className="font-mono">{os.placa}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{os.modelo}</TableCell>
                    <TableCell>{os.cliente}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(os.valorOrcado)}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell text-success">{formatCurrency(getTotalRecebido(os))}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell text-warning">{formatCurrency(Math.max(0, getSaldoPendente(os)))}</TableCell>
                    <TableCell><Badge variant="outline" className={statusColors[os.status]}>{os.status}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className={pagamentoColors[statusPag]}>{statusPag}</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedOS(os)}><Eye className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedOS} onOpenChange={() => setSelectedOS(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedOS && (
            <>
              <DialogHeader>
                <DialogTitle>OS #{selectedOS.numero} — {selectedOS.modelo} ({selectedOS.placa})</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Cliente:</span><br /><strong>{selectedOS.cliente}</strong></div>
                  <div><span className="text-muted-foreground">Telefone:</span><br /><strong>{selectedOS.telefone}</strong></div>
                  <div><span className="text-muted-foreground">Tipo:</span><br /><strong>{selectedOS.tipoServico}</strong></div>
                  <div><span className="text-muted-foreground">Cor:</span><br /><strong>{selectedOS.cor}</strong></div>
                  <div><span className="text-muted-foreground">Ano:</span><br /><strong>{selectedOS.ano}</strong></div>
                  <div><span className="text-muted-foreground">Status:</span><br /><Badge variant="outline" className={statusColors[selectedOS.status]}>{selectedOS.status}</Badge></div>
                </div>
                <div className="text-sm"><span className="text-muted-foreground">Descrição:</span><br />{selectedOS.descricao}</div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Peças e Terceiros</h4>
                  {selectedOS.pecas.length === 0 ? <p className="text-muted-foreground text-sm">Nenhuma peça registrada</p> : (
                    <div className="space-y-2">
                      {selectedOS.pecas.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 text-sm">
                          <div>
                            <p className="font-medium">{p.descricao}</p>
                            <p className="text-muted-foreground text-xs">{p.fornecedor} • {p.status}</p>
                          </div>
                          <span className="font-semibold">{formatCurrency(p.valor)}</span>
                        </div>
                      ))}
                      <div className="text-right text-sm font-semibold text-primary">Total: {formatCurrency(getTotalPecas(selectedOS))}</div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Pagamentos Recebidos</h4>
                  {selectedOS.pagamentos.length === 0 ? <p className="text-muted-foreground text-sm">Nenhum pagamento registrado</p> : (
                    <div className="space-y-2">
                      {selectedOS.pagamentos.map(pg => (
                        <div key={pg.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 text-sm">
                          <div>
                            <p className="font-medium">{formatDate(pg.data)}</p>
                            <p className="text-muted-foreground text-xs">{pg.forma}{pg.observacao ? ` • ${pg.observacao}` : ''}</p>
                          </div>
                          <span className="font-semibold text-success">{formatCurrency(pg.valor)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="glass-card p-4">
                  <h4 className="font-semibold text-sm mb-3">Resultado da OS</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Valor cobrado:</span><br /><strong>{formatCurrency(selectedOS.valorOrcado)}</strong></div>
                    <div><span className="text-muted-foreground">Custo peças/terceiros:</span><br /><strong className="text-destructive">{formatCurrency(getTotalPecas(selectedOS))}</strong></div>
                    <div><span className="text-muted-foreground">Total recebido:</span><br /><strong className="text-success">{formatCurrency(getTotalRecebido(selectedOS))}</strong></div>
                    <div><span className="text-muted-foreground">Saldo pendente:</span><br /><strong className="text-warning">{formatCurrency(Math.max(0, getSaldoPendente(selectedOS)))}</strong></div>
                  </div>
                  {(() => {
                    const margem = selectedOS.valorOrcado - getTotalPecas(selectedOS);
                    const pct = selectedOS.valorOrcado > 0 ? (margem / selectedOS.valorOrcado * 100) : 0;
                    return (
                      <div className={`mt-3 p-3 rounded-lg text-center font-bold ${margem >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        Margem: {formatCurrency(margem)} ({pct.toFixed(1)}%)
                      </div>
                    );
                  })()}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
