'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

interface BackButtonProps {
  label?: string
  className?: string
}

export function BackButton({ label = 'Back', className = '' }: BackButtonProps) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className={`inline-flex items-center gap-1 text-accent hover:text-accent/80 font-medium text-sm transition-colors ${className}`}
      aria-label={label}
    >
      <ChevronLeft className="w-4 h-4" />
      {label}
    </button>
  )
}
