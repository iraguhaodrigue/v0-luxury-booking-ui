import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      propertyId,
      roomId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      bookingType,
      specialRequests,
    } = body

    // Validate input
    if (!propertyId || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate total price
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

    if (nights <= 0) {
      return NextResponse.json(
        { error: 'Invalid dates' },
        { status: 400 }
      )
    }

    // Get property/room pricing
    let pricePerNight = 0
    if (roomId) {
      const { data: room } = await supabase
        .from('rooms')
        .select('price_per_night')
        .eq('id', roomId)
        .single()
      pricePerNight = room?.price_per_night || 0
    } else {
      const { data: property } = await supabase
        .from('properties')
        .select('base_price_per_night')
        .eq('id', propertyId)
        .single()
      pricePerNight = property?.base_price_per_night || 0
    }

    const totalPrice = nights * pricePerNight

    // Create booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        customer_id: user.id,
        property_id: propertyId,
        room_id: roomId || null,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        number_of_guests: numberOfGuests,
        total_price: totalPrice,
        booking_type: bookingType,
        status: 'pending',
        special_requests: specialRequests || null,
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Booking creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      )
    }

    return NextResponse.json({ bookingId: booking.id })
  } catch (error) {
    console.error('[v0] API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const status = url.searchParams.get('status')

    let query = supabase
      .from('bookings')
      .select(`
        *,
        properties(name, location, image_url),
        rooms(name)
      `)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: bookings, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      )
    }

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('[v0] API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
