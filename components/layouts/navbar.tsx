'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Search, User, Heart } from 'lucide-react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { href: '/properties', label: 'Villas & Apartments' },
    { href: '/services', label: 'Services' },
    { href: '/car-rental', label: 'Car Rental' },
    { href: '/about', label: 'About' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-2xl font-serif font-bold text-primary">
              Luxury<span className="text-accent">Stays</span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-foreground text-sm font-medium hover:text-accent transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 hover:bg-secondary rounded-md transition-colors">
              <Search className="w-5 h-5 text-foreground" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-md transition-colors">
              <Heart className="w-5 h-5 text-foreground" />
            </button>
            <Link href="/dashboard">
              <button className="p-2 hover:bg-secondary rounded-md transition-colors">
                <User className="w-5 h-5 text-foreground" />
              </button>
            </Link>
            <Link href="/booking">
              <button className="btn-luxury-accent text-sm">Book Now</button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button className="p-2 hover:bg-secondary rounded-md transition-colors">
              <Search className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-secondary rounded-md transition-colors"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-2 text-foreground hover:bg-secondary rounded-md transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="px-4 py-2 space-y-2">
                <Link href="/dashboard">
                  <button className="w-full py-2 text-foreground text-sm font-medium hover:bg-secondary rounded-md">
                    Account
                  </button>
                </Link>
                <Link href="/booking">
                  <button className="w-full btn-luxury-accent text-sm">Book Now</button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
