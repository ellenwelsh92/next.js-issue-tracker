import Link from 'next/link'
import { Timestamp } from '../components/Timestamp'
import Button from '../components/ui/Button'

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-gray-200 dark:border-dark-border-subtle bg-white dark:bg-dark-base">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold">
              Mode
            </Link>
            <nav className="hidden md:flex gap-6">
              <button
                type="button"
                disabled
                title="Coming soon"
                className="text-sm font-medium cursor-not-allowed opacity-50"
              >
                Features
              </button>
              <Link
                href="/pricing"
                className="text-sm font-medium hover:text-purple-600"
              >
                Pricing
              </Link>
              <button
                type="button"
                disabled
                title="Coming soon"
                className="text-sm font-medium cursor-not-allowed opacity-50"
              >
                FAQ
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-4">
              <Link href="/signin">
                <Button variant="outline">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-gray-200 dark:border-dark-border-subtle bg-white dark:bg-dark-base">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Mode</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A modern project management tool built with Next.js.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    disabled
                    title="Coming soon"
                    className="text-sm text-gray-600 dark:text-gray-400 cursor-not-allowed opacity-50"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    disabled
                    title="Coming soon"
                    className="text-sm text-gray-600 dark:text-gray-400 cursor-not-allowed opacity-50"
                  >
                    FAQ
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    disabled
                    title="Coming soon"
                    className="text-sm text-gray-600 dark:text-gray-400 cursor-not-allowed opacity-50"
                  >
                    Documentation
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    disabled
                    title="Coming soon"
                    className="text-sm text-gray-600 dark:text-gray-400 cursor-not-allowed opacity-50"
                  >
                    GitHub
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    disabled
                    title="Coming soon"
                    className="text-sm text-gray-600 dark:text-gray-400 cursor-not-allowed opacity-50"
                  >
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 border-t border-gray-200 dark:border-dark-border-subtle pt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              &copy; <Timestamp /> Mode. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
