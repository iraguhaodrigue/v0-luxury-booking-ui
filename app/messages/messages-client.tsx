'use client'

import { useState } from 'react'
import { ConversationList } from '@/components/messaging/conversation-list'
import { MessageThread } from '@/components/messaging/message-thread'

interface MessagesClientProps {
  userId: string
}

export function MessagesClient({ userId }: MessagesClientProps) {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null)
  const [participantEmail, setParticipantEmail] = useState('')

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Conversations List */}
      <div className="w-full sm:w-80 border-r border-border">
        <ConversationList
          selectedId={selectedConversation || undefined}
          onSelect={(id) => {
            setSelectedConversation(id)
            // Fetch participant email when conversation is selected
            fetch(`/api/conversations/${id}`)
              .then(r => r.json())
              .then(data => setParticipantEmail(data.participantEmail))
          }}
        />
      </div>

      {/* Message Thread */}
      <div className="hidden sm:flex flex-1 flex-col">
        {selectedConversation ? (
          <MessageThread
            conversationId={selectedConversation}
            userId={userId}
            participantEmail={participantEmail}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  )
}
