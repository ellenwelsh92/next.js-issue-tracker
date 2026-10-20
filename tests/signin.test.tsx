import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SignInPage from '@/app/(auth)/signin/page'

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  push: vi.fn(),
  toastSuccess: vi.fn(),
}))

vi.mock('@/app/actions/auth', () => ({
  signIn: mocks.signIn,
  signUp: mocks.signUp,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}))

vi.mock('react-hot-toast', () => ({
  default: { success: mocks.toastSuccess },
}))

function submitCredentials() {
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'user@example.com' },
  })
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'test-password' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
}

describe('sign in', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('signs into an existing account with only email and password', async () => {
    mocks.signIn.mockResolvedValue({
      success: true,
      message: 'Signed in successfully',
    })
    render(<SignInPage />)

    expect(screen.queryByLabelText('Confirm Password')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'autocomplete',
      'current-password'
    )

    submitCredentials()

    await waitFor(() => {
      expect(mocks.push).toHaveBeenCalledWith('/dashboard')
    })
    const formData = mocks.signIn.mock.calls[0][0] as FormData
    expect(Object.fromEntries(formData)).toEqual({
      email: 'user@example.com',
      password: 'test-password',
    })
    expect(mocks.signUp).not.toHaveBeenCalled()
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Signed in successfully')
  })

  it('shows a single credentials error and stays on the form', async () => {
    mocks.signIn.mockResolvedValue({
      success: false,
      message: 'Invalid email or password',
      errors: { email: ['Invalid email or password'] },
    })
    render(<SignInPage />)

    submitCredentials()

    await waitFor(() => {
      expect(screen.getAllByText('Invalid email or password')).toHaveLength(1)
    })
    expect(mocks.push).not.toHaveBeenCalled()
    expect(mocks.signUp).not.toHaveBeenCalled()
    expect(mocks.toastSuccess).not.toHaveBeenCalled()
  })
})
