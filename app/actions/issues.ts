'use server'

import { db } from '@/db'
import { issues } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/dal'
import { IssueSchema, type IssueData } from '@/lib/validation/issues'
import { mockDelay } from '@/lib/utils'

export type { IssueData } from '@/lib/validation/issues'

export type ActionResponse = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  error?: string
}

export async function createIssue(data: IssueData): Promise<ActionResponse> {
  try {
    // Security check - ensure user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        message: 'Unauthorized access',
        error: 'Unauthorized',
      }
    }

    // Validate with Zod
    const validationResult = IssueSchema.safeParse(data)
    if (!validationResult.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      }
    }

    // Create issue with validated data
    const validatedData = validationResult.data
    await db.insert(issues).values({
      title: validatedData.title,
      description: validatedData.description || null,
      status: validatedData.status,
      priority: validatedData.priority,
      userId: user.id,
    })

    return { success: true, message: 'Issue created successfully' }
  } catch (error) {
    console.error('Error creating issue:', error)
    return {
      success: false,
      message: 'An error occurred while creating the issue',
      error: 'Failed to create issue',
    }
  }
}

export const updateIssue = async (
  id: number,
  data: Partial<IssueData>,
): Promise<ActionResponse> => {
  try {
    // Security check - ensure user is authenticated
    await mockDelay(700)
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        message: 'Unauthorized access',
        error: 'Unauthorized',
      }
    }

    // Allow partial validation for updates
    const UpdateIssueSchema = IssueSchema.partial()
    const validationResult = UpdateIssueSchema.safeParse(data)

    if (!validationResult.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      }
    }

    // Type safe update object with validated data
    const validatedData = validationResult.data
    const updateData: Partial<IssueData> = {}

    if (validatedData.title !== undefined)
      updateData.title = validatedData.title
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description
    if (validatedData.status !== undefined)
      updateData.status = validatedData.status
    if (validatedData.priority !== undefined)
      updateData.priority = validatedData.priority

    // Enforce ownership in the write itself, including requests with guessed IDs.
    const [updatedIssue] = await db
      .update(issues)
      .set({ ...updateData, updatedAt: new Date() })
      .where(and(eq(issues.id, id), eq(issues.userId, user.id)))
      .returning()

    if (!updatedIssue) {
      return {
        success: false,
        message: 'Issue not found',
        error: 'Not found',
      }
    }

    revalidatePath('/dashboard')
    revalidatePath(`/issues/${id}`)
    revalidatePath(`/issues/${id}/edit`)

    return { success: true, message: 'Issue updated successfully' }
  } catch (error) {
    console.error('Error updating issue:', error)
    return {
      success: false,
      message: 'An error occurred while updating the issue',
      error: 'Failed to update issue',
    }
  }
}

export const deleteIssue = async (id: number): Promise<ActionResponse> => {
  try {
    // Security check - ensure user is authenticated
    await mockDelay(700)
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        message: 'Unauthorized access',
        error: 'Unauthorized',
      }
    }

    const [deletedIssue] = await db
      .delete(issues)
      .where(and(eq(issues.id, id), eq(issues.userId, user.id)))
      .returning()

    if (!deletedIssue) {
      return {
        success: false,
        message: 'Issue not found',
        error: 'Not found',
      }
    }

    return { success: true, message: 'Issue deleted successfully' }
  } catch (error) {
    console.error('Error deleting issue:', error)
    return {
      success: false,
      message: 'An error occurred while deleting the issue',
      error: 'Failed to delete issue',
    }
  }
}
