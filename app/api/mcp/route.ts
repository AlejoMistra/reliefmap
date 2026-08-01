import { NextResponse } from "next/server"
import { processTriageAndGenerateReport } from "@/lib/triage-engine"
import { getActiveEmergencies } from "@/lib/emergency-store"

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const { jsonrpc, id, method, params } = json

    if (jsonrpc !== "2.0") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id: id || null,
        error: { code: -32600, message: "Invalid Request: jsonrpc must be '2.0'" },
      })
    }

    // 1. Manejo de herramientas (tools/list)
    if (method === "tools/list") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          tools: [
            {
              name: "triage_emergency",
              description:
                "Agente 2: Evalúa, clasifica en 5 niveles de triaje y genera un reporte de emergencia estructurado para ReliefMap.",
              inputSchema: {
                type: "object",
                properties: {
                  name_or_dni: {
                    type: "string",
                    description: "Nombre completo y/o DNI del informante",
                  },
                  location: {
                    type: "string",
                    description: "Ubicación en texto o coordenadas GPS (lat, long)",
                  },
                  description: {
                    type: "string",
                    description: "Descripción detallada de la emergencia recolectada",
                  },
                  affected_people: {
                    type: "number",
                    description: "Cantidad estimada o exacta de afectados/heridos/víctimas",
                  },
                },
                required: ["description"],
              },
            },
          ],
        },
      })
    }

    // 2. Ejecución de herramientas (tools/call)
    if (method === "tools/call") {
      const toolName = params?.name
      const args = params?.arguments || {}

      if (toolName === "triage_emergency") {
        const triageResult = await processTriageAndGenerateReport(args)

        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: triageResult.formattedReport,
              },
            ],
            structured: {
              emergencyId: triageResult.emergency.id,
              triageLevel: triageResult.triageLevel,
              color: triageResult.colorName,
              reason: triageResult.reason,
            },
          },
        })
      }

      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Tool not found: ${toolName}` },
      })
    }

    // 3. Recursos de contexto (resources/list)
    if (method === "resources/list") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          resources: [
            {
              uri: "emergencies://active",
              name: "Reportes de Emergencia Activos",
              description: "Lista completa de emergencias registradas en tiempo real en ReliefMap",
              mimeType: "application/json",
            },
          ],
        },
      })
    }

    // 4. Lectura de recurso (resources/read)
    if (method === "resources/read") {
      const uri = params?.uri
      if (uri === "emergencies://active") {
        const active = getActiveEmergencies()
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            contents: [
              {
                uri: "emergencies://active",
                mimeType: "application/json",
                text: JSON.stringify(active, null, 2),
              },
            ],
          },
        })
      }
    }

    // Método no soportado
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Method not found: ${method}` },
    })
  } catch (err: any) {
    return NextResponse.json({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32603, message: "Internal error", data: err?.message },
    })
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    server: "ReliefMap Agent 2 MCP Server",
    version: "1.0.0",
    protocol: "JSON-RPC 2.0 (Model Context Protocol)",
  })
}
