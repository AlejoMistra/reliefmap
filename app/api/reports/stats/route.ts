import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const revalidate = 0 // always fresh

export async function GET() {
  const supabase = createServiceClient()

  // Single query — aggregate on DB side, never fetches rows
  const { data, error } = await supabase.rpc('get_report_stats')

  if (error) {
    // Fallback: individual count queries if the RPC doesn't exist yet
    const [activeRes, criticalRes, orangeRes] = await Promise.all([
      supabase
        .from('emergency_reports')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase
        .from('emergency_reports')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('risk_color', 'RED'),
      supabase
        .from('emergency_reports')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('risk_color', 'ORANGE'),
    ])

    if (activeRes.error || criticalRes.error || orangeRes.error) {
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }

    return NextResponse.json({
      active:    activeRes.count   ?? 0,
      unassigned: activeRes.count  ?? 0, // all active = pending assignment
      critical:  criticalRes.count ?? 0,
      high:      orangeRes.count   ?? 0,
    })
  }

  return NextResponse.json(data)
}
