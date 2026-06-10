'use client'

import { useState, useEffect, useRef } from 'react'
import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Phone, Mail, Clock, Send, Loader2, CheckCheck, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DbMessage {
  id: string
  name: string
  sender_email: string
  message: string
  sender_role: 'customer' | 'admin'
  created_at: string
}

const CONTACT_INFO = [
  {
    Icon: MapPin,
    label: 'Address',
    lines: ['KN 7, Kacyiru', 'Kigali, Rwanda'],
  },
  {
    Icon: Phone,
    label: 'Phone',
    lines: ['+250 788 123 456', '+250 700 123 456'],
  },
  {
    Icon: Mail,
    label: 'Email',
    lines: ['info@kiluva.com', 'bookings@kiluva.com'],
  },
  {
    Icon: Clock,
    label: 'Business Hours',
    lines: ['Mon – Fri: 8:00 AM – 6:00 PM', 'Sat – Sun: 10:00 AM – 4:00 PM'],
  },
]

export default function ContactPage() {
  // Identity — persisted per session so thread loads on re-visit
  const [name,   setName]   = useState('')
  const [email,  setEmail]  = useState('')
  const [phone,  setPhone]  = useState('')

  // Current message being typed
  const [body,      setBody]      = useState('')
  const [sending,   setSending]   = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  // Thread display
  const [thread,    setThread]    = useState<DbMessage[]>([])
  const [loading,   setLoading]   = useState(false)
  const [chatOpen,  setChatOpen]  = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  // Poll for admin replies every 15 s once chat is open
  useEffect(() => {
    if (!chatOpen || !email) return
    loadThread(email)
    const id = setInterval(() => loadThread(email), 15_000)
    return () => clearInterval(id)
  }, [chatOpen, email])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread])

  const loadThread = async (senderEmail: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('messages')
      .select('id,name,sender_email,message,sender_role,created_at')
      .eq('sender_email', senderEmail.trim().toLowerCase())
      .order('created_at', { ascending: true })
    if (data) setThread(data as DbMessage[])
  }

  const handleOpenChat = async (e: React.FormEvent) => {
    e.preventDefault()
    setSendError(null)
    if (!name.trim() || !email.trim()) {
      setSendError('Please enter your name and email to continue.')
      return
    }
    setLoading(true)
    await loadThread(email)
    setLoading(false)
    setChatOpen(true)
  }

  const handleSend = async () => {
    setSendError(null)
    if (!body.trim()) return

    setSending(true)
    const supabase = createClient()

    // Determine thread_id: use the id of the first message in the thread
    const firstMsg = thread.find(m => m.sender_role === 'customer')

    const { data, error } = await supabase
      .from('messages')
      .insert({
        thread_id:    firstMsg?.id ?? null,
        name:         name.trim(),
        sender_email: email.trim().toLowerCase(),
        message:      body.trim(),
        sender_role:  'customer',
        read_by_admin: false,
      })
      .select()
      .single()

    if (error) {
      setSendError('Failed to send your message. Please try again.')
    } else {
      setThread(prev => [...prev, data as DbMessage])
      setBody('')
      // Update thread_id on first message if this is the very first
      if (!firstMsg && data) {
        await supabase.from('messages').update({ thread_id: data.id }).eq('id', data.id)
      }
    }
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <main className="w-full">
      <Navbar />

      {/* Hero */}
      <section className="bg-secondary py-12 md:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-accent text-xs font-semibold mb-2 tracking-widest uppercase">Get in Touch</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Have questions about our luxury properties or services? Reach out and our team will respond promptly.
          </p>
        </div>
      </section>

      {/* Main */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Contact info column */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-8">Contact Information</h2>
              <div className="space-y-8">
                {CONTACT_INFO.map(({ Icon, label, lines }) => (
                  <div key={label} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <Icon className="w-6 h-6 text-accent mt-0.5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{label}</h3>
                      {lines.map(line => (
                        <p key={line} className="text-muted-foreground">{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Messaging column */}
            <div className="lg:col-span-2">

              {!chatOpen ? (
                /* ── Identity form (step 1) ── */
                <div className="bg-secondary rounded-2xl p-8">
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Start a Conversation</h2>
                  <p className="text-muted-foreground mb-6 text-sm">
                    Enter your details to open a message thread with our team. Existing conversations will be loaded automatically.
                  </p>

                  <form onSubmit={handleOpenChat} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Full Name <span className="text-red-500">*</span></label>
                        <Input
                          placeholder="Jane Doe"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Email Address <span className="text-red-500">*</span></label>
                        <Input
                          type="email"
                          placeholder="jane@example.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Phone (optional)</label>
                      <Input
                        type="tel"
                        placeholder="+250 788 000 000"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                      />
                    </div>

                    {sendError && (
                      <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{sendError}</p>
                    )}

                    <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                      {loading
                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Loading thread…</>
                        : <><MessageSquare className="w-4 h-4 mr-2" />Open Chat</>
                      }
                    </Button>
                  </form>
                </div>
              ) : (
                /* ── Chat thread (step 2) ── */
                <div className="rounded-2xl border border-border overflow-hidden flex flex-col" style={{ height: '600px' }}>
                  {/* Thread header */}
                  <div className="bg-secondary border-b border-border px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{name}</p>
                      <p className="text-xs text-muted-foreground">{email}</p>
                    </div>
                    <button
                      onClick={() => setChatOpen(false)}
                      className="text-xs text-muted-foreground hover:text-foreground underline"
                    >
                      Change identity
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-background">
                    {thread.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                        <MessageSquare className="w-10 h-10 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">No messages yet. Send your first message below.</p>
                      </div>
                    )}
                    {thread.map(msg => {
                      const isMe = msg.sender_role === 'customer'
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                            isMe
                              ? 'bg-accent text-accent-foreground rounded-br-sm'
                              : 'bg-secondary border border-border text-foreground rounded-bl-sm'
                          }`}>
                            {!isMe && (
                              <p className="text-xs font-semibold mb-1 text-accent">Support Team</p>
                            )}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-accent-foreground/70' : 'text-muted-foreground'}`}>
                              <span className="text-xs">
                                {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isMe && <CheckCheck className="w-3 h-3" />}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={bottomRef} />
                  </div>

                  {/* Input */}
                  <div className="border-t border-border px-5 py-3 bg-background">
                    {sendError && (
                      <p className="text-xs text-red-600 mb-2">{sendError}</p>
                    )}
                    <div className="flex gap-3 items-end">
                      <Textarea
                        placeholder="Type a message… (Enter to send)"
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={2}
                        className="flex-1 resize-none"
                      />
                      <Button
                        onClick={handleSend}
                        disabled={sending || !body.trim()}
                        className="h-10 px-4 flex-shrink-0"
                      >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Replies from our team appear here automatically.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
