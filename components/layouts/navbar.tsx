'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, Search, User, Heart, LogOut, Shield, LayoutDashboard, Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user?.user_metadata?.role === 'admin') {
        fetchUnreadNotifications()
      }
      
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUnreadNotifications = async () => {
    try {
      const supabase = createClient()
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .is('read_at', null)

      if (!error && count) {
        setUnreadNotifications(count)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setUserMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const isAdmin = user?.user_metadata?.role === 'admin'
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  const navLinks = [
    { href: '/properties', label: 'Villas & Apartments' },
    { href: '/services', label: 'Services' },
    { href: '/car-rental', label: 'Car Rental' },
    { href: '/contact', label: 'Contact' },
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
          <div className="hidden md:flex items-center gap-8">
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
          <div className="hidden md:flex items-center gap-3">
            <button className="p-2 hover:bg-secondary rounded-md transition-colors" aria-label="Search">
              <Search className="w-5 h-5 text-foreground" />
            </button>

            {!loading && user ? (
              <>
                <button className="p-2 hover:bg-secondary rounded-md transition-colors" aria-label="Favorites">
                  <Heart className="w-5 h-5 text-foreground" />
                </button>

                {isAdmin && (
                  <Link href="/admin/notifications" className="relative p-2 hover:bg-secondary rounded-md transition-colors">
                    <Bell className="w-5 h-5 text-foreground" />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-1 right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </span>
                    )}
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-secondary rounded-md transition-colors"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-accent font-semibold text-sm">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                      {displayName}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-luxury-lg z-50 py-2">
                        <div className="px-4 py-2 border-b border-border">
                          <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          {isAdmin && (
                            <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded bg-accent/10 text-accent">
                              Admin
                            </span>
                          )}
                        </div>

                        {isAdmin ? (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                            Admin Dashboard
                          </Link>
                        ) : (
                          <Link
                            href="/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            My Dashboard
                          </Link>
                        )}

                        <Link
                          href={isAdmin ? '/admin' : '/dashboard/profile'}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>

                        <div className="border-t border-border mt-1 pt-1">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-secondary transition-colors w-full text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <Link href="/booking">
                  <button className="btn-luxury-accent text-sm">Book Now</button>
                </Link>
              </>
            ) : !loading ? (
              <>
                <Link href="/auth/login">
                  <button className="btn-luxury-ghost text-sm">Sign In</button>
                </Link>
                <Link href="/auth/sign-up">
                  <button className="btn-luxury-accent text-sm">Get Started</button>
                </Link>
              </>
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button className="p-2 hover:bg-secondary rounded-md transition-colors" aria-label="Search">
              <Search className="w-5 h-5 text-foreground" />
            </button>
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
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-foreground hover:bg-secondary rounded-md transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-border my-2 pt-2 px-4 space-y-2">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 py-2">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                        <span className="text-accent font-semibold text-sm">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{displayName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>

                    <Link
                      href={isAdmin ? '/admin' : '/dashboard'}
                      onClick={() => setIsOpen(false)}
                      className="block py-2 text-sm font-medium text-foreground hover:text-accent transition-colors"
                    >
                      {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
                    </Link>

                    <button
                      onClick={() => {
                        setIsOpen(false)
                        handleSignOut()
                      }}
                      className="block py-2 text-sm font-medium text-destructive"
                    >
                      Sign Out
                    </button>

                    <Link href="/booking" onClick={() => setIsOpen(false)}>
                      <button className="w-full btn-luxury-accent text-sm mt-2">Book Now</button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      <button className="w-full btn-luxury-ghost text-sm">Sign In</button>
                    </Link>
                    <Link href="/auth/sign-up" onClick={() => setIsOpen(false)}>
                      <button className="w-full btn-luxury-accent text-sm">Get Started</button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
