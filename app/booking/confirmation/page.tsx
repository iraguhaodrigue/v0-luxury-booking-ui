import { Suspense } from 'react'
import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { ConfirmationContent } from './confirmation-content'
import { Loader2 } from 'lucide-react'

function LoadingFallback() {
  return (
    <section className="flex-1 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-accent" />
    </section>
  )
}

export const metadata = {
  title: 'Booking Confirmation | KILUVA',
  description: 'Your booking has been confirmed. Check the details below.',
}

export default function ConfirmationPage() {
  return (
    <main className="w-full min-h-screen flex flex-col">
      <Navbar />
      <Suspense fallback={<LoadingFallback />}>
        <ConfirmationContent />
      </Suspense>
      <Footer />
    </main>
  )
}
