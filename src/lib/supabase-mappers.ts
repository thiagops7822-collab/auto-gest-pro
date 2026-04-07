import type { OrdemServico, PecaOS, PagamentoOS, CustoFixo, Funcionario, CartaoCredito, DespesaCartao, Terceiro } from "./mock-data";
import type { SaidaNaoPlanejada, Orcamento, OrcamentoItem } from "@/contexts/DataContext";

// ============ DB → App mappers ============

export function mapOS(row: any, pecas: any[], pagamentos: any[]): OrdemServico {
  return {
    id: row.id,
    numero: row.numero,
    dataEntrada: row.data_entrada,
    placa: row.placa,
    modelo: row.modelo,
    ano: row.ano,
    cor: row.cor,
    cliente: row.cliente,
    telefone: row.telefone,
    tipoServico: row.tipo_servico,
    descricao: row.descricao,
    valorOrcado: Number(row.valor_orcado),
    status: row.status,
    pecas: pecas.filter(p => p.os_id === row.id).map(mapPeca),
    pagamentos: pagamentos.filter(p => p.os_id === row.id).map(mapPagamento),
  };
}

export function mapPeca(row: any): PecaOS {
  return { id: row.id, descricao: row.descricao, fornecedor: row.fornecedor, valor: Number(row.valor), data: row.data, status: row.status };
}

export function mapPagamento(row: any): PagamentoOS {
  return { id: row.id, data: row.data, valor: Number(row.valor), forma: row.forma, observacao: row.observacao };
}

export function mapCusto(row: any): CustoFixo {
  return {
    id: row.id, nome: row.nome, categoria: row.categoria, valorPrevisto: Number(row.valor_previsto),
    diaVencimento: row.dia_vencimento, recorrencia: row.recorrencia, observacoes: row.observacoes,
    statusPagamento: row.status_pagamento, valorPago: row.valor_pago ? Number(row.valor_pago) : undefined,
    dataPagamento: row.data_pagamento, formaPagamento: row.forma_pagamento,
  };
}

export function mapFuncionario(row: any): Funcionario {
  return {
    id: row.id, nome: row.nome, cpf: row.cpf, cargo: row.cargo,
    tipoContrato: row.tipo_contrato, salarioBase: Number(row.salario_base),
    dataAdmissao: row.data_admissao, status: row.status, diaPagamento: row.dia_pagamento,
  };
}

export function mapCartao(row: any): CartaoCredito {
  return { id: row.id, nome: row.nome, limiteTotal: Number(row.limite_total), diaFechamento: row.dia_fechamento, diaVencimento: row.dia_vencimento };
}

export function mapDespesa(row: any, parcelas: any[]): DespesaCartao {
  return {
    id: row.id, cartaoId: row.cartao_id, descricao: row.descricao, categoria: row.categoria,
    valorTotal: Number(row.valor_total), parcelas: row.parcelas, dataCompra: row.data_compra,
    osVinculadaId: row.os_vinculada_id,
    parcelasGeradas: parcelas.filter(p => p.despesa_id === row.id).map(p => ({
      mes: p.mes, valor: Number(p.valor), status: p.status,
    })),
  };
}

export function mapTerceiro(row: any): Terceiro {
  return { id: row.id, nome: row.nome, tipo: row.tipo, telefone: row.telefone, especialidade: row.especialidade };
}

export function mapSaida(row: any): SaidaNaoPlanejada {
  return {
    id: row.id, descricao: row.descricao, valor: Number(row.valor), formaPagamento: row.forma_pagamento,
    data: row.data, observacao: row.observacao, tipo: row.tipo,
    osVinculadaId: row.os_vinculada_id, funcionarioId: row.funcionario_id,
    custoVinculadoId: row.custo_vinculado_id, cartaoVinculadoId: row.cartao_vinculado_id,
  };
}

export function mapOrcamento(row: any, itens: any[]): Orcamento {
  return {
    id: row.id, numero: row.numero, dataCriacao: row.data_criacao, validade: row.validade,
    placa: row.placa, modelo: row.modelo, ano: row.ano, cor: row.cor,
    cliente: row.cliente, telefone: row.telefone, sinistro: row.sinistro,
    orcamentista: row.orcamentista, observacoes: row.observacoes, status: row.status,
    itens: itens.filter(i => i.orcamento_id === row.id).map(mapOrcamentoItem),
  };
}

export function mapOrcamentoItem(row: any): OrcamentoItem {
  return { id: row.id, operacao: row.operacao, descricao: row.descricao, qtde: row.qtde, valorUnitario: Number(row.valor_unitario), valorTotal: Number(row.valor_total) };
}
