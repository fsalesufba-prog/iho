import ExcelJS from 'exceljs'
import { formatCurrency, formatDate } from '../utils/format'

export class ExcelService {
  /**
   * Gerar Excel de medição
   */
  async gerarMedicao(medicao: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Medição')

    // Título
    worksheet.mergeCells('A1:E1')
    const titleRow = worksheet.getRow(1)
    titleRow.getCell(1).value = 'MEDIÇÃO DE SERVIÇOS'
    titleRow.getCell(1).font = { size: 16, bold: true }
    titleRow.getCell(1).alignment = { horizontal: 'center' }

    // Informações da obra
    worksheet.mergeCells('A2:E2')
    worksheet.getRow(2).getCell(1).value = medicao.titulo
    worksheet.getRow(2).getCell(1).font = { size: 14, bold: true }
    worksheet.getRow(2).getCell(1).alignment = { horizontal: 'center' }

    worksheet.addRow([])
    worksheet.addRow([`Obra: ${medicao.obra.nome}`])
    worksheet.addRow([`Código: ${medicao.obra.codigo}`])
    if (medicao.obra.cliente) {
      worksheet.addRow([`Cliente: ${medicao.obra.cliente.nome}`])
    }
    worksheet.addRow([])
    worksheet.addRow([`Período: ${formatDate(medicao.periodoInicio)} a ${formatDate(medicao.periodoFim)}`])
    worksheet.addRow([`Data de emissão: ${formatDate(new Date())}`])
    worksheet.addRow([])

    // Cabeçalho da tabela
    const headerRow = worksheet.addRow(['Equipamento', 'Tag', 'Horas', 'Valor Unit.', 'Valor Total'])
    headerRow.font = { bold: true }
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })

    // Dados dos equipamentos
    for (const item of medicao.equipamentos) {
      const row = worksheet.addRow([
        item.equipamento.nome,
        item.equipamento.tag,
        item.horasTrabalhadas,
        formatCurrency(item.valorUnitario),
        formatCurrency(item.valorTotal)
      ])
      
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
    }

    // Linha de totais
    const totalRow = worksheet.addRow([
      'TOTAIS',
      '',
      medicao.horasTotal,
      '',
      formatCurrency(medicao.valorTotal)
    ])
    totalRow.font = { bold: true }
    totalRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })

    worksheet.addRow([])

    // Observações
    if (medicao.observacoes) {
      worksheet.addRow(['Observações:'])
      worksheet.addRow([medicao.observacoes])
      worksheet.addRow([])
    }

    // Assinaturas
    worksheet.addRow(['_________________________', '', '', '_________________________'])
    worksheet.addRow(['Responsável pela medição', '', '', 'Cliente / Aprovador'])

    // Ajustar largura das colunas
    worksheet.columns = [
      { width: 30 },
      { width: 15 },
      { width: 12 },
      { width: 15 },
      { width: 15 }
    ]

    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }

  /**
   * Gerar relatório de medições
   */
  async gerarRelatorioMedicoes(medicoes: any[], periodo: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Relatório de Medições')

    // Título
    worksheet.mergeCells('A1:F1')
    const titleRow = worksheet.getRow(1)
    titleRow.getCell(1).value = 'RELATÓRIO DE MEDIÇÕES'
    titleRow.getCell(1).font = { size: 16, bold: true }
    titleRow.getCell(1).alignment = { horizontal: 'center' }

    worksheet.addRow([])
    worksheet.addRow([`Período: ${formatDate(periodo.inicio)} a ${formatDate(periodo.fim)}`])
    worksheet.addRow([])

    // Resumo
    const totalMedicoes = medicoes.length
    const valorTotal = medicoes.reduce((sum, m) => sum + m.valorTotal, 0)
    const horasTotal = medicoes.reduce((sum, m) => sum + m.horasTotal, 0)

    worksheet.addRow(['RESUMO GERAL'])
    worksheet.addRow([`Total de medições: ${totalMedicoes}`])
    worksheet.addRow([`Total de horas: ${horasTotal}`])
    worksheet.addRow([`Valor total: ${formatCurrency(valorTotal)}`])
    worksheet.addRow([])

    // Cabeçalho da tabela
    const headerRow = worksheet.addRow(['Número', 'Obra', 'Período', 'Horas', 'Valor', 'Status'])
    headerRow.font = { bold: true }
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })

    // Dados das medições
    for (const medicao of medicoes) {
      const row = worksheet.addRow([
        `#${medicao.id}`,
        medicao.obra.nome,
        `${formatDate(medicao.periodoInicio)} a ${formatDate(medicao.periodoFim)}`,
        medicao.horasTotal,
        formatCurrency(medicao.valorTotal),
        medicao.status
      ])
      
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
    }

    // Ajustar largura das colunas
    worksheet.columns = [
      { width: 12 },
      { width: 30 },
      { width: 25 },
      { width: 10 },
      { width: 15 },
      { width: 12 }
    ]

    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }
<<<<<<< HEAD
=======

  async gerarRelatorio(relatorio: any, tipo: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(tipo || 'Relatório')

    worksheet.addRow(['Relatório IHO - ' + tipo])
    worksheet.addRow(['Gerado em:', new Date().toLocaleString('pt-BR')])
    worksheet.addRow([])

    if (relatorio && typeof relatorio === 'object') {
      const flatten = (obj: any, prefix = ''): [string, any][] =>
        Object.entries(obj).flatMap(([k, v]) =>
          v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)
            ? flatten(v, prefix ? `${prefix}.${k}` : k)
            : [[prefix ? `${prefix}.${k}` : k, v]]
        )
      const rows = flatten(relatorio)
      rows.forEach(([key, value]) => {
        worksheet.addRow([key, String(value ?? '')])
      })
    }

    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
}

export const excelService = new ExcelService()