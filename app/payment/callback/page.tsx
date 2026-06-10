import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Props {
  searchParams: Promise<Record<string, string | string[]>>
}

export default async function PaymentCallbackPage({ searchParams }: Props) {
  const supabase = await createClient()
  const params = await searchParams
  const transactionToken = params.TransToken as string
  const cancelled = params.cancelled === 'true'

  if (!transactionToken && !cancelled) {
    redirect('/dashboard/bookings')
  }

  if (cancelled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12">
        <Card className="max-w-md w-full p-8">
          <div className="text-center">
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-serif font-bold mb-3">Payment Cancelled</h1>
            <p className="text-muted-foreground mb-6">Your payment was cancelled. Your booking is still available.</p>
            <Link href="/dashboard/bookings">
              <Button className="w-full">Return to Bookings</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  // Verify payment
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments?token=${transactionToken}`, {
      headers: {
        Cookie: `authToken=${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
      },
    })

    const data = await response.json()
    const isSuccess = data.verification?.status === '000'

    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12">
        <Card className="max-w-md w-full p-8">
          <div className="text-center">
            {isSuccess ? (
              <>
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h1 className="text-2xl font-serif font-bold mb-3">Payment Successful!</h1>
                <p className="text-muted-foreground mb-6">
                  Your booking has been confirmed. The property owner will be notified shortly.
                </p>
                <Link href="/dashboard/bookings">
                  <Button className="w-full">View My Bookings</Button>
                </Link>
              </>
            ) : (
              <>
                <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
                <h1 className="text-2xl font-serif font-bold mb-3">Payment Failed</h1>
                <p className="text-muted-foreground mb-6">
                  Your payment could not be processed. Please try again.
                </p>
                <Link href="/booking">
                  <Button className="w-full">Try Again</Button>
                </Link>
              </>
            )}
          </div>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('[v0] Payment callback error:', error)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12">
        <Card className="max-w-md w-full p-8">
          <div className="text-center">
            <Loader2 className="w-20 h-20 text-accent mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-serif font-bold mb-3">Processing Payment</h1>
            <p className="text-muted-foreground">Please wait while we verify your payment...</p>
          </div>
        </Card>
      </div>
    )
  }
}
