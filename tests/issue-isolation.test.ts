// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PgDialect } from 'drizzle-orm/pg-core'
import { NextRequest } from 'next/server'
import { getIssue, getIssues } from '@/lib/dal'
import { createIssue, deleteIssue, updateIssue } from '@/app/actions/issues'
import { GET as listIssues, POST as postIssue } from '@/app/api/issue/route'
import { GET as readIssue } from '@/app/api/issue/[id]/route'
import type { Issue, User } from '@/db/schema'

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  selectUser: vi.fn(),
  findMany: vi.fn(),
  findFirst: vi.fn(),
  insert: vi.fn(),
  insertValues: vi.fn(),
  insertReturning: vi.fn(),
  update: vi.fn(),
  updateSet: vi.fn(),
  updateWhere: vi.fn(),
  updateReturning: vi.fn(),
  delete: vi.fn(),
  deleteWhere: vi.fn(),
  deleteReturning: vi.fn(),
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ getSession: mocks.getSession }))
vi.mock('@/lib/utils', () => ({ mockDelay: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock('@/db', () => ({
  db: {
    select: () => ({ from: () => ({ where: mocks.selectUser }) }),
    query: {
      issues: { findMany: mocks.findMany, findFirst: mocks.findFirst },
    },
    insert: mocks.insert,
    update: mocks.update,
    delete: mocks.delete,
  },
}))

const dialect = new PgDialect()
const alice: User = {
  id: 'alice',
  email: 'alice@example.com',
  password: 'hashed-password',
  createdAt: new Date(),
}
const bob: User = { ...alice, id: 'bob', email: 'bob@example.com' }
const issueData = {
  title: 'Private issue',
  description: 'Only the owner should see this',
  status: 'todo' as const,
  priority: 'medium' as const,
}
const aliceIssue: Issue = {
  ...issueData,
  id: 1,
  userId: alice.id,
  createdAt: new Date(),
  updatedAt: new Date(),
}

function signInAs(user: User) {
  mocks.getSession.mockResolvedValue({ userId: user.id })
  mocks.selectUser.mockResolvedValue([user])
}

function expectOwnerFilter(where: Parameters<PgDialect['sqlToQuery']>[0]) {
  expect(dialect.sqlToQuery(where)).toMatchObject({
    sql: '("issues"."id" = $1 and "issues"."user_id" = $2)',
    params: [aliceIssue.id, bob.id],
  })
}

function issueRequest(method = 'GET', body?: unknown) {
  return new NextRequest('http://localhost/api/issue', {
    method,
    ...(body === undefined
      ? {}
      : { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }),
  })
}

beforeEach(() => {
  vi.resetAllMocks()
  signInAs(alice)
  mocks.findMany.mockResolvedValue([])
  mocks.findFirst.mockResolvedValue(undefined)
  mocks.insert.mockReturnValue({ values: mocks.insertValues })
  mocks.insertValues.mockReturnValue({ returning: mocks.insertReturning })
  mocks.insertReturning.mockResolvedValue([aliceIssue])
  mocks.update.mockReturnValue({ set: mocks.updateSet })
  mocks.updateSet.mockReturnValue({ where: mocks.updateWhere })
  mocks.updateWhere.mockReturnValue({ returning: mocks.updateReturning })
  mocks.updateReturning.mockResolvedValue([])
  mocks.delete.mockReturnValue({ where: mocks.deleteWhere })
  mocks.deleteWhere.mockReturnValue({ returning: mocks.deleteReturning })
  mocks.deleteReturning.mockResolvedValue([])
})

describe('private issue reads', () => {
  it('uses the current account in every list query after switching accounts', async () => {
    mocks.findMany.mockResolvedValueOnce([aliceIssue]).mockResolvedValueOnce([])

    expect(await getIssues()).toEqual([aliceIssue])
    signInAs(bob)
    expect(await getIssues()).toEqual([])

    const queries = mocks.findMany.mock.calls.map(([query]) =>
      dialect.sqlToQuery(query.where),
    )
    expect(queries).toMatchObject([
      { sql: '"issues"."user_id" = $1', params: [alice.id] },
      { sql: '"issues"."user_id" = $1', params: [bob.id] },
    ])
    expect(mocks.findMany.mock.calls[0][0].with.user).toEqual({
      columns: { id: true, email: true },
    })
  })

  it('checks the owner as well as the ID when reading a single issue', async () => {
    signInAs(bob)

    expect(await getIssue(aliceIssue.id)).toBeUndefined()
    expectOwnerFilter(mocks.findFirst.mock.calls[0][0].where)
    expect(mocks.findFirst.mock.calls[0][0].with.user).toEqual({
      columns: { id: true, email: true },
    })
  })

  it('does not query issues without a session', async () => {
    mocks.getSession.mockResolvedValue(null)

    expect(await getIssues()).toEqual([])
    expect(await getIssue(aliceIssue.id)).toBeNull()
    expect(mocks.findMany).not.toHaveBeenCalled()
    expect(mocks.findFirst).not.toHaveBeenCalled()
  })

  it('does not query issues for a session whose user no longer exists', async () => {
    mocks.selectUser.mockResolvedValue([])

    expect(await getIssues()).toEqual([])
    expect(await getIssue(aliceIssue.id)).toBeNull()
    expect(mocks.findMany).not.toHaveBeenCalled()
    expect(mocks.findFirst).not.toHaveBeenCalled()
  })
})

describe('private issue actions', () => {
  it('uses the signed-in owner when a create request supplies another user ID', async () => {
    const forgedData = { ...issueData, userId: bob.id }

    expect((await createIssue(forgedData)).success).toBe(true)
    expect(mocks.insertValues).toHaveBeenCalledWith({
      ...issueData,
      userId: alice.id,
    })
  })

  it('cannot update another account’s issue by guessing its ID', async () => {
    signInAs(bob)

    expect(await updateIssue(aliceIssue.id, { title: 'Changed title' })).toMatchObject({
      success: false,
      error: 'Not found',
    })
    expectOwnerFilter(mocks.updateWhere.mock.calls[0][0])
    expect(mocks.revalidatePath).not.toHaveBeenCalled()
  })

  it('cannot delete another account’s issue by guessing its ID', async () => {
    signInAs(bob)

    expect(await deleteIssue(aliceIssue.id)).toMatchObject({
      success: false,
      error: 'Not found',
    })
    expectOwnerFilter(mocks.deleteWhere.mock.calls[0][0])
  })

  it('allows the owner to update and delete their own issue', async () => {
    mocks.updateReturning.mockResolvedValue([{ id: aliceIssue.id }])
    mocks.deleteReturning.mockResolvedValue([{ id: aliceIssue.id }])

    expect((await updateIssue(aliceIssue.id, { title: 'New title' })).success).toBe(true)
    expect(mocks.updateSet).toHaveBeenCalledWith({
      title: 'New title',
      updatedAt: expect.any(Date),
    })
    expect(mocks.revalidatePath.mock.calls).toEqual([
      ['/dashboard'],
      [`/issues/${aliceIssue.id}`],
      [`/issues/${aliceIssue.id}/edit`],
    ])
    expect((await deleteIssue(aliceIssue.id)).success).toBe(true)
    for (const where of [
      mocks.updateWhere.mock.calls[0][0],
      mocks.deleteWhere.mock.calls[0][0],
    ]) {
      expect(dialect.sqlToQuery(where)).toMatchObject({
        sql: '("issues"."id" = $1 and "issues"."user_id" = $2)',
        params: [aliceIssue.id, alice.id],
      })
    }
  })

  it('does not allow an update to transfer ownership', async () => {
    const forgedData = { title: 'New title', userId: bob.id }
    mocks.updateReturning.mockResolvedValue([{ id: aliceIssue.id }])

    expect((await updateIssue(aliceIssue.id, forgedData)).success).toBe(true)
    expect(mocks.updateSet).toHaveBeenCalledWith({
      title: 'New title',
      updatedAt: expect.any(Date),
    })
  })

  it('rejects all writes without a session', async () => {
    mocks.getSession.mockResolvedValue(null)

    const results = await Promise.all([
      createIssue(issueData),
      updateIssue(aliceIssue.id, { title: 'New title' }),
      deleteIssue(aliceIssue.id),
    ])
    for (const result of results) {
      expect(result).toMatchObject({ success: false, error: 'Unauthorized' })
    }
    expect(mocks.insert).not.toHaveBeenCalled()
    expect(mocks.update).not.toHaveBeenCalled()
    expect(mocks.delete).not.toHaveBeenCalled()
  })
})

describe('private issue API routes', () => {
  it('rejects unauthenticated list, detail, and create requests', async () => {
    mocks.getSession.mockResolvedValue(null)

    const responses = await Promise.all([
      listIssues(),
      readIssue(issueRequest(), { params: Promise.resolve({ id: '1' }) }),
      postIssue(issueRequest('POST', issueData)),
    ])
    expect(responses.map((response) => response.status)).toEqual([401, 401, 401])
    expect(mocks.findMany).not.toHaveBeenCalled()
    expect(mocks.findFirst).not.toHaveBeenCalled()
    expect(mocks.insert).not.toHaveBeenCalled()
  })

  it('scopes API lists to the signed-in account and disables response caching', async () => {
    signInAs(bob)

    const response = await listIssues()

    expect(await response.json()).toEqual({ data: { issues: [] } })
    expect(dialect.sqlToQuery(mocks.findMany.mock.calls[0][0].where)).toMatchObject({
      sql: '"issues"."user_id" = $1',
      params: [bob.id],
    })
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
  })

  it('returns 404 for another account’s issue', async () => {
    signInAs(bob)

    const response = await readIssue(issueRequest(), {
      params: Promise.resolve({ id: String(aliceIssue.id) }),
    })

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'Issue not found' })
    expectOwnerFilter(mocks.findFirst.mock.calls[0][0].where)
  })

  it('returns the owner’s issue with caching disabled', async () => {
    mocks.findFirst.mockResolvedValue(aliceIssue)

    const response = await readIssue(issueRequest(), {
      params: Promise.resolve({ id: String(aliceIssue.id) }),
    })

    expect(response.status).toBe(200)
    expect((await response.json()).data.id).toBe(aliceIssue.id)
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
  })

  it('ignores forged owner and ID fields on API creation', async () => {
    const response = await postIssue(
      issueRequest('POST', { ...issueData, userId: bob.id, id: 99 }),
    )

    expect(response.status).toBe(200)
    expect(mocks.insertValues).toHaveBeenCalledWith({
      ...issueData,
      userId: alice.id,
    })
  })

  it('rejects invalid create data before writing to the database', async () => {
    const response = await postIssue(issueRequest('POST', { title: '' }))

    expect(response.status).toBe(400)
    expect(mocks.insert).not.toHaveBeenCalled()
  })
})
