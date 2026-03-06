import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger, validateRequired } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await request.json()

    // Validate required fields
    if (!validateRequired({ name, email, message }, ['name', 'email', 'message'])) {
      logger.warn('Contact form missing required fields')
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      logger.warn('Invalid email format provided', { email })
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    logger.info('Processing contact form', { name, email })
    const supabase = await createClient()

    // Check if this is a reply or a new message (for thread linking)
    const { data: existingThread } = await supabase
      .from('messages')
      .select('thread_id')
      .eq('sender_email', email.trim())
      .order('created_at', { ascending: false })
      .limit(1)

    const threadId = existingThread?.[0]?.thread_id

    // Insert into messages table with correct column names
    const { data, error: insertError } = await supabase
      .from('messages')
      .insert({
        thread_id: threadId || undefined,
        name: name.trim(),
        sender_email: email.trim(),
        message: message.trim(),
        read_by_admin: false,
      })
      .select()

    if (insertError) {
      logger.error('Database insert error', { code: insertError.code, message: insertError.message })
      return NextResponse.json(
        { error: `Failed to save message: ${insertError.message}` },
        { status: 500 }
      )
    }

    const messageId = data?.[0]?.id
    const finalThreadId = threadId || messageId

    // If this is the first message in thread, set thread_id to message id
    if (!threadId && messageId) {
      await supabase
        .from('messages')
        .update({ thread_id: messageId })
        .eq('id', messageId)
    }

    logger.success('Contact message saved', { email, messageId, threadId: finalThreadId })

    return NextResponse.json(
      { 
        success: true,
        message: 'Thank you for your message. We will respond shortly.',
        messageId: data?.[0]?.id
      },
      { status: 200 }
    )
  } catch (error: any) {
    logger.error('Contact form exception', error)
    return NextResponse.json(
      { error: `Failed to process contact form: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}
