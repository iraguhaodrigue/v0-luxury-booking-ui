import { redirect } from 'next/navigation'

/**
 * Dynamic route: /booking/[category]/[id]
 *
 * Accepts:
 *   /booking/properties/12  → type=property
 *   /booking/cars/5         → type=car
 *   /booking/services/3     → type=service
 *
 * Redirects to /booking?type=<type>&id=<id> which is the full booking flow page.
 */

interface BookingRedirectProps {
  params: Promise<{ category: string; id: string }>
}

const CATEGORY_TO_TYPE: Record<string, string> = {
  properties: 'property',
  property: 'property',
  cars: 'car',
  car: 'car',
  services: 'service',
  service: 'service',
}

export default async function BookingRedirectPage({ params }: BookingRedirectProps) {
  const { category, id } = await params
  const type = CATEGORY_TO_TYPE[category.toLowerCase()] ?? 'property'
  redirect(`/booking?type=${type}&id=${id}`)
}
