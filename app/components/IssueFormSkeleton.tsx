import { cn } from '@/lib/utils'

function Skeleton({ className }: { className: string }) {
  return (
    <div
      className={cn(
        'rounded-md bg-gray-200 motion-safe:animate-pulse dark:bg-dark-border-default',
        className
      )}
    />
  )
}

export default function IssueFormSkeleton() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading issue form...</span>

      <div aria-hidden="true" className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-[98px] w-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['status', 'priority'].map((field) => (
            <div key={field} className="space-y-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </div>
  )
}
