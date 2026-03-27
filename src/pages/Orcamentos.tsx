import { useState } from "react";
import { Search, Plus, Eye, Pencil, Trash2, FileDown, ArrowRightLeft, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate, type OrdemServico } from "@/lib/mock-data";
import { useData, type Orcamento, type OrcamentoItem } from "@/contexts/DataContext";
import { exportOrcamentoPDF } from "@/lib/pdf-orcamento";

const statusColors: Record<string, string> = {
  'Pendente': 'badge-warning',
  'Aprovado': 'badge-success',
  'Recusado': 'badge-danger',
  'Convertido': 'bg-muted text-muted-foreground border-border',
};

const operacaoOptions = [
  'Peças',
  'Mecânica',
  'Funilaria',
  'Pintura',
  'Montagem',
  'Funilaria + Pintura',
  'Funilaria + Montagem',
  'Pintura + Montagem',
  'Funilaria + Pintura + Montagem',
];

function isPecas(operacao: string) {
  return operacao === 'Peças';
}

interface OrcamentoForm {
  placa: string; modelo: string; ano: string; cor: string;
  cliente: string; telefone: string; sinistro: string;
  orcamentista: string;
  observacoes: string; validade: string;
  itens: OrcamentoItem[];
}

const emptyForm: OrcamentoForm = {
  placa: '', modelo: '', ano: '', cor: '', cliente: '', telefone: '',
  sinistro: 'Não', orcamentista: '',
  observacoes: '', validade: '',
  itens: [],
};

const createEmptyItem = (): OrcamentoItem => ({
  id: crypto.randomUUID(),
  operacao: '',
  descricao: '',
  qtde: 1,
  valorUnitario: 0,
  valorTotal: 0,
});

function getTotal(itens: OrcamentoItem[]) {
  return itens.reduce((sum, i) => sum + i.valorTotal, 0);
}

export default function Orcamentos() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [selectedOrc, setSelectedOrc] = useState<Orcamento | null>(null);
  const { orcamentosList, setOrcamentosList, osList, setOsList } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<OrcamentoForm>(emptyForm);
  const [editingOrc, setEditingOrc] = useState<Orcamento | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<OrcamentoForm>(emptyForm);
  const [deleteOrc, setDeleteOrc] = useState<Orcamento | null>(null);
  const [convertOrc, setConvertOrc] = useState<Orcamento | null>(null);
  const { toast } = useToast();

  const filtered = orcamentosList.filter(orc => {
    const matchSearch = orc.placa.toLowerCase().includes(search.toLowerCase()) ||
      orc.cliente.toLowerCase().includes(search.toLowerCase()) ||
      orc.numero.toString().includes(search);
    const matchStatus = statusFilter === "todos" || orc.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleChange = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value.toUpperCase() }));

  const handleEditChange = (field: string, value: string) =>
    setEditForm(prev => ({ ...prev, [field]: value.toUpperCase() }));

  const addItem = (setter: React.Dispatch<React.SetStateAction<OrcamentoForm>>) => {
    setter(prev => ({ ...prev, itens: [...prev.itens, createEmptyItem()] }));
  };

  const removeItem = (setter: React.Dispatch<React.SetStateAction<OrcamentoForm>>, id: string) => {
    setter(prev => ({ ...prev, itens: prev.itens.filter(i => i.id !== id) }));
  };

  const updateItem = (setter: React.Dispatch<React.SetStateAction<OrcamentoForm>>, id: string, field: keyof OrcamentoItem, value: string | number) => {
    setter(prev => ({
      ...prev,
      itens: prev.itens.map(item => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };

        // When changing operation, reset values appropriately
        if (field === 'operacao') {
          if (isPecas(value as string)) {
            updated.qtde = updated.qtde || 1;
          } else {
            updated.qtde = 1;
            updated.valorTotal = updated.valorUnitario;
          }
        }

        if (isPecas(updated.operacao)) {
          // Peças: total = qtde * valorUnitario
          if (field === 'qtde' || field === 'valorUnitario') {
            const qtde = field === 'qtde' ? Number(value) : item.qtde;
            const unitario = field === 'valorUnitario' ? Number(value) : item.valorUnitario;
            updated.valorTotal = qtde * unitario;
          }
        } else {
          // Serviços: total = valorUnitario (valor do serviço)
          if (field === 'valorUnitario') {
            updated.valorTotal = Number(value);
          }
        }

        if (field === 'valorTotal') {
          updated.valorTotal = Number(value);
        }
        return updated;
      }),
    }));
  };

  const getDefaultValidade = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  };

  const handleCreate = () => {
    if (!form.modelo) {
      toast({ title: "Campo obrigatório", description: "Preencha o modelo do veículo.", variant: "destructive" });
      return;
    }
    const nextNumero = Math.max(...orcamentosList.map(o => o.numero), 0) + 1;
    const newOrc: Orcamento = {
      id: crypto.randomUUID(),
      numero: nextNumero,
      dataCriacao: new Date().toISOString().split('T')[0],
      validade: form.validade || getDefaultValidade(),
      placa: form.placa, modelo: form.modelo, ano: form.ano, cor: form.cor,
      cliente: form.cliente, telefone: form.telefone, sinistro: form.sinistro,
      orcamentista: form.orcamentista,
      itens: form.itens,
      observacoes: form.observacoes,
      status: 'Pendente',
    };
    setOrcamentosList(prev => [newOrc, ...prev]);
    setForm(emptyForm);
    setDialogOpen(false);
    toast({ title: "Orçamento criado!", description: `Orçamento #${nextNumero} cadastrado.` });
  };

  const handleStartEdit = (orc: Orcamento) => {
    setEditingOrc(orc);
    setEditForm({
      placa: orc.placa, modelo: orc.modelo, ano: orc.ano, cor: orc.cor,
      cliente: orc.cliente, telefone: orc.telefone, sinistro: orc.sinistro,
      orcamentista: orc.orcamentista,
      observacoes: orc.observacoes, validade: orc.validade,
      itens: orc.itens.map(i => ({ ...i })),
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingOrc || !editForm.modelo) {
      toast({ title: "Campo obrigatório", description: "Preencha o modelo.", variant: "destructive" });
      return;
    }
    setOrcamentosList(prev => prev.map(orc => orc.id === editingOrc.id ? {
      ...orc, placa: editForm.placa, modelo: editForm.modelo, ano: editForm.ano,
      cor: editForm.cor, cliente: editForm.cliente, telefone: editForm.telefone,
      sinistro: editForm.sinistro,
      orcamentista: editForm.orcamentista,
      itens: editForm.itens, observacoes: editForm.observacoes,
      validade: editForm.validade || orc.validade,
    } : orc));
    setEditDialogOpen(false);
    setEditingOrc(null);
    toast({ title: "Orçamento atualizado!" });
  };

  const handleDelete = () => {
    if (!deleteOrc) return;
    setOrcamentosList(prev => prev.filter(o => o.id !== deleteOrc.id));
    setDeleteOrc(null);
    toast({ title: "Orçamento excluído." });
  };

  const handleConvertToOS = () => {
    if (!convertOrc) return;
    const nextNumero = Math.max(...osList.map(o => o.numero), 1000) + 1;
    const servicoItens = convertOrc.itens.filter(i => !isPecas(i.operacao));
    const pecaItens = convertOrc.itens.filter(i => isPecas(i.operacao));
    const valorServico = servicoItens.reduce((s, i) => s + i.valorTotal, 0);

    const newOS: OrdemServico = {
      id: crypto.randomUUID(),
      numero: nextNumero,
      dataEntrada: new Date().toISOString().split('T')[0],
      placa: convertOrc.placa, modelo: convertOrc.modelo,
      ano: convertOrc.ano, cor: convertOrc.cor,
      cliente: convertOrc.cliente, telefone: convertOrc.telefone,
      tipoServico: servicoItens.map(i => i.operacao).filter((v, i, a) => a.indexOf(v) === i).join(', ') || 'Geral',
      descricao: servicoItens.map(i => i.descricao).join('; '),
      valorOrcado: valorServico,
      status: 'Em Andamento',
      pecas: pecaItens.map(i => ({
        id: crypto.randomUUID(),
        descricao: i.descricao,
        fornecedor: 'ORÇAMENTO',
        valor: i.valorTotal,
        data: new Date().toISOString().split('T')[0],
        status: 'Solicitado' as const,
      })),
      pagamentos: [],
    };
    setOsList(prev => [newOS, ...prev]);
    setOrcamentosList(prev => prev.map(o => o.id === convertOrc.id ? { ...o, status: 'Convertido' as const } : o));
    setConvertOrc(null);
    toast({ title: "Orçamento convertido em OS!", description: `OS #${nextNumero} criada.` });
  };

  const handleStatusChange = (id: string, newStatus: Orcamento['status']) => {
    setOrcamentosList(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    toast({ title: `Status alterado para "${newStatus}"` });
  };

  const renderItemFields = (item: OrcamentoItem, idx: number, setter: React.Dispatch<React.SetStateAction<OrcamentoForm>>) => {
    const isPeca = isPecas(item.operacao);
    return (
      <div key={item.id} className="border rounded-lg p-3 mb-2 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Item {idx + 1}</span>
          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem(setter, item.id)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Operação</Label>
            <Select value={item.operacao} onValueChange={v => updateItem(setter, item.id, 'operacao', v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{operacaoOptions.map(op => <SelectItem key={op} value={op}>{op}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Descrição</Label>
            <Input className="h-8 text-xs" value={item.descricao} onChange={e => updateItem(setter, item.id, 'descricao', e.target.value.toUpperCase())} placeholder={isPeca ? "Nome da peça" : "Descrição do serviço"} />
          </div>
        </div>
        {isPeca ? (
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs">Quantidade</Label>
              <Input className="h-8 text-xs" type="number" min="1" value={item.qtde} onChange={e => updateItem(setter, item.id, 'qtde', parseInt(e.target.value) || 1)} />
            </div>
            <div>
              <Label className="text-xs">Valor Unit. (R$)</Label>
              <Input className="h-8 text-xs" type="number" step="0.01" value={item.valorUnitario || ''} onChange={e => updateItem(setter, item.id, 'valorUnitario', parseFloat(e.target.value) || 0)} placeholder="0,00" />
            </div>
            <div>
              <Label className="text-xs">Valor Total (R$)</Label>
              <Input className="h-8 text-xs bg-muted" readOnly value={item.valorTotal > 0 ? item.valorTotal.toFixed(2) : ''} placeholder="0,00" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Valor do Serviço (R$)</Label>
              <Input className="h-8 text-xs" type="number" step="0.01" value={item.valorUnitario || ''} onChange={e => updateItem(setter, item.id, 'valorUnitario', parseFloat(e.target.value) || 0)} placeholder="0,00" />
            </div>
            <div>
              <Label className="text-xs">Valor Total (R$)</Label>
              <Input className="h-8 text-xs bg-muted" readOnly value={item.valorTotal > 0 ? item.valorTotal.toFixed(2) : ''} placeholder="0,00" />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFormFields = (f: OrcamentoForm, onChange: (field: string, value: string) => void, setter: React.Dispatch<React.SetStateAction<OrcamentoForm>>) => (
    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
      <h3 className="font-semibold text-sm text-muted-foreground">Dados do Veículo e Cliente</h3>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Placa</Label><Input value={f.placa} onChange={e => onChange('placa', e.target.value)} placeholder="ABC-1234" /></div>
        <div><Label>Modelo *</Label><Input value={f.modelo} onChange={e => onChange('modelo', e.target.value)} placeholder="Ex: Saveiro" /></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><Label>Ano</Label><Input value={f.ano} onChange={e => onChange('ano', e.target.value)} placeholder="2023" /></div>
        <div><Label>Cor</Label><Input value={f.cor} onChange={e => onChange('cor', e.target.value)} placeholder="Branco" /></div>
        <div>
          <Label>Sinistro</Label>
          <Select value={f.sinistro} onValueChange={v => setter(prev => ({ ...prev, sinistro: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Não">Não</SelectItem>
              <SelectItem value="Sim">Sim</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Proprietário / Cliente</Label><Input value={f.cliente} onChange={e => onChange('cliente', e.target.value)} placeholder="Nome" /></div>
        <div><Label>Telefone</Label><Input value={f.telefone} onChange={e => onChange('telefone', e.target.value)} placeholder="(11) 99999-9999" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Orçamentista</Label><Input value={f.orcamentista} onChange={e => onChange('orcamentista', e.target.value)} /></div>
        <div><Label>Validade</Label><Input type="date" value={f.validade || getDefaultValidade()} onChange={e => setter(prev => ({ ...prev, validade: e.target.value }))} /></div>
      </div>

      {/* Items */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-muted-foreground">Itens do Orçamento</h3>
          <Button type="button" variant="outline" size="sm" onClick={() => addItem(setter)}>
            <Plus className="h-3 w-3 mr-1" />Adicionar Item
          </Button>
        </div>
        {f.itens.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum item adicionado. Clique em "Adicionar Item".</p>
        )}
        {f.itens.map((item, idx) => renderItemFields(item, idx, setter))}
        {f.itens.length > 0 && (
          <div className="text-right text-sm font-bold mt-2">
            Total: {formatCurrency(getTotal(f.itens))}
          </div>
        )}
      </div>

      <div><Label>Observações</Label><Textarea value={f.observacoes} onChange={e => onChange('observacoes', e.target.value)} placeholder="Observações adicionais" /></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Orçamentos</h2>
          <p className="text-muted-foreground">Gerencie seus orçamentos e converta em OS</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm(emptyForm)}><Plus className="mr-2 h-4 w-4" />Novo Orçamento</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>Novo Orçamento</DialogTitle></DialogHeader>
            {renderFormFields(form, handleChange, setForm)}
            <Button onClick={handleCreate} className="w-full">Criar Orçamento</Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por placa, cliente ou número..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="Pendente">Pendente</SelectItem>
            <SelectItem value="Aprovado">Aprovado</SelectItem>
            <SelectItem value="Recusado">Recusado</SelectItem>
            <SelectItem value="Convertido">Convertido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead className="text-center">Itens</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum orçamento encontrado</TableCell></TableRow>
            ) : filtered.map(orc => {
              const valorTotal = getTotal(orc.itens);
              return (
                <TableRow key={orc.id}>
                  <TableCell className="font-mono font-bold">{orc.numero}</TableCell>
                  <TableCell>
                    <div className="font-medium">{orc.cliente || '—'}</div>
                    <div className="text-xs text-muted-foreground">{orc.telefone}</div>
                  </TableCell>
                  <TableCell>
                    <div>{orc.modelo}</div>
                    <div className="text-xs text-muted-foreground">{orc.placa} • {orc.cor}</div>
                  </TableCell>
                  <TableCell className="text-center">{orc.itens.length}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(valorTotal)}</TableCell>
                  <TableCell>
                    {orc.status === 'Convertido' ? (
                      <Badge className={statusColors[orc.status]}>{orc.status}</Badge>
                    ) : (
                      <Select value={orc.status} onValueChange={(v) => handleStatusChange(orc.id, v as Orcamento['status'])}>
                        <SelectTrigger className="w-32 h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendente">Pendente</SelectItem>
                          <SelectItem value="Aprovado">Aprovado</SelectItem>
                          <SelectItem value="Recusado">Recusado</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(orc.dataCriacao)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedOrc(orc)} title="Detalhes"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => exportOrcamentoPDF(orc)} title="Exportar PDF"><FileDown className="h-4 w-4" /></Button>
                      {orc.status !== 'Convertido' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setConvertOrc(orc)} title="Converter em OS"><ArrowRightLeft className="h-4 w-4" /></Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleStartEdit(orc)} title="Editar"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteOrc(orc)} title="Excluir"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedOrc} onOpenChange={() => setSelectedOrc(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Orçamento #{selectedOrc?.numero}</DialogTitle></DialogHeader>
          {selectedOrc && (() => {
            const valorTotal = getTotal(selectedOrc.itens);
            return (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-semibold">Cliente:</span> {selectedOrc.cliente || '—'}</div>
                  <div><span className="font-semibold">Telefone:</span> {selectedOrc.telefone || '—'}</div>
                  <div><span className="font-semibold">Veículo:</span> {selectedOrc.modelo}</div>
                  <div><span className="font-semibold">Placa:</span> {selectedOrc.placa || '—'}</div>
                  <div><span className="font-semibold">Ano:</span> {selectedOrc.ano || '—'}</div>
                  <div><span className="font-semibold">Cor:</span> {selectedOrc.cor || '—'}</div>
                  <div><span className="font-semibold">Sinistro:</span> {selectedOrc.sinistro}</div>
                  <div><span className="font-semibold">Status:</span> <Badge className={statusColors[selectedOrc.status]}>{selectedOrc.status}</Badge></div>
                  <div><span className="font-semibold">Data:</span> {formatDate(selectedOrc.dataCriacao)}</div>
                  <div><span className="font-semibold">Validade:</span> {formatDate(selectedOrc.validade)}</div>
                  {selectedOrc.orcamentista && <div className="col-span-2"><span className="font-semibold">Orçamentista:</span> {selectedOrc.orcamentista}</div>}
                </div>

                {selectedOrc.itens.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead className="text-center">Qtde</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrc.itens.map(item => (
                          <TableRow key={item.id}>
                            <TableCell className="text-xs">{item.operacao}</TableCell>
                            <TableCell className="text-xs">{item.descricao}</TableCell>
                            <TableCell className="text-center text-xs">{isPecas(item.operacao) ? item.qtde : '—'}</TableCell>
                            <TableCell className="text-right text-xs">{item.valorUnitario > 0 ? formatCurrency(item.valorUnitario) : '—'}</TableCell>
                            <TableCell className="text-right text-xs font-semibold">{item.valorTotal > 0 ? formatCurrency(item.valorTotal) : '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="bg-muted px-4 py-2 text-right font-bold text-sm">
                      Total: {formatCurrency(valorTotal)}
                    </div>
                  </div>
                )}

                {selectedOrc.observacoes && (
                  <div><span className="font-semibold text-sm">Observações:</span><p className="text-sm text-muted-foreground mt-1">{selectedOrc.observacoes}</p></div>
                )}
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => exportOrcamentoPDF(selectedOrc)}><FileDown className="mr-2 h-4 w-4" />Exportar PDF</Button>
                  {selectedOrc.status !== 'Convertido' && (
                    <Button variant="secondary" className="flex-1" onClick={() => { setSelectedOrc(null); setConvertOrc(selectedOrc); }}>
                      <ArrowRightLeft className="mr-2 h-4 w-4" />Converter em OS
                    </Button>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Editar Orçamento #{editingOrc?.numero}</DialogTitle></DialogHeader>
          {renderFormFields(editForm, handleEditChange, setEditForm)}
          <Button onClick={handleSaveEdit} className="w-full">Salvar Alterações</Button>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteOrc} onOpenChange={() => setDeleteOrc(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Orçamento #{deleteOrc?.numero}?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Convert Confirm */}
      <AlertDialog open={!!convertOrc} onOpenChange={() => setConvertOrc(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Converter Orçamento #{convertOrc?.numero} em OS?</AlertDialogTitle>
            <AlertDialogDescription>
              Será criada uma nova Ordem de Serviço com os dados deste orçamento. O orçamento será marcado como "Convertido".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConvertToOS}>Converter em OS</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
