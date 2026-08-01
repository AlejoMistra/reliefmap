import { Emergency, INITIAL_EMERGENCIES, TriageLevel, TRIAGE_LEVELS } from "./emergencies"

// Global in-memory cache to maintain state across API invocations in Next.js runtime
const globalForEmergencies = globalThis as unknown as {
  emergencyStore?: Emergency[]
}

if (!globalForEmergencies.emergencyStore) {
  globalForEmergencies.emergencyStore = [...INITIAL_EMERGENCIES]
}

export const getActiveEmergencies = (): Emergency[] => {
  return globalForEmergencies.emergencyStore || INITIAL_EMERGENCIES
}

export interface CreateEmergencyInput {
  informantName?: string
  title: string
  location: string
  description: string
  triageLevel: TriageLevel
  reason: string
  affectedPeople: number
  formattedReport?: string
}

export const addEmergency = (input: CreateEmergencyInput): Emergency => {
  const current = getActiveEmergencies()
  const nextIdNum = current.length + 42
  const id = `RPT-${String(nextIdNum).padStart(4, "0")}`

  const triageMeta = TRIAGE_LEVELS[input.triageLevel] || TRIAGE_LEVELS[3]

  const newEmergency: Emergency = {
    id,
    informantName: input.informantName || "Informante Kapso",
    title: input.title,
    location: input.location,
    description: input.description,
    triageLevel: input.triageLevel,
    priority: triageMeta.priority,
    reason: input.reason,
    affectedPeople: input.affectedPeople,
    reportedAt: new Date(),
    status: "unassigned",
    formattedReport: input.formattedReport,
  }

  // Prepend to display latest emergency first
  globalForEmergencies.emergencyStore = [newEmergency, ...current]

  return newEmergency
}

export const getEmergenciesContextForPrompt = (): string => {
  const emergencies = getActiveEmergencies().slice(0, 5) // top 5 most urgent/recent
  if (emergencies.length === 0) return "No hay reportes previos registrados."

  return emergencies
    .map(
      (e) =>
        `- [ID: ${e.id}] ${e.title} | Nivel: ${e.triageLevel} | Ubicación: ${e.location} | Afectados: ${e.affectedPeople} | Estado: ${e.status}`
    )
    .join("\n")
}
