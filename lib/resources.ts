export type ResourceType =
  | "policia"
  | "bomberos"
  | "ambulancia"
  | "defensa_civil"
  | "rescate"
  | "otro"

export type ResourceStatus =
  | "disponible"
  | "en_camino"
  | "en_escena"
  | "fuera_de_servicio"

export interface Resource {
  id: string
  name: string
  type: ResourceType
  status: ResourceStatus
  zone: string
  radio_call: string | null
  phone: string | null
  crew_count: number
  notes: string | null
  created_at: string
  updated_at: string
}

export type ResourceInsert = Omit<Resource, "id" | "created_at" | "updated_at">
export type ResourceUpdate = Partial<ResourceInsert>

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  policia:       "Policía",
  bomberos:      "Bomberos",
  ambulancia:    "Ambulancia",
  defensa_civil: "Defensa Civil",
  rescate:       "Rescate",
  otro:          "Otro",
}

export const RESOURCE_STATUS_LABELS: Record<ResourceStatus, string> = {
  disponible:        "Disponible",
  en_camino:         "En camino",
  en_escena:         "En escena",
  fuera_de_servicio: "Fuera de servicio",
}

export const RESOURCE_STATUS_COLORS: Record<ResourceStatus, string> = {
  disponible:        "text-em-low border-em-low/40 bg-em-low/10",
  en_camino:         "text-em-medium border-em-medium/40 bg-em-medium/10",
  en_escena:         "text-em-high border-em-high/40 bg-em-high/10",
  fuera_de_servicio: "text-muted-foreground border-border bg-muted/30",
}

export const RESOURCE_TYPE_COLORS: Record<ResourceType, string> = {
  policia:       "text-blue-400 border-blue-400/40 bg-blue-400/10",
  bomberos:      "text-em-high border-em-high/40 bg-em-high/10",
  ambulancia:    "text-em-critical border-em-critical/40 bg-em-critical/10",
  defensa_civil: "text-em-medium border-em-medium/40 bg-em-medium/10",
  rescate:       "text-purple-400 border-purple-400/40 bg-purple-400/10",
  otro:          "text-muted-foreground border-border bg-muted/20",
}

export const ZONES = [
  "Zona A1", "Zona A2", "Zona A3",
  "Zona B1", "Zona B2", "Zona B3",
  "Zona C1", "Zona C2", "Zona C3",
  "Zona D1", "Zona D2", "Zona D3", "Zona D4",
  "Zona E1", "Zona E2", "Zona E3",
]
