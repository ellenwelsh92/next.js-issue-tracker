// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { signIn, signUp } from '@/app/actions/auth'

const mocks = vi.hoisted(() => ({
  getUserByEmail: vi.fn(),
  verifyPassword: vi.fn(),
  createSession: vi.fn(),
  createUser: vi.fn(),
  deleteSession: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  verifyPassword: mocks.verifyPassword,
  createSession: mocks.createSession,
  createUser: mocks.createUser,
  deleteSession: mocks.deleteSession,
}))
vi.mock('@/lib/dal', () => ({ getUserByEmail: mocks.getUserByEmail }))
vi.mock('@/lib/utils', () => ({ mockDelay: vi.fn() }))

const user = { id: 'user-1', email: 'user@example.com', password: 'hashed-password' }

function credentials() {
  const form = new FormData()
  form.set('email', user.email)
  form.set('password', 'test-password')
  form.set('confirmPassword', 'test-password')
  return form
}

beforeEach(() => {
  vi.resetAllMocks()
  mocks.getUserByEmail.mockResolvedValue(user)
  mocks.verifyPassword.mockResolvedValue(true)
  mocks.createSession.mockResolvedValue(true)
  mocks.createUser.mockResolvedValue({ id: user.id, email: user.email })
})

describe('authentication session creation', () => {
  it('does not report sign-in success when the session cannot be created', async () => {
    mocks.createSession.mockResolvedValue(false)

    expect(await signIn(credentials())).toMatchObject({
      success: false,
      message: 'Unable to sign in. Please try again.',
    })
    expect(mocks.createSession).toHaveBeenCalledWith(user.id)
  })

  it('reports sign-in success when credentials and session creation succeed', async () => {
    expect(await signIn(credentials())).toMatchObject({ success: true })
    expect(mocks.createSession).toHaveBeenCalledWith(user.id)
  })

  it('does not create a session when the password is incorrect', async () => {
    mocks.verifyPassword.mockResolvedValue(false)

    expect(await signIn(credentials())).toMatchObject({
      success: false,
      message: 'Invalid email or password',
    })
    expect(mocks.createSession).not.toHaveBeenCalled()
  })

  it('explains that signup created the account when session creation fails', async () => {
    mocks.getUserByEmail.mockResolvedValue(undefined)
    mocks.createSession.mockResolvedValue(false)

    expect(await signUp(credentials())).toMatchObject({
      success: false,
      message:
        'Your account was created, but we could not sign you in. Please sign in to continue.',
    })
    expect(mocks.createUser).toHaveBeenCalledExactlyOnceWith(user.email, 'test-password')
    expect(mocks.createSession).toHaveBeenCalledWith(user.id)
  })

  it('reports signup success after creating the account and session', async () => {
    mocks.getUserByEmail.mockResolvedValue(undefined)

    expect(await signUp(credentials())).toMatchObject({ success: true })
    expect(mocks.createSession).toHaveBeenCalledWith(user.id)
  })

  it('does not attempt a session when account creation fails', async () => {
    mocks.getUserByEmail.mockResolvedValue(undefined)
    mocks.createUser.mockResolvedValue(null)

    expect(await signUp(credentials())).toMatchObject({ success: false })
    expect(mocks.createSession).not.toHaveBeenCalled()
  })
})
