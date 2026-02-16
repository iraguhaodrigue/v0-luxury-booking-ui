import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Authentication Error | Rwanda Luxury Hospitality',
  description: 'An error occurred during authentication',
}

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <Link href="/">
          <h1 className="text-3xl font-serif font-bold text-primary">
            Luxury<span className="text-accent">Stays</span>
          </h1>
        </Link>

        <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>

        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-3">
            Authentication Error
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Something went wrong during authentication. This could be due to an expired link, an invalid token, or a network issue. Please try again.
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <Link href="/auth/login">
            <button className="btn-luxury-accent w-full">
              Try Again
            </button>
          </Link>
          <Link href="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}
