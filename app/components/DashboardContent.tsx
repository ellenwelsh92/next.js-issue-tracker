import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/dal'
import Navigation from './Navigation'

export default async function DashboardContent({
  children,
}: {
  children: ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/signin')
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pl-16 md:pl-64 pt-0 min-h-screen">
        <div className="max-w-6xl mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  )
}
