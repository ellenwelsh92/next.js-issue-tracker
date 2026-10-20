import { db } from '@/db'
import { getSession } from './auth'
import { and, eq } from 'drizzle-orm'
import { cache } from 'react'
import { issues, users } from '@/db/schema'

export const getCurrentUser = cache(async () => {
  const session = await getSession()
  if (!session) {
    return null
  }

  try {
    const results = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))

    return results[0] || null
  } catch (e) {
    console.error(e)
    return null
  }
})

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    return user
  } catch (e) {
    console.error(e)
  }
}

export async function getIssues() {
  const user = await getCurrentUser()
  if (!user) {
    return []
  }

  try {
    const result = await db.query.issues.findMany({
      where: eq(issues.userId, user.id),
      with: {
        user: { columns: { id: true, email: true } },
      },
      orderBy: (issues, { desc }) => [desc(issues.createdAt)],
    })
    return result
  } catch (error) {
    console.error('Error fetching issues:', error)
    throw new Error('Failed to fetch issues')
  }
}

export const getIssue = async (id: number) => {
  const user = await getCurrentUser()
  if (!user) {
    return null
  }

  try {
    const issue = await db.query.issues.findFirst({
      where: and(eq(issues.id, id), eq(issues.userId, user.id)),
      with: { user: { columns: { id: true, email: true } } },
    })
    return issue
  } catch (e) {
    console.error(e)
    return null
  }
}
