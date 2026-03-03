'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminSidebar } from '@/components/layouts/admin-sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send, Check } from 'lucide-react'

interface Message {
  id: number
  sender_id: string
  content: string
  created_at: string
  sender_email?: string
}

interface MessageThread {
  id: number
  user_id: string
  subject: string
  status: string
  created_at: string
  messages?: Message[]
  user_email?: string
}

export default function MessagesPage() {
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchThreads()
  }, [])

  const fetchThreads = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('message_threads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setThreads(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadThreadMessages = async (thread: MessageThread) => {
    try {
      const supabase = createClient()

      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: true })

      if (error) throw error

      setSelectedThread({ ...thread, messages: messagesData || [] })
      setDialogOpen(true)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendReply = async () => {
    if (!selectedThread || !replyText.trim()) return

    try {
      setSending(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          thread_id: selectedThread.id,
          sender_id: user.id,
          content: replyText
        })

      if (messageError) throw messageError

      const { error: updateError } = await supabase
        .from('message_threads')
        .update({ status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', selectedThread.id)

      if (updateError) throw updateError

      setReplyText('')
      await loadThreadMessages(selectedThread)
      await fetchThreads()
    } catch (error) {
      console.error('Error sending reply:', error)
    } finally {
      setSending(false)
    }
  }

  const markAsResolved = async (thread: MessageThread) => {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('message_threads')
        .update({ status: 'closed', updated_at: new Date().toISOString() })
        .eq('id', thread.id)

      if (error) throw error

      setThreads(threads.map(t => t.id === thread.id ? { ...t, status: 'closed' } : t))
      setDialogOpen(false)
    } catch (error) {
      console.error('Error marking as resolved:', error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-foreground">Customer Messages</h1>
            <p className="text-muted-foreground mt-2">Manage customer inquiries and messages</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Message Threads ({threads.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : threads.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">No messages yet</p>
              ) : (
                <div className="space-y-4">
                  {threads.map(thread => (
                    <div
                      key={thread.id}
                      className="p-4 border border-input rounded-lg hover:bg-accent/5 cursor-pointer transition-colors"
                      onClick={() => loadThreadMessages(thread)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{thread.subject}</h3>
                          <p className="text-sm text-muted-foreground mt-1">From: User {thread.user_id.slice(0, 8)}</p>
                        </div>
                        <Badge variant={thread.status === 'closed' ? 'secondary' : 'default'}>
                          {thread.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(thread.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedThread?.subject}</DialogTitle>
                <DialogDescription>Thread Status: {selectedThread?.status}</DialogDescription>
              </DialogHeader>

              {selectedThread?.messages && (
                <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
                  {selectedThread.messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg ${
                        msg.sender_id === selectedThread.user_id
                          ? 'bg-accent/10 border-l-4 border-accent'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        {msg.sender_id === selectedThread.user_id ? 'Customer' : 'You'}
                      </p>
                      <p className="text-sm text-foreground">{msg.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(msg.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}

              {selectedThread?.status !== 'closed' && (
                <div className="space-y-3 py-4">
                  <Textarea
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    className="min-h-24"
                  />
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button>
                {selectedThread?.status !== 'closed' && (
                  <>
                    <Button
                      onClick={() => selectedThread && markAsResolved(selectedThread)}
                      variant="outline"
                    >
                      <Check className="mr-2 h-4 w-4" /> Mark Resolved
                    </Button>
                    <Button onClick={sendReply} disabled={sending || !replyText.trim()}>
                      {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : <><Send className="mr-2 h-4 w-4" /> Send Reply</>}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}
