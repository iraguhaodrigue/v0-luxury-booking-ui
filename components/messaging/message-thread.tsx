'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  id: number
  sender_id: string
  content: string
  created_at: string
  read_at: string | null
  sender: { email: string }
}

interface MessageThreadProps {
  conversationId: number
  userId: string
  participantEmail: string
}

export function MessageThread({ conversationId, userId, participantEmail }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages?conversationId=${conversationId}`)
        const data = await response.json()
        setMessages(data.messages || [])
      } catch (error) {
        console.error('[v0] Error fetching messages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 2000)
    return () => clearInterval(interval)
  }, [conversationId])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    setSending(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          content: input,
        }),
      })

      if (!response.ok) throw new Error('Failed to send message')

      const data = await response.json()
      setMessages([...messages, data.message])
      setInput('')
    } catch (error) {
      console.error('[v0] Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading messages...</div>
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${participantEmail}`} />
          <AvatarFallback>{participantEmail[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{participantEmail}</p>
          <p className="text-xs text-muted-foreground">Active now</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender_id !== userId && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${participantEmail}`} />
                  <AvatarFallback>{participantEmail[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              )}

              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.sender_id === userId
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-secondary text-foreground'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border flex gap-2">
        <Input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={sending}
        />
        <Button onClick={handleSend} disabled={sending || !input.trim()} size="sm">
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
