import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId, recipientId, content } = await request.json()

    if (!recipientId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create or get conversation
    let convId = conversationId
    if (!convId) {
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(
          `and(participant1_id.eq.${user.id},participant2_id.eq.${recipientId}),` +
          `and(participant1_id.eq.${recipientId},participant2_id.eq.${user.id})`
        )
        .single()

      if (!existingConv) {
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({
            participant1_id: user.id,
            participant2_id: recipientId,
          })
          .select('id')
          .single()

        if (error) throw error
        convId = newConv.id
      } else {
        convId = existingConv.id
      }
    }

    // Create message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: convId,
        sender_id: user.id,
        content,
        read_at: null,
      })
      .select()
      .single()

    if (error) throw error

    // Send notification to recipient
    await supabase.from('notifications').insert({
      user_id: recipientId,
      type: 'message',
      title: 'New message',
      description: content.substring(0, 100),
      related_id: convId,
      read: false,
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('[v0] API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const conversationId = url.searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Missing conversationId' },
        { status: 400 }
      )
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users(id, email)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Mark messages as read
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('[v0] API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
