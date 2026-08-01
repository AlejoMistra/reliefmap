import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Agent1Payload } from '@/lib/triage/schema'
import {
  classifyEmergency,
  buildZoneKey,
  buildSituationSummary,
  applyEscalation,
} from '@/lib/triage/processor'
import { createServiceClient } from '@/lib/supabase/server'
import type { EmergencyReport } from '@/lib/triage/schema'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  // ── 1. Parse body ──────────────────────────────────────────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // ── 2. Validate against Agent1Payload ─────────────────────────────────────
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

  const supabase = createServiceClient()
  const zoneKey = buildZoneKey(payload.location_text)

  // ── 3. Deduplication — look for an active event in the same zone ───────────
  // Window: last 2 hours, same zone_key, is_active = true
  const windowStart = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

  const { data: existing, error: lookupError } = await supabase
    .from('emergency_reports')
    .select('*')
    .eq('zone_key', zoneKey)
    .eq('is_active', true)
    .gte('created_at', windowStart)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (lookupError) {
    console.error('[triage] Zone lookup failed:', lookupError)
    return NextResponse.json(
      { error: 'Zone lookup failed', detail: lookupError.message },
      { status: 500 },
    )
  }

  // ── 4a. MERGE — duplicate detected in same zone ────────────────────────────
  if (existing) {
    const existingReport = existing as EmergencyReport
    const { risk_level: newLevel, risk_color: newColor } = applyEscalation(existingReport)
    const newCount = existingReport.report_count + 1
    const newPeopleAffected = existingReport.people_affected + payload.people_affected

    const updatedEvent = {
      ...existingReport,
      risk_level:      newLevel,
      risk_color:      newColor,
      report_count:    newCount,
      people_affected: newPeopleAffected,
      processed_at:    new Date().toISOString(),
    }

    const situationSummary = buildSituationSummary(updatedEvent)

    const { data: merged, error: updateError } = await supabase
      .from('emergency_reports')
      .update({
        risk_level:        newLevel,
        risk_color:        newColor,
        report_count:      newCount,
        people_affected:   newPeopleAffected,
        situation_summary: situationSummary,
        processed_at:      new Date().toISOString(),
      })
      .eq('id', existingReport.id)
      .select()
      .single()

    if (updateError) {
      console.error('[triage] Merge update failed:', updateError)
      return NextResponse.json(
        { error: 'Failed to merge event', detail: updateError.message },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { report: merged, action: 'merged', previous_count: existingReport.report_count },
      { status: 200 },
    )
  }

  // ── 4b. NEW EVENT — no active duplicate found ──────────────────────────────
  let classification: Awaited<ReturnType<typeof classifyEmergency>>
  try {
    classification = await classifyEmergency(payload)
  } catch (err) {
    console.error('[triage] AI classification failed:', err)
    const message = String(err)
    const isBillingError =
      message.includes('credit card') || message.includes('customer_verification_required')
    return NextResponse.json(
      {
        error: isBillingError
          ? 'AI Gateway requires a credit card on file. Visit https://vercel.com/account/billing to add one and unlock free credits.'
          : 'AI triage classification failed',
        detail: message,
      },
      { status: 502 },
    )
  }

  const { output, modelUsed } = classification

  const newEvent = {
    // Agent 1 — required
    dni:             payload.dni,
    people_affected: payload.people_affected,
    location_text:   payload.location_text,
    // Agent 1 — optional supplementary
    full_name:       payload.full_name      ?? null,
    raw_transcript:  payload.raw_transcript ?? null,
    latitude:        payload.latitude       ?? null,
    longitude:       payload.longitude      ?? null,
    // AI classification
    title:           output.title,
    risk_level:      output.risk_level,
    risk_color:      output.risk_color,
    reason:          output.reason,
    model_used:      modelUsed,
    processed_at:    new Date().toISOString(),
    // Event aggregation
    zone_key:        zoneKey,
    report_count:    1,
    is_active:       true,
    situation_summary: null as string | null,
  }

  // Build situation_summary now that we have the full event shape
  newEvent.situation_summary = buildSituationSummary(newEvent)

  const { data, error: insertError } = await supabase
    .from('emergency_reports')
    .insert(newEvent)
    .select()
    .single()

  if (insertError) {
    console.error('[triage] Supabase insert failed:', insertError)
    return NextResponse.json(
      { error: 'Failed to persist report', detail: insertError.message },
      { status: 500 },
    )
  }

  return NextResponse.json({ report: data, action: 'created' }, { status: 201 })
}
