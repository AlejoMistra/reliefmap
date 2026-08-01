import { NextResponse } from "next/server"
import { getActiveEmergencies } from "@/lib/emergency-store"
import { processTriageAndGenerateReport } from "@/lib/triage-engine"

export async function GET() {
  const emergencies = getActiveEmergencies()
  return NextResponse.json({
    count: emergencies.length,
    emergencies,
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = await processTriageAndGenerateReport(body)
    return NextResponse.json({
      success: true,
      emergency: result.emergency,
      formattedReport: result.formattedReport,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
