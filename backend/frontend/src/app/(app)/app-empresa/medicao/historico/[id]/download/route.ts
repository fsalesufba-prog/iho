import { NextRequest, NextResponse } from 'next/server'
import { api } from '@/lib/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const formato = searchParams.get('formato') || 'pdf'

    const response = await api.get(`/medicao/${params.id}/download`, {
      params: { formato },
      responseType: 'arraybuffer'
    })

    const contentType = formato === 'pdf' 
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

    const filename = `medicao-${params.id}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`

    return new NextResponse(response.data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Erro ao baixar medição:', error)
    return NextResponse.json(
      { error: 'Erro ao baixar medição' },
      { status: 500 }
    )
  }
}