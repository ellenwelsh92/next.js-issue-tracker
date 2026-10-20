import { getCurrentUser, getIssue } from '@/lib/dal'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const issueId = Number(id)
    if (!Number.isSafeInteger(issueId) || issueId < 1) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    const issue = await getIssue(issueId)
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    return NextResponse.json(
      { data: issue },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch issue' }, { status: 500 })
  }
}
