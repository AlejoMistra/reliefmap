import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { Agent1Payload } from "@/lib/triage/schema"
import {
  classifyEmergency,
  buildZoneKey,
  buildSituationSummary,
  applyEscalation,
} from "@/lib/triage/processor"
import { createServiceClient } from "@/lib/supabase/server"
import type { EmergencyReport } from "@/lib/triage/schema"

export const maxDuration = 60

// ── Kapso payload shape ───────────────────────────────────────────────────────
interface KapsoPayload {
  execution_context?: {
    vars?: {
      dni?: string | null
      location?: string | null
      emergency_type?: string | null
      people_count?: string | number | null
      report_id?: string | null
      dispatch_count?: number | null
    }
    context?: {
      conversation_id?: string | null
      phone_number?: string | null
      contact?: { profile_name?: string | null }
    }
    system?: {
      flow_id?: string | null
      started_at?: string | null
      trigger_type?: string | null
    }
  }
}

// ── Translate Kapso → Agent1Payload ──────────────────────────────────────────
function translateKapsoPayload(body: KapsoPayload): Agent1Payload {
  const vars = body.execution_context?.vars ?? {}
  const ctx  = body.execution_context?.context ?? {}

  const dni = vars.dni ?? ctx.phone_number ?? "DNI no provisto"

  const location = vars.location ?? "Ubicación no especificada"

  // Build a rich description from emergency_type + any available context
  const callerName = ctx.contact?.profile_name ?? "Informante"
  const emergencyType = vars.emergency_type ?? "Emergencia sin clasificar"
  const description = `${emergencyType} reportado por ${callerName}.`

  // people_count comes as a string from WhatsApp vars
  const raw = vars.people_count
  const people_affected =
    typeof raw === "number"
      ? raw
      : typeof raw === "string" && raw.trim() !== ""
      ? parseInt(raw, 10) || 0
      : 0

  const full_name = ctx.contact?.profile_name ?? undefined
  const raw_transcript = ctx.conversation_id
    ? `Conversación Kapso ID: ${ctx.conversation_id}`
    : undefined

  return Agent1Payload.parse({
    dni,
    description,
    people_affected,
    location_text: location,
    full_name,
    raw_transcript,
  })
}

