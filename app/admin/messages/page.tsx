'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminSidebar } from '@/components/layouts/admin-sidebar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Send, MessageSquare, Mail, Clock, CheckCheck, User } from 'lucide-react'
import { formatPrice } from '@/lib/utils/currency'

interface DbMessage {
  id: string
  thread_id: string | null
  name: string
  sender_email: string
  message: string
  sender_role: 'customer' | 'admin'
  read_by_admin: boolean
  created_at: string
}

interface Thread {
  email: string
  name: string
  latest: string
  unread: number
  messages: DbMessage[]
}

function groupByThread(rows: DbMessage[]): Thread[] {
  const map = new Map<string, Thread>()
  for (const row of rows) {
    const key = row.sender_email.toLowerCase()
    if (!map.has(key)) {
      map.set(key, { email: row.sender_email, name: row.name, latest: row.created_at, unread: 0, messages: [] })
    }
    const t = map.get(key)!
    t.messages.push(row)
    if (row.created_at > t.latest) { t.latest = row.created_at; t.name = row.name }
    if (!row.read_by_admin && row.sender_role === 'customer') t.unread++
  }
  return [...map.values()].sort((a, b) => b.latest.localeCompare(a.latest))
}

export default function AdminMessagesPage() {
  const [threads, setThreads]     = useState<Thread[]>([])
  const [active,  setActive]      = useState<Thread | null>(null)
  const [reply,   setReply]       = useState('')
  const [sending, setSending]     = useState(false)
  const [loading, setLoading]     = useState(true)
  const bottomRef                 = useRef<HTMLDivElement>(null)

  const supabase = createClient()

  useEffect(() => { loadMessages() }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [active?.messages])

  const loadMessages = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })

    if (!error && data) {
      const grouped = groupByThread(data as DbMessage[])
      setThreads(grouped)
      // Re-hydrate active thread
      if (active) {
        const refreshed = grouped.find(t => t.email === active.email)
        if (refreshed) setActive(refreshed)
      }
    }
    setLoading(false)
  }

  const openThread = async (thread: Thread) => {
    setActive(thread)
    setReply('')

    // Mark all customer messages in this thread as read
    const unreadIds = thread.messages
      .filter(m => !m.read_by_admin && m.sender_role === 'customer')
      .map(m => m.id)

    if (unreadIds.length > 0) {
      await supabase
        .from('messages')
        .update({ read_by_admin: true })
        .in('id', unreadIds)

      setThreads(prev =>
        prev.map(t =>
          t.email === thread.email
            ? { ...t, unread: 0, messages: t.messages.map(m => ({ ...m, read_by_admin: true })) }
            : t
        )
      )
    }
  }

  const sendReply = async () => {
    if (!active || !reply.trim()) return
    setSending(true)

    // The thread root is the first customer message
    const root = active.messages.find(m => m.sender_role === 'customer')

    const { data, error } = await supabase
      .from('messages')
      .insert({
        thread_id:    root?.thread_id ?? root?.id ?? null,
        name:         'Support Team',
        sender_email: active.email,
        message:      reply.trim(),
        sender_role:  'admin',
        read_by_admin: true,
      })
      .select()
      .single()

    if (!error && data) {
      const newMsg = data as DbMessage
      setActive(prev => prev ? { ...prev, messages: [...prev.messages, newMsg] } : prev)
      setThreads(prev =>
        prev.map(t =>
          t.email === active.email
            ? { ...t, latest: newMsg.created_at, messages: [...t.messages, newMsg] }
            : t
        ).sort((a, b) => b.latest.localeCompare(a.latest))
      )
      setReply('')
    }

    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendReply()
  }

  const totalUnread = threads.reduce((s, t) => s + t.unread, 0)

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border px-6 py-4 flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-accent" />
          <h1 className="text-xl font-serif font-bold text-foreground">Customer Messages</h1>
          {totalUnread > 0 && (
            <Badge className="bg-accent text-accent-foreground">{totalUnread} unread</Badge>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* ── Thread list ── */}
          <div className="w-full max-w-xs border-r border-border flex flex-col overflow-hidden">
            <div className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border">
              Conversations ({threads.length})
            </div>

            {loading ? (
              <div className="flex items-center justify-center flex-1">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            ) : threads.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-2 px-4 text-center">
                <Mail className="w-8 h-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No messages yet</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {threads.map(thread => (
                  <button
                    key={thread.email}
                    onClick={() => openThread(thread)}
                    className={`w-full text-left px-4 py-3 border-b border-border/60 hover:bg-accent/5 transition-colors ${
                      active?.email === thread.email ? 'bg-accent/10 border-l-2 border-l-accent' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-semibold text-sm text-foreground truncate">{thread.name}</span>
                      {thread.unread > 0 && (
                        <span className="flex-shrink-0 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {thread.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{thread.email}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {thread.messages[thread.messages.length - 1]?.message}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {new Date(thread.latest).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Chat pane ── */}
          {active ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Chat header */}
              <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-secondary/40">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{active.name}</p>
                  <p className="text-xs text-muted-foreground">{active.email}</p>
                </div>
                <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {active.messages.length} message{active.messages.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {active.messages.map(msg => {
                  const isAdmin = msg.sender_role === 'admin'
                  return (
                    <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        isAdmin
                          ? 'bg-accent text-accent-foreground rounded-br-sm'
                          : 'bg-secondary text-foreground rounded-bl-sm border border-border'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 ${isAdmin ? 'text-accent-foreground/70' : 'text-muted-foreground'}`}>
                          <span className="text-xs">
                            {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isAdmin && <CheckCheck className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              {/* Reply box */}
              <div className="border-t border-border px-6 py-4 bg-background">
                <div className="flex gap-3 items-end">
                  <Textarea
                    placeholder="Type a reply… (Ctrl+Enter to send)"
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    className="flex-1 resize-none"
                  />
                  <Button
                    onClick={sendReply}
                    disabled={sending || !reply.trim()}
                    className="h-10 px-4"
                  >
                    {sending
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Send className="w-4 h-4" />
                    }
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground/30" />
              <p className="text-muted-foreground">Select a conversation to start replying</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
