'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Search, MessageCircle } from 'lucide-react'

interface Conversation {
  id: number
  participant1_id: string
  participant2_id: string
  participant: { email: string }
  last_message: string
  unread_count: number
  updated_at: string
}

interface ConversationListProps {
  selectedId?: number
  onSelect: (id: number) => void
}

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/conversations')
        const data = await response.json()
        setConversations(data.conversations || [])
      } catch (error) {
        console.error('[v0] Error fetching conversations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [])

  const filtered = conversations.filter(conv =>
    conv.participant.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">Loading conversations...</div>
        ) : filtered.length > 0 ? (
          filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full p-4 border-b border-border hover:bg-secondary transition-colors text-left ${
                selectedId === conv.id ? 'bg-secondary' : ''
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.participant.email}`} />
                  <AvatarFallback>{conv.participant.email[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold truncate">{conv.participant.email}</p>
                    {conv.unread_count > 0 && (
                      <Badge className="flex-shrink-0">{conv.unread_count}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{conv.last_message}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(conv.updated_at).toLocaleDateString()}
              </p>
            </button>
          ))
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No conversations yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
