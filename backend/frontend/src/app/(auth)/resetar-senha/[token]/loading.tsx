import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function ResetarSenhaLoading() {
  return (
    <Card className="border-0 shadow-2xl">
      <CardHeader className="space-y-2">
        <Skeleton className="h-6 w-32 mx-auto" />
        <Skeleton className="h-8 w-56 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
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