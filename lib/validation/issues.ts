import { z } from 'zod'

// Ownership is always supplied by the authenticated server session.
export const IssueSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string().optional().nullable(),
  status: z.enum(['backlog', 'todo', 'in_progress', 'done'], {
    errorMap: () => ({ message: 'Please select a valid status' }),
  }),
  priority: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Please select a valid priority' }),
  }),
})

export type IssueData = z.infer<typeof IssueSchema>
