import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'

export default function ManutencaoDetalheLoading() {
  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Carregando..." />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-5 w-32" />
          </div>

          {/* Header Card Skeleton */}
          <div className="mb-8">
            <Card className="overflow-hidden">
              <Skeleton className="h-32 w-full" />
              <CardContent className="relative p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <Skeleton className="h-20 w-20 rounded-full -mt-12 border-4 border-background" />
                  
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-8 w-64" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Skeleton */}
          <Tabs defaultValue="info" className="space-y-6">
            <TabsList>
              <TabsTrigger value="info" disabled>Informações</TabsTrigger>
              <TabsTrigger value="itens" disabled>Itens</TabsTrigger>
              <TabsTrigger value="equipamento" disabled>Equipamento</TabsTrigger>
            </TabsList>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-32" />
                      </div>
                    ))}
                  </div>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            </div>
          </Tabs>
        </Container>
      </main>
    </>
  )
}