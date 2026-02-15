'use client'

import { useState } from 'react'
import { MapPin, Calendar, Users } from 'lucide-react'

export function HeroSection() {
  const [searchData, setSearchData] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: '',
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search logic
    console.log('Search:', searchData)
  }

  return (
    <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1613395877344-13d4a8e0d049?w=2000&q=80)',
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center px-4 text-center">
        {/* Headline */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-4 text-balance">
            Experience Luxury Living
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-light">
            Book Villas, Rooms & Premium Services
          </p>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="w-full max-w-4xl bg-white rounded-lg shadow-luxury-lg p-6 md:p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Location */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-foreground mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <input
                type="text"
                placeholder="Where to go?"
                value={searchData.location}
                onChange={(e) =>
                  setSearchData({ ...searchData, location: e.target.value })
                }
                className="input-luxury text-sm"
              />
            </div>

            {/* Check-in */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-foreground mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Check-in
              </label>
              <input
                type="date"
                value={searchData.checkIn}
                onChange={(e) =>
                  setSearchData({ ...searchData, checkIn: e.target.value })
                }
                className="input-luxury text-sm"
              />
            </div>

            {/* Check-out */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-foreground mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Check-out
              </label>
              <input
                type="date"
                value={searchData.checkOut}
                onChange={(e) =>
                  setSearchData({ ...searchData, checkOut: e.target.value })
                }
                className="input-luxury text-sm"
              />
            </div>

            {/* Guests */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-foreground mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Guests
              </label>
              <select
                value={searchData.guests}
                onChange={(e) =>
                  setSearchData({ ...searchData, guests: e.target.value })
                }
                className="input-luxury text-sm"
              >
                <option value="">Select guests</option>
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4+ Guests</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="flex flex-col justify-end">
              <button
                type="submit"
                className="btn-luxury-accent w-full h-12 text-sm font-semibold"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        {/* Quick Stats */}
        <div className="mt-12 md:mt-16 grid grid-cols-3 gap-8 text-white">
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-serif font-bold">500+</p>
            <p className="text-sm mt-2 text-white/80">Premium Properties</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-serif font-bold">50K+</p>
            <p className="text-sm mt-2 text-white/80">Happy Guests</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-serif font-bold">25+</p>
            <p className="text-sm mt-2 text-white/80">Countries</p>
          </div>
        </div>
      </div>
    </section>
  )
}
