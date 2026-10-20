import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import IssueForm from '@/app/components/IssueForm'
import { getCurrentUser, getIssue } from '@/lib/dal'

const EditIssuePage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/signin')
  }

  const { id } = await params
  const issueId = Number(id)
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(issueId) || issueId <= 0) {
    notFound()
  }

  const issue = await getIssue(issueId)
  if (!issue) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <Link
        href={`/issues/${issue.id}`}
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
      >
        <ArrowLeftIcon size={16} className="mr-1" />
        Back to Issue
      </Link>

      <h1 className="text-2xl font-bold mb-6">Edit Issue</h1>

      <div className="bg-white dark:bg-dark-elevated border border-gray-200 dark:border-dark-border-default rounded-lg shadow-sm p-6">
        <IssueForm key={issue.id} issue={issue} isEditing />
      </div>
    </div>
  )
}

export default EditIssuePage
