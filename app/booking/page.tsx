'use client'

import { useState, Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { BookingSteps } from '@/components/booking/booking-steps'
import { ServicesSelector } from '@/components/booking/services-selector'
import { BookingSummary } from '@/components/booking/booking-summary'
import { formatPrice } from '@/lib/utils/currency'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, CheckCircle, CreditCard, Smartphone, Calendar, Users, User, Mail, Phone } from 'lucide-react'

const bookingSteps = [
  { id: 1, title: 'Dates',    description: 'Check-in & Check-out' },
  { id: 2, title: 'Guests',   description: 'Number of guests' },
  { id: 3, title: 'Details',  description: 'Your information' },
  { id: 4, title: 'Extras',   description: 'Add-on services' },
  { id: 5, title: 'Review',   description: 'Confirm booking' },
  { id: 6, title: 'Payment',  description: 'Complete purchase' },
]

interface BookableItem {
  id: number | string
  name: string
  description?: string | null
  images?: string[]
  image?: string
  base_price_per_night?: number
  price_per_day?: number
  price?: number
  location?: string
  capacity?: number
  seats?: number
  transmission?: string
  fuel_type?: string
  make?: string
  model?: string
  year?: number
}

function BookingPageContent() {
  const searchParams = useSearchParams()
  const type = (searchParams.get('type') || 'property') as 'property' | 'car' | 'service'
  const id   = searchParams.get('id')

  // Navigation
  const [currentStep, setCurrentStep] = useState(1)

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

  const fetchItem = async () => {
    setLoading(true)
    setError(null)
    try {
      // All three tables use integer (int4) primary keys — convert the URL
      // string to a number so Supabase can match the row correctly.
      const numericId = Number(id)
      if (!id || isNaN(numericId) || numericId <= 0) {
        setError('Invalid item ID.')
        return
      }

      console.log('[v0] Booking fetch — type:', type, '| id:', numericId)

      const supabase = createClient()
      let query

      if (type === 'car') {
        query = supabase
          .from('cars')
          .select('id,make,model,year,price_per_day,seats,transmission,fuel_type,images,description')
          .eq('id', numericId)
      } else if (type === 'service') {
        // Column is price_per_day (not price) — select it explicitly
        query = supabase
          .from('services')
          .select('id,name,price_per_day,description,image')
          .eq('id', numericId)
      } else {
        query = supabase
          .from('properties')
          .select('id,name,base_price_per_night,description,images,location,capacity')
          .eq('id', numericId)
      }

      const { data, error: fetchError } = await query.single()

      console.log('[v0] Fetch result — data:', data, '| error:', fetchError)

      if (fetchError || !data) {
        setError(`Could not load ${type} details. (${fetchError?.message ?? 'not found'})`)
      } else {
        // Normalise car name from make/model/year fields
        if (type === 'car') {
          const car = data as any
          setItem({ ...car, name: `${car.year ?? ''} ${car.make ?? ''} ${car.model ?? ''}`.trim() } as BookableItem)
        } else if (type === 'service') {
          // Map price_per_day → price_per_day so baseRate calc can read it
          setItem(data as BookableItem)
        } else {
          setItem(data as BookableItem)
        }
      }
    } catch {
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
  const extrasTotal   = selectedServices.reduce((sum, svc) => sum + (svc.price ?? 0) * (nights || 1), 0)
  const serviceFee    = Math.round((itemTotal + extrasTotal) * 0.1)
  const grandTotal    = itemTotal + extrasTotal + serviceFee

  // ─── Step validation ─────────────────────────────────────────────────────────

  const stepValid = (() => {
    if (currentStep === 1) return !!checkIn && !!checkOut && nights > 0
    if (currentStep === 2) return parseInt(guests) >= 1
    if (currentStep === 3) return !!userName.trim() && !!userEmail.trim() && !!userPhone.trim()
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
      const { data, error: dbError } = await supabase
        .from('bookings')
        .insert({
          item_id:        String(item?.id),
          item_type:      type,
          item_name:      item?.name ?? '',
          user_name:      userName,
          user_email:     userEmail,
          user_phone:     userPhone,
          guests:         parseInt(guests),
          checkin:        checkIn,
          checkout:       checkOut,
          total_price:    grandTotal,
          payment_method: paymentMethod === 'card'
            ? 'Card (Demo)'
            : `${mobileProvider.toUpperCase()} Money (Demo)`,
          extras: selectedServices.map(svc => ({
            id: svc.id, name: svc.name, price: svc.price,
          })),
          status: 'pending',
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

  const itemImage = (() => {
    if (!item) return undefined
    if (item.images && item.images.length > 0) return item.images[0]
    if (item.image) return item.image
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

            {/* STEP 1 – Dates */}
            {currentStep === 1 && (
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

            {/* STEP 2 – Guests */}
            {currentStep === 2 && (
              <div className="card-luxury space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Number of Guests</h2>
                  <p className="text-muted-foreground text-sm">
                    {type === 'property'
                      ? `This property accommodates up to ${item?.capacity ?? '??'} guests.`
                      : type === 'car'
                      ? `This vehicle seats up to ${item?.seats ?? item?.capacity ?? '??'} passengers.`
                      : 'How many guests will be attending?'}
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
                    max={type === 'property' ? (item?.capacity ?? 20) : (item?.seats ?? item?.capacity ?? 10)}
                    value={guests}
                    onChange={e => setGuests(e.target.value)}
                    className="w-32"
                  />
                </div>
              </div>
            )}

            {/* STEP 3 – Customer details */}
            {currentStep === 3 && (
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

            {/* STEP 4 – Extras */}
            {currentStep === 4 && (
              <div className="card-luxury space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Add-on Services</h2>
                  <p className="text-muted-foreground text-sm">Enhance your stay with optional services.</p>
                </div>
                <ServicesSelector
                  selectedServices={selectedServices}
                  onServicesChange={setSelectedServices}
                  nights={nights || 1}
                />
              </div>
            )}

            {/* STEP 5 – Review */}
            {currentStep === 5 && (
              <div className="card-luxury space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Review Your Booking</h2>
                  <p className="text-muted-foreground text-sm">Please confirm all details before proceeding to payment.</p>
                </div>

                {/* Guest info */}
                <div className="bg-secondary rounded-lg p-5 space-y-3">
                  <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Guest Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
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
                  </div>
                </div>

                {/* Stay info */}
                <div className="bg-secondary rounded-lg p-5 space-y-3">
                  <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Stay Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
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
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="bg-secondary rounded-lg p-5 space-y-3">
                  <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Price Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{item!.name} ({nights} night{nights !== 1 ? 's' : ''})</span>
                      <span className="font-semibold text-foreground">{formatPrice(itemTotal)}</span>
                    </div>
                    {extrasTotal > 0 && (
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
                  Free cancellation up to 48 hours before check-in.
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
                <Link href={type === 'car' ? '/car-rental' : type === 'service' ? '/services' : '/properties'}>
                  <Button variant="outline">Cancel</Button>
                </Link>
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
