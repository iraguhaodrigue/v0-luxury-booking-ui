import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await request.json()
    console.log('[v0] Contact form received:', { name, email, subject })

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

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
      console.error('[v0] Insert error:', insertError.message, insertError.code)
      
      // Provide specific error messages
      if (insertError.message.includes('relation "public.messages" does not exist')) {
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

    console.log('[v0] Contact message saved successfully:', { email, name, id: data?.[0]?.id })

    return NextResponse.json(
      { 
        success: true,
        message: 'Thank you for your message. We will respond shortly.',
        messageId: data?.[0]?.id
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[v0] Contact form error:', error)
    return NextResponse.json(
      { error: `Failed to process contact form: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}
