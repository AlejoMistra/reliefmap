import { NextResponse } from "next/server"
import { processTriageAndGenerateReport } from "@/lib/triage-engine"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validar payload básico
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Payload inválido. Se requiere un objeto JSON con los datos recolectados." },
        { status: 400 }
      )
    }

    // Ejecución del Agente 2
    const result = await processTriageAndGenerateReport(body)

    return NextResponse.json({
      status: "success",
      message: "Reporte procesado, clasificado y publicado exitosamente en el dashboard",
      report_text: result.formattedReport,
      data: {
        id: result.emergency.id,
        informantName: result.emergency.informantName,
        title: result.title,
        triageLevel: result.triageLevel,
        color: result.colorName,
        reason: result.reason,
        location: result.emergency.location,
        affectedPeople: result.emergency.affectedPeople,
        reportedAt: result.emergency.reportedAt,
      },
    })
  } catch (error: any) {
    console.error("Error en Kapso Webhook:", error)
    return NextResponse.json(
      {
        error: "Error interno al procesar el triaje de la emergencia",
        details: error?.message || String(error),
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    name: "Kapso Triage Webhook Agent 2 API",
    status: "active",
    usage: "Envía una solicitud POST con { name_or_dni, location, description, affected_people }",
  })
}
