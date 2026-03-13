import PDFDocument from 'pdfkit'
import { formatCurrency, formatDate } from '../utils/format'

export class PdfService {
  /**
   * Gerar PDF de medição
   */
  async gerarMedicao(medicao: any): Promise<Buffer> {
    return new Promise((resolve) => {
      const chunks: Buffer[] = []
      const doc = new PDFDocument({ margin: 50, size: 'A4' })

      doc.on('data', chunk => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))

      // Cabeçalho
      doc.fontSize(20).text('MEDIÇÃO DE SERVIÇOS', { align: 'center' })
      doc.moveDown()
      
      doc.fontSize(16).text(medicao.titulo, { align: 'center' })
      doc.moveDown(2)

      // Informações da obra
      doc.fontSize(12).text(`Obra: ${medicao.obra.nome}`)
      doc.text(`Código: ${medicao.obra.codigo}`)
      if (medicao.obra.cliente) {
        doc.text(`Cliente: ${medicao.obra.cliente.nome}`)
      }
      doc.moveDown()

      // Período
      doc.text(`Período: ${formatDate(medicao.periodoInicio)} a ${formatDate(medicao.periodoFim)}`)
      doc.text(`Data de emissão: ${formatDate(new Date())}`)
      doc.moveDown(2)

      // Tabela de equipamentos
      doc.fontSize(14).text('Equipamentos Utilizados', { underline: true })
      doc.moveDown()

      // Cabeçalho da tabela
      const tableTop = doc.y
      doc.fontSize(10)
      doc.text('Equipamento', 50, tableTop)
      doc.text('Horas', 250, tableTop)
      doc.text('Valor Unit.', 350, tableTop)
      doc.text('Valor Total', 450, tableTop)

      doc.moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke()

      let y = tableTop + 25

      // Linhas da tabela
      for (const item of medicao.equipamentos) {
        doc.text(item.equipamento.nome, 50, y)
        doc.text(item.horasTrabalhadas.toString(), 250, y)
        doc.text(formatCurrency(item.valorUnitario), 350, y)
        doc.text(formatCurrency(item.valorTotal), 450, y)
        y += 20
      }

      doc.moveTo(50, y)
        .lineTo(550, y)
        .stroke()
      
      y += 15

      // Totais
      doc.fontSize(12)
      doc.text(`Total de Horas: ${medicao.horasTotal}`, 50, y)
      doc.text(`Valor Total: ${formatCurrency(medicao.valorTotal)}`, 350, y, { align: 'right' })
      
      y += 30

      // Observações
      if (medicao.observacoes) {
        doc.fontSize(12).text('Observações:', 50, y)
        doc.fontSize(10).text(medicao.observacoes, 50, y + 20)
        y += 60
      }

      // Assinaturas
      y = 650
      doc.fontSize(10)
      doc.text('_________________________', 100, y)
      doc.text('_________________________', 350, y)
      
      doc.text('Responsável pela medição', 100, y + 20)
      doc.text('Cliente / Aprovador', 350, y + 20)

      // Rodapé
      doc.fontSize(8)
      doc.text(
        'Documento gerado pelo sistema IHO - Índice de Saúde Operacional',
        50,
        750,
        { align: 'center' }
      )

      doc.end()
    })
  }

  /**
   * Gerar relatório de medições
   */
  async gerarRelatorioMedicoes(medicoes: any[], periodo: any): Promise<Buffer> {
    return new Promise((resolve) => {
      const chunks: Buffer[] = []
      const doc = new PDFDocument({ margin: 50, size: 'A4' })

      doc.on('data', chunk => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))

      // Cabeçalho
      doc.fontSize(20).text('RELATÓRIO DE MEDIÇÕES', { align: 'center' })
      doc.moveDown()
      
      doc.fontSize(12).text(`Período: ${formatDate(periodo.inicio)} a ${formatDate(periodo.fim)}`)
      doc.moveDown(2)

      // Resumo
      const totalMedicoes = medicoes.length
      const valorTotal = medicoes.reduce((sum, m) => sum + m.valorTotal, 0)
      const horasTotal = medicoes.reduce((sum, m) => sum + m.horasTotal, 0)

      doc.fontSize(14).text('Resumo Geral', { underline: true })
      doc.moveDown()
      doc.fontSize(12)
      doc.text(`Total de medições: ${totalMedicoes}`)
      doc.text(`Total de horas: ${horasTotal}`)
      doc.text(`Valor total: ${formatCurrency(valorTotal)}`)
      doc.moveDown(2)

      // Tabela de medições
      doc.fontSize(14).text('Medições Realizadas', { underline: true })
      doc.moveDown()

      const tableTop = doc.y
      doc.fontSize(10)
      doc.text('Número', 50, tableTop)
      doc.text('Obra', 150, tableTop)
      doc.text('Período', 300, tableTop)
      doc.text('Valor', 450, tableTop)

      doc.moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke()

      let y = tableTop + 25

      for (const medicao of medicoes) {
        doc.text(`#${medicao.id}`, 50, y)
        doc.text(medicao.obra.nome.substring(0, 20), 150, y)
        doc.text(`${formatDate(medicao.periodoInicio)}`, 300, y)
        doc.text(formatCurrency(medicao.valorTotal), 450, y)
        y += 20
      }

      doc.end()
      resolve(Buffer.concat(chunks))
    })
  }
}

export const pdfService = new PdfService()