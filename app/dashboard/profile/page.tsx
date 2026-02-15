'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layouts/navbar'
import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar'
import { Footer } from '@/components/layouts/footer'
import { User, Mail, Phone, MapPin, Save } from 'lucide-react'

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Luxury Avenue',
    city: 'New York',
    country: 'United States',
    postalCode: '10001',
  })

  const [saved, setSaved] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <main className="w-full min-h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <DashboardSidebar />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                Profile Settings
              </h1>
              <p className="text-muted-foreground">
                Manage your account information and preferences
              </p>
            </div>

            {/* Profile Form */}
            <div className="space-y-8">
              {/* Avatar Section */}
              <div className="card-luxury">
                <h2 className="text-xl font-serif font-bold text-foreground mb-6">
                  Profile Picture
                </h2>

                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-12 h-12 text-accent" />
                  </div>

                  <div>
                    <button className="btn-luxury-ghost text-sm mb-2">
                      Change Picture
                    </button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF. Max size 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="card-luxury">
                <h2 className="text-xl font-serif font-bold text-foreground mb-6">
                  Personal Information
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="input-luxury w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="input-luxury w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2 flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Email Address</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-luxury w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2 flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>Phone Number</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-luxury w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="card-luxury">
                <h2 className="text-xl font-serif font-bold text-foreground mb-6 flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Address Information</span>
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="input-luxury w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="input-luxury w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="input-luxury w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="input-luxury w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="card-luxury">
                <h2 className="text-xl font-serif font-bold text-foreground mb-6">
                  Preferences
                </h2>

                <div className="space-y-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-foreground">
                      Receive booking confirmations by email
                    </span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-foreground">
                      Receive promotional offers and deals
                    </span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-foreground">
                      Share my profile with travel partners
                    </span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pb-8">
                <button
                  onClick={handleSave}
                  className="btn-luxury-accent flex items-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </button>

                {saved && (
                  <div className="bg-accent/10 text-accent px-6 py-3 rounded-lg flex items-center">
                    <span className="font-semibold">Changes saved successfully!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
