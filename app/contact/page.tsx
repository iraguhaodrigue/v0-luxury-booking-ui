'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Phone, Mail, Clock, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

interface Message {
  id: string
  name: string
  sender_email: string
  message: string
  admin_reply?: string
  admin_name?: string
  created_at: string
  reply_created_at?: string
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [messageHistory, setMessageHistory] = useState<Message[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    if (formData.email) {
      fetchMessageHistory(formData.email)
    }
  }, [formData.email])

  const fetchMessageHistory = async (email: string) => {
    if (!email) return
    try {
      setLoadingHistory(true)
      logger.info(`Fetching message history for ${email}`)
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_email', email.trim())
        .order('created_at', { ascending: true })

      if (fetchError) {
        logger.warn('Failed to load message history', fetchError)
        return
      }

      logger.success(`Found ${data?.length || 0} messages`)
      setMessageHistory(data || [])
      if (data && data.length > 0) {
        setShowHistory(true)
      }
    } catch (err) {
      logger.error('Exception loading message history', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError('Please fill in all required fields')
      return
    }
    setLoading(true)

    try {
      console.log('[v0] Sending contact message:', formData)
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log('[v0] Contact response:', { status: response.status, data })

      if (response.ok) {
        setSuccess(true)
        setSubmitted(true)
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
        setTimeout(() => setSubmitted(false), 5000)
      } else {
        setError(data.error || 'Failed to send message. Please try again.')
        console.error('[v0] Contact error:', data.error)
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Network error. Please check your connection and try again.'
      console.error('[v0] Error submitting form:', error)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="w-full">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-secondary py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-accent text-sm font-semibold mb-2 tracking-widest">GET IN TOUCH</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Have questions about our luxury properties or services? We're here to help. Reach out to our team and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-8">Contact Information</h2>

              <div className="space-y-8">
                {/* Address */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <MapPin className="w-6 h-6 text-accent mt-1" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Address</h3>
                    <p className="text-muted-foreground">
                      KN 7, Kacyiru<br />
                      Kigali, Rwanda
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Phone className="w-6 h-6 text-accent mt-1" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                    <p className="text-muted-foreground">
                      +250 788 123 456<br />
                      +250 700 123 456
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Mail className="w-6 h-6 text-accent mt-1" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                    <p className="text-muted-foreground">
                      info@rwandaluxury.com<br />
                      bookings@rwandaluxury.com
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Clock className="w-6 h-6 text-accent mt-1" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Business Hours</h3>
                    <p className="text-muted-foreground">
                      Mon - Fri: 8:00 AM - 6:00 PM<br />
                      Sat - Sun: 10:00 AM - 4:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-secondary rounded-lg p-8">
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Send us a Message</h2>

                {submitted && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 font-medium">Success! We've received your message and will respond shortly.</p>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                )}

                {/* Conversation History */}
                {showHistory && messageHistory.length > 0 && (
                  <div className="mb-8 p-4 bg-accent/5 border border-accent/20 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground">Conversation History</h3>
                      <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="text-sm text-accent hover:underline"
                      >
                        {showHistory ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {showHistory && (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {messageHistory.map((msg) => (
                          <div key={msg.id} className="space-y-2">
                            {/* Your Message */}
                            <div className="bg-accent/10 rounded-lg p-3">
                              <p className="text-xs text-muted-foreground font-semibold">
                                You - {new Date(msg.created_at).toLocaleString()}
                              </p>
                              <p className="text-sm text-foreground mt-1">{msg.message}</p>
                            </div>

                            {/* Admin Reply */}
                            {msg.admin_reply && (
                              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                <p className="text-xs text-green-700 font-semibold">
                                  {msg.admin_name || 'Admin'} - {new Date(msg.reply_created_at || msg.created_at).toLocaleString()}
                                </p>
                                <p className="text-sm text-foreground mt-1">{msg.admin_reply}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="w-full"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+250 700 000 000"
                      className="w-full"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                      Subject *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      className="w-full"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      className="w-full"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-luxury-primary"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
