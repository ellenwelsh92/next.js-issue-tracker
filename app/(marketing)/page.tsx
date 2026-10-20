import Link from 'next/link'
import Button from '../components/ui/Button'

export default async function LandingPage() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-14"
    >
      <div className="text-center">
        <h1
          id="hero-heading"
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight"
        >
          Issue tracking <br className="hidden sm:block" />
          <span className="text-purple-600 dark:text-purple-400">
            simplified
          </span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-300">
          A minimal and elegant issue tracking tool for modern teams. Manage
          your projects with ease.
        </p>
        <div className="mt-10">
          <Link href="/signup">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
