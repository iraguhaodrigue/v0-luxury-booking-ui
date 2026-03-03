import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await request.json()
    console.log('[v0] Contact form received:', { name, email, subject })

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Try to create message thread
    try {
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
        console.error('[v0] Thread creation error:', threadError.message)
        // Continue even if thread creation fails - save message separately
      }

      // Save message
      const threadId = threadData?.id || null
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          thread_id: threadId,
          sender_email: email,
          sender_name: name,
          message_text: `Phone: ${phone || 'Not provided'}\n\n${message}`,
          is_from_admin: false,
          created_at: new Date().toISOString(),
        })

      if (messageError) {
        console.error('[v0] Message creation error:', messageError.message)
        return NextResponse.json(
          { error: 'Failed to save message: ' + messageError.message },
          { status: 500 }
        )
      }

      console.log('[v0] Contact message saved successfully:', { email, thread_id: threadId })

      return NextResponse.json(
        { message: 'Message received successfully', thread_id: threadId },
        { status: 200 }
      )
    } catch (dbError: any) {
      console.error('[v0] Database error:', dbError)
      return NextResponse.json(
        { error: 'Database error: ' + (dbError.message || 'Unknown error') },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('[v0] Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to process contact form: ' + (error.message || 'Unknown error') },
      { status: 500 }
    )
  }
}
