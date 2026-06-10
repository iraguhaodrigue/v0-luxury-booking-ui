import { AlertCircle, RefreshCw, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

interface ErrorPageProps {
  title?: string
  message?: string
  backLink?: string
  backText?: string
  showRefresh?: boolean
  onRefresh?: () => void
}

export function ErrorPage({
  title = 'Something went wrong',
  message = 'We encountered an error while processing your request. Please try again.',
  backLink = '/',
  backText = 'Go Home',
  showRefresh = true,
  onRefresh,
}: ErrorPageProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
        </div>

        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">{title}</h1>

        <p className="text-muted-foreground mb-8 leading-relaxed">{message}</p>

        <div className="flex flex-col gap-3">
          {showRefresh && onRefresh && (
            <button
              onClick={onRefresh}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-accent/90 transition"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
          )}

          <Link
            href={backLink}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-foreground rounded-lg font-semibold hover:bg-secondary/80 transition"
          >
            <ChevronLeft className="w-5 h-5" />
            {backText}
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * Inline error message component for use within forms
 */
interface ErrorMessageProps {
  message: string
  className?: string
}

export function ErrorMessage({ message, className = '' }: ErrorMessageProps) {
  return (
    <div className={`p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3 ${className}`}>
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <p className="text-red-700 text-sm">{message}</p>
    </div>
  )
}

/**
 * Loading skeleton component
 */
interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = 'h-12 w-full' }: SkeletonProps) {
  return <div className={`bg-muted animate-pulse rounded-lg ${className}`} />
}
