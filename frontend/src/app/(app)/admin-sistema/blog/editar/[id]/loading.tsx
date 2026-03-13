
import { Skeleton } from '@/components/ui/Skeleton'
import { Card, CardContent } from '@/components/ui/Card'

export default function EditarPostLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Form skeleton */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />

          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />

          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-20 w-full" />

          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}