'use client'

import { useState, Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { BookingSteps } from '@/components/booking/booking-steps'
import { ServicesSelector } from '@/components/booking/services-selector'
import { BookingSummary } from '@/components/booking/booking-summary'
import { formatPrice } from '@/lib/utils/currency'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, CheckCircle, CreditCard, Smartphone, Calendar, Users, User, Mail, Phone, MapPin, Clock, Shield, Navigation, Baby } from 'lucide-react'

// Separate booking steps for each category
const propertyBookingSteps = [
  { id: 1, title: 'Dates',    description: 'Check-in & Check-out' },
  { id: 2, title: 'Guests',   description: 'Number of guests' },
  { id: 3, title: 'Details',  description: 'Your information' },
  { id: 4, title: 'Extras',   description: 'Add-on services' },
  { id: 5, title: 'Review',   description: 'Confirm booking' },
  { id: 6, title: 'Payment',  description: 'Complete purchase' },
]

const carBookingSteps = [
  { id: 1, title: 'Pickup',   description: 'Pickup location' },
  { id: 2, title: 'Dates',    description: 'Pickup & Return dates' },
  { id: 3, title: 'Driver',   description: 'Driver information' },
  { id: 4, title: 'Add-ons',  description: 'Insurance, GPS, etc.' },
  { id: 5, title: 'Review',   description: 'Confirm booking' },
  { id: 6, title: 'Payment',  description: 'Complete purchase' },
]

const serviceBookingSteps = [
  { id: 1, title: 'Date',     description: 'Select date' },
  { id: 2, title: 'Time',     description: 'Select time slot' },
  { id: 3, title: 'Guests',   description: 'Number of guests' },
  { id: 4, title: 'Details',  description: 'Your information' },
  { id: 5, title: 'Review',   description: 'Confirm booking' },
  { id: 6, title: 'Payment',  description: 'Complete purchase' },
]

interface BookableItem {
  // Shared
  id: number
  name: string
  description?: string | null
  price_per_day?: number      // cars & services
  image_url?: string          // cars & services primary image

  // Properties
  location?: string
  city?: string
  country?: string
  total_rooms?: number
  base_price_per_night?: number
  images?: string[] | string
  amenities?: string[]

  // Cars
  make?: string
  model?: string
  year?: number
  capacity?: number           // seats / max guests for cars & services
  transmission?: string
  fuel_type?: string
  license_plate?: string
  color?: string
  status?: string
  mileage_limit?: number

  // Services
  service_type?: string
  category?: string
  max_guests_per_day?: number
}

function BookingPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const type    = (searchParams.get('type') || 'property') as 'property' | 'car' | 'service'
  const id      = searchParams.get('id')
  const roomId  = searchParams.get('room_id')   // set when booking an individual room
  const roomNameParam = searchParams.get('room_name') ? decodeURIComponent(searchParams.get('room_name')!) : null
  const subtype = (searchParams.get('subtype') || 'full_property') as 'full_property' | 'room'

  // Get the correct steps based on booking type
  const bookingSteps = type === 'car' 
    ? carBookingSteps 
    : type === 'service' 
      ? serviceBookingSteps 
      : propertyBookingSteps

  // Navigation
  const [currentStep, setCurrentStep] = useState(1)

  // Car-specific fields
  const [pickupLocation, setPickupLocation] = useState('')
  const [returnLocation, setReturnLocation] = useState('')
  const [driverName, setDriverName]     = useState('')
  const [driverLicense, setDriverLicense] = useState('')
  const [driverAge, setDriverAge]       = useState('')
  
  // Car add-ons
  const [addInsurance, setAddInsurance] = useState(false)
  const [addGPS, setAddGPS]             = useState(false)
  const [addChildSeat, setAddChildSeat] = useState(false)
  
  // Service-specific fields
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')

  // Item data
  const [item,    setItem]    = useState<BookableItem | null>(null)
  const [loading, setLoading] = useState(!!id)
  const [error,   setError]   = useState<string | null>(null)

  // Step 1 – Dates
  const [checkIn,  setCheckIn]  = useState('')
  const [checkOut, setCheckOut] = useState('')

  // Step 2 – Guests
  const [guests, setGuests] = useState('2')

  // Step 3 – Customer details
  const [userName,  setUserName]  = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userPhone, setUserPhone] = useState('')

  // Step 4 – Extra services (full objects from DB so prices are always accurate)
  const [selectedServices, setSelectedServices] = useState<Array<{ id: number; name: string; price: number }>>([])

  // Step 6 – Payment
  const [paymentMethod,   setPaymentMethod]   = useState<'card' | 'mobile'>('card')
  const [cardNumber,      setCardNumber]       = useState('')
  const [cardExpiry,      setCardExpiry]       = useState('')
  const [cardCVV,         setCardCVV]          = useState('')
  const [mobileProvider,  setMobileProvider]   = useState('mtn')
  const [mobilePhone,     setMobilePhone]      = useState('')
  const [processing,      setProcessing]       = useState(false)
  const [bookingSuccess,  setBookingSuccess]   = useState(false)
  const [bookingId,       setBookingId]        = useState('')

  useEffect(() => {
    if (id) fetchItem()
  }, [id, type])

  // Pre-fill guest details from auth session
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        if (user.email)                              setUserEmail(user.email)
        if (user.user_metadata?.full_name)           setUserName(user.user_metadata.full_name)
        if (user.user_metadata?.phone)               setUserPhone(user.user_metadata.phone)
        if (user.user_metadata?.full_name && !driverName) setDriverName(user.user_metadata.full_name)
      }
    })
  }, [])

  const fetchItem = async () => {
    setLoading(true)
    setError(null)
    try {
      // All three tables use integer (int4) primary keys — convert the URL string to a number
      const numericId = Number(id)
      if (!id || isNaN(numericId) || numericId <= 0) {
        setError('Invalid item ID.')
        return
      }

      const supabase = createClient()
      let query

      if (type === 'car') {
        // Cars table: id, make, model, year, license_plate, color, capacity, transmission, fuel_type, price_per_day, images, status, mileage_limit
        // NOTE: 'description' does NOT exist in the cars table — omit it
        query = supabase
          .from('cars')
          .select('id,make,model,year,capacity,transmission,fuel_type,price_per_day,image_url,images,status,color,license_plate,mileage_limit')
          .eq('id', numericId)
      } else if (type === 'service') {
        // Services table: id, name, description, price_per_day, image_url, service_type, category, max_guests_per_day, is_active
        query = supabase
          .from('services')
          .select('id,name,description,price_per_day,image_url,service_type,category,max_guests_per_day,is_active')
          .eq('id', numericId)
      } else {
        // Properties table: id, owner_id, name, description, location, city, country, property_type, total_rooms, amenities, base_price_per_night, currency, images, is_active
        query = supabase
          .from('properties')
          .select('id,name,description,location,city,country,property_type,total_rooms,amenities,base_price_per_night,currency,images,is_active')
          .eq('id', numericId)
      }

      const { data, error: fetchError } = await query.single()

      if (fetchError || !data) {
        setError(`Could not load ${type} details. (${fetchError?.message ?? 'not found'})`)
      } else {
        // Normalize car name from make/model/year
        if (type === 'car') {
          const car = data as any
          setItem({ 
            ...car, 
            name: `${car.year ?? ''} ${car.make ?? ''} ${car.model ?? ''}`.trim() 
          } as BookableItem)
        } else {
          setItem(data as BookableItem)
        }
      }
    } catch (err) {
      setError('Failed to load item details.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Price helpers ───────────────────────────────────────────────────────────

  const nights = (() => {
    if (!checkIn || !checkOut) return 0
    const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime()
    return Math.max(0, Math.ceil(ms / 86_400_000))
  })()

  const baseRate = (() => {
    if (!item) return 0
    if (type === 'property') return item.base_price_per_night ?? 0
    if (type === 'car')      return item.price_per_day ?? 0
    // service: price_per_day is the correct column name
    return item.price_per_day ?? item.price ?? 0
  })()

  const itemTotal     = baseRate * (nights || 1)
  
  // Car add-ons pricing (per day)
  const carAddOnsTotal = type === 'car' 
    ? ((addInsurance ? 25 : 0) + (addGPS ? 10 : 0) + (addChildSeat ? 15 : 0)) * (nights || 1)
    : 0
  
  const extrasTotal   = selectedServices.reduce((sum, svc) => sum + (svc.price ?? 0) * (nights || 1), 0) + carAddOnsTotal
  const serviceFee    = Math.round((itemTotal + extrasTotal) * 0.1)
  const grandTotal    = itemTotal + extrasTotal + serviceFee

  // ─── Step validation ─────────────────────────────────────────────────────────

  const stepValid = (() => {
    if (type === 'property') {
      // Property: Dates -> Guests -> Details -> Extras -> Review -> Payment
      if (currentStep === 1) return !!checkIn && !!checkOut && nights > 0
      if (currentStep === 2) return parseInt(guests) >= 1
      if (currentStep === 3) return !!userName.trim() && !!userEmail.trim() && !!userPhone.trim()
      return true
    }
    
    if (type === 'car') {
      // Car: Pickup -> Dates -> Driver -> Add-ons -> Review -> Payment
      if (currentStep === 1) return !!pickupLocation.trim()
      if (currentStep === 2) return !!checkIn && !!checkOut && nights > 0
      if (currentStep === 3) return !!driverName.trim() && !!driverLicense.trim() && parseInt(driverAge) >= 21
      return true
    }
    
    if (type === 'service') {
      // Service: Date -> Time -> Guests -> Details -> Review -> Payment
      if (currentStep === 1) return !!checkIn
      if (currentStep === 2) return !!selectedTimeSlot
      if (currentStep === 3) return parseInt(guests) >= 1
      if (currentStep === 4) return !!userName.trim() && !!userEmail.trim() && !!userPhone.trim()
      return true
    }
    
    return true
  })()

  // ─── Complete booking ────────────────────────────────────────────────────────

  const handleCompleteBooking = async () => {
    try {
      setProcessing(true)
      setError(null)

      if (paymentMethod === 'card') {
        if (!cardNumber.replace(/\s/g, '') || !cardExpiry || !cardCVV) {
          setError('Please fill in all card details.')
          setProcessing(false)
          return
        }
      } else {
        if (!mobilePhone.trim()) {
          setError('Please enter your mobile money number.')
          setProcessing(false)
          return
        }
      }

      // Simulate gateway delay
      await new Promise(r => setTimeout(r, 1800))

      const supabase = createClient()

      // Get the authenticated user so we can store auth_user_id
      const { data: { user } } = await supabase.auth.getUser()

      // Build the resolved email: prefer auth email, else form field
      const resolvedEmail = user?.email || userEmail

      const { data, error: dbError } = await supabase
        .from('bookings')
        .insert({
          item_id:        String(item?.id),
          item_type:      type,
          item_name:      item?.name ?? '',
          user_name:      type === 'car' ? driverName : userName,
          user_email:     resolvedEmail,
          user_phone:     userPhone,
          guests:         parseInt(guests),
          checkin:        checkIn,
          checkout:       type === 'service' ? checkIn : checkOut,
          total_price:    grandTotal,
          payment_method: paymentMethod === 'card'
            ? 'Card (Demo)'
            : `${mobileProvider.toUpperCase()} Money (Demo)`,
          extras: type === 'car'
            ? {
                add_ons: [
                  ...(addInsurance ? [{ name: 'Insurance',       price: 25 }] : []),
                  ...(addGPS       ? [{ name: 'GPS Navigation',  price: 10 }] : []),
                  ...(addChildSeat ? [{ name: 'Child Seat',      price: 15 }] : []),
                ],
                pickup_location: pickupLocation,
                return_location: returnLocation || pickupLocation,
                driver_license:  driverLicense,
                driver_age:      driverAge,
              }
            : type === 'service'
              ? {
                  time_slot: selectedTimeSlot,
                  services:  selectedServices.map(svc => ({ id: svc.id, name: svc.name, price: svc.price })),
                }
              : selectedServices.map(svc => ({ id: svc.id, name: svc.name, price: svc.price })),
          status:           'pending',
          // ── New columns from migration ──
          auth_user_id:     user?.id ?? null,
          booking_subtype:  subtype,
          room_id:          roomId ? parseInt(roomId, 10) : null,
          room_name:        subtype === 'room' ? roomNameParam : null,
        })
        .select('id')
        .single()

      if (dbError || !data) {
        setError('Failed to save booking. Please try again.')
        setProcessing(false)
        return
      }

      setBookingId(data.id)
      setBookingSuccess(true)
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  // ─── Image helper ─────────────────────────────────────────────────────────────
  // Priority: image_url (cars/services) → images[0] (properties/cars gallery)
  const itemImage = (() => {
    if (!item) return undefined
    if (item.image_url) return item.image_url
    if (item.images) {
      const imgs = item.images
      if (Array.isArray(imgs) && imgs.length > 0) return imgs[0]
      if (typeof imgs === 'string' && imgs) return imgs
    }
    return undefined
  })()

  // ─── Render ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <main className="w-full">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
          <p className="text-muted-foreground">Loading details…</p>
        </div>
        <Footer />
      </main>
    )
  }

  if (!loading && (error || !item)) {
    return (
      <main className="w-full">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
          <h2 className="text-2xl font-serif font-bold text-foreground">{error ?? 'Item not found'}</h2>
          <p className="text-muted-foreground">The {type} you are trying to book could not be loaded.</p>
          <Link href={type === 'car' ? '/car-rental' : type === 'service' ? '/services' : '/properties'}>
            <Button>Browse {type === 'car' ? 'Cars' : type === 'service' ? 'Services' : 'Properties'}</Button>
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  if (bookingSuccess) {
    return (
      <main className="w-full">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center max-w-lg mx-auto py-24">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-accent" />
          </div>
          <div>
            <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Booking Confirmed!</h2>
            <p className="text-muted-foreground">
              Thank you, {userName}. Your reservation has been received and is pending confirmation.
            </p>
          </div>
          <div className="bg-secondary rounded-xl p-6 w-full text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Booking ID</span>
              <span className="font-mono font-semibold text-foreground text-xs">{bookingId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item!.name}</span>
              <span className="text-foreground font-semibold">{nights} night{nights !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Check-in</span>
              <span className="text-foreground font-semibold">{checkIn}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Check-out</span>
              <span className="text-foreground font-semibold">{checkOut}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3">
              <span className="font-semibold text-foreground">Total Paid</span>
              <span className="font-bold text-accent">{formatPrice(grandTotal)}</span>
            </div>
          </div>
          <div className="flex gap-3 w-full">
            <Link href="/properties" className="flex-1">
              <Button variant="outline" className="w-full">Browse More</Button>
            </Link>
            <Link href="/contact" className="flex-1">
              <Button className="w-full">Contact Support</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="w-full">
      <Navbar />

      {/* Hero */}
      <div className="bg-secondary py-8 md:py-12 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-2">Reservation</p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            Complete Your Booking
          </h1>
          <p className="text-muted-foreground mt-1">
            {item?.name} &mdash; {nights > 0 ? `${nights} night${nights !== 1 ? 's' : ''}` : 'Select dates below'}
          </p>
        </div>
      </div>

      {/* Steps bar */}
      <div className="border-b border-border bg-background sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BookingSteps steps={bookingSteps} currentStep={currentStep} />
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── Left / form column ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ═══════════════════════════════════════════════════════════════════════════
                PROPERTY BOOKING STEPS
            ═══════════════════════════════════════════════════════════════════════════ */}
            
            {/* PROPERTY STEP 1 – Dates */}
            {type === 'property' && currentStep === 1 && (
              <div className="card-luxury space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Select Dates</h2>
                  <p className="text-muted-foreground text-sm">Choose your check-in and check-out dates.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Calendar className="inline w-4 h-4 mr-1 text-accent" />
                      Check-in Date
                    </label>
                    <Input
                      type="date"
                      value={checkIn}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => { setCheckIn(e.target.value); if (checkOut && e.target.value >= checkOut) setCheckOut('') }}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Calendar className="inline w-4 h-4 mr-1 text-accent" />
                      Check-out Date
                    </label>
                    <Input
                      type="date"
                      value={checkOut}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      onChange={e => setCheckOut(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
                {nights > 0 && (
                  <div className="bg-accent/10 border border-accent/30 rounded-lg px-4 py-3 text-sm text-foreground">
                    <span className="font-semibold text-accent">{nights}</span> night{nights !== 1 ? 's' : ''} &nbsp;&middot;&nbsp;
                    <span className="font-semibold">{formatPrice(baseRate)}</span>/night &nbsp;&middot;&nbsp;
                    Subtotal: <span className="font-semibold">{formatPrice(itemTotal)}</span>
                  </div>
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════════════
                CAR RENTAL BOOKING STEPS
            ═══════════════════════════════════════════════════════════════════════════ */}
            
            {/* CAR STEP 1 – Pickup Location */}
            {type === 'car' && currentStep === 1 && (
              <div className="card-luxury space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Pickup Location</h2>
                  <p className="text-muted-foreground text-sm">Where would you like to pick up the vehicle?</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <MapPin className="inline w-4 h-4 mr-1 text-accent" />
                      Pickup Location <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g., Kigali International Airport"
                      value={pickupLocation}
                      onChange={e => setPickupLocation(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Navigation className="inline w-4 h-4 mr-1 text-accent" />
                      Return Location (leave empty if same as pickup)
                    </label>
                    <Input
                      placeholder="Same as pickup location"
                      value={returnLocation}
                      onChange={e => setReturnLocation(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* CAR STEP 2 – Dates */}
            {type === 'car' && currentStep === 2 && (
              <div className="card-luxury space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Rental Period</h2>
                  <p className="text-muted-foreground text-sm">Select pickup and return dates for your rental.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Calendar className="inline w-4 h-4 mr-1 text-accent" />
                      Pickup Date
                    </label>
                    <Input
                      type="date"
                      value={checkIn}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => { setCheckIn(e.target.value); if (checkOut && e.target.value >= checkOut) setCheckOut('') }}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Calendar className="inline w-4 h-4 mr-1 text-accent" />
                      Return Date
                    </label>
                    <Input
                      type="date"
                      value={checkOut}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      onChange={e => setCheckOut(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
                {nights > 0 && (
                  <div className="bg-accent/10 border border-accent/30 rounded-lg px-4 py-3 text-sm text-foreground">
                    <span className="font-semibold text-accent">{nights}</span> day{nights !== 1 ? 's' : ''} &nbsp;&middot;&nbsp;
                    <span className="font-semibold">{formatPrice(baseRate)}</span>/day &nbsp;&middot;&nbsp;
                    Subtotal: <span className="font-semibold">{formatPrice(itemTotal)}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* CAR STEP 3 – Driver Information */}
            {type === 'car' && currentStep === 3 && (
              <div className="card-luxury space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Driver Information</h2>
                  <p className="text-muted-foreground text-sm">Primary driver details for the rental agreement.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <User className="inline w-4 h-4 mr-1 text-accent" />
                      Driver Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="John Doe"
                      value={driverName}
                      onChange={e => setDriverName(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <CreditCard className="inline w-4 h-4 mr-1 text-accent" />
                      Driver's License Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="DL123456789"
                      value={driverLicense}
                      onChange={e => setDriverLicense(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <User className="inline w-4 h-4 mr-1 text-accent" />
                      Driver Age <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      placeholder="25"
                      min={21}
                      value={driverAge}
                      onChange={e => setDriverAge(e.target.value)}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Minimum age: 21 years</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Mail className="inline w-4 h-4 mr-1 text-accent" />
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={userEmail}
                      onChange={e => setUserEmail(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Phone className="inline w-4 h-4 mr-1 text-accent" />
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="tel"
                      placeholder="+250 788 000 000"
                      value={userPhone}
                      onChange={e => setUserPhone(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* CAR STEP 4 – Add-ons */}
            {type === 'car' && currentStep === 4 && (
              <div className="card-luxury space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Add-ons & Extras</h2>
                  <p className="text-muted-foreground text-sm">Enhance your rental experience with these optional add-ons.</p>
                </div>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-accent/50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-accent" />
                      <div>
                        <p className="font-semibold text-foreground">Full Insurance Coverage</p>
                        <p className="text-xs text-muted-foreground">Comprehensive coverage for peace of mind</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-accent font-semibold">$25/day</span>
                      <input
                        type="checkbox"
                        checked={addInsurance}
                        onChange={e => setAddInsurance(e.target.checked)}
                        className="w-5 h-5 accent-accent"
                      />
                    </div>
                  </label>
                  
                  <label className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-accent/50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <Navigation className="w-5 h-5 text-accent" />
                      <div>
                        <p className="font-semibold text-foreground">GPS Navigation</p>
                        <p className="text-xs text-muted-foreground">Built-in navigation system</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-accent font-semibold">$10/day</span>
                      <input
                        type="checkbox"
                        checked={addGPS}
                        onChange={e => setAddGPS(e.target.checked)}
                        className="w-5 h-5 accent-accent"
                      />
                    </div>
                  </label>
                  
                  <label className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-accent/50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <Baby className="w-5 h-5 text-accent" />
                      <div>
                        <p className="font-semibold text-foreground">Child Safety Seat</p>
                        <p className="text-xs text-muted-foreground">Certified child car seat</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-accent font-semibold">$15/day</span>
                      <input
                        type="checkbox"
                        checked={addChildSeat}
                        onChange={e => setAddChildSeat(e.target.checked)}
                        className="w-5 h-5 accent-accent"
                      />
                    </div>
                  </label>
                </div>
                
                {carAddOnsTotal > 0 && (
                  <div className="bg-accent/10 border border-accent/30 rounded-lg px-4 py-3 text-sm text-foreground">
                    Add-ons total: <span className="font-semibold text-accent">{formatPrice(carAddOnsTotal)}</span> for {nights} day{nights !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════════════
                SERVICE BOOKING STEPS
            ═══════════════════════════════════════════════════════════════════════════ */}
            
            {/* SERVICE STEP 1 – Select Date */}
            {type === 'service' && currentStep === 1 && (
              <div className="card-luxury space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Select Date</h2>
                  <p className="text-muted-foreground text-sm">Choose when you'd like to book this service.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Calendar className="inline w-4 h-4 mr-1 text-accent" />
                    Service Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={checkIn}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setCheckIn(e.target.value)}
                    className="w-full max-w-xs"
                  />
                </div>
                {checkIn && (
                  <div className="bg-accent/10 border border-accent/30 rounded-lg px-4 py-3 text-sm text-foreground">
                    Selected: <span className="font-semibold text-accent">{new Date(checkIn).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* SERVICE STEP 2 – Select Time Slot */}
            {type === 'service' && currentStep === 2 && (
              <div className="card-luxury space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Select Time Slot</h2>
                  <p className="text-muted-foreground text-sm">Choose a convenient time for your service.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map(slot => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                        selectedTimeSlot === slot
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border bg-secondary text-foreground hover:border-accent/40'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold text-sm">{slot}</span>
                    </button>
                  ))}
                </div>
                {selectedTimeSlot && (
                  <div className="bg-accent/10 border border-accent/30 rounded-lg px-4 py-3 text-sm text-foreground">
                    Selected time: <span className="font-semibold text-accent">{selectedTimeSlot}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* SERVICE STEP 3 – Number of Guests */}
            {type === 'service' && currentStep === 3 && (
              <div className="card-luxury space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Number of Guests</h2>
                  <p className="text-muted-foreground text-sm">
                    This service accommodates up to {item?.max_guests_per_day ?? item?.capacity ?? '??'} guests.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Users className="inline w-4 h-4 mr-1 text-accent" />
                    Guests
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={item?.max_guests_per_day ?? item?.capacity ?? 10}
                    value={guests}
                    onChange={e => setGuests(e.target.value)}
                    className="w-32"
                  />
                </div>
              </div>
            )}
            
            {/* SERVICE STEP 4 – Customer Details */}
            {type === 'service' && currentStep === 4 && (
              <div className="card-luxury space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Your Details</h2>
                  <p className="text-muted-foreground text-sm">We'll use this information for your booking confirmation.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <User className="inline w-4 h-4 mr-1 text-accent" />
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Jane Doe"
                      value={userName}
                      onChange={e => setUserName(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Mail className="inline w-4 h-4 mr-1 text-accent" />
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="jane@example.com"
                      value={userEmail}
                      onChange={e => setUserEmail(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Phone className="inline w-4 h-4 mr-1 text-accent" />
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="tel"
                      placeholder="+250 788 000 000"
                      value={userPhone}
                      onChange={e => setUserPhone(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PROPERTY STEP 2 – Guests */}
            {type === 'property' && currentStep === 2 && (
              <div className="card-luxury space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Number of Guests</h2>
                  <p className="text-muted-foreground text-sm">
                    This property has {item?.total_rooms ?? '??'} rooms available.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Users className="inline w-4 h-4 mr-1 text-accent" />
                    Guests
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={item?.total_rooms ?? 20}
                    value={guests}
                    onChange={e => setGuests(e.target.value)}
                    className="w-32"
                  />
                </div>
              </div>
            )}

            {/* PROPERTY STEP 3 – Customer details */}
            {type === 'property' && currentStep === 3 && (
              <div className="card-luxury space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Your Details</h2>
                  <p className="text-muted-foreground text-sm">We'll use this information for your booking confirmation.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <User className="inline w-4 h-4 mr-1 text-accent" />
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Jane Doe"
                      value={userName}
                      onChange={e => setUserName(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Mail className="inline w-4 h-4 mr-1 text-accent" />
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="jane@example.com"
                      value={userEmail}
                      onChange={e => setUserEmail(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Phone className="inline w-4 h-4 mr-1 text-accent" />
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="tel"
                      placeholder="+250 788 000 000"
                      value={userPhone}
                      onChange={e => setUserPhone(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PROPERTY STEP 4 – Extras */}
            {type === 'property' && currentStep === 4 && (
              <div className="card-luxury space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Add-on Services</h2>
                  <p className="text-muted-foreground text-sm">Enhance your stay with optional services.</p>
                </div>
                <ServicesSelector
                  selectedServices={selectedServices.map(s => s.id)}
                  onServicesChange={setSelectedServices}
                  nights={nights || 1}
                />
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════════════
                SHARED STEPS (Review & Payment)
            ═══════════════════════════════════════════════════════════════════════════ */}
            
            {/* STEP 5 – Review (all types) */}
            {currentStep === 5 && (
              <div className="card-luxury space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Review Your Booking</h2>
                  <p className="text-muted-foreground text-sm">Please confirm all details before proceeding to payment.</p>
                </div>

                {/* Contact/Driver info */}
                <div className="bg-secondary rounded-lg p-5 space-y-3">
                  <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                    {type === 'car' ? 'Driver Information' : 'Guest Information'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {type === 'car' ? (
                      <>
                        {[
                          { label: 'Driver',   value: driverName },
                          { label: 'License',  value: driverLicense },
                          { label: 'Age',      value: `${driverAge} years` },
                          { label: 'Email',    value: userEmail },
                          { label: 'Phone',    value: userPhone },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex justify-between">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-semibold text-foreground">{value}</span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        {[
                          { label: 'Name',     value: userName },
                          { label: 'Email',    value: userEmail },
                          { label: 'Phone',    value: userPhone },
                          { label: 'Guests',   value: `${guests} guest${parseInt(guests) !== 1 ? 's' : ''}` },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex justify-between">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-semibold text-foreground">{value}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Booking details - varies by type */}
                <div className="bg-secondary rounded-lg p-5 space-y-3">
                  <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                    {type === 'property' ? 'Stay Details' : type === 'car' ? 'Rental Details' : 'Service Details'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {type === 'property' && (
                      <>
                        {[
                          { label: 'Property',  value: item!.name },
                          { label: 'Check-in',  value: checkIn },
                          { label: 'Check-out', value: checkOut },
                          { label: 'Nights',    value: `${nights}` },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex justify-between">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-semibold text-foreground">{value}</span>
                          </div>
                        ))}
                      </>
                    )}
                    {type === 'car' && (
                      <>
                        {[
                          { label: 'Vehicle',         value: item!.name },
                          { label: 'Pickup',          value: pickupLocation },
                          { label: 'Return',          value: returnLocation || pickupLocation },
                          { label: 'Pickup Date',     value: checkIn },
                          { label: 'Return Date',     value: checkOut },
                          { label: 'Days',            value: `${nights}` },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex justify-between">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-semibold text-foreground">{value}</span>
                          </div>
                        ))}
                      </>
                    )}
                    {type === 'service' && (
                      <>
                        {[
                          { label: 'Service',   value: item!.name },
                          { label: 'Date',      value: checkIn },
                          { label: 'Time',      value: selectedTimeSlot },
                          { label: 'Guests',    value: `${guests}` },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex justify-between">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-semibold text-foreground">{value}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="bg-secondary rounded-lg p-5 space-y-3">
                  <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Price Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {item!.name} ({type === 'service' ? '1 session' : `${nights} ${type === 'car' ? 'day' : 'night'}${nights !== 1 ? 's' : ''}`})
                      </span>
                      <span className="font-semibold text-foreground">{formatPrice(itemTotal)}</span>
                    </div>
                    {type === 'car' && carAddOnsTotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Add-ons ({[addInsurance && 'Insurance', addGPS && 'GPS', addChildSeat && 'Child Seat'].filter(Boolean).join(', ')})
                        </span>
                        <span className="font-semibold text-foreground">{formatPrice(carAddOnsTotal)}</span>
                      </div>
                    )}
                    {type !== 'car' && extrasTotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Add-on services</span>
                        <span className="font-semibold text-foreground">{formatPrice(extrasTotal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service fee (10%)</span>
                      <span className="font-semibold text-foreground">{formatPrice(serviceFee)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-3 text-base">
                      <span className="font-bold text-foreground">Grand Total</span>
                      <span className="font-bold text-accent">{formatPrice(grandTotal)}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  {type === 'car' 
                    ? 'Free cancellation up to 24 hours before pickup.'
                    : type === 'service'
                      ? 'Free cancellation up to 24 hours before the service.'
                      : 'Free cancellation up to 48 hours before check-in.'}
                </p>
              </div>
            )}

            {/* STEP 6 – Payment */}
            {currentStep === 6 && (
              <div className="card-luxury space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Payment</h2>
                  <p className="text-muted-foreground text-sm">All transactions are secure and demo-simulated.</p>
                </div>

                {/* Method selector */}
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { id: 'card',   label: 'Card Payment',  Icon: CreditCard },
                    { id: 'mobile', label: 'Mobile Money',  Icon: Smartphone },
                  ] as const).map(({ id: mid, label, Icon }) => (
                    <button
                      key={mid}
                      onClick={() => setPaymentMethod(mid)}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                        paymentMethod === mid
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border bg-secondary text-muted-foreground hover:border-accent/40'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm font-semibold">{label}</span>
                    </button>
                  ))}
                </div>

                {/* Card form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4 rounded-xl bg-secondary p-5">
                    <p className="text-xs text-muted-foreground">
                      Demo mode — use any numbers. e.g. <code className="bg-background px-1 rounded">4111 1111 1111 1111</code>
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Card Number</label>
                      <Input
                        placeholder="4111 1111 1111 1111"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Expiry MM/YY</label>
                        <Input
                          placeholder="12/27"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">CVV</label>
                        <Input
                          type="password"
                          placeholder="•••"
                          value={cardCVV}
                          onChange={e => setCardCVV(e.target.value)}
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile money form */}
                {paymentMethod === 'mobile' && (
                  <div className="space-y-4 rounded-xl bg-secondary p-5">
                    <p className="text-xs text-muted-foreground">Demo mode — enter any phone number.</p>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Provider</label>
                      <select
                        value={mobileProvider}
                        onChange={e => setMobileProvider(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                      >
                        <option value="mtn">MTN MoMo</option>
                        <option value="airtel">Airtel Money</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Mobile Number</label>
                      <Input
                        type="tel"
                        placeholder="+250 788 000 000"
                        value={mobilePhone}
                        onChange={e => setMobilePhone(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Amount reminder */}
                <div className="flex justify-between items-center border border-accent/30 bg-accent/5 rounded-xl px-5 py-3">
                  <span className="text-sm font-medium text-foreground">Amount Due</span>
                  <span className="text-xl font-bold text-accent">{formatPrice(grandTotal)}</span>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* ── Navigation buttons ── */}
            <div className="flex justify-between items-center pt-2">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={() => setCurrentStep(s => s - 1)}>
                  Back
                </Button>
              ) : (
                <Button variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              )}

              {currentStep < bookingSteps.length ? (
                <Button
                  disabled={!stepValid}
                  onClick={() => setCurrentStep(s => s + 1)}
                  className="min-w-[120px]"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleCompleteBooking}
                  disabled={processing}
                  className="min-w-[160px]"
                >
                  {processing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing…</>
                  ) : (
                    `Pay ${formatPrice(grandTotal)}`
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* ── Right / summary column ── */}
          <div className="hidden lg:block">
            <BookingSummary
              property={item ? {
                name:          item.name,
                location:      item.location ?? 'Rwanda',
                pricePerNight: baseRate,
                image:         itemImage,
              } : undefined}
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guests}
              nights={nights}
              propertyTotal={itemTotal}
              servicesTotal={extrasTotal}
            />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <main className="w-full">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
        </div>
        <Footer />
      </main>
    }>
      <BookingPageContent />
    </Suspense>
  )
}
