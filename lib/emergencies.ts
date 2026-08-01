export type Priority = "critical" | "high" | "medium" | "low" | "info"

export type TriageLevel = 1 | 2 | 3 | 4 | 5

export interface TriageInfo {
  level: TriageLevel
  label: string
  colorName: "ROJO" | "NARANJA" | "AMARILLO" | "VERDE" | "AZUL"
  badgeColor: string
  dotColor: string
  priority: Priority
}

export const TRIAGE_LEVELS: Record<TriageLevel, TriageInfo> = {
  1: {
    level: 1,
    label: "Nivel 1 - ROJO",
    colorName: "ROJO",
    badgeColor: "bg-red-500/15 text-red-500 border-red-500/30",
    dotColor: "#ef4444",
    priority: "critical",
  },
  2: {
    level: 2,
    label: "Nivel 2 - NARANJA",
    colorName: "NARANJA",
    badgeColor: "bg-orange-500/15 text-orange-500 border-orange-500/30",
    dotColor: "#f97316",
    priority: "high",
  },
  3: {
    level: 3,
    label: "Nivel 3 - AMARILLO",
    colorName: "AMARILLO",
    badgeColor: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    dotColor: "#eab308",
    priority: "medium",
  },
  4: {
    level: 4,
    label: "Nivel 4 - VERDE",
    colorName: "VERDE",
    badgeColor: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    dotColor: "#10b981",
    priority: "low",
  },
  5: {
    level: 5,
    label: "Nivel 5 - AZUL",
    colorName: "AZUL",
    badgeColor: "bg-sky-500/15 text-sky-500 border-sky-500/30",
    dotColor: "#0ea5e9",
    priority: "info",
  },
}

export type Status = "unassigned" | "dispatched" | "in-progress" | "resolved"

export interface Emergency {
  id: string
  informantName?: string
  title: string
  location: string
  description: string
  priority: Priority
  triageLevel: TriageLevel
  reason?: string
  affectedPeople: number
  reportedAt: Date
  status: Status
  formattedReport?: string
}

