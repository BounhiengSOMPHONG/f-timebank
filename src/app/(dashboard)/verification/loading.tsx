import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function VerificationLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row">
          <Skeleton className="h-10 w-full md:w-1/2" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-24" />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <Skeleton className="h-12 w-20" />
              <Skeleton className="h-12 flex-1" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
