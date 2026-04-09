import { supabase } from "@/integrations/supabase/client";
import type { OrdemServico, CustoFixo, Funcionario, CartaoCredito, DespesaCartao, Terceiro } from "@/lib/mock-data";
import type { SaidaNaoPlanejada, Orcamento } from "@/contexts/DataContext";

// ============ Ordens de Serviço ============
export async function upsertOS(os: OrdemServico) {
  const { pecas, pagamentos, ...rest } = os;
  await supabase.from('ordens_servico').upsert({
    id: rest.id, numero: rest.numero, data_entrada: rest.dataEntrada,
    placa: rest.placa, modelo: rest.modelo, ano: rest.ano, cor: rest.cor,
    cliente: rest.cliente, telefone: rest.telefone, tipo_servico: rest.tipoServico,
    descricao: rest.descricao, valor_orcado: rest.valorOrcado, status: rest.status,
  });
  // Sync pecas
  await supabase.from('pecas_os').delete().eq('os_id', os.id);
  if (pecas.length > 0) {
    await supabase.from('pecas_os').insert(
      pecas.map(p => ({ id: p.id, os_id: os.id, descricao: p.descricao, fornecedor: p.fornecedor, valor: p.valor, data: p.data, status: p.status }))
    );
  }
  // Sync pagamentos
  await supabase.from('pagamentos_os').delete().eq('os_id', os.id);
  if (pagamentos.length > 0) {
    await supabase.from('pagamentos_os').insert(
      pagamentos.map(p => ({ id: p.id, os_id: os.id, data: p.data, valor: p.valor, forma: p.forma, observacao: p.observacao }))
    );
  }
}

export async function deleteOS(id: string) {
  await supabase.from('ordens_servico').delete().eq('id', id);
}

// ============ Custos Fixos ============
export async function upsertCusto(c: CustoFixo) {
  await supabase.from('custos_fixos').upsert({
    id: c.id, nome: c.nome, categoria: c.categoria, valor_previsto: c.valorPrevisto,
    dia_vencimento: c.diaVencimento ?? null, recorrencia: c.recorrencia, observacoes: c.observacoes,
    status_pagamento: c.statusPagamento, valor_pago: c.valorPago,
    data_pagamento: c.dataPagamento, forma_pagamento: c.formaPagamento,
  });
}

export async function deleteCusto(id: string) {
  await supabase.from('custos_fixos').delete().eq('id', id);
}

// ============ Funcionários ============
export async function upsertFuncionario(f: Funcionario) {
  await supabase.from('funcionarios').upsert({
    id: f.id, nome: f.nome, cpf: f.cpf, cargo: f.cargo,
    tipo_contrato: f.tipoContrato, salario_base: f.salarioBase,
    data_admissao: f.dataAdmissao, status: f.status, dia_pagamento: f.diaPagamento,
  });
}

export async function deleteFuncionario(id: string) {
  await supabase.from('funcionarios').delete().eq('id', id);
}

// ============ Cartões ============
export async function upsertCartao(c: CartaoCredito) {
  await supabase.from('cartoes_credito').upsert({
    id: c.id, nome: c.nome, limite_total: c.limiteTotal,
    dia_fechamento: c.diaFechamento, dia_vencimento: c.diaVencimento,
  });
}

export async function deleteCartao(id: string) {
  await supabase.from('cartoes_credito').delete().eq('id', id);
}

// ============ Despesas Cartão ============
export async function upsertDespesa(d: DespesaCartao) {
  const { parcelasGeradas, ...rest } = d;
  await supabase.from('despesas_cartao').upsert({
    id: rest.id, cartao_id: rest.cartaoId, descricao: rest.descricao,
    categoria: rest.categoria, valor_total: rest.valorTotal, parcelas: rest.parcelas,
    data_compra: rest.dataCompra, os_vinculada_id: rest.osVinculadaId || null,
  });
  await supabase.from('parcelas_despesa').delete().eq('despesa_id', d.id);
  if (parcelasGeradas.length > 0) {
    await supabase.from('parcelas_despesa').insert(
      parcelasGeradas.map(p => ({ despesa_id: d.id, mes: p.mes, valor: p.valor, status: p.status }))
    );
  }
}

export async function deleteDespesa(id: string) {
  await supabase.from('despesas_cartao').delete().eq('id', id);
}

// ============ Terceiros ============
export async function upsertTerceiro(t: Terceiro) {
  await supabase.from('terceiros').upsert({
    id: t.id, nome: t.nome, tipo: t.tipo, telefone: t.telefone, especialidade: t.especialidade,
  });
}

export async function deleteTerceiro(id: string) {
  await supabase.from('terceiros').delete().eq('id', id);
}

// ============ Saídas Não Planejadas ============
export async function upsertSaida(s: SaidaNaoPlanejada) {
  await supabase.from('saidas_nao_planejadas').upsert({
    id: s.id, descricao: s.descricao, valor: s.valor, forma_pagamento: s.formaPagamento,
    data: s.data, observacao: s.observacao, tipo: s.tipo,
    os_vinculada_id: s.osVinculadaId || null, funcionario_id: s.funcionarioId || null,
    custo_vinculado_id: s.custoVinculadoId || null, cartao_vinculado_id: s.cartaoVinculadoId || null,
  });
}

export async function deleteSaida(id: string) {
  await supabase.from('saidas_nao_planejadas').delete().eq('id', id);
}

// ============ Orçamentos ============
export async function upsertOrcamento(o: Orcamento) {
  const { itens, ...rest } = o;
  await supabase.from('orcamentos').upsert({
    id: rest.id, numero: rest.numero, data_criacao: rest.dataCriacao, validade: rest.validade,
    placa: rest.placa, modelo: rest.modelo, ano: rest.ano, cor: rest.cor,
    cliente: rest.cliente, telefone: rest.telefone, sinistro: rest.sinistro,
    orcamentista: rest.orcamentista, observacoes: rest.observacoes, status: rest.status,
  });
  await supabase.from('orcamento_itens').delete().eq('orcamento_id', o.id);
  if (itens.length > 0) {
    await supabase.from('orcamento_itens').insert(
      itens.map(i => ({ id: i.id, orcamento_id: o.id, operacao: i.operacao, descricao: i.descricao, qtde: i.qtde, valor_unitario: i.valorUnitario, valor_total: i.valorTotal }))
    );
  }
}

export async function deleteOrcamento(id: string) {
  await supabase.from('orcamentos').delete().eq('id', id);
}

// ============ Configurações ============
export async function saveSaldoAnterior(valor: number) {
  await supabase.from('configuracoes').upsert({ chave: 'saldo_anterior', valor: String(valor) }, { onConflict: 'chave' });
}
