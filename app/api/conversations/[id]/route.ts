import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { data: conversation, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1:users!participant1_id(id, email),
        participant2:users!participant2_id(id, email)
      `)
      .eq('id', parseInt(id))
      .single()

    if (error || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Verify user is a participant
    if (conversation.participant1_id !== user.id && conversation.participant2_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const participant = conversation.participant1_id === user.id
      ? conversation.participant2
      : conversation.participant1

    return NextResponse.json({
      conversation,
      participantEmail: participant.email,
    })
  } catch (error) {
    console.error('[v0] API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
