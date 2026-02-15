'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FilterSidebarProps {
  onFiltersChange: (filters: any) => void
}

export function FilterSidebar({ onFiltersChange }: FilterSidebarProps) {
  const [filters, setFilters] = useState({
    priceRange: [0, 2000],
    bedrooms: [],
    location: [],
    amenities: [],
  })

  const [expandedSections, setExpandedSections] = useState({
    price: true,
    bedrooms: true,
    location: true,
    amenities: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handlePriceChange = (value: number[]) => {
    const newFilters = { ...filters, priceRange: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleCheckboxChange = (category: string, value: string) => {
    const current = filters[category as keyof typeof filters] as string[]
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]

    const newFilters = { ...filters, [category]: updated }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const bedroomOptions = [
    { value: '1', label: '1 Bedroom' },
    { value: '2', label: '2 Bedrooms' },
    { value: '3', label: '3 Bedrooms' },
    { value: '4', label: '4+ Bedrooms' },
  ]

  const locationOptions = [
    { value: 'europe', label: 'Europe' },
    { value: 'asia', label: 'Asia' },
    { value: 'americas', label: 'Americas' },
    { value: 'africa', label: 'Africa' },
  ]

  const amenityOptions = [
    { value: 'pool', label: 'Swimming Pool' },
    { value: 'gym', label: 'Gym' },
    { value: 'spa', label: 'Spa' },
    { value: 'parking', label: 'Parking' },
    { value: 'wifi', label: 'WiFi' },
    { value: 'kitchen', label: 'Full Kitchen' },
  ]

  return (
    <div className="bg-card rounded-lg shadow-luxury p-6 h-fit sticky top-24">
      <h3 className="text-lg font-serif font-bold text-foreground mb-6">
        Filters
      </h3>

      {/* Price Range */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full mb-3"
        >
          <h4 className="font-semibold text-foreground">Price Range</h4>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              expandedSections.price ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expandedSections.price && (
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="2000"
              step="50"
              value={filters.priceRange[1]}
              onChange={(e) =>
                handlePriceChange([filters.priceRange[0], parseInt(e.target.value)])
              }
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                ${filters.priceRange[0]}
              </span>
              <span className="text-muted-foreground">
                ${filters.priceRange[1]}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bedrooms */}
      <div className="mb-6 pb-6 border-b border-border">
        <button
          onClick={() => toggleSection('bedrooms')}
          className="flex items-center justify-between w-full mb-3"
        >
          <h4 className="font-semibold text-foreground">Bedrooms</h4>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              expandedSections.bedrooms ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expandedSections.bedrooms && (
          <div className="space-y-2">
            {bedroomOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.bedrooms.includes(option.value)}
                  onChange={() => handleCheckboxChange('bedrooms', option.value)}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm text-foreground group-hover:text-accent transition-colors">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Location */}
      <div className="mb-6 pb-6 border-b border-border">
        <button
          onClick={() => toggleSection('location')}
          className="flex items-center justify-between w-full mb-3"
        >
          <h4 className="font-semibold text-foreground">Region</h4>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              expandedSections.location ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expandedSections.location && (
          <div className="space-y-2">
            {locationOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.location.includes(option.value)}
                  onChange={() => handleCheckboxChange('location', option.value)}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm text-foreground group-hover:text-accent transition-colors">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Amenities */}
      <div>
        <button
          onClick={() => toggleSection('amenities')}
          className="flex items-center justify-between w-full mb-3"
        >
          <h4 className="font-semibold text-foreground">Amenities</h4>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              expandedSections.amenities ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expandedSections.amenities && (
          <div className="space-y-2">
            {amenityOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.amenities.includes(option.value)}
                  onChange={() => handleCheckboxChange('amenities', option.value)}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm text-foreground group-hover:text-accent transition-colors">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          const resetFilters = {
            priceRange: [0, 2000],
            bedrooms: [],
            location: [],
            amenities: [],
          }
          setFilters(resetFilters)
          onFiltersChange(resetFilters)
        }}
        className="w-full mt-8 btn-luxury-ghost text-sm"
      >
        Clear All Filters
      </button>
    </div>
  )
}
