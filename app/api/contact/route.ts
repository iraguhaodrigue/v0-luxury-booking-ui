import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await request.json()

    // Validate inputs
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Create a message thread first
    const { data: threadData, error: threadError } = await supabase
      .from('message_threads')
      .insert({
        subject: subject,
        sender_email: email,
        sender_name: name,
        status: 'open',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (threadError) {
      console.error('Thread creation error:', threadError)
      return NextResponse.json(
        { error: 'Failed to create message thread' },
        { status: 500 }
      )
    }

    // Then save the actual message
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert({
        thread_id: threadData.id,
        sender_email: email,
        sender_name: name,
        message_text: `Phone: ${phone}\n\n${message}`,
        is_from_admin: false,
        created_at: new Date().toISOString(),
      })

    if (messageError) {
      console.error('Message creation error:', messageError)
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      )
    }

    console.log('[v0] Contact message saved:', { thread_id: threadData.id, email, name })

    return NextResponse.json(
      { message: 'Message received successfully', thread_id: threadData.id },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to process contact form' },
      { status: 500 }
    )
  }
}
