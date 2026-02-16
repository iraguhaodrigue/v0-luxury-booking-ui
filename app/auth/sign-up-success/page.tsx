import Link from 'next/link'
import { Mail } from 'lucide-react'

export const metadata = {
  title: 'Check Your Email | Rwanda Luxury Hospitality',
  description: 'Verify your email to complete registration',
}

export default function SignUpSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <Link href="/">
          <h1 className="text-3xl font-serif font-bold text-primary">
            Luxury<span className="text-accent">Stays</span>
          </h1>
        </Link>

        <div className="w-16 h-16 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
          <Mail className="w-8 h-8 text-accent" />
        </div>

        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-3">
            Check Your Email
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We sent you a confirmation link. Please check your email inbox and click the link to verify your account and get started.
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <Link href="/auth/login">
            <button className="btn-luxury-accent w-full">
              Back to Sign In
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
