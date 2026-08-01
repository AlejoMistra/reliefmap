import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import type { ResourceUpdate } from "@/lib/resources"

// PATCH /api/resources/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  let body: ResourceUpdate
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("emergency_resources")
    .update(body)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[resources PATCH]", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ resource: data })
}

// DELETE /api/resources/:id
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = createServiceClient()

  const { error } = await supabase
    .from("emergency_resources")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[resources DELETE]", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
