import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Optional filters
  const riskColor = searchParams.get('risk_color')?.toUpperCase()
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200)
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)

  const supabase = createServiceClient()

  let query = supabase
    .from('emergency_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (riskColor) {
    query = query.eq('risk_color', riskColor)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('[reports] Supabase fetch failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports', detail: error.message },
      { status: 500 },
    )
  }

  return NextResponse.json({ reports: data, count, limit, offset })
}
