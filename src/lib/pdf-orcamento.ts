import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "@/lib/mock-data";
import type { Orcamento } from "@/contexts/DataContext";

const ORANGE = [234, 120, 30] as const;
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

function addHeader(doc: jsPDF, logo: string | null, numero: number) {
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

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`ORÇAMENTO #${numero}`, 196, 14, { align: "right" });

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
      14, 287
    );
    doc.text(`Página ${i} de ${pageCount}`, 196, 287, { align: "right" });
  }
}

export async function exportOrcamentoPDF(orc: Orcamento) {
  const doc = new jsPDF();
  const logo = await loadLogoBase64();
  let y = addHeader(doc, logo, orc.numero);

  // Client & vehicle info
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 50, 50);
  doc.text("Dados do Veículo e Cliente", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    body: [
      ["Placa", orc.placa || "—", "Modelo", orc.modelo],
      ["Ano", orc.ano || "—", "Cor", orc.cor || "—"],
      ["Cliente", orc.cliente || "—", "Telefone", orc.telefone || "—"],
      ["Tipo de Serviço", orc.tipoServico, "Data", formatDate(orc.dataCriacao)],
      ["Validade", formatDate(orc.validade), "Status", orc.status],
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
  if (orc.descricao) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text("Descrição do Serviço", 14, y);
    y += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const lines = doc.splitTextToSize(orc.descricao, 182);
    doc.text(lines, 14, y);
    y += lines.length * 4.5 + 6;
  }

  // Values breakdown
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 50, 50);
  doc.text("Detalhamento de Valores", 14, y);
  y += 4;

  const valorTotal = orc.valorServico + orc.valorPecas + orc.valorTerceiros;

  autoTable(doc, {
    startY: y,
    body: [
      ["Serviço (mão de obra)", formatCurrency(orc.valorServico)],
      ["Peças", formatCurrency(orc.valorPecas)],
      ["Serviços de Terceiros", formatCurrency(orc.valorTerceiros)],
    ],
    foot: [
      [{ content: "VALOR TOTAL", styles: { fontStyle: "bold", fontSize: 11 } },
       { content: formatCurrency(valorTotal), styles: { fontStyle: "bold", fontSize: 11 } }],
    ],
    theme: "grid",
    bodyStyles: { fontSize: 10, textColor: [60, 60, 60], cellPadding: 4 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 80 } },
    footStyles: { fillColor: [...ORANGE], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    margin: { left: 14, right: 14 },
    styles: { lineColor: [220, 220, 220], lineWidth: 0.3 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Observations
  if (orc.observacoes) {
    doc.setFontSize(11);
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