export const INITIAL_EMERGENCIES: Emergency[] = [
  {
    id: "RPT-0041",
    informantName: "Carlos Gómez (DNI 32.145.890)",
    title: "Colision Multiple de Vehiculos",
    location: "Autopista 12 y Calle Roble, Zona A3",
    description:
      "Choque múltiple de 4 vehículos bloqueando dos carriles. Fuga de combustible activa. 3 personas graves atrapadas.",
    priority: "critical",
    triageLevel: 1,
    reason: "Peligro vital inminente con múltiples víctimas graves y riesgo de incendio.",
    affectedPeople: 11,
    reportedAt: new Date("2026-08-01T15:39:00Z"),
    status: "unassigned",
  },
  {
    id: "RPT-0039",
    informantName: "María López",
    title: "Incendio Estructural — Residencial",
    location: "Av. Los Pinos 48, Zona B1",
    description:
      "Incendio activo en el segundo piso de vivienda de dos plantas. Humo denso y propagación rápida.",
    priority: "critical",
    triageLevel: 1,
    reason: "Fuego estructural activo con potencial atrapamiento de residentes.",
    affectedPeople: 6,
    reportedAt: new Date("2026-08-01T15:36:00Z"),
    status: "dispatched",
  },
  {
    id: "RPT-0038",
    informantName: "Defensa Civil",
    title: "Alerta de Inundacion Repentina",
    location: "Distrito Ribera, Zona C2",
    description:
      "Sensor del Río Kern superó el umbral crítico de 2.4m. Inundación inminente en zonas bajas.",
    priority: "high",
    triageLevel: 2,
    reason: "Riesgo severo para la población de la ribera a corto plazo.",
    affectedPeople: 340,
    reportedAt: new Date("2026-08-01T15:31:00Z"),
    status: "in-progress",
  },
  {
    id: "RPT-0037",
    informantName: "Vecino Anónimo",
    title: "Fuga de Gas — Bloque Comercial",
    location: "Blvd. Comercio 200-220, Zona D4",
    description:
      "Concentración de metano 2.1 veces sobre nivel seguro. Olor fuerte a gas en la vía pública.",
    priority: "high",
    triageLevel: 2,
    reason: "Riesgo de explosión en zona comercial con alta densidad peatonal.",
    affectedPeople: 55,
    reportedAt: new Date("2026-08-01T15:25:00Z"),
    status: "unassigned",
  },
  {
    id: "RPT-0036",
    informantName: "Transeúnte",
    title: "Emergencia Medica — Paro Cardiaco",
    location: "Pabellon Parque Central, Zona B3",
    description:
      "Masculino 60 años desvanecido sin pulso. RCP por transeúntes. DEA en camino.",
    priority: "critical",
    triageLevel: 1,
    reason: "Paro cardiorrespiratorio activo (emergencia médica vital).",
    affectedPeople: 1,
    reportedAt: new Date("2026-08-01T15:21:00Z"),
    status: "dispatched",
  },
  {
    id: "RPT-0035",
    informantName: "Esteban R.",
    title: "Cable Electrico Caido",
    location: "Calle Olmo y 4a Av., Zona A1",
    description:
      "Cable de alta tensión derribado por la tormenta con chispas en la vereda.",
    priority: "medium",
    triageLevel: 3,
    reason: "Riesgo eléctrico en vía pública sin lesionados de momento.",
    affectedPeople: 0,
    reportedAt: new Date("2026-08-01T15:08:00Z"),
    status: "in-progress",
  },
  {
    id: "RPT-0034",
    informantName: "Operador Industrial",
    title: "Derrame de Materiales Peligrosos",
    location: "Lote Industrial C, Zona E2",
    description:
      "Ruptura menor de contenedor químico no volátil. Área acordonada.",
    priority: "medium",
    triageLevel: 3,
    reason: "Derrame controlado de químicos en recinto industrial.",
    affectedPeople: 4,
    reportedAt: new Date("2026-08-01T14:55:00Z"),
    status: "in-progress",
  },
  {
    id: "RPT-0033",
    informantName: "Tránsito Municipal",
    title: "Fallo de Semaforos",
    location: "Interseccion Principal y 5a, Zona A2",
    description:
      "Semáforo apagado en intersección transitada. Tránsito lento.",
    priority: "low",
    triageLevel: 4,
    reason: "Problema de tránsito sin accidentes ni heridos.",
    affectedPeople: 0,
    reportedAt: new Date("2026-08-01T14:48:00Z"),
    status: "unassigned",
  },
  {
    id: "RPT-0032",
    informantName: "Lucía M.",
    title: "Persona Desaparecida — Menor",
    location: "Centro Comercial Westfield, Zona B2",
    description:
      "Niño de 7 años extraviado en patio de comidas. Seguridad alertada.",
    priority: "high",
    triageLevel: 2,
    reason: "Menor extraviado en lugar concurrido sin indicios de violencia.",
    affectedPeople: 1,
    reportedAt: new Date("2026-08-01T14:41:00Z"),
    status: "dispatched",
  },
  {
    id: "RPT-0031",
    informantName: "Conductor",
    title: "Incidente Vehicular Menor",
    location: "Estacionamiento 9, Zona D1",
    description:
      "Roze de espejos entre dos autos estacionados. Solo daños materiales.",
    priority: "info",
    triageLevel: 5,
    reason: "Sin lesionados ni peligro activo.",
    affectedPeople: 2,
    reportedAt: new Date("2026-08-01T14:13:00Z"),
    status: "resolved",
  },
]

export const EMERGENCIES = INITIAL_EMERGENCIES

export const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
}

export const STATUS_LABELS: Record<Status, string> = {
  unassigned: "Sin Asignar",
  dispatched: "Despachado",
  "in-progress": "En Curso",
  resolved: "Resuelto",
}
