import { NextResponse } from "next/server"
import { processTriageAndGenerateReport } from "@/lib/triage-engine"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Payload inválido. Se requiere un objeto JSON con los datos recolectados por Kapso (Agente 1)." },
        { status: 400 }
      )
    }

    // Normalizar nombres de campos entre la especificación de Kapso y el schema de la BD
    const normalizedPayload = {
      dni: body.dni || body.name_or_dni || body.informant_name || "DNI Sin Especificar",
      name_or_dni: body.name_or_dni || body.informant_name || body.dni || "Informante Kapso",
      description: body.description || body.raw_transcript || "Sin descripción",
      location: body.location || body.location_text || "Ubicación sin especificar",
      location_text: body.location_text || body.location || "Ubicación sin especificar",
      affected_people: body.affected_people ?? body.people_affected ?? 0,
      people_affected: body.people_affected ?? body.affected_people ?? 0,
    }

    // Ejecución del Agente 2
    const result = await processTriageAndGenerateReport(normalizedPayload)

    return NextResponse.json({
      status: "success",
      action: "created",
      message: "Reporte procesado por Agente 2 y publicado exitosamente",
      report_text: result.formattedReport,
      report: {
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
    name: "ReliefMap Kapso Webhook API",
    status: "active",
    usage: "POST { name_or_dni / dni, location / location_text, description, affected_people / people_affected }",
  })
}
