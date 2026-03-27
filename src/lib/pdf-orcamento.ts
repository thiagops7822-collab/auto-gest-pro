import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "@/lib/mock-data";
import type { Orcamento } from "@/contexts/DataContext";

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

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function isPecas(operacao: string) {
  return operacao === 'Peças';
}

function addHeader(doc: jsPDF, logo: string | null, numero: number) {
  doc.setFillColor(...BLACK);
  doc.rect(0, 0, 210, 36, "F");

  let logoEndX = 14;
  if (logo) {
    doc.addImage(logo, "JPEG", 10, 3, 26, 26);
    logoEndX = 40;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("AUTO ESTUFA LIPPE", logoEndX, 12);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("(11) 94744-0501 • @autoestufalippe", logoEndX, 19);
  doc.text("Rua Sul América Nº 20 Jd. das Nações - Diadema/SP", logoEndX, 25);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`ORÇAMENTO #${numero}`, 196, 14, { align: "right" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Emitido em ${new Date().toLocaleDateString("pt-BR")}`, 196, 22, { align: "right" });

  return 44;
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Auto Estufa Lippe • Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
      14, 287
    );
    doc.text(`Página ${i} de ${pageCount}`, 196, 287, { align: "right" });
  }
}

export async function exportOrcamentoPDF(orc: Orcamento) {
  const doc = new jsPDF();
  const logo = await loadLogoBase64();
  let y = addHeader(doc, logo, orc.numero);

  // Date & Orcamentista row
  autoTable(doc, {
    startY: y,
    body: [
      [
        { content: `Data: ${formatDate(orc.dataCriacao)}`, styles: { fontStyle: "bold" } },
        { content: `Orçamento: ${orc.numero}`, styles: { fontStyle: "bold", halign: "right" as const } },
      ],
      ...(orc.orcamentista ? [
        [{ content: `Orçamentista: ${orc.orcamentista}`, colSpan: 2, styles: { fontStyle: "bold" as const } }]
      ] : []),
    ],
    theme: "plain",
    bodyStyles: { fontSize: 9, textColor: [60, 60, 60], cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 2;

  // Vehicle & client info (no endereco/cpfCnpj)
  autoTable(doc, {
    startY: y,
    body: [
      [{ content: "Proprietário:", styles: { fontStyle: "bold" } }, orc.cliente || "—", { content: "Veículo:", styles: { fontStyle: "bold" } }, orc.modelo],
      [{ content: "Fone:", styles: { fontStyle: "bold" } }, orc.telefone || "—", { content: "Ano:", styles: { fontStyle: "bold" } }, orc.ano || "—"],
      [{ content: "", styles: { fontStyle: "bold" } }, "", { content: "Placa:", styles: { fontStyle: "bold" } }, orc.placa || "—"],
      [{ content: "", styles: { fontStyle: "bold" } }, "", { content: "Cor/Pint:", styles: { fontStyle: "bold" } }, orc.cor || "—"],
      [{ content: "", styles: { fontStyle: "bold" } }, "", { content: "Sinistro:", styles: { fontStyle: "bold" } }, orc.sinistro || "Não"],
    ],
    theme: "plain",
    bodyStyles: { fontSize: 9, textColor: [60, 60, 60], cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 28 },
      1: { cellWidth: 62 },
      2: { fontStyle: "bold", cellWidth: 22 },
      3: { cellWidth: 60 },
    },
    margin: { left: 14, right: 14 },
    styles: { lineColor: [220, 220, 220], lineWidth: 0.2 },
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.3,
  });
  y = (doc as any).lastAutoTable.finalY + 4;

  // Items table - separate peças and serviços display
  if (orc.itens.length > 0) {
    const valorTotal = orc.itens.reduce((s, i) => s + i.valorTotal, 0);

    autoTable(doc, {
      startY: y,
      head: [["Tipo", "Descrição", "Qtde", "Valor (R$)", "Total (R$)"]],
      body: orc.itens.map(item => {
        const peca = isPecas(item.operacao);
        return [
          item.operacao,
          item.descricao,
          peca ? item.qtde.toString() : "—",
          item.valorUnitario > 0 ? formatCurrency(item.valorUnitario) : "",
          item.valorTotal > 0 ? formatCurrency(item.valorTotal) : "",
        ];
      }),
      foot: [[
        { content: "VALOR TOTAL", colSpan: 4, styles: { halign: "right" as const, fontStyle: "bold" as const, fontSize: 11 } },
        { content: formatCurrency(valorTotal), styles: { fontStyle: "bold" as const, fontSize: 11 } },
      ]],
      theme: "grid",
      headStyles: { fillColor: [...BLACK], textColor: [255, 255, 255], fontSize: 8, fontStyle: "bold", cellPadding: 3 },
      bodyStyles: { fontSize: 8, textColor: [60, 60, 60], cellPadding: 3 },
      footStyles: { fillColor: [240, 240, 240], textColor: [40, 40, 40] },
      columnStyles: {
        0: { cellWidth: 42 },
        1: { cellWidth: 64 },
        2: { cellWidth: 16, halign: "center" },
        3: { cellWidth: 28, halign: "right" },
        4: { cellWidth: 28, halign: "right" },
      },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      margin: { left: 14, right: 14 },
      styles: { lineColor: [200, 200, 200], lineWidth: 0.3 },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // Observations
  if (orc.observacoes) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text("Observações", 14, y);
    y += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const obsLines = doc.splitTextToSize(orc.observacoes, 182);
    doc.text(obsLines, 14, y);
    y += obsLines.length * 4.5 + 6;
  }

  // Validity notice
  if (y > 250) {
    doc.addPage();
    y = addHeader(doc, logo, orc.numero);
  }

  doc.setFillColor(240, 240, 240);
  doc.roundedRect(14, y, 182, 20, 2, 2, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.text("Este orçamento é válido até " + formatDate(orc.validade) + ".", 20, y + 8);
  doc.setFont("helvetica", "normal");
  doc.text("Após essa data, os valores poderão sofrer alteração.", 20, y + 14);

  addFooter(doc);
  doc.save(`AutoEstufaLippe_Orcamento_${orc.numero}.pdf`);
}
