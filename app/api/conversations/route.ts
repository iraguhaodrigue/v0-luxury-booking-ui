import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        participant1_id,
        participant2_id,
        updated_at,
        messages(content, created_at),
        participant1:users!participant1_id(email),
        participant2:users!participant2_id(email)
      `)
      .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
      .order('updated_at', { ascending: false })

    if (error) throw error

    const formatted = conversations.map(conv => {
      const isParticipant1 = conv.participant1_id === user.id
      const participant = isParticipant1 ? conv.participant2 : conv.participant1
      const lastMessage = conv.messages?.[conv.messages.length - 1]

      return {
        id: conv.id,
        participant1_id: conv.participant1_id,
        participant2_id: conv.participant2_id,
        participant: { email: participant.email },
        last_message: lastMessage?.content || 'No messages yet',
        updated_at: conv.updated_at,
        unread_count: conv.messages?.filter((m: any) => !m.read_at && m.sender_id !== user.id).length || 0,
      }
    })

    return NextResponse.json({ conversations: formatted })
  } catch (error) {
    console.error('[v0] API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
