import { useState } from "react";
import { Plus, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, type CartaoCredito, type DespesaCartao } from "@/lib/mock-data";
import { useData } from "@/contexts/DataContext";

const emptyCartao = { nome: '', limiteTotal: '', diaFechamento: '', diaVencimento: '' };
const emptyDespesa = { cartaoId: '', descricao: '', categoria: '', valorTotal: '', parcelas: '1', dataCompra: '' };

export default function Cartoes() {
  const { cartoesList, setCartoesList, despesasList, setDespesasList } = useData();
  const [cartaoDialog, setCartaoDialog] = useState(false);
  const [despesaDialog, setDespesaDialog] = useState(false);
  const [cartaoForm, setCartaoForm] = useState(emptyCartao);
  const [despesaForm, setDespesaForm] = useState(emptyDespesa);
  const { toast } = useToast();

  const handleCreateCartao = () => {
    if (!cartaoForm.nome || !cartaoForm.limiteTotal) {
      toast({ title: "Campos obrigatórios", description: "Preencha nome e limite.", variant: "destructive" });
      return;
    }
    const novo: CartaoCredito = {
      id: crypto.randomUUID(),
      nome: cartaoForm.nome.toUpperCase(),
      limiteTotal: parseFloat(cartaoForm.limiteTotal) || 0,
      diaFechamento: parseInt(cartaoForm.diaFechamento) || 1,
      diaVencimento: parseInt(cartaoForm.diaVencimento) || 10,
    };
    setCartoesList(prev => [...prev, novo]);
    setCartaoForm(emptyCartao);
    setCartaoDialog(false);
    toast({ title: "Cartão cadastrado!", description: `${novo.nome} adicionado.` });
  };

  const handleCreateDespesa = () => {
    if (!despesaForm.cartaoId || !despesaForm.descricao || !despesaForm.valorTotal) {
      toast({ title: "Campos obrigatórios", description: "Preencha cartão, descrição e valor.", variant: "destructive" });
      return;
    }
    const valor = parseFloat(despesaForm.valorTotal) || 0;
    const parcelas = parseInt(despesaForm.parcelas) || 1;
    const valorParcela = valor / parcelas;
    const hoje = new Date(despesaForm.dataCompra || new Date().toISOString().split('T')[0]);
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
    };
    setDespesasList(prev => [...prev, nova]);
    setDespesaForm(emptyDespesa);
    setDespesaDialog(false);
    toast({ title: "Despesa lançada!", description: `${nova.descricao} em ${parcelas}x de ${formatCurrency(valorParcela)}.` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cartões de Crédito</h1>
          <p className="text-muted-foreground text-sm">Controle de faturas e parcelas</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={cartaoDialog} onOpenChange={setCartaoDialog}>
            <DialogTrigger asChild><Button variant="outline" className="gap-2"><Plus className="w-4 h-4" /> Novo Cartão</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Cadastrar Cartão</DialogTitle></DialogHeader>
              <div className="grid gap-4 mt-4">
                <div><Label>Nome do Cartão *</Label><Input placeholder="Ex: Nubank PJ" value={cartaoForm.nome} onChange={e => setCartaoForm(p => ({ ...p, nome: e.target.value }))} /></div>
                <div><Label>Limite Total (R$) *</Label><Input type="number" placeholder="0,00" value={cartaoForm.limiteTotal} onChange={e => setCartaoForm(p => ({ ...p, limiteTotal: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Dia Fechamento</Label><Input type="number" placeholder="3" value={cartaoForm.diaFechamento} onChange={e => setCartaoForm(p => ({ ...p, diaFechamento: e.target.value }))} /></div>
                  <div><Label>Dia Vencimento</Label><Input type="number" placeholder="10" value={cartaoForm.diaVencimento} onChange={e => setCartaoForm(p => ({ ...p, diaVencimento: e.target.value }))} /></div>
                </div>
              </div>
              <Button className="w-full mt-4" onClick={handleCreateCartao}>Cadastrar</Button>
            </DialogContent>
          </Dialog>
          <Dialog open={despesaDialog} onOpenChange={setDespesaDialog}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Nova Despesa</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Lançar Despesa no Cartão</DialogTitle></DialogHeader>
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
                  <Select value={despesaForm.categoria} onValueChange={v => setDespesaForm(p => ({ ...p, categoria: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {['Peças','Ferramentas','Combustível','Alimentação','Material de escritório','Outros'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Valor Total (R$) *</Label><Input type="number" placeholder="0,00" value={despesaForm.valorTotal} onChange={e => setDespesaForm(p => ({ ...p, valorTotal: e.target.value }))} /></div>
                  <div><Label>Parcelas</Label><Input type="number" placeholder="1" value={despesaForm.parcelas} onChange={e => setDespesaForm(p => ({ ...p, parcelas: e.target.value }))} /></div>
                </div>
                <div><Label>Data da Compra</Label><Input type="date" value={despesaForm.dataCompra} onChange={e => setDespesaForm(p => ({ ...p, dataCompra: e.target.value }))} /></div>
              </div>
              <Button className="w-full mt-4" onClick={handleCreateDespesa}>Lançar</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cartoesList.map(cartao => {
          const despesas = despesasList.filter(d => d.cartaoId === cartao.id);
          const parcelasMes = despesas.flatMap(d => d.parcelasGeradas.filter(p => p.mes === '2025-03'));
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
                <div>
                  <h3 className="font-semibold text-foreground">{cartao.nome}</h3>
                  <p className="text-xs text-muted-foreground">Fecha dia {cartao.diaFechamento} • Vence dia {cartao.diaVencimento}</p>
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
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Fatura Mar/25</p>
                    <p className="text-lg font-bold text-primary">{formatCurrency(faturaMes)}</p>
                  </div>
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Dívida Total</p>
                    <p className="text-lg font-bold text-warning">{formatCurrency(totalFuturo)}</p>
                  </div>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {despesasList.map(d => {
                const cartao = cartoesList.find(c => c.id === d.cartaoId);
                return (
                  <TableRow key={d.id} className="border-border">
                    <TableCell className="font-medium">{d.descricao}</TableCell>
                    <TableCell className="text-muted-foreground">{cartao?.nome}</TableCell>
                    <TableCell><Badge variant="outline">{d.categoria}</Badge></TableCell>
                    <TableCell className="text-right">{formatCurrency(d.valorTotal)}</TableCell>
                    <TableCell>{d.parcelas}x</TableCell>
                    <TableCell className="text-right">{formatCurrency(d.valorTotal / d.parcelas)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
