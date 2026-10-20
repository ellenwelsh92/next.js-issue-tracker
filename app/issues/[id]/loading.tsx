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

const IssueLoader = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8" role="status" aria-busy="true">
      <span className="sr-only">Loading issue...</span>

      <div aria-hidden="true">
        <div className="mb-8">
          <Skeleton className="h-4 w-28 mb-4" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Skeleton className="h-9 w-3/4 max-w-sm" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-elevated border border-gray-200 dark:border-dark-border-default rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-elevated border border-gray-200 dark:border-dark-border-default rounded-lg shadow-sm p-6">
          <Skeleton className="h-6 w-20 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['assignee', 'status', 'priority', 'created'].map((field) => (
              <div key={field} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-36" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default IssueLoader
