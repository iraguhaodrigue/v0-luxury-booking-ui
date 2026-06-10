import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Verify admin
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Update user metadata to mark as verified
    const { error } = await supabase.auth.admin.updateUserById(id, {
      user_metadata: { verified: true },
    })

    if (error) throw error

    // Send notification to owner
    await supabase.from('notifications').insert({
      user_id: id,
      type: 'verification',
      title: 'Account Verified',
      description: 'Your KILUVA owner account has been verified. You can now list properties.',
      read: false,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Admin verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
