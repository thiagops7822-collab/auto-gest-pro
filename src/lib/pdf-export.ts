import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  cartoes,
  ordensServico,
  custosFixos,
  funcionarios,
  despesasCartao,
  terceiros,
  formatCurrency,
  getTotalRecebido,
  getTotalPecas,
  getSaldoPendente,
  getStatusPagamento,
} from "@/lib/mock-data";

const BLACK = [30, 30, 30] as const;
const LOGO_PATH = "/images/logo-auto-estufa.jpeg";

function addHeader(doc: jsPDF, title: string, subtitle: string) {
  // Orange bar
  doc.setFillColor(...BLACK);
  doc.rect(0, 0, 210, 28, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("AutoGest", 14, 14);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema de Gestão Automotiva", 14, 21);

  // Title area
  doc.setFontSize(14);
  doc.setTextColor(50, 50, 50);
  doc.text(title, 14, 40);

  doc.setFontSize(9);
  doc.setTextColor(130, 130, 130);
  doc.text(subtitle, 14, 47);

  return 55;
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `AutoGest • Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
      14,
      287
    );
    doc.text(`Página ${i} de ${pageCount}`, 196, 287, { align: "right" });
  }
}

export function exportRelatorioFinanceiro() {
  const doc = new jsPDF();
  let y = addHeader(doc, "Relatório Financeiro Completo", "Março / 2025");

  const totalRecebido = ordensServico.reduce((s, os) => s + getTotalRecebido(os), 0);
  const totalPecas = ordensServico.reduce((s, os) => s + getTotalPecas(os), 0);
  const totalFolha = funcionarios.filter((f) => f.status === "Ativo").reduce((s, f) => s + f.salarioBase, 0);
  const totalFixos = custosFixos.filter((c) => c.categoria.startsWith("Fixo")).reduce((s, c) => s + c.valorPrevisto, 0);
  const totalVariaveis = custosFixos.filter((c) => c.categoria === "Variável").reduce((s, c) => s + c.valorPrevisto, 0);
  const totalCartao = despesasCartao.flatMap((d) => d.parcelasGeradas.filter((p) => p.mes === "2025-03")).reduce((s, p) => s + p.valor, 0);
  const lucroLiquido = totalRecebido - totalPecas - totalFolha - totalFixos - totalVariaveis - totalCartao;
  const margemPct = totalRecebido > 0 ? (lucroLiquido / totalRecebido) * 100 : 0;

  // DRE Section
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 50, 50);
  doc.text("Demonstrativo de Resultado", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Descrição", "Valor (R$)"]],
    body: [
      ["(+) Total Recebido de Clientes", formatCurrency(totalRecebido)],
      ["(-) Custo com Peças e Terceiros", formatCurrency(totalPecas)],
      ["(-) Folha de Pagamento", formatCurrency(totalFolha)],
      ["(-) Custos Fixos", formatCurrency(totalFixos)],
      ["(-) Custos Variáveis", formatCurrency(totalVariaveis)],
      ["(-) Fatura Cartão do Mês", formatCurrency(totalCartao)],
    ],
    foot: [[{ content: "(=) LUCRO LÍQUIDO ESTIMADO", styles: { fontStyle: "bold" } }, { content: formatCurrency(lucroLiquido), styles: { fontStyle: "bold", textColor: lucroLiquido >= 0 ? [34, 139, 34] : [220, 50, 50] } }]],
    headStyles: { fillColor: [...BLACK], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    footStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50], fontSize: 10 },
    bodyStyles: { fontSize: 9, textColor: [60, 60, 60] },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    margin: { left: 14, right: 14 },
    theme: "grid",
    styles: { cellPadding: 4, lineColor: [220, 220, 220], lineWidth: 0.3 },
  });

  y = (doc as any).lastAutoTable.finalY + 6;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Margem de lucro: ${margemPct.toFixed(1)}% — Status: ${lucroLiquido < 0 ? "Prejuízo" : margemPct < 15 ? "Margem Baixa" : "Saudável"}`, 14, y);

  // OS Summary
  y += 12;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 50, 50);
  doc.text("Resumo de Ordens de Serviço", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Nº OS", "Cliente", "Veículo", "Valor", "Recebido", "Pendente", "Status", "Pgto"]],
    body: ordensServico.map((os) => [
      `#${os.numero}`,
      os.cliente,
      `${os.modelo} (${os.placa})`,
      formatCurrency(os.valorOrcado),
      formatCurrency(getTotalRecebido(os)),
      formatCurrency(Math.max(0, getSaldoPendente(os))),
      os.status,
      getStatusPagamento(os),
    ]),
    headStyles: { fillColor: [...BLACK], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: [60, 60, 60] },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    margin: { left: 14, right: 14 },
    theme: "grid",
    styles: { cellPadding: 3, lineColor: [220, 220, 220], lineWidth: 0.3 },
  });

  // Custos page
  doc.addPage();
  y = addHeader(doc, "Detalhamento de Custos", "Março / 2025");

  autoTable(doc, {
    startY: y,
    head: [["Custo", "Categoria", "Valor Previsto", "Valor Pago", "Status"]],
    body: custosFixos.map((c) => [c.nome, c.categoria, formatCurrency(c.valorPrevisto), c.valorPago ? formatCurrency(c.valorPago) : "—", c.statusPagamento]),
    headStyles: { fillColor: [...BLACK], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [60, 60, 60] },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    margin: { left: 14, right: 14 },
    theme: "grid",
    styles: { cellPadding: 4, lineColor: [220, 220, 220], lineWidth: 0.3 },
  });

  // Folha de Pagamento
  y = (doc as any).lastAutoTable.finalY + 12;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 50, 50);
  doc.text("Folha de Pagamento", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Funcionário", "Cargo", "Contrato", "Salário Base", "Status"]],
    body: funcionarios.map((f) => [f.nome, f.cargo, f.tipoContrato, formatCurrency(f.salarioBase), f.status]),
    foot: [["", "", "", { content: formatCurrency(funcionarios.filter((f) => f.status === "Ativo").reduce((s, f) => s + f.salarioBase, 0)), styles: { fontStyle: "bold" } }, ""]],
    headStyles: { fillColor: [...BLACK], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    footStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50] },
    bodyStyles: { fontSize: 9, textColor: [60, 60, 60] },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    margin: { left: 14, right: 14 },
    theme: "grid",
    styles: { cellPadding: 4, lineColor: [220, 220, 220], lineWidth: 0.3 },
  });

  // Cartões
  y = (doc as any).lastAutoTable.finalY + 12;
  if (y > 240) {
    doc.addPage();
    y = addHeader(doc, "Cartões de Crédito", "Março / 2025");
  } else {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text("Despesas no Cartão de Crédito", 14, y);
    y += 4;
  }

  autoTable(doc, {
    startY: y,
    head: [["Descrição", "Cartão", "Categoria", "Valor Total", "Parcelas", "Valor Parcela"]],
    body: despesasCartao.map((d) => {
      const cartaoNome = cartoes.find((c) => c.id === d.cartaoId)?.nome || "";
      return [d.descricao, cartaoNome, d.categoria, formatCurrency(d.valorTotal), `${d.parcelas}x`, formatCurrency(d.valorTotal / d.parcelas)];
    }),
    headStyles: { fillColor: [...BLACK], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [60, 60, 60] },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    margin: { left: 14, right: 14 },
    theme: "grid",
    styles: { cellPadding: 4, lineColor: [220, 220, 220], lineWidth: 0.3 },
  });

  addFooter(doc);
  doc.save("AutoGest_Relatorio_Financeiro_Mar2025.pdf");
}

