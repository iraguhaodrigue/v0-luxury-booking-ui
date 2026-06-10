import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const search = url.searchParams.get('search')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    let query = supabase
      .from('products')
      .select(`
        *,
        shop:shops(id, name, owner_id)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category) {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data: products, error, count } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      products,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('[v0] API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
