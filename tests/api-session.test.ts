// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GET as listIssues } from '@/app/api/issue/route'
import { generateJWT } from '@/lib/auth'

const mocks = vi.hoisted(() => ({
  getCookie: vi.fn(),
  selectUser: vi.fn(),
  findMany: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: mocks.getCookie }),
}))
vi.mock('@/db', () => ({
  db: {
    select: () => ({ from: () => ({ where: mocks.selectUser }) }),
    query: { issues: { findMany: mocks.findMany } },
  },
}))

describe('issue API session authentication', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mocks.selectUser.mockResolvedValue([{ id: 'user-1' }])
    mocks.findMany.mockResolvedValue([])
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('accepts a valid session cookie without an Authorization header', async () => {
    const token = await generateJWT({ userId: 'user-1' })
    mocks.getCookie.mockImplementation((name: string) =>
      name === 'auth_token' ? { value: token } : undefined
    )

    const response = await listIssues()

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data: { issues: [] } })
    expect(mocks.findMany).toHaveBeenCalledOnce()
  })

  it.each([undefined, { value: 'invalid-token' }])(
    'rejects a missing or invalid session cookie',
    async (cookie) => {
      mocks.getCookie.mockReturnValue(cookie)

      const response = await listIssues()

      expect(response.status).toBe(401)
      expect(await response.json()).toEqual({ error: 'Unauthorized' })
      expect(mocks.findMany).not.toHaveBeenCalled()
      expect(mocks.selectUser).not.toHaveBeenCalled()
    }
  )

  it('rejects an expired session cookie', async () => {
    vi.useFakeTimers()
    const token = await generateJWT({ userId: 'user-1' })
    mocks.getCookie.mockReturnValue({ value: token })
    vi.setSystemTime(Date.now() + 8 * 24 * 60 * 60 * 1000)

    const response = await listIssues()

    expect(response.status).toBe(401)
    expect(mocks.findMany).not.toHaveBeenCalled()
    expect(mocks.selectUser).not.toHaveBeenCalled()
  })

  it('rejects a valid token if its user no longer exists', async () => {
    const token = await generateJWT({ userId: 'deleted-user' })
    mocks.getCookie.mockReturnValue({ value: token })
    mocks.selectUser.mockResolvedValue([])

    const response = await listIssues()

    expect(response.status).toBe(401)
    expect(mocks.findMany).not.toHaveBeenCalled()
  })
})