export function exportRelatorioOS() {
  const doc = new jsPDF();
  let y = addHeader(doc, "Relatório de Ordens de Serviço", "Detalhamento Completo — Março / 2025");

  ordensServico.forEach((os, index) => {
    if (y > 230) {
      doc.addPage();
      y = addHeader(doc, "Relatório de Ordens de Serviço (cont.)", "Março / 2025");
    }

    doc.setFillColor(245, 245, 245);
    doc.roundedRect(14, y - 4, 182, 8, 1, 1, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BLACK);
    doc.text(`OS #${os.numero}`, 16, y + 1);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`${os.cliente} • ${os.modelo} (${os.placa}) • ${os.status}`, 50, y + 1);
    y += 10;

    const rows: string[][] = [];
    rows.push(["Valor Orçado", formatCurrency(os.valorOrcado)]);
    rows.push(["Total Recebido", formatCurrency(getTotalRecebido(os))]);
    rows.push(["Saldo Pendente", formatCurrency(Math.max(0, getSaldoPendente(os)))]);
    rows.push(["Custo Peças/Terceiros", formatCurrency(getTotalPecas(os))]);
    const margem = os.valorOrcado - getTotalPecas(os);
    rows.push(["Margem", `${formatCurrency(margem)} (${os.valorOrcado > 0 ? ((margem / os.valorOrcado) * 100).toFixed(1) : 0}%)`]);

    autoTable(doc, {
      startY: y,
      body: rows,
      theme: "plain",
      bodyStyles: { fontSize: 8, textColor: [60, 60, 60], cellPadding: 2 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
      margin: { left: 16, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  });

  addFooter(doc);
  doc.save("AutoGest_Relatorio_OS_Mar2025.pdf");
}
