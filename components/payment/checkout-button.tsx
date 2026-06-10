'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'

interface CheckoutButtonProps {
  bookingId: number
  amount: number
  disabled?: boolean
}

export function CheckoutButton({ bookingId, amount, disabled }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      })

      if (!response.ok) {
        throw new Error('Failed to initiate payment')
      }

      const { paymentUrl } = await response.json()
      window.location.href = paymentUrl
    } catch (error) {
      console.error('[v0] Checkout error:', error)
      toast.error('Failed to start payment. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading || disabled}
      size="lg"
      className="w-full h-14 text-lg font-semibold"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Redirecting to Payment...
        </>
      ) : (
        <>
          <Lock className="w-5 h-5 mr-2" />
          Complete Payment (${amount.toFixed(2)})
        </>
      )}
    </Button>
  )
}
