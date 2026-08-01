import { addEmergency, getEmergenciesContextForPrompt } from "./emergency-store"
import { Emergency, TriageLevel, TRIAGE_LEVELS } from "./emergencies"

export interface KapsoInputPayload {
  name_or_dni?: string
  informant_name?: string
  dni?: string
  location?: string
  description?: string
  affected_people?: number | string
}

export interface TriageResult {
  emergency: Emergency
  formattedReport: string
  triageLevel: TriageLevel
  colorName: string
  title: string
  reason: string
}

/**
 * Agente 2 — Procesamiento, Triaje y Generación de Reporte
 */
export async function processTriageAndGenerateReport(
  payload: KapsoInputPayload
): Promise<TriageResult> {
  // 1. Fase 1: Ingesta y consolidación de datos
  const rawInformant =
    payload.name_or_dni ||
    payload.informant_name ||
    (payload.dni ? `DNI ${payload.dni}` : "Informante Anónimo")

  const rawLocation = payload.location?.trim() || "Ubicación sin especificar"
  const rawDescription = payload.description?.trim() || "Emergencia sin descripción provista"

  let affectedCount = 0
  if (typeof payload.affected_people === "number") {
    affectedCount = payload.affected_people
  } else if (typeof payload.affected_people === "string") {
    const parsed = parseInt(payload.affected_people, 10)
    affectedCount = isNaN(parsed) ? 1 : parsed
  }

  // Obtenemos el contexto actual de la BD para la evaluación
  const activeContext = getEmergenciesContextForPrompt()

  // 2. Fase 2: Clasificación de Triaje (Motor Heurístico + Regla Conservadora Vital)
  const textLower = `${rawDescription} ${rawLocation}`.toLowerCase()

  let triageLevel: TriageLevel = 3 // Valor por defecto: Nivel 3 Amarillo
  let title = generateSyntheticTitle(rawDescription)
  let reason = "Evaluación de emergencia estándar."

  // REGLA CRÍTICA CONSERVADORA: Ante cualquier indicio de riesgo de muerte, inconsciencia o fallecidos -> Nivel 1 - ROJO
  const isLevel1Critical =
    /muert|falleci|inconscient|paro|respiratorio|cardiaco|atrapad|incendio grande|colapso|fuego activo|fuga de combustible|choque grave|sangrado masivo/i.test(
      textLower
    ) || (affectedCount >= 5 && /herid|victim|atrapad|inconscient/i.test(textLower))

  const isLevel4Green =
    /leve|menor|sin heridos|sin lesionados|semaforo|semáforo|transito|tránsito|daño material/i.test(textLower) &&
    affectedCount === 0 &&
    !/inconscient|muert|falleci|fuego|atrapad/i.test(textLower)

  const isLevel5Blue =
    /consulta|informe|no urgente|estacionamiento|espejo/i.test(textLower) && affectedCount <= 2

  const isLevel2Orange =
    /herid|grave|dolor severo|inestable|fuga de gas|inundacio|explosion|persona desaparecida|quimico|derrame/i.test(
      textLower
    ) || affectedCount >= 10

  if (isLevel1Critical) {
    triageLevel = 1
    reason =
      "Asignación Nivel 1 - ROJO: Indicio de riesgo vital inminente, personas inconscientes, atrapadas o heridos graves en masa."
  } else if (isLevel4Green) {
    triageLevel = 4
    reason =
      "Asignación Nivel 4 - VERDE: Incidente leve o fallo urbano sin personas afectadas directamente."
  } else if (isLevel5Blue) {
    triageLevel = 5
    reason =
      "Asignación Nivel 5 - AZUL: Consulta o incidente menor sin lesionados ni peligro activo."
  } else if (isLevel2Orange) {
    triageLevel = 2
    reason =
      "Asignación Nivel 2 - NARANJA: Muy urgente. Riesgo potencial grave o alto número de evacuados/afectados."
  } else {
    triageLevel = 3
    reason =
      "Asignación Nivel 3 - AMARILLO: Urgente. Situación estable sin riesgo de vida inminente."
  }

  // 3. Fase 3: Georreferenciación (Sin inventar coordenadas si no están presentes)
  const normalizedLocation = formatLocationString(rawLocation)

  // 4. Fase 4: Generación del Reporte Estructurado
  const triageMeta = TRIAGE_LEVELS[triageLevel]
  const formattedReport = `🚨 REPORTE DE EMERGENCIA

- Nombre y Apellido: ${rawInformant}
- Título de la Descripción: ${title}
- Categorización de Riesgo: ${triageMeta.label}
- Motivo: ${reason}
- Ubicación del Problema: ${normalizedLocation}
- Número de Afectados: ${affectedCount}`

  // 5. Fase 5: Publicación en el Dashboard / DB Store
  const createdEmergency = addEmergency({
    informantName: rawInformant,
    title,
    location: normalizedLocation,
    description: rawDescription,
    triageLevel,
    reason,
    affectedPeople: affectedCount,
    formattedReport,
  })

  return {
    emergency: createdEmergency,
    formattedReport,
    triageLevel,
    colorName: triageMeta.colorName,
    title,
    reason,
  }
}

/**
 * Genera un título sintético de máximo 7 palabras a partir de la descripción
 */
function generateSyntheticTitle(description: string): string {
  if (!description) return "Reporte de Emergencia"

  // Limpiar caracteres especiales
  const clean = description.replace(/[\n\r]/g, " ").trim()
  const words = clean.split(/\s+/)

  if (words.length <= 7) {
    // Capitalizar primera letra
    return clean.charAt(0).toUpperCase() + clean.slice(1)
  }

  return words.slice(0, 7).join(" ") + "..."
}

/**
 * Normaliza la ubicación preservando coordenadas expresas o texto format
 */
function formatLocationString(location: string): string {
  // Verificar si ya contiene formato de coordenadas (-XX.XXXX, -YY.YYYY)
  const coordRegex = /(-?\d+\.\d+),\s*(-?\d+\.\d+)/
  const match = location.match(coordRegex)

  if (match) {
    return `${location.trim()}`
  }

  return location.trim()
}
