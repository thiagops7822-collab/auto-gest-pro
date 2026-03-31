import { useState, useMemo } from "react";
import { Car, DollarSign, TrendingUp, TrendingDown, AlertTriangle, Clock } from "lucide-react";
import MonthFilter, { getCurrentMonth, filterByMonth } from "@/components/MonthFilter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { formatCurrency, getTotalRecebido, getSaldoPendente, getTotalPecas } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";

export default function Dashboard() {
  const { osList, custosList, funcList, despesasList, saidasList } = useData();
  const [mesFiltro, setMesFiltro] = useState(getCurrentMonth());

  const computed = useMemo(() => {
    const veiculosAtivos = osList.filter(os => os.status !== 'Finalizado' && os.status !== 'Cancelado').length;
    const faturamentoBruto = osList.reduce((sum, os) => sum + os.valorOrcado, 0);
    const totalRecebido = osList.reduce((sum, os) => sum + getTotalRecebido(os), 0);
    const totalPendente = osList.reduce((sum, os) => sum + Math.max(0, getSaldoPendente(os)), 0);
    const totalCustosFixos = custosList.reduce((sum, c) => sum + c.valorPrevisto, 0);
    const totalFolha = funcList.filter(f => f.status === 'Ativo').reduce((sum, f) => sum + f.salarioBase, 0);
    const totalPecas = osList.reduce((sum, os) => sum + getTotalPecas(os), 0);
    const totalCartao = despesasList.flatMap(d => d.parcelasGeradas.filter(p => p.status === 'Aberta')).reduce((s, p) => s + p.valor, 0);
    const totalSaidas = saidasList.reduce((s, item) => s + item.valor, 0);
    const totalDespesas = totalCustosFixos + totalFolha + totalCartao + totalSaidas;
    const lucroEstimado = totalRecebido - totalCustosFixos - totalFolha - totalPecas - totalSaidas;

    // Peças margin: cost = saídas tipo Peça, sale = peças nas OS
    const custoPecas = saidasList.filter(s => s.tipo === 'Peça').reduce((s, item) => s + item.valor, 0);
    const vendaPecas = osList.reduce((sum, os) => sum + getTotalPecas(os), 0);
    const lucroPecas = vendaPecas - custoPecas;
    const margemPecas = vendaPecas > 0 ? (lucroPecas / vendaPecas) * 100 : 0;

    // Terceiros margin: cost = saídas tipo Terceiro vinculadas a OS, sale = valorOrcado das OS vinculadas
    const saidasTerceiros = saidasList.filter(s => s.tipo === 'Terceiro' && s.osVinculadaId);
    const custoTerceiros = saidasTerceiros.reduce((s, item) => s + item.valor, 0);
    const osIdsComTerceiro = [...new Set(saidasTerceiros.map(s => s.osVinculadaId))];
    const vendaTerceiros = osList.filter(os => osIdsComTerceiro.includes(os.id)).reduce((s, os) => s + os.valorOrcado, 0);
    const lucroTerceiros = vendaTerceiros - custoTerceiros;
    const margemTerceiros = vendaTerceiros > 0 ? (lucroTerceiros / vendaTerceiros) * 100 : 0;

    // Expense categories from real data
    const expenseCategoryData = [
      { name: 'Fixos', value: custosList.filter(c => c.categoria.startsWith('Fixo')).reduce((s, c) => s + c.valorPrevisto, 0), color: 'hsl(24, 95%, 53%)' },
      { name: 'Variáveis', value: custosList.filter(c => c.categoria === 'Variável').reduce((s, c) => s + c.valorPrevisto, 0), color: 'hsl(38, 92%, 50%)' },
      { name: 'Pessoal', value: totalFolha, color: 'hsl(210, 80%, 55%)' },
      { name: 'Peças/Terceiros', value: totalPecas, color: 'hsl(142, 71%, 45%)' },
      { name: 'Cartão', value: totalCartao, color: 'hsl(280, 65%, 55%)' },
      { name: 'Saídas Avulsas', value: totalSaidas, color: 'hsl(0, 84%, 60%)' },
    ].filter(d => d.value > 0);

    // OS by status from real data
    const statusCounts: Record<string, number> = {};
    osList.forEach(os => { statusCounts[os.status] = (statusCounts[os.status] || 0) + 1; });
    const statusColorMap: Record<string, string> = {
      'Em Andamento': 'hsl(210, 80%, 55%)',
      'Aguardando Peça': 'hsl(38, 92%, 50%)',
      'Pronto para Entrega': 'hsl(142, 71%, 45%)',
      'Finalizado': 'hsl(215, 15%, 55%)',
      'Cancelado': 'hsl(0, 84%, 60%)',
    };
    const osStatusData = Object.entries(statusCounts).map(([status, total]) => ({
      status, total, color: statusColorMap[status] || 'hsl(215, 15%, 55%)',
    }));

    // Alerts from real data
    const alerts: { type: 'warning' | 'danger' | 'info'; text: string; icon: typeof AlertTriangle }[] = [];
    const hoje = new Date();
    const diaHoje = hoje.getDate();

    custosList.filter(c => c.statusPagamento === 'Pendente' || c.statusPagamento === 'Vencido').forEach(c => {
      const diasAteVencer = c.diaVencimento - diaHoje;
      if (diasAteVencer < 0) {
        alerts.push({ type: 'danger', text: `${c.nome} vencido (Dia ${c.diaVencimento}) — ${formatCurrency(c.valorPrevisto)}`, icon: AlertTriangle });
      } else if (diasAteVencer <= 7) {
        alerts.push({ type: 'warning', text: `${c.nome} vence em ${diasAteVencer} dias (${formatCurrency(c.valorPrevisto)})`, icon: AlertTriangle });
      }
    });

    osList.filter(os => os.status !== 'Finalizado' && os.status !== 'Cancelado').forEach(os => {
      const pendente = Math.max(0, getSaldoPendente(os));
      if (pendente > 0) {
        alerts.push({ type: 'info', text: `OS #${os.numero} com saldo pendente de ${formatCurrency(pendente)}`, icon: Clock });
      }
    });

    return {
      veiculosAtivos, faturamentoBruto, totalRecebido, totalPendente, totalDespesas, lucroEstimado,
      expenseCategoryData, osStatusData, alerts,
      custoPecas, vendaPecas, lucroPecas, margemPecas,
      custoTerceiros, vendaTerceiros, lucroTerceiros, margemTerceiros,
    };
  }, [osList, custosList, funcList, despesasList, saidasList]);

  const stats = [
    { label: 'Veículos em Atendimento', value: computed.veiculosAtivos, icon: Car, color: 'text-info' },
    { label: 'Faturamento Bruto', value: formatCurrency(computed.faturamentoBruto), icon: DollarSign, color: 'text-primary' },
    { label: 'Total Recebido', value: formatCurrency(computed.totalRecebido), icon: TrendingUp, color: 'text-success' },
    { label: 'Total Pendente', value: formatCurrency(computed.totalPendente), icon: Clock, color: 'text-warning' },
    { label: 'Lucro Estimado', value: formatCurrency(computed.lucroEstimado), icon: TrendingUp, color: computed.lucroEstimado > 0 ? 'text-success' : 'text-destructive' },
    { label: 'Total Despesas', value: formatCurrency(computed.totalDespesas), icon: TrendingDown, color: 'text-destructive' },
  ];

  // Lucro health indicator
  const margemPct = computed.faturamentoBruto > 0 ? (computed.lucroEstimado / computed.faturamentoBruto) * 100 : 0;
  const healthColor = computed.lucroEstimado <= 0 ? 'bg-destructive/15 border-destructive/30 text-destructive' :
    margemPct < 15 ? 'bg-warning/15 border-warning/30 text-warning' : 'bg-success/15 border-success/30 text-success';
  const healthLabel = computed.lucroEstimado <= 0 ? '⛔ Prejuízo' : margemPct < 15 ? '⚠️ Margem Baixa' : '✅ Saudável';

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Visão geral do seu negócio — dados em tempo real</p>
      </div>

      {/* Health indicator */}
      <div className={`p-4 rounded-lg border ${healthColor} flex items-center justify-between`}>
        <div>
          <p className="text-sm font-semibold">{healthLabel}</p>
          <p className="text-xs opacity-80">Margem: {margemPct.toFixed(1)}% | Lucro: {formatCurrency(computed.lucroEstimado)}</p>
        </div>
        <TrendingUp className="w-8 h-8 opacity-40" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.color}`}>
                  {typeof stat.value === 'number' ? stat.value : stat.value}
                </p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color} opacity-40`} />
            </div>
          </div>
        ))}
      </div>

      {/* Receitas x Despesas */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Receitas x Despesas</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={[
            { name: 'Receitas', valor: computed.totalRecebido },
            { name: 'Despesas', valor: computed.totalDespesas },
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 18%)" />
            <XAxis dataKey="name" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} />
            <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} tickFormatter={(v) => formatCurrency(v)} />
            <Tooltip contentStyle={{ background: 'hsl(220, 15%, 13%)', border: '1px solid hsl(220, 13%, 20%)', borderRadius: '8px', color: 'hsl(210, 20%, 92%)' }} formatter={(value: number) => formatCurrency(value)} />
            <Bar dataKey="valor" radius={[4, 4, 0, 0]} name="Valor">
              <Cell fill="hsl(142, 71%, 45%)" />
              <Cell fill="hsl(0, 84%, 60%)" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Expense Categories */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Despesas por Categoria</h3>
          {computed.expenseCategoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={computed.expenseCategoryData} cx="50%" cy="50%" outerRadius={90} innerRadius={55} dataKey="value" paddingAngle={3}>
                    {computed.expenseCategoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(220, 15%, 13%)', border: '1px solid hsl(220, 13%, 20%)', borderRadius: '8px', color: 'hsl(210, 20%, 92%)' }} formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-2 justify-center">
                {computed.expenseCategoryData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                    {item.name}: {formatCurrency(item.value)}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-10">Sem dados de despesas</p>
          )}
        </div>

        {/* OS by Status */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">OS por Status</h3>
          {computed.osStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={computed.osStatusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 18%)" />
                <XAxis type="number" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} />
                <YAxis dataKey="status" type="category" width={120} tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(220, 15%, 13%)', border: '1px solid hsl(220, 13%, 20%)', borderRadius: '8px', color: 'hsl(210, 20%, 92%)' }} />
                <Bar dataKey="total" radius={[0, 4, 4, 0]} name="Quantidade">
                  {computed.osStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-10">Sem ordens de serviço</p>
          )}
        </div>
      </div>

      {/* Margem Peças e Terceiros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">🔧 Margem de Peças</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 rounded bg-muted/30"><span className="text-muted-foreground">Custo (Saídas)</span><span className="font-bold text-destructive">{formatCurrency(computed.custoPecas)}</span></div>
            <div className="flex justify-between p-2 rounded bg-muted/30"><span className="text-muted-foreground">Venda (OS)</span><span className="font-bold text-success">{formatCurrency(computed.vendaPecas)}</span></div>
            <div className={`flex justify-between p-3 rounded-lg font-bold ${computed.lucroPecas >= 0 ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>
              <span>Lucro</span><span>{formatCurrency(computed.lucroPecas)}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-muted/30"><span className="text-muted-foreground">Margem</span><span className="font-bold">{computed.margemPecas.toFixed(1)}%</span></div>
          </div>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">🤝 Margem de Terceiros</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 rounded bg-muted/30"><span className="text-muted-foreground">Custo (Saídas)</span><span className="font-bold text-destructive">{formatCurrency(computed.custoTerceiros)}</span></div>
            <div className="flex justify-between p-2 rounded bg-muted/30"><span className="text-muted-foreground">Venda (OS)</span><span className="font-bold text-success">{formatCurrency(computed.vendaTerceiros)}</span></div>
            <div className={`flex justify-between p-3 rounded-lg font-bold ${computed.lucroTerceiros >= 0 ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>
              <span>Lucro</span><span>{formatCurrency(computed.lucroTerceiros)}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-muted/30"><span className="text-muted-foreground">Margem</span><span className="font-bold">{computed.margemTerceiros.toFixed(1)}%</span></div>
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">💰 Cálculo do Lucro Real</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between p-2 rounded bg-success/10"><span className="text-success">+ Total recebido de clientes</span><span className="font-bold text-success">{formatCurrency(computed.totalRecebido)}</span></div>
          {computed.expenseCategoryData.map(cat => (
            <div key={cat.name} className="flex justify-between p-2 rounded bg-destructive/10"><span className="text-destructive">- {cat.name}</span><span className="font-bold text-destructive">{formatCurrency(cat.value)}</span></div>
          ))}
          <div className={`flex justify-between p-3 rounded-lg font-bold text-lg ${computed.lucroEstimado >= 0 ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>
            <span>= LUCRO LÍQUIDO ESTIMADO</span><span>{formatCurrency(computed.lucroEstimado)}</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {computed.alerts.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">⚠️ Alertas e Vencimentos</h3>
          <div className="space-y-2">
            {computed.alerts.map((alert, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${
                alert.type === 'danger' ? 'badge-danger' : alert.type === 'warning' ? 'badge-warning' : 'badge-info'
              }`}>
                <alert.icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{alert.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
