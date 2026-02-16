'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Building2, DoorOpen, Calendar, Settings, Car, DollarSign, Users, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/admin', icon: Home, label: 'Overview' },
  { href: '/admin/properties', icon: Building2, label: 'Properties' },
  { href: '/admin/rooms', icon: DoorOpen, label: 'Rooms' },
  { href: '/admin/bookings', icon: Calendar, label: 'Bookings' },
  { href: '/admin/services', icon: Settings, label: 'Services' },
  { href: '/admin/cars', icon: Car, label: 'Cars' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/payments', icon: DollarSign, label: 'Payments' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden sticky top-20 z-40 bg-background border-b border-border px-4 py-3 flex justify-between items-center">
        <h2 className="font-serif font-bold text-foreground">Admin</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-secondary rounded-md transition-colors"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-foreground" />
          ) : (
            <Menu className="w-6 h-6 text-foreground" />
          )}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-secondary border-r border-border sticky top-20 h-[calc(100vh-80px)] overflow-y-auto">
        <div className="p-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))

            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground hover:bg-background'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </Link>
            )
          })}

          <hr className="my-4 border-border" />

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-background transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-secondary border-b border-border">
          <div className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href))

              return (
                <Link key={item.href} href={item.href}>
                  <button
                    onClick={() => setIsOpen(false)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-foreground hover:bg-background'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </Link>
              )
            })}

            <hr className="my-4 border-border" />

            <button
              onClick={() => {
                setIsOpen(false)
                handleLogout()
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-background transition-colors"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
