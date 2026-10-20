import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DashboardContent from '@/app/components/DashboardContent'

const mocks = vi.hoisted(() => ({ getCurrentUser: vi.fn() }))

vi.mock('@/lib/dal', () => ({ getCurrentUser: mocks.getCurrentUser }))
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`)
  },
}))
vi.mock('@/app/components/Navigation', () => ({
  default: () => <nav aria-label="Dashboard navigation" />,
}))

describe('dashboard authentication', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('redirects signed-out users before returning dashboard content', async () => {
    mocks.getCurrentUser.mockResolvedValue(null)

    await expect(
      DashboardContent({ children: <p>Private dashboard</p> })
    ).rejects.toThrow('redirect:/signin')
    expect(screen.queryByText('Private dashboard')).not.toBeInTheDocument()
  })

  it('renders the dashboard for an authenticated user', async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: 'user-1' })

    render(await DashboardContent({ children: <p>Private dashboard</p> }))

    expect(screen.getByText('Private dashboard')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Dashboard navigation' })).toBeInTheDocument()
  })
})
