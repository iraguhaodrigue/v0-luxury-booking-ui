'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/utils/currency'
import { SERVICES } from '@/lib/constants/rwanda-data'
import { createClient } from '@/lib/supabase/client'
import { Check, Loader2 } from 'lucide-react'

interface Service {
  id: number
  name: string
  description: string
  price: number
  price_per_day?: number
  duration?: string
  icon?: React.ReactNode
}

interface ServicesSelectorProps {
  onServicesChange: (serviceIds: number[]) => void
  initialServices?: number[]
}

export function ServicesSelector({ onServicesChange, initialServices = [] }: ServicesSelectorProps) {
  const [selectedServices, setSelectedServices] = useState<number[]>(initialServices)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('services')
        .select('id, name, description, price_per_day')
        .order('name')

      if (error) {
        // Use hardcoded services as fallback if database fetch fails
        // Use hardcoded services as fallback
        setServices(SERVICES.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          price: s.price,
          duration: s.duration,
          icon: s.icon
        })))
      } else if (data && data.length > 0) {
        // Map database services
        setServices(data.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description || '',
          price: s.price_per_day || 0,
          duration: 'Per day'
        })))
      } else {
        // No services in database, use fallback
        setServices(SERVICES.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          price: s.price,
          duration: s.duration,
          icon: s.icon
        })))
      }
    } catch (err) {
      // Use fallback on exception
      setServices(SERVICES.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        price: s.price,
        duration: s.duration,
        icon: s.icon
      })))
    } finally {
      setLoading(false)
    }
  }

  const handleServiceToggle = (serviceId: number) => {
    const updated = selectedServices.includes(serviceId)
      ? selectedServices.filter((id) => id !== serviceId)
      : [...selectedServices, serviceId]

    setSelectedServices(updated)
    onServicesChange(updated)
  }

  const totalServicePrice = services
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <span className="ml-2 text-muted-foreground">Loading services...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-serif font-bold text-foreground mb-2">
          Add Premium Services
        </h3>
        <p className="text-muted-foreground">
          Enhance your stay with our premium Rwanda hospitality services
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {services.map((service) => {
          const isSelected = selectedServices.includes(service.id)

          return (
            <button
              key={service.id}
              onClick={() => handleServiceToggle(service.id)}
              className={`relative p-4 rounded-lg border-2 transition-all text-left group ${
                isSelected
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-accent/50 bg-card'
              }`}
            >
              {/* Checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Icon */}
              {service.icon && (
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                  {service.icon}
                </div>
              )}

              {/* Content */}
              <h4 className="font-semibold text-foreground mb-1">
                {service.name}
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                {service.description}
              </p>

              {/* Price */}
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">
                  {service.duration || 'Per day'}
                </span>
                <span className="font-semibold text-accent">
                  {formatPrice(service.price, false)}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Total Services Price */}
      {selectedServices.length > 0 && (
        <div className="bg-secondary rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-foreground">Services Total ({selectedServices.length})</span>
            <span className="text-xl font-bold text-accent">
              {formatPrice(totalServicePrice, false)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
