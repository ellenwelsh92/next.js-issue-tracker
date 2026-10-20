import { db } from '@/db'
import { issues } from '@/db/schema'
import { getCurrentUser, getIssues } from '@/lib/dal'
import { IssueSchema } from '@/lib/validation/issues'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async () => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const issues = await getIssues()
    return NextResponse.json(
      { data: { issues } },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 })
  }
}

export const POST = async (req: NextRequest) => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const newIssueData = await req.json()
    const validationResult = IssueSchema.safeParse(newIssueData)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const [newIssue] = await db
      .insert(issues)
      .values({ ...validationResult.data, userId: user.id })
      .returning()
    return NextResponse.json({ data: newIssue })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create issue' }, { status: 500 })
  }
}
