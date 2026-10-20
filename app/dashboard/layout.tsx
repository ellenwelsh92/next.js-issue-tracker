import { Suspense } from 'react'
import DashboardContent from '../components/DashboardContent'
import DashboardSkeleton from '../components/DashboardSkeleton'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <DashboardSkeleton />
        </div>
      }
    >
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  )
}
