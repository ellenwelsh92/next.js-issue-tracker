import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import EditIssuePage from '@/app/issues/[id]/edit/page'
import IssueForm from '@/app/components/IssueForm'
import type { Issue } from '@/db/schema'

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getIssue: vi.fn(),
  updateIssue: vi.fn(),
  createIssue: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
}))

vi.mock('@/lib/dal', () => ({
  getCurrentUser: mocks.getCurrentUser,
  getIssue: mocks.getIssue,
}))

vi.mock('@/app/actions/issues', () => ({
  updateIssue: mocks.updateIssue,
  createIssue: mocks.createIssue,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mocks.push,
    refresh: mocks.refresh,
    back: mocks.back,
  }),
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`)
  },
  notFound: () => {
    throw new Error('not-found')
  },
}))

const issue: Issue = {
  id: 42,
  title: 'Existing issue',
  description: 'Existing description',
  status: 'todo',
  priority: 'high',
  userId: 'owner',
  createdAt: new Date('2026-10-01T12:00:00Z'),
  updatedAt: new Date('2026-10-01T12:00:00Z'),
}

const page = (id = String(issue.id)) =>
  EditIssuePage({ params: Promise.resolve({ id }) })

describe('edit issue page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.getCurrentUser.mockResolvedValue({ id: issue.userId })
    mocks.getIssue.mockResolvedValue(issue)
    mocks.updateIssue.mockResolvedValue({
      success: true,
      message: 'Issue updated successfully',
    })
  })

  it('prefills the form and saves changes to the existing issue', async () => {
    render(await page())

    expect(screen.getByRole('heading', { name: 'Edit Issue' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Issue' })).toHaveAttribute(
      'href',
      '/issues/42'
    )
    expect(screen.getByLabelText('Title')).toHaveValue(issue.title)
    expect(screen.getByLabelText('Description')).toHaveValue(issue.description)
    expect(screen.getByLabelText('Status')).toHaveValue(issue.status)
    expect(screen.getByLabelText('Priority')).toHaveValue(issue.priority)

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Updated issue' },
    })
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Updated description' },
    })
    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: 'in_progress' },
    })
    fireEvent.change(screen.getByLabelText('Priority'), {
      target: { value: 'low' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Update Issue' }))

    await waitFor(() => {
      expect(mocks.push).toHaveBeenCalledWith('/issues/42')
    })
    expect(mocks.updateIssue).toHaveBeenCalledWith(42, {
      title: 'Updated issue',
      description: 'Updated description',
      status: 'in_progress',
      priority: 'low',
    })
    expect(mocks.createIssue).not.toHaveBeenCalled()
    expect(mocks.refresh).toHaveBeenCalled()
  })

  it('keeps edits and shows field feedback when validation fails', async () => {
    mocks.updateIssue.mockResolvedValue({
      success: false,
      message: 'Validation failed',
      errors: { title: ['Title must be at least 3 characters'] },
    })
    render(await page())

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'ab' },
    })
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Keep this draft' },
    })
    fireEvent.submit(screen.getByRole('button', { name: 'Update Issue' }).closest('form')!)

    expect(await screen.findByText('Title must be at least 3 characters')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toHaveValue('ab')
    expect(screen.getByLabelText('Description')).toHaveValue('Keep this draft')
    expect(screen.queryByText('Validation failed')).not.toBeInTheDocument()
    expect(mocks.push).not.toHaveBeenCalled()
    expect(mocks.refresh).not.toHaveBeenCalled()
  })

  it('cancels back to the issue without saving', async () => {
    render(await page())
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mocks.push).toHaveBeenCalledWith('/issues/42')
    expect(mocks.updateIssue).not.toHaveBeenCalled()
    expect(mocks.createIssue).not.toHaveBeenCalled()
  })

  it('still creates new issues through the shared form', async () => {
    mocks.createIssue.mockResolvedValue({
      success: true,
      message: 'Issue created successfully',
    })
    render(<IssueForm />)

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'New issue' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create Issue' }))

    await waitFor(() => {
      expect(mocks.push).toHaveBeenCalledWith('/dashboard')
    })
    expect(mocks.createIssue).toHaveBeenCalledWith({
      title: 'New issue',
      description: '',
      status: 'backlog',
      priority: 'medium',
    })
    expect(mocks.updateIssue).not.toHaveBeenCalled()
  })

  it('requires sign-in before loading an issue', async () => {
    mocks.getCurrentUser.mockResolvedValue(null)

    await expect(page()).rejects.toThrow('redirect:/signin')
    expect(mocks.getIssue).not.toHaveBeenCalled()
  })

  it('shows not found when the issue is missing or belongs to another user', async () => {
    mocks.getIssue.mockResolvedValue(null)

    await expect(page()).rejects.toThrow('not-found')
  })

  it.each(['invalid', '42junk', '0', '-1', '1.5'])(
    'rejects invalid issue ID %s before querying',
    async (id) => {
      await expect(page(id)).rejects.toThrow('not-found')
      expect(mocks.getIssue).not.toHaveBeenCalled()
    }
  )
})
