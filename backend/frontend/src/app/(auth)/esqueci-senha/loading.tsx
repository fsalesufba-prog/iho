import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function EsqueciSenhaLoading() {
  return (
    <Card className="border-0 shadow-2xl">
      <CardHeader className="space-y-2">
        <Skeleton className="h-6 w-32 mx-auto" />
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-72 mx-auto" />
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>

        <Skeleton className="h-10 w-full" />
      </CardContent>

      <CardContent>
        <Skeleton className="h-4 w-32 mx-auto" />
      </CardContent>
    </Card>
  )
}