import { useState } from "react";
import { Plus, CreditCard, Pencil, Trash2 } from "lucide-react";
import MonthFilter, { getCurrentMonth, getMonthLabel } from "@/components/MonthFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, type CartaoCredito, type DespesaCartao } from "@/lib/mock-data";
import { useData } from "@/contexts/DataContext";

const emptyCartao = { nome: '', limiteTotal: '', diaFechamento: '', diaVencimento: '' };
const emptyDespesa = { cartaoId: '', descricao: '', categoria: '', valorTotal: '', parcelas: '1', dataCompra: '', osVinculadaId: '' };

export default function Cartoes() {
  const { cartoesList, setCartoesList, despesasList, setDespesasList, osList } = useData();
  const [mesFiltro, setMesFiltro] = useState(getCurrentMonth());
  const [cartaoDialog, setCartaoDialog] = useState(false);
  const [despesaDialog, setDespesaDialog] = useState(false);
  const [cartaoForm, setCartaoForm] = useState(emptyCartao);
  const [despesaForm, setDespesaForm] = useState(emptyDespesa);
  const [editingCartaoId, setEditingCartaoId] = useState<string | null>(null);
  const [editingDespesaId, setEditingDespesaId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'cartao' | 'despesa' | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [faturaCartaoId, setFaturaCartaoId] = useState<string | null>(null);
  const [faturaMode, setFaturaMode] = useState<'mes' | 'total'>('mes');
  const { toast } = useToast();

  const openEditCartao = (c: CartaoCredito) => {
    setEditingCartaoId(c.id);
    setCartaoForm({ nome: c.nome, limiteTotal: String(c.limiteTotal), diaFechamento: String(c.diaFechamento), diaVencimento: String(c.diaVencimento) });
    setCartaoDialog(true);
  };

  const openCreateCartao = () => {
    setEditingCartaoId(null);
    setCartaoForm(emptyCartao);
    setCartaoDialog(true);
  };

  const openEditDespesa = (d: DespesaCartao) => {
    setEditingDespesaId(d.id);
    setDespesaForm({ cartaoId: d.cartaoId, descricao: d.descricao, categoria: d.categoria, valorTotal: String(d.valorTotal), parcelas: String(d.parcelas), dataCompra: d.dataCompra, osVinculadaId: d.osVinculadaId || '' });
    setDespesaDialog(true);
  };

  const openCreateDespesa = () => {
    setEditingDespesaId(null);
    setDespesaForm(emptyDespesa);
    setDespesaDialog(true);
  };

  const handleSaveCartao = () => {
    if (!cartaoForm.nome || !cartaoForm.limiteTotal) {
      toast({ title: "Campos obrigatórios", description: "Preencha nome e limite.", variant: "destructive" });
      return;
    }
    if (editingCartaoId) {
      setCartoesList(prev => prev.map(c => c.id === editingCartaoId ? {
        ...c,
        nome: cartaoForm.nome.toUpperCase(),
        limiteTotal: parseFloat(cartaoForm.limiteTotal) || 0,
        diaFechamento: parseInt(cartaoForm.diaFechamento) || 1,
        diaVencimento: parseInt(cartaoForm.diaVencimento) || 10,
      } : c));
      toast({ title: "Cartão atualizado!", description: `${cartaoForm.nome.toUpperCase()} editado.` });
    } else {
      const novo: CartaoCredito = {
        id: crypto.randomUUID(),
        nome: cartaoForm.nome.toUpperCase(),
        limiteTotal: parseFloat(cartaoForm.limiteTotal) || 0,
        diaFechamento: parseInt(cartaoForm.diaFechamento) || 1,
        diaVencimento: parseInt(cartaoForm.diaVencimento) || 10,
      };
      setCartoesList(prev => [...prev, novo]);
      toast({ title: "Cartão cadastrado!", description: `${novo.nome} adicionado.` });
    }
    setCartaoForm(emptyCartao);
    setEditingCartaoId(null);
    setCartaoDialog(false);
  };

  const handleSaveDespesa = () => {
    if (!despesaForm.cartaoId || !despesaForm.descricao || !despesaForm.valorTotal) {
      toast({ title: "Campos obrigatórios", description: "Preencha cartão, descrição e valor.", variant: "destructive" });
      return;
    }
    const valor = parseFloat(despesaForm.valorTotal) || 0;
    const parcelas = parseInt(despesaForm.parcelas) || 1;
    const valorParcela = valor / parcelas;
    const hoje = new Date(despesaForm.dataCompra || new Date().toISOString().split('T')[0]);

    if (editingDespesaId) {
      const parcelasGeradas = Array.from({ length: parcelas }, (_, i) => {
        const d = new Date(hoje);
        d.setMonth(d.getMonth() + i + 1);
        return { mes: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, valor: Math.round(valorParcela * 100) / 100, status: 'Aberta' as const };
      });
      setDespesasList(prev => prev.map(d => d.id === editingDespesaId ? {
        ...d,
        cartaoId: despesaForm.cartaoId,
        descricao: despesaForm.descricao.toUpperCase(),
        categoria: despesaForm.categoria || 'Outros',
        valorTotal: valor,
        parcelas,
        dataCompra: despesaForm.dataCompra || d.dataCompra,
        parcelasGeradas,
        osVinculadaId: (despesaForm.categoria === 'Peças' || despesaForm.categoria === 'Terceiros') ? despesaForm.osVinculadaId || undefined : undefined,
      } : d));
      toast({ title: "Despesa atualizada!", description: `${despesaForm.descricao.toUpperCase()} editada.` });
    } else {
      const parcelasGeradas = Array.from({ length: parcelas }, (_, i) => {
        const d = new Date(hoje);
        d.setMonth(d.getMonth() + i + 1);
        return { mes: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, valor: Math.round(valorParcela * 100) / 100, status: 'Aberta' as const };
      });
      const nova: DespesaCartao = {
        id: crypto.randomUUID(),
        cartaoId: despesaForm.cartaoId,
        descricao: despesaForm.descricao.toUpperCase(),
        categoria: despesaForm.categoria || 'Outros',
        valorTotal: valor,
        parcelas,
        dataCompra: despesaForm.dataCompra || new Date().toISOString().split('T')[0],
        parcelasGeradas,
        osVinculadaId: (despesaForm.categoria === 'Peças' || despesaForm.categoria === 'Terceiros') ? despesaForm.osVinculadaId || undefined : undefined,
      };
      setDespesasList(prev => [...prev, nova]);
      toast({ title: "Despesa lançada!", description: `${nova.descricao} em ${parcelas}x de ${formatCurrency(valorParcela)}.` });
    }
    setDespesaForm(emptyDespesa);
    setEditingDespesaId(null);
    setDespesaDialog(false);
  };

  const handleDelete = () => {
    if (!deleteId || !deleteType) return;
    if (deleteType === 'cartao') {
      const item = cartoesList.find(c => c.id === deleteId);
      setCartoesList(prev => prev.filter(c => c.id !== deleteId));
      setDespesasList(prev => prev.filter(d => d.cartaoId !== deleteId));
      toast({ title: "Cartão excluído!", description: `${item?.nome} e suas despesas foram removidos.` });
    } else {
      const item = despesasList.find(d => d.id === deleteId);
      setDespesasList(prev => prev.filter(d => d.id !== deleteId));
      toast({ title: "Despesa excluída!", description: `${item?.descricao} removida.` });
    }
    setDeleteId(null);
    setDeleteType(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cartões de Crédito</h1>
          <p className="text-muted-foreground text-sm">Controle de faturas e parcelas</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <MonthFilter value={mesFiltro} onChange={setMesFiltro} />
          <Dialog open={cartaoDialog} onOpenChange={o => { if (!o) { setEditingCartaoId(null); setCartaoForm(emptyCartao); } setCartaoDialog(o); }}>
            <DialogTrigger asChild><Button variant="outline" className="gap-2" onClick={openCreateCartao}><Plus className="w-4 h-4" /> Novo Cartão</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingCartaoId ? 'Editar Cartão' : 'Cadastrar Cartão'}</DialogTitle></DialogHeader>
              <div className="grid gap-4 mt-4">
                <div><Label>Nome do Cartão *</Label><Input placeholder="Ex: Nubank PJ" value={cartaoForm.nome} onChange={e => setCartaoForm(p => ({ ...p, nome: e.target.value }))} /></div>
                <div><Label>Limite Total (R$) *</Label><Input type="number" placeholder="0,00" value={cartaoForm.limiteTotal} onChange={e => setCartaoForm(p => ({ ...p, limiteTotal: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Dia Fechamento</Label><Input type="number" placeholder="3" value={cartaoForm.diaFechamento} onChange={e => setCartaoForm(p => ({ ...p, diaFechamento: e.target.value }))} /></div>
                  <div><Label>Dia Vencimento</Label><Input type="number" placeholder="10" value={cartaoForm.diaVencimento} onChange={e => setCartaoForm(p => ({ ...p, diaVencimento: e.target.value }))} /></div>
                </div>
              </div>
              <Button className="w-full mt-4" onClick={handleSaveCartao}>{editingCartaoId ? 'Salvar Alterações' : 'Cadastrar'}</Button>
            </DialogContent>
          </Dialog>
          <Dialog open={despesaDialog} onOpenChange={o => { if (!o) { setEditingDespesaId(null); setDespesaForm(emptyDespesa); } setDespesaDialog(o); }}>
            <DialogTrigger asChild><Button className="gap-2" onClick={openCreateDespesa}><Plus className="w-4 h-4" /> Nova Despesa</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingDespesaId ? 'Editar Despesa' : 'Lançar Despesa no Cartão'}</DialogTitle></DialogHeader>
              <div className="grid gap-4 mt-4">
                <div>
                  <Label>Cartão *</Label>
                  <Select value={despesaForm.cartaoId} onValueChange={v => setDespesaForm(p => ({ ...p, cartaoId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {cartoesList.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Descrição *</Label><Input placeholder="Ex: Compressor de ar" value={despesaForm.descricao} onChange={e => setDespesaForm(p => ({ ...p, descricao: e.target.value }))} /></div>
                <div>
                  <Label>Categoria</Label>
                  <Select value={despesaForm.categoria} onValueChange={v => setDespesaForm(p => ({ ...p, categoria: v, osVinculadaId: '' }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {['Peças','Terceiros','Ferramentas','Combustível','Alimentação','Material de escritório','Outros'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {(despesaForm.categoria === 'Peças' || despesaForm.categoria === 'Terceiros') && (
                  <div>
                    <Label>Vincular à OS</Label>
                    <Select value={despesaForm.osVinculadaId} onValueChange={v => setDespesaForm(p => ({ ...p, osVinculadaId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione a OS" /></SelectTrigger>
                      <SelectContent>
                        {osList.map(os => (
                          <SelectItem key={os.id} value={os.id}>
                            OS #{os.numero} - {os.modelo} {os.placa ? `(${os.placa})` : ''} - {os.cliente || 'Sem cliente'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Valor Total (R$) *</Label><Input type="number" placeholder="0,00" value={despesaForm.valorTotal} onChange={e => setDespesaForm(p => ({ ...p, valorTotal: e.target.value }))} /></div>
                  <div><Label>Parcelas</Label><Input type="number" placeholder="1" value={despesaForm.parcelas} onChange={e => setDespesaForm(p => ({ ...p, parcelas: e.target.value }))} /></div>
                </div>
                <div><Label>Data da Compra</Label><Input type="date" value={despesaForm.dataCompra} onChange={e => setDespesaForm(p => ({ ...p, dataCompra: e.target.value }))} /></div>
              </div>
              <Button className="w-full mt-4" onClick={handleSaveDespesa}>{editingDespesaId ? 'Salvar Alterações' : 'Lançar'}</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cartoesList.map(cartao => {
          const despesas = despesasList.filter(d => d.cartaoId === cartao.id);
          const parcelasMes = despesas.flatMap(d => d.parcelasGeradas.filter(p => p.mes === mesFiltro));
          const faturaMes = parcelasMes.reduce((s, p) => s + p.valor, 0);
          const totalFuturo = despesas.flatMap(d => d.parcelasGeradas.filter(p => p.status === 'Aberta')).reduce((s, p) => s + p.valor, 0);
          const usado = totalFuturo;
          const pctUsado = Math.min((usado / cartao.limiteTotal) * 100, 100);

          return (
            <div key={cartao.id} className="glass-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{cartao.nome}</h3>
                  <p className="text-xs text-muted-foreground">Fecha dia {cartao.diaFechamento} • Vence dia {cartao.diaVencimento}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditCartao(cartao)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { setDeleteType('cartao'); setDeleteId(cartao.id); }}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Limite utilizado</span>
                    <span className="font-medium">{pctUsado.toFixed(0)}%</span>
                  </div>
                  <Progress value={pctUsado} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Usado: {formatCurrency(usado)}</span>
                    <span>Limite: {formatCurrency(cartao.limiteTotal)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    className="p-3 bg-secondary/50 rounded-lg text-left hover:bg-secondary/80 transition-colors cursor-pointer"
                    onClick={() => { setFaturaCartaoId(cartao.id); setFaturaMode('mes'); }}
                  >
                    <p className="text-xs text-muted-foreground">Fatura {getMonthLabel(mesFiltro)}</p>
                    <p className="text-lg font-bold text-primary">{formatCurrency(faturaMes)}</p>
                  </button>
                  <button
                    className="p-3 bg-secondary/50 rounded-lg text-left hover:bg-secondary/80 transition-colors cursor-pointer"
                    onClick={() => { setFaturaCartaoId(cartao.id); setFaturaMode('total'); }}
                  >
                    <p className="text-xs text-muted-foreground">Dívida Total</p>
                    <p className="text-lg font-bold text-warning">{formatCurrency(totalFuturo)}</p>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Despesas Recentes</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Descrição</TableHead>
                <TableHead>Cartão</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead>Parcelas</TableHead>
                <TableHead className="text-right">Valor Parcela</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {despesasList.filter(d => d.parcelasGeradas.some(p => p.mes === mesFiltro)).map(d => {
                const cartao = cartoesList.find(c => c.id === d.cartaoId);
                const parcelaAtual = d.parcelasGeradas.findIndex(p => p.mes === mesFiltro) + 1;
                return (
                  <TableRow key={d.id} className="border-border">
                    <TableCell className="font-medium">{d.descricao}</TableCell>
                    <TableCell className="text-muted-foreground">{cartao?.nome}</TableCell>
                    <TableCell><Badge variant="outline">{d.categoria}</Badge></TableCell>
                    <TableCell className="text-right">{formatCurrency(d.valorTotal)}</TableCell>
                    <TableCell>{parcelaAtual}/{d.parcelas}</TableCell>
                    <TableCell className="text-right">{formatCurrency(d.valorTotal / d.parcelas)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDespesa(d)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { setDeleteType('despesa'); setDeleteId(d.id); }}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Fatura Detail Dialog */}
      <Dialog open={!!faturaCartaoId} onOpenChange={o => { if (!o) setFaturaCartaoId(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {faturaMode === 'mes'
                ? `Fatura ${getMonthLabel(mesFiltro)} — ${cartoesList.find(c => c.id === faturaCartaoId)?.nome || ''}`
                : `Dívida Total — ${cartoesList.find(c => c.id === faturaCartaoId)?.nome || ''}`}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-2 max-h-[60vh] overflow-y-auto">
            {(() => {
              const despesas = despesasList.filter(d => d.cartaoId === faturaCartaoId);
              const items = faturaMode === 'mes'
                ? despesas.flatMap(d => d.parcelasGeradas
                    .filter(p => p.mes === mesFiltro)
                    .map(p => ({ despesaId: d.id, descricao: d.descricao, categoria: d.categoria, parcelas: d.parcelas, parcelaAtual: d.parcelasGeradas.findIndex(pg => pg.mes === p.mes) + 1, valor: p.valor, mes: p.mes, status: p.status })))
                : despesas.flatMap(d => d.parcelasGeradas
                    .filter(p => p.status === 'Aberta' || p.status === 'Vencida')
                    .map(p => ({ despesaId: d.id, descricao: d.descricao, categoria: d.categoria, parcelas: d.parcelas, parcelaAtual: d.parcelasGeradas.findIndex(pg => pg.mes === p.mes) + 1, valor: p.valor, mes: p.mes, status: p.status })));
              const total = items.filter(i => i.status !== 'Paga').reduce((s, i) => s + i.valor, 0);
              const totalPago = items.filter(i => i.status === 'Paga').reduce((s, i) => s + i.valor, 0);

              if (items.length === 0) return <p className="text-muted-foreground text-sm py-4 text-center">Nenhuma parcela encontrada.</p>;

              const toggleParcela = (despesaId: string, mes: string) => {
                setDespesasList(prev => prev.map(d => {
                  if (d.id !== despesaId) return d;
                  return {
                    ...d,
                    parcelasGeradas: d.parcelasGeradas.map(p =>
                      p.mes === mes ? { ...p, status: p.status === 'Paga' ? 'Aberta' as const : 'Paga' as const } : p
                    ),
                  };
                }));
              };

              const marcarTodasMes = () => {
                const allPaid = items.every(i => i.status === 'Paga');
                setDespesasList(prev => prev.map(d => {
                  if (d.cartaoId !== faturaCartaoId) return d;
                  return {
                    ...d,
                    parcelasGeradas: d.parcelasGeradas.map(p =>
                      p.mes === mesFiltro ? { ...p, status: allPaid ? 'Aberta' as const : 'Paga' as const } : p
                    ),
                  };
                }));
              };

              return (
                <>
                  {faturaMode === 'mes' && (
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" onClick={marcarTodasMes}>
                        {items.every(i => i.status === 'Paga') ? 'Desmarcar todas' : 'Pagar fatura'}
                      </Button>
                    </div>
                  )}
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead>Descrição</TableHead>
                        <TableHead>Parcela</TableHead>
                        <TableHead>Categoria</TableHead>
                        {faturaMode === 'total' && <TableHead>Mês</TableHead>}
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, i) => (
                        <TableRow key={i} className={`border-border cursor-pointer hover:bg-muted/50 ${item.status === 'Paga' ? 'opacity-50' : ''}`} onClick={() => toggleParcela(item.despesaId, item.mes)}>
                          <TableCell className="font-medium">{item.descricao}</TableCell>
                          <TableCell className="text-muted-foreground">{item.parcelaAtual}/{item.parcelas}</TableCell>
                          <TableCell><Badge variant="outline">{item.categoria}</Badge></TableCell>
                          {faturaMode === 'total' && <TableCell className="text-muted-foreground">{getMonthLabel(item.mes)}</TableCell>}
                          <TableCell>
                            <Badge variant={item.status === 'Paga' ? 'default' : 'secondary'}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(item.valor)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="space-y-1 pt-3 border-t border-border">
                    {faturaMode === 'mes' && totalPago > 0 && (
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Pago</span>
                        <span>{formatCurrency(totalPago)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center font-semibold">
                      <span>{faturaMode === 'mes' ? 'A pagar' : 'Dívida Total'}</span>
                      <span className={faturaMode === 'mes' ? 'text-primary' : 'text-warning'}>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={o => { if (!o) { setDeleteId(null); setDeleteType(null); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteType === 'cartao'
                ? 'Tem certeza que deseja excluir este cartão? Todas as despesas vinculadas também serão removidas.'
                : 'Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
