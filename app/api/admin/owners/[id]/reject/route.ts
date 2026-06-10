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
    const body = await request.json()
    const { reason } = body

    // Update user metadata to reject
    const { error } = await supabase.auth.admin.updateUserById(id, {
      user_metadata: { verified: false, rejected: true, rejection_reason: reason },
    })

    if (error) throw error

    // Send notification to owner
    await supabase.from('notifications').insert({
      user_id: id,
      type: 'rejection',
      title: 'Verification Rejected',
      description: `Your KILUVA owner account verification was rejected. Reason: ${reason}`,
      read: false,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Admin rejection error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
