import prisma from '../config/database'

export interface ListarItemsParams {
  page: number
  limit: number
  search?: string
  categoria?: string
  estoqueBaixo?: boolean
}

export interface ListarItemsResult {
  items: any[]
  total: number
  totalPages: number
  currentPage: number
  stats: {
    totalItems: number
    valorTotal: number
    itensBaixoEstoque: number
    categorias: number
  }
}

export class AlmoxarifadoService {
  /**
   * Listar itens com paginação e filtros
   */
  async listar(empresaId: number, params: ListarItemsParams): Promise<ListarItemsResult> {
    const { page, limit, search, categoria, estoqueBaixo } = params
    const skip = (page - 1) * limit

    // Construir where
    const where: any = {
      empresaId
    }

    if (search) {
      where.OR = [
        { nome: { contains: search } },
        { codigo: { contains: search } },
        { descricao: { contains: search } }
      ]
    }

    if (categoria) {
      where.categoria = categoria
    }

    if (estoqueBaixo) {
      where.estoqueAtual = { lte: prisma.estoque.fields.estoqueMinimo }
    }

    // Buscar itens com paginação
    const [items, total] = await Promise.all([
      prisma.estoque.findMany({
        where,
        include: {
          movimentos: {
            take: 1,
            orderBy: { data: 'desc' }
          }
        },
        skip,
        take: limit,
        orderBy: { nome: 'asc' }
      }),
      prisma.estoque.count({ where })
    ])

    // Calcular estatísticas
    const stats = await this.calcularStats(empresaId)

    // Adicionar alertas
    const itemsComAlerta = items.map(item => ({
      ...item,
      alerta: item.estoqueAtual <= item.estoqueMinimo,
      percentual: item.estoqueMinimo > 0 ? (item.estoqueAtual / item.estoqueMinimo) * 100 : 100
    }))

    return {
      items: itemsComAlerta,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      stats
    }
  }

  /**
   * Calcular estatísticas do estoque
   */
  async calcularStats(empresaId: number) {
    const items = await prisma.estoque.findMany({
      where: { empresaId }
    })

    const totalItems = items.length
    const valorTotal = items.reduce((sum, item) => {
      return sum + (item.valorUnitario || 0) * item.estoqueAtual
    }, 0)

    const itensBaixoEstoque = items.filter(
      item => item.estoqueAtual <= item.estoqueMinimo
    ).length

    const categorias = new Set(items.map(i => i.categoria)).size

    return {
      totalItems,
      valorTotal,
      itensBaixoEstoque,
      categorias
    }
  }

  /**
   * Verificar alerta de estoque
   */
  verificarAlertaEstoque(item: any): 'critico' | 'atencao' | 'normal' | null {
    if (item.estoqueAtual <= 0) {
      return 'critico'
    }
    if (item.estoqueAtual <= item.estoqueMinimo) {
      return 'atencao'
    }
    if (item.estoqueAtual >= item.estoqueMaximo) {
      return 'atencao'
    }
    return null
  }

  /**
   * Calcular dias até acabar o estoque
   */
  calcularDiasAteAcabar(item: any): number | null {
    if (item.movimentos.length === 0) return null

    // Calcular média de saída nos últimos 30 dias
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() - 30)

    const saidas = item.movimentos
      .filter((m: any) => m.tipo === 'saida' && m.data >= dataLimite)
      .reduce((sum: number, m: any) => sum + m.quantidade, 0)

    const mediaDiaria = saidas / 30
    if (mediaDiaria === 0) return null

    return Math.floor(item.estoqueAtual / mediaDiaria)
  }

  /**
   * Analisar consumo
   */
  async analisarConsumo(empresaId: number, dias: number) {
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() - dias)

    const movimentacoes = await prisma.estoqueMovimento.findMany({
      where: {
        estoque: { empresaId },
        data: { gte: dataLimite },
        tipo: 'saida'
      },
      include: {
        estoque: {
          select: {
            id: true,
            nome: true,
            categoria: true,
            unidade: true
          }
        }
      }
    })

    // Consumo por item
    const consumoPorItem: Record<number, { nome: string; quantidade: number; valor: number }> = {}
    
    movimentacoes.forEach(m => {
      if (!consumoPorItem[m.estoqueId]) {
        consumoPorItem[m.estoqueId] = {
          nome: m.estoque.nome,
          quantidade: 0,
          valor: 0
        }
      }
      consumoPorItem[m.estoqueId].quantidade += m.quantidade
      if (m.valorTotal) {
        consumoPorItem[m.estoqueId].valor += m.valorTotal
      }
    })

    // Consumo por categoria
    const consumoPorCategoria: Record<string, { quantidade: number; valor: number }> = {}
    
    movimentacoes.forEach(m => {
      const cat = m.estoque.categoria
      if (!consumoPorCategoria[cat]) {
        consumoPorCategoria[cat] = { quantidade: 0, valor: 0 }
      }
      consumoPorCategoria[cat].quantidade += m.quantidade
      if (m.valorTotal) {
        consumoPorCategoria[cat].valor += m.valorTotal
      }
    })

    return {
      periodo: `${dias} dias`,
      totalMovimentacoes: movimentacoes.length,
      consumoPorItem: Object.entries(consumoPorItem).map(([id, data]) => ({
        id: parseInt(id),
        ...data
      })),
      consumoPorCategoria,
      topItems: Object.entries(consumoPorItem)
        .sort((a, b) => b[1].quantidade - a[1].quantidade)
        .slice(0, 10)
        .map(([id, data]) => ({
          id: parseInt(id),
          ...data
        }))
    }
  }

  /**
   * Gerar relatório
   */
  async gerarRelatorio(empresaId: number, tipo: string) {
    const stats = await this.calcularStats(empresaId)
    const itens = await prisma.estoque.findMany({
      where: { empresaId },
      include: {
        movimentos: {
          take: 5,
          orderBy: { data: 'desc' }
        }
      }
    })

    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      select: { nome: true, cnpj: true }
    })

    const itensComAlerta = itens.map(item => ({
      ...item,
      alerta: this.verificarAlertaEstoque(item),
      diasAteAcabar: this.calcularDiasAteAcabar(item)
    }))

    return {
      empresa,
      data: new Date(),
      tipo,
      stats,
      itens: itensComAlerta,
      resumo: {
        valorMedioItem: stats.totalItems > 0 ? stats.valorTotal / stats.totalItems : 0,
        itensCriticos: itensComAlerta.filter(i => i.alerta === 'critico').length,
        itensAtencao: itensComAlerta.filter(i => i.alerta === 'atencao').length
      }
    }
  }
}

export const almoxarifadoService = new AlmoxarifadoService()