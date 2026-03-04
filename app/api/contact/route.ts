import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await request.json()
    console.log('[v0] Contact form received:', { name, email, subject })

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Insert into messages table
    const { error: insertError } = await supabase
      .from('messages')
      .insert({
        name: name,
        email: email,
        message: `Subject: ${subject || 'No subject'}\nPhone: ${phone || 'Not provided'}\n\n${message}`,
      })

    if (insertError) {
      console.error('[v0] Insert error:', insertError.message)
      return NextResponse.json(
        { error: `Failed to save message: ${insertError.message}` },
        { status: 500 }
      )
    }

    console.log('[v0] Contact message saved successfully:', { email, name })

    return NextResponse.json(
      { message: 'Thank you for your message. We will respond shortly.' },
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
