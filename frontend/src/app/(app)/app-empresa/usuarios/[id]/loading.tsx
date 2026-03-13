import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'

export default function UsuarioDetalheLoading() {
  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Carregando usuário..." />
        
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
                <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                  <Skeleton className="h-24 w-24 rounded-full -mt-12 border-4 border-background" />
                  
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-64" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </div>

                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Skeleton */}
          <div className="space-y-6">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info" disabled>Informações</TabsTrigger>
                <TabsTrigger value="permissoes" disabled>Permissões</TabsTrigger>
                <TabsTrigger value="logs" disabled>Atividades</TabsTrigger>
                <TabsTrigger value="seguranca" disabled>Segurança</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-full" />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-16 mt-2" />
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-10 w-full mt-4" />
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </main>
    </>
  )
}