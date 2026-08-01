import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import type { ResourceInsert } from "@/lib/resources"

// GET /api/resources?type=policia&status=disponible&search=alfa
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type   = searchParams.get("type")
  const status = searchParams.get("status")
  const search = searchParams.get("search")

  const supabase = createServiceClient()

  let query = supabase
    .from("emergency_resources")
    .select("*")
    .order("type", { ascending: true })
    .order("name", { ascending: true })

  if (type)   query = query.eq("type", type)
  if (status) query = query.eq("status", status)
  if (search) query = query.ilike("name", `%${search}%`)

  const { data, error } = await query

  if (error) {
    console.error("[resources GET]", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ resources: data })
}

// POST /api/resources
export async function POST(request: NextRequest) {
  let body: ResourceInsert
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  if (!body.name?.trim() || !body.type || !body.zone?.trim()) {
    return NextResponse.json(
      { error: "name, type y zone son requeridos" },
      { status: 422 },
    )
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("emergency_resources")
    .insert({
      name:       body.name.trim(),
      type:       body.type,
      status:     body.status ?? "disponible",
      zone:       body.zone.trim(),
      radio_call: body.radio_call?.trim() || null,
      phone:      body.phone?.trim() || null,
      crew_count: body.crew_count ?? 1,
      notes:      body.notes?.trim() || null,
    })
    .select()
    .single()

  if (error) {
    console.error("[resources POST]", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ resource: data }, { status: 201 })
}
