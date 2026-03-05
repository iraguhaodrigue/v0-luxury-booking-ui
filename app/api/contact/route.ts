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

    // Insert into messages table
    const { data, error: insertError } = await supabase
      .from('messages')
      .insert({
        name: name.trim(),
        email: email.trim(),
        message: `Subject: ${subject || 'No subject'}\nPhone: ${phone || 'Not provided'}\n\n${message.trim()}`,
      })
      .select()

    if (insertError) {
      logger.error('Database insert error', { code: insertError.code, message: insertError.message })
      
      // Provide specific error messages
      if (insertError.message.includes('relation "public.messages" does not exist')) {
        logger.warn('Messages table does not exist')
        return NextResponse.json(
          { error: 'Database table not initialized. Please contact support.' },
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { error: `Failed to save message: ${insertError.message}` },
        { status: 500 }
      )
    }

    logger.success('Contact message saved', { email, messageId: data?.[0]?.id })

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
