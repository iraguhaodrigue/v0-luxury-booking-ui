import { createClient } from '@/lib/supabase/server'
import { dpoPaymentService } from '@/lib/services/dpo-payment.service'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookingId } = await request.json()

    // Get booking details
    const { data: booking } = await supabase
      .from('bookings')
      .select(`
        *,
        properties(name)
      `)
      .eq('id', bookingId)
      .eq('customer_id', user.id)
      .single()

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Create payment token with DPO
    const callbackUrl = `${request.nextUrl.origin}/payment/callback`
    const payment = {
      transactionToken: '',
      amount: booking.total_price,
      currency: 'USD', // Change based on region
      description: `Booking #${bookingId} - ${booking.properties.name}`,
      customerEmail: user.email || '',
      customerName: user.user_metadata?.full_name || user.email || 'Guest',
      bookingId,
      callbackUrl,
    }

    const token = await dpoPaymentService.createPaymentToken(payment)
    const paymentUrl = dpoPaymentService.getPaymentUrl(token.transactionToken)

    // Store transaction token in database
    await supabase
      .from('payments')
      .insert({
        booking_id: bookingId,
        customer_id: user.id,
        amount: booking.total_price,
        currency: 'USD',
        transaction_token: token.transactionToken,
        status: 'pending',
      })

    return NextResponse.json({
      paymentUrl,
      transactionToken: token.transactionToken,
    })
  } catch (error) {
    console.error('[v0] Payment creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const transactionToken = url.searchParams.get('token')

    if (!transactionToken) {
      return NextResponse.json(
        { error: 'Missing transaction token' },
        { status: 400 }
      )
    }

    // Verify payment with DPO
    const verification = await dpoPaymentService.verifyPayment(transactionToken)

    // Update payment status in database
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_token', transactionToken)
      .single()

    if (payment) {
      const status = verification.status === '000' ? 'completed' : 'failed'
      
      await supabase
        .from('payments')
        .update({ status })
        .eq('id', payment.id)

      // Update booking status
      if (status === 'completed') {
        await supabase
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('id', payment.booking_id)
      }
    }

    return NextResponse.json({ verification })
  } catch (error) {
    console.error('[v0] Payment verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
