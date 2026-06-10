import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const {
      propertyId,
      bookingType,
      subtype,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      guestName,
      guestEmail,
      guestPhone,
      specialRequests,
    } = body

    // Validate required fields
    if (!propertyId || !bookingType || !checkInDate || !checkOutDate || !guestEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create booking
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        item_id: String(propertyId),
        item_type: bookingType,
        item_name: '',
        user_name: guestName,
        user_email: guestEmail,
        user_phone: guestPhone,
        guests: numberOfGuests,
        checkin: checkInDate,
        checkout: checkOutDate,
        status: 'pending',
        auth_user_id: user?.id || null,
        booking_subtype: subtype,
        total_price: 0,
        payment_method: 'pending',
        extras: { specialRequests },
      })
      .select('id')
      .single()

    if (error) {
      console.error('[v0] Booking creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      )
    }

    return NextResponse.json({ bookingId: data.id }, { status: 201 })
  } catch (error) {
    console.error('[v0] Booking API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
