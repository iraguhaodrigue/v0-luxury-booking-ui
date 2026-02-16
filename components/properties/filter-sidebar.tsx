'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { RWANDA_LOCATIONS, PROPERTY_TYPES } from '@/lib/constants/rwanda-data'

interface FilterSidebarProps {
  onFiltersChange: (filters: any) => void
}

export function FilterSidebar({ onFiltersChange }: FilterSidebarProps) {
  const [filters, setFilters] = useState({
    priceRange: [80000, 400000],
    location: '',
    propertyType: '',
  })

  const [expandedSections, setExpandedSections] = useState({
    price: true,
    location: true,
    type: true,
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

  const handleLocationChange = (location: string) => {
    const newFilters = { ...filters, location: location === filters.location ? '' : location }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleTypeChange = (type: string) => {
    const newFilters = { ...filters, propertyType: type === filters.propertyType ? '' : type }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

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
              min="50000"
              max="400000"
              step="10000"
              value={filters.priceRange[1]}
              onChange={(e) =>
                handlePriceChange([filters.priceRange[0], parseInt(e.target.value)])
              }
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {(filters.priceRange[0] / 1000).toFixed(0)}K RWF
              </span>
              <span className="text-muted-foreground">
                {(filters.priceRange[1] / 1000).toFixed(0)}K RWF
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Property Type */}
      <div className="mb-6 pb-6 border-b border-border">
        <button
          onClick={() => toggleSection('type')}
          className="flex items-center justify-between w-full mb-3"
        >
          <h4 className="font-semibold text-foreground">Type</h4>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              expandedSections.type ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expandedSections.type && (
          <div className="space-y-2">
            {PROPERTY_TYPES.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="propertyType"
                  checked={filters.propertyType === option.value}
                  onChange={() => handleTypeChange(option.value)}
                  className="w-4 h-4 rounded-full border-border"
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
          <h4 className="font-semibold text-foreground">Location</h4>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              expandedSections.location ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expandedSections.location && (
          <div className="space-y-2">
            {RWANDA_LOCATIONS.map((location) => (
              <label
                key={location}
                className="flex items-center space-x-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="location"
                  checked={filters.location === location}
                  onChange={() => handleLocationChange(location)}
                  className="w-4 h-4 rounded-full border-border"
                />
                <span className="text-sm text-foreground group-hover:text-accent transition-colors">
                  {location}
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
            priceRange: [80000, 400000],
            location: '',
            propertyType: '',
          }
          setFilters(resetFilters)
          onFiltersChange(resetFilters)
        }}
        className="w-full btn-luxury-ghost text-sm"
      >
        Clear All Filters
      </button>
    </div>
  )
}
