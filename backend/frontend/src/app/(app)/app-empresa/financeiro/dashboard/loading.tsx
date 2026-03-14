import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'

export default function DashboardFinanceiroLoading() {
  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Dashboard Financeiro" />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-5 w-32" />
          </div>

          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-5 w-48 mt-2" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-[180px]" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>

          {/* Tabs Skeleton */}
          <Tabs defaultValue="visao-geral" className="space-y-6">
            <TabsList>
              <TabsTrigger value="visao-geral" disabled>Visão Geral</TabsTrigger>
              <TabsTrigger value="indicadores" disabled>Indicadores</TabsTrigger>
              <TabsTrigger value="historico" disabled>Histórico</TabsTrigger>
            </TabsList>

            {/* Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                    <Skeleton className="h-8 w-32 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Gráficos Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-64 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </Tabs>
        </Container>
      </main>
    </>
  )
}