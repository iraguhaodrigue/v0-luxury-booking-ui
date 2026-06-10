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

    // Find the first message in this email's thread to use as thread_id
    const { data: existingRoot } = await supabase
      .from('messages')
      .select('id, thread_id')
      .eq('sender_email', email.trim().toLowerCase())
      .eq('sender_role', 'customer')
      .order('created_at', { ascending: true })
      .limit(1)

    const threadId = existingRoot?.[0]?.thread_id ?? existingRoot?.[0]?.id ?? null

    const { data, error: insertError } = await supabase
      .from('messages')
      .insert({
        thread_id:     threadId,
        name:          name.trim(),
        sender_email:  email.trim().toLowerCase(),
        message:       message.trim(),
        sender_role:   'customer',
        read_by_admin: false,
      })
      .select('id')
      .single()

    if (insertError || !data) {
      logger.error('Database insert error', { code: insertError?.code, message: insertError?.message })
      return NextResponse.json(
        { error: `Failed to save message: ${insertError?.message}` },
        { status: 500 }
      )
    }

    // If this is the very first message, set its own id as thread_id
    if (!threadId) {
      await supabase.from('messages').update({ thread_id: data.id }).eq('id', data.id)
    }

    logger.success('Contact message saved', { email, messageId: data.id })

    return NextResponse.json(
      { success: true, message: 'Message sent successfully.', messageId: data.id },
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
