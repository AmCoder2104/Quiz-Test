import { Skeleton } from "@/components/ui/skeleton"
import { Heading } from "@/components/ui/heading"

export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Heading title="Questions Management" description="Add, edit, and manage questions for tests" />
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="w-full max-w-md mx-auto">
        <Skeleton className="h-10 w-full mb-4" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
        <Skeleton className="h-10 w-full sm:w-[300px]" />
        <Skeleton className="h-10 w-full sm:w-[180px]" />
      </div>

      <div className="rounded-md border p-4">
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex justify-between items-center">
              <Skeleton className="h-6 w-[60%]" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
