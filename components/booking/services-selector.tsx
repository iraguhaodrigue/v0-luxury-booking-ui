'use client'

import { useState } from 'react'
import {
  Car,
  Utensils,
  Sparkles,
  Plane,
  ShoppingBag,
  Wand2,
  Check,
} from 'lucide-react'

const services = [
  {
    id: 'airport',
    icon: Plane,
    title: 'Airport Transfer',
    description: 'VIP ground transportation',
    price: 150,
    duration: 'One way',
  },
  {
    id: 'housekeeper',
    icon: Wand2,
    title: 'Housekeeping',
    description: 'Daily cleaning & maintenance',
    price: 100,
    duration: 'Per day',
  },
  {
    id: 'chef',
    icon: Utensils,
    title: 'Private Chef',
    description: 'World-class dining experience',
    price: 250,
    duration: 'Per day',
  },
  {
    id: 'spa',
    icon: Sparkles,
    title: 'Spa & Wellness',
    description: 'Premium spa treatments',
    price: 200,
    duration: 'Per session',
  },
  {
    id: 'shopping',
    icon: ShoppingBag,
    title: 'Shopping Tour',
    description: 'Personal shopping experience',
    price: 120,
    duration: 'Per day',
  },
  {
    id: 'car',
    icon: Car,
    title: 'Car Rental',
    description: 'Luxury vehicle at your disposal',
    price: 180,
    duration: 'Per day',
  },
]

interface ServicesSelectorProps {
  onServicesChange: (services: string[]) => void
}

export function ServicesSelector({ onServicesChange }: ServicesSelectorProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  const handleServiceToggle = (serviceId: string) => {
    const updated = selectedServices.includes(serviceId)
      ? selectedServices.filter((id) => id !== serviceId)
      : [...selectedServices, serviceId]

    setSelectedServices(updated)
    onServicesChange(updated)
  }

  const totalServicePrice = services
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0)

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-serif font-bold text-foreground mb-2">
          Add Services
        </h3>
        <p className="text-muted-foreground">
          Enhance your stay with our premium services
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {services.map((service) => {
          const Icon = service.icon
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
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                <Icon className="w-6 h-6 text-accent" />
              </div>

              {/* Content */}
              <h4 className="font-semibold text-foreground mb-1">
                {service.title}
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                {service.description}
              </p>

              {/* Price */}
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">
                  {service.duration}
                </span>
                <span className="font-semibold text-accent">
                  ${service.price}
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
            <span className="font-semibold text-foreground">Services Total</span>
            <span className="text-xl font-bold text-accent">
              ${totalServicePrice}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
