import { NextRequest, NextResponse } from 'next/server'
import { processTranscript } from '@/lib/triage/processor'
import { createServiceClient } from '@/lib/supabase/server'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { transcript } = body as { transcript?: string }

  if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
    return NextResponse.json(
      { error: 'Missing or empty "transcript" field' },
      { status: 422 },
    )
  }

  // --- AI triage processing ---
  let triageResult: Awaited<ReturnType<typeof processTranscript>>
  try {
    triageResult = await processTranscript(transcript.trim())
  } catch (err) {
    console.error('[triage] AI processing failed:', err)
    return NextResponse.json(
      { error: 'AI triage processing failed', detail: String(err) },
      { status: 502 },
    )
  }

  const { output, modelUsed } = triageResult

  // --- Persist to Supabase ---
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('emergency_reports')
    .insert({
      raw_transcript: transcript.trim(),
      full_name: output.full_name,
      dni: output.dni,
      title: output.title,
      risk_level: output.risk_level,
      risk_color: output.risk_color,
      reason: output.reason,
      location_text: output.location_text,
      latitude: output.latitude,
      longitude: output.longitude,
      people_affected: output.people_affected,
      model_used: modelUsed,
      processed_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('[triage] Supabase insert failed:', error)
    return NextResponse.json(
      { error: 'Failed to persist report', detail: error.message },
      { status: 500 },
    )
  }

  return NextResponse.json({ report: data }, { status: 201 })
}
