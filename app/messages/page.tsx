'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle, Send, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Conversation {
  id: number
  otherUserId: string
  otherUserName: string
  otherUserAvatar?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

interface Message {
  id: number
  senderId: string
  senderName: string
  content: string
  createdAt: string
  isOwn: boolean
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [user, setUser] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUser(user)

      // Fetch conversations
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false })

      if (data) {
        const formattedConversations = data.map(conv => ({
          id: conv.id,
          otherUserId: conv.user_1_id === user.id ? conv.user_2_id : conv.user_1_id,
          otherUserName: conv.user_1_id === user.id ? conv.user_2_name : conv.user_1_name,
          lastMessage: conv.last_message,
          lastMessageTime: conv.updated_at,
          unreadCount: 0,
        }))
        setConversations(formattedConversations)
      }
    } catch (error) {
      console.error('[v0] Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: number) => {
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (data && user) {
        setMessages(
          data.map(msg => ({
            id: msg.id,
            senderId: msg.sender_id,
            senderName: msg.sender_id === user.id ? 'You' : selectedConversation?.otherUserName || '',
            content: msg.content,
            createdAt: msg.created_at,
            isOwn: msg.sender_id === user.id,
          }))
        )
      }
    } catch (error) {
      console.error('[v0] Error loading messages:', error)
    }
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    loadMessages(conversation.id)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return

    setSending(true)
    try {
      await supabase.from('messages').insert({
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        content: newMessage,
      })

      setNewMessage('')
      loadMessages(selectedConversation.id)
    } catch (error) {
      console.error('[v0] Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <main className="w-full">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="w-full">
      <Navbar />

      <section className="py-12 md:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-8">Messages</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations list */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Conversations</CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto h-[520px] space-y-2">
                {conversations.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No conversations yet</p>
                ) : (
                  conversations.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedConversation?.id === conv.id
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-secondary'
                      }`}
                    >
                      <p className="font-semibold text-sm">{conv.otherUserName}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {conv.lastMessage}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(conv.lastMessageTime), { addSuffix: true })}
                      </p>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Message thread */}
            {selectedConversation ? (
              <Card className="lg:col-span-2 flex flex-col">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg">
                    {selectedConversation.otherUserName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.isOwn
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-secondary text-foreground'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <div className="border-t p-4 flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSendMessage()
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    size="sm"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="lg:col-span-2 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a conversation to start messaging</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
