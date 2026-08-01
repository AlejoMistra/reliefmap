import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Agent1Payload } from '@/lib/triage/schema'
import { classifyEmergency } from '@/lib/triage/processor'
import { createServiceClient } from '@/lib/supabase/server'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  // --- Parse body ---
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // --- Validate against Agent1Payload schema ---
  let payload: Agent1Payload
  try {
    payload = Agent1Payload.parse(body)
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid payload from Agent 1', issues: err.issues },
        { status: 422 },
      )
    }
    return NextResponse.json({ error: 'Payload validation failed' }, { status: 422 })
  }

  // --- AI risk classification (Agent 2) ---
  let classification: Awaited<ReturnType<typeof classifyEmergency>>
  try {
    classification = await classifyEmergency(payload)
  } catch (err) {
    console.error('[triage] AI classification failed:', err)
    return NextResponse.json(
      { error: 'AI triage classification failed', detail: String(err) },
      { status: 502 },
    )
  }

  const { output, modelUsed } = classification

  // --- Merge Agent 1 fields + AI output and persist ---
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('emergency_reports')
    .insert({
      // Agent 1 — required fields
      dni:             payload.dni,
      people_affected: payload.people_affected,
      location_text:   payload.location_text,
      // Agent 1 — optional supplementary
      full_name:       payload.full_name       ?? null,
      raw_transcript:  payload.raw_transcript  ?? null,
      latitude:        payload.latitude        ?? null,
      longitude:       payload.longitude       ?? null,
      // Agent 2 — AI-generated classification
      title:           output.title,
      risk_level:      output.risk_level,
      risk_color:      output.risk_color,
      reason:          output.reason,
      // Metadata
      model_used:      modelUsed,
      processed_at:    new Date().toISOString(),
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