export async function POST(request: NextRequest) {
  // ── 0. Shared-secret auth ─────────────────────────────────────────────────
  const expectedSecret = process.env.KAPSO_API_SECRET
  if (expectedSecret) {
    const authHeader = request.headers.get("authorization") ?? ""
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : ""
    if (token !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  // ── 1. Parse body ─────────────────────────────────────────────────────────
  let body: KapsoPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  // ── 2. Translate Kapso → Agent1Payload ────────────────────────────────────
  let payload: Agent1Payload
  try {
    payload = translateKapsoPayload(body)
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: "Payload translation failed", issues: err.issues },
        { status: 422 },
      )
    }
    return NextResponse.json({ error: "Payload translation failed" }, { status: 422 })
  }

  const supabase = createServiceClient()
  const zoneKey = buildZoneKey(payload.location_text)

  // ── 3. Deduplication ──────────────────────────────────────────────────────
  const windowStart = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

  const { data: existing, error: lookupError } = await supabase
    .from("emergency_reports")
    .select("*")
    .eq("zone_key", zoneKey)
    .eq("is_active", true)
    .gte("created_at", windowStart)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (lookupError) {
    console.error("[kapso/webhook] Zone lookup failed:", lookupError)
    return NextResponse.json(
      { error: "Zone lookup failed", detail: lookupError.message },
      { status: 500 },
    )
  }

  // ── 4a. MERGE ─────────────────────────────────────────────────────────────
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
      .from("emergency_reports")
      .update({
        risk_level:        newLevel,
        risk_color:        newColor,
        report_count:      newCount,
        people_affected:   newPeopleAffected,
        situation_summary: situationSummary,
        processed_at:      new Date().toISOString(),
      })
      .eq("id", existingReport.id)
      .select()
      .single()

    if (updateError) {
      console.error("[kapso/webhook] Merge update failed:", updateError)
      return NextResponse.json(
        { error: "Failed to merge event", detail: updateError.message },
        { status: 500 },
      )
    }

    const vars = body.execution_context?.vars ?? {}
    const ctx  = body.execution_context?.context ?? {}
    const reportId = vars.report_id ?? ctx.conversation_id ?? merged.id

    return NextResponse.json(
      {
        success: true,
        action: "merged",
        dispatch_id: `DISPATCH-${String(reportId).substring(0, 8)}`,
        report_id: reportId,
        message: "Report updated successfully",
        report: merged,
        vars: {
          dispatch_id: `DISPATCH-${String(reportId).substring(0, 8)}`,
          report_id: reportId,
          dispatch_confirmed: true,
          dispatch_count: (vars.dispatch_count ?? 0) + 1,
        },
      },
      { status: 200 },
    )
  }

  // ── 4b. NEW EVENT ─────────────────────────────────────────────────────────
  let classification: Awaited<ReturnType<typeof classifyEmergency>>
  try {
    classification = await classifyEmergency(payload)
  } catch (err) {
    console.error("[kapso/webhook] AI classification failed:", err)
    const message = String(err)
    const isBillingError =
      message.includes("credit card") || message.includes("customer_verification_required")
    return NextResponse.json(
      {
        error: isBillingError
          ? "AI Gateway requires a credit card on file."
          : "AI triage classification failed",
        detail: message,
      },
      { status: 502 },
    )
  }

  const { output, modelUsed } = classification

  const newEvent = {
    dni:             payload.dni,
    people_affected: payload.people_affected,
    location_text:   payload.location_text,
    full_name:       payload.full_name      ?? null,
    raw_transcript:  payload.raw_transcript ?? null,
    latitude:        payload.latitude       ?? null,
    longitude:       payload.longitude      ?? null,
    title:           output.title,
    risk_level:      output.risk_level,
    risk_color:      output.risk_color,
    reason:          output.reason,
    model_used:      modelUsed,
    processed_at:    new Date().toISOString(),
    zone_key:        zoneKey,
    report_count:    1,
    is_active:       true,
    situation_summary: null as string | null,
  }

  newEvent.situation_summary = buildSituationSummary(newEvent)

  const { data, error: insertError } = await supabase
    .from("emergency_reports")
    .insert(newEvent)
    .select()
    .single()

  if (insertError) {
    console.error("[kapso/webhook] Supabase insert failed:", insertError)
    return NextResponse.json(
      { error: "Failed to persist report", detail: insertError.message },
      { status: 500 },
    )
  }

  const vars = body.execution_context?.vars ?? {}
  const ctx  = body.execution_context?.context ?? {}
  const reportId = vars.report_id ?? ctx.conversation_id ?? data.id

  return NextResponse.json(
    {
      success: true,
      action: "created",
      dispatch_id: `DISPATCH-${String(reportId).substring(0, 8)}`,
      report_id: reportId,
      message: "Emergency dispatched to central system",
      report: data,
      vars: {
        dispatch_id: `DISPATCH-${String(reportId).substring(0, 8)}`,
        report_id: reportId,
        dispatch_confirmed: true,
        dispatch_count: 1,
      },
    },
    { status: 201 },
  )
}

export async function GET() {
  return NextResponse.json({
    name: "ReliefMap Kapso Webhook API",
    status: "active",
    version: "2.0",
    usage: "POST with Kapso execution_context payload",
    auth: "Bearer <KAPSO_API_SECRET>",
    payload_example: {
      execution_context: {
        vars: { dni: "12345678", location: "Av. Corrientes 1234", emergency_type: "incendio", people_count: "3" },
        context: { conversation_id: "conv_abc123", phone_number: "+5491100000000", contact: { profile_name: "Juan" } },
        system: { flow_id: "flow_001", started_at: new Date().toISOString(), trigger_type: "whatsapp" },
      },
    },
  })
}
