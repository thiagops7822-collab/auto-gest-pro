import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  formatCurrency,
  formatDate,
  getTotalRecebido,
  getTotalPecas,
  getSaldoPendente,
  getStatusPagamento,
  getValorTotalOS,
  type OrdemServico,
} from "@/lib/mock-data";

const BLACK = [30, 30, 30] as const;
const LOGO_PATH = "/images/logo-auto-estufa.jpeg";

async function loadLogoBase64(): Promise<string | null> {
  try {
    const response = await fetch(LOGO_PATH);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function addHeader(doc: jsPDF, logo: string | null, osNumero: number) {
  // Orange bar
  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, 210, 32, "F");

  let logoEndX = 14;
  if (logo) {
    doc.addImage(logo, "JPEG", 10, 3, 26, 26);
    logoEndX = 40;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("Auto Estufa Lippe", logoEndX, 14);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Funilaria • Pintura • Estética Automotiva", logoEndX, 21);

  // OS number on the right
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`OS #${osNumero}`, 196, 14, { align: "right" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Emitido em ${new Date().toLocaleDateString("pt-BR")}`, 196, 21, { align: "right" });

  return 40;
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Auto Estufa Lippe • Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
      14,
      287
    );
    doc.text(`Página ${i} de ${pageCount}`, 196, 287, { align: "right" });
  }
}

export async function exportOSIndividualPDF(os: OrdemServico) {
  const doc = new jsPDF();
  const logo = await loadLogoBase64();
  let y = addHeader(doc, logo, os.numero);

  // Vehicle / Client info
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 50, 50);
  doc.text("Dados do Veículo e Cliente", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    body: [
      ["Placa", os.placa || "—", "Modelo", os.modelo],
      ["Ano", os.ano || "—", "Cor", os.cor || "—"],
      ["Cliente", os.cliente || "—", "Telefone", os.telefone || "—"],
      ["Tipo de Serviço", os.tipoServico, "Data Entrada", formatDate(os.dataEntrada)],
      ["Status", os.status, "Pagamento", getStatusPagamento(os)],
    ],
    theme: "plain",
    bodyStyles: { fontSize: 9, textColor: [60, 60, 60], cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 35 },
      1: { cellWidth: 55 },
      2: { fontStyle: "bold", cellWidth: 35 },
      3: { cellWidth: 55 },
    },
    margin: { left: 14, right: 14 },
    alternateRowStyles: { fillColor: [248, 248, 248] },
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // Description
  if (os.descricao) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text("Descrição do Serviço", 14, y);
    y += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const lines = doc.splitTextToSize(os.descricao, 182);
    doc.text(lines, 14, y);
    y += lines.length * 4.5 + 6;
  }

  // Parts & Third-party
  if (os.pecas.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text("Peças e Serviços de Terceiros", 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [["Descrição", "Fornecedor", "Valor", "Data", "Status"]],
      body: os.pecas.map((p) => [
        p.descricao,
        p.fornecedor,
        formatCurrency(p.valor),
        formatDate(p.data),
        p.status,
      ]),
      foot: [
        [
          { content: "TOTAL", colSpan: 2, styles: { fontStyle: "bold" } },
          { content: formatCurrency(getTotalPecas(os)), styles: { fontStyle: "bold" } },
          "",
          "",
        ],
      ],
      headStyles: { fillColor: [...ORANGE], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
      footStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50] },
      bodyStyles: { fontSize: 9, textColor: [60, 60, 60] },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      margin: { left: 14, right: 14 },
      theme: "grid",
      styles: { cellPadding: 3, lineColor: [220, 220, 220], lineWidth: 0.3 },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Payments
  if (os.pagamentos.length > 0) {
    if (y > 230) {
      doc.addPage();
      y = addHeader(doc, logo, os.numero);
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text("Pagamentos Recebidos", 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [["Data", "Valor", "Forma", "Observação"]],
      body: os.pagamentos.map((pg) => [
        formatDate(pg.data),
        formatCurrency(pg.valor),
        pg.forma,
        pg.observacao || "—",
      ]),
      foot: [
        [
          { content: "TOTAL RECEBIDO", styles: { fontStyle: "bold" } },
          { content: formatCurrency(getTotalRecebido(os)), styles: { fontStyle: "bold" } },
          "",
          "",
        ],
      ],
      headStyles: { fillColor: [...ORANGE], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
      footStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50] },
      bodyStyles: { fontSize: 9, textColor: [60, 60, 60] },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      margin: { left: 14, right: 14 },
      theme: "grid",
      styles: { cellPadding: 3, lineColor: [220, 220, 220], lineWidth: 0.3 },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Financial summary
  if (y > 230) {
    doc.addPage();
    y = addHeader(doc, logo, os.numero);
  }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 50, 50);
  doc.text("Resumo Financeiro", 14, y);
  y += 4;

  const valorTotal = getValorTotalOS(os);
  const totalRecebido = getTotalRecebido(os);
  const saldoPendente = Math.max(0, getSaldoPendente(os));
  const margem = os.valorOrcado - getTotalPecas(os);
  const margemPct = os.valorOrcado > 0 ? (margem / os.valorOrcado) * 100 : 0;

  autoTable(doc, {
    startY: y,
    body: [
      ["Valor Orçado (serviço)", formatCurrency(os.valorOrcado)],
      ["Custo Peças / Terceiros", formatCurrency(getTotalPecas(os))],
      ["Valor Total da OS", formatCurrency(valorTotal)],
      ["Total Recebido", formatCurrency(totalRecebido)],
      ["Saldo Pendente", formatCurrency(saldoPendente)],
      ["Margem de Lucro", `${formatCurrency(margem)} (${margemPct.toFixed(1)}%)`],
    ],
    theme: "grid",
    bodyStyles: { fontSize: 10, textColor: [60, 60, 60], cellPadding: 4 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 80 } },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    margin: { left: 14, right: 14 },
    styles: { lineColor: [220, 220, 220], lineWidth: 0.3 },
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // Health indicator
  const healthColor = margem < 0 ? [220, 50, 50] : margemPct < 15 ? [200, 160, 30] : [34, 139, 34];
  const healthText = margem < 0 ? "PREJUÍZO" : margemPct < 15 ? "MARGEM BAIXA" : "SAUDÁVEL";
  doc.setFillColor(healthColor[0], healthColor[1], healthColor[2]);
  doc.roundedRect(14, y, 182, 12, 2, 2, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(`Status Financeiro: ${healthText}`, 105, y + 8, { align: "center" });

  addFooter(doc);
  doc.save(`AutoEstufaLippe_OS_${os.numero}.pdf`);
}
