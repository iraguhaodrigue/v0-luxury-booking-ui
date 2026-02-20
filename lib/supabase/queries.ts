import { createClient } from './client'

export interface Property {
  id: number
  owner_id: number
  name: string
  description: string | null
  location: string
  city: string | null
  country: string | null
  property_type: 'villa' | 'apartment'
  total_rooms: number | null
  amenities: string[]
  base_price_per_night: number
  currency: string
  images: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Room {
  id: number
  property_id: number
  name: string
  description: string | null
  capacity: number
  bedrooms: number | null
  bathrooms: number | null
  price_per_night: number
  images: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Booking {
  id: number
  user_id: number
  auth_user_id: string | null
  room_id: number
  check_in_date: string
  check_out_date: string
  total_guests: number
  total_price: number
  status: 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled'
  notes: string | null
  created_at: string
  updated_at: string
}

export async function getProperties(): Promise<Property[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('is_active', true)

  if (error) throw error
  return data || []
}

export async function getProperty(id: number): Promise<Property> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getPropertiesByCity(city: string): Promise<Property[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('city', city)
    .eq('is_active', true)

  if (error) throw error
  return data || []
}

export async function getPropertyRooms(propertyId: number): Promise<Room[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('property_id', propertyId)
    .eq('is_active', true)

  if (error) throw error
  return data || []
}

export async function getRoom(id: number): Promise<Room> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getUserBookings(authUserId: string): Promise<Booking[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('auth_user_id', authUserId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getBooking(id: number): Promise<Booking> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function checkRoomAvailability(
  roomId: number,
  checkInDate: string,
  checkOutDate: string
): Promise<boolean> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('id')
    .eq('room_id', roomId)
    .gte('check_out_date', checkInDate)
    .lt('check_in_date', checkOutDate)
    .eq('status', 'confirmed')

  if (error) throw error
  return (data?.length || 0) === 0
}

export async function createBooking(
  authUserId: string,
  roomId: number,
  checkInDate: string,
  checkOutDate: string,
  totalGuests: number,
  totalPrice: number
): Promise<Booking> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bookings')
    .insert([
      {
        auth_user_id: authUserId,
        room_id: roomId,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        total_guests: totalGuests,
        total_price: totalPrice,
        status: 'pending',
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}
