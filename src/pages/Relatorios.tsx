import { useState } from "react";
import { FileBarChart, TrendingUp, TrendingDown, DollarSign, Users, CreditCard, Building2, AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import MonthFilter, { getCurrentMonth, filterByMonth } from "@/components/MonthFilter";
import { formatCurrency, getTotalRecebido, getTotalPecas } from "@/lib/mock-data";
import { exportRelatorioFinanceiro, exportRelatorioOS } from "@/lib/pdf-export";
import { useData } from "@/contexts/DataContext";

export default function Relatorios() {
  const { osList, custosList, funcList, despesasList, saidasList } = useData();
  const [mesFiltro, setMesFiltro] = useState(getCurrentMonth());

  const osFiltered = filterByMonth(osList, 'dataEntrada', mesFiltro);
  const saidasFiltered = filterByMonth(saidasList, 'data', mesFiltro);

  const totalRecebido = osFiltered.reduce((s, os) => s + getTotalRecebido(os), 0);
  const totalPecas = osFiltered.reduce((s, os) => s + getTotalPecas(os), 0);
  const totalFolha = funcList.filter(f => f.status === 'Ativo').reduce((s, f) => s + f.salarioBase, 0);
  const totalFixos = custosList.filter(c => c.categoria.startsWith('Fixo')).reduce((s, c) => s + c.valorPrevisto, 0);
  const totalVariaveis = custosList.filter(c => c.categoria === 'Variável').reduce((s, c) => s + c.valorPrevisto, 0);
  const totalCartao = despesasList.flatMap(d => d.parcelasGeradas.filter(p => p.status === 'Aberta' && p.mes === mesFiltro)).reduce((s, p) => s + p.valor, 0);
  const totalSaidas = saidasFiltered.reduce((s, item) => s + item.valor, 0);
  const lucroLiquido = totalRecebido - totalPecas - totalFolha - totalFixos - totalVariaveis - totalCartao - totalSaidas;
  const margemPct = totalRecebido > 0 ? (lucroLiquido / totalRecebido) * 100 : 0;

  const healthColor = lucroLiquido < 0 ? 'text-destructive' : margemPct < 15 ? 'text-warning' : 'text-success';
  const healthBg = lucroLiquido < 0 ? 'bg-destructive/10 border-destructive/30' : margemPct < 15 ? 'bg-warning/10 border-warning/30' : 'bg-success/10 border-success/30';
  const healthLabel = lucroLiquido < 0 ? 'Prejuízo' : margemPct < 15 ? 'Margem Baixa' : 'Saudável';

  const lineItems = [
    { label: '(+) Total Recebido de Clientes', value: totalRecebido, color: 'text-success', icon: TrendingUp },
    { label: '(-) Custo com Peças e Terceiros', value: -totalPecas, color: 'text-destructive', icon: Building2 },
    { label: '(-) Folha de Pagamento', value: -totalFolha, color: 'text-destructive', icon: Users },
    { label: '(-) Custos Fixos', value: -totalFixos, color: 'text-destructive', icon: TrendingDown },
    { label: '(-) Custos Variáveis', value: -totalVariaveis, color: 'text-destructive', icon: AlertTriangle },
    { label: '(-) Fatura Cartão', value: -totalCartao, color: 'text-destructive', icon: CreditCard },
    { label: '(-) Saídas Avulsas', value: -totalSaidas, color: 'text-destructive', icon: AlertTriangle },
  ];

  const osComPrejuizo = osList.filter(os => os.valorOrcado < getTotalPecas(os));
  const osPendentes = osList.filter(os => {
    const pendente = os.valorOrcado - getTotalRecebido(os);
    return pendente > 0 && os.status !== 'Cancelado';
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios e Análise de Lucro</h1>
          <p className="text-muted-foreground text-sm">Visão financeira completa do período</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={exportRelatorioFinanceiro} className="gap-2">
            <Download className="w-4 h-4" /> Relatório Financeiro
          </Button>
          <Button onClick={exportRelatorioOS} variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Relatório de OS
          </Button>
        </div>
      </div>

      {/* Profit Dashboard */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" /> Dashboard de Lucro Real
        </h3>

        <div className="space-y-3">
          {lineItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border/50">
              <div className="flex items-center gap-3">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
              <span className={`font-semibold ${item.color}`}>{formatCurrency(Math.abs(item.value))}</span>
            </div>
          ))}
        </div>

        <div className={`mt-4 p-4 rounded-lg border ${healthBg} flex items-center justify-between`}>
          <div>
            <p className="text-xs text-muted-foreground">(=) LUCRO LÍQUIDO ESTIMADO</p>
            <p className={`text-3xl font-bold ${healthColor}`}>{formatCurrency(lucroLiquido)}</p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-semibold ${healthColor}`}>{healthLabel}</p>
            <p className="text-xs text-muted-foreground">Margem: {margemPct.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-xs text-muted-foreground">OS Finalizadas</p>
          <p className="text-2xl font-bold text-success mt-1">{osList.filter(os => os.status === 'Finalizado').length}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground">OS com Saldo Pendente</p>
          <p className="text-2xl font-bold text-warning mt-1">{osPendentes.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground">OS com Prejuízo</p>
          <p className="text-2xl font-bold text-destructive mt-1">{osComPrejuizo.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground">Dívida Cartões (Futura)</p>
          <p className="text-2xl font-bold text-info mt-1">{formatCurrency(totalCartao)}</p>
        </div>
      </div>

      {/* OS Pendentes */}
      {osPendentes.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">OS com Saldo Pendente</h3>
          <div className="space-y-2">
            {osPendentes.map(os => (
              <div key={os.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div>
                  <span className="font-mono font-semibold text-primary">#{os.numero}</span>
                  <span className="text-muted-foreground text-sm ml-2">{os.cliente} — {os.modelo}</span>
                </div>
                <span className="font-semibold text-warning">{formatCurrency(os.valorOrcado - getTotalRecebido(os))}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
