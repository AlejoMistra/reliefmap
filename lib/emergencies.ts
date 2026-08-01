export type Priority = "critical" | "high" | "medium" | "low"
export type Status = "unassigned" | "dispatched" | "in-progress" | "resolved"

export interface Emergency {
  id: string
  title: string
  location: string
  description: string
  priority: Priority
  affectedPeople: number
  reportedAt: Date
  status: Status
}

export const EMERGENCIES: Emergency[] = [
  {
    id: "RPT-0041",
    title: "Colision Multiple de Vehiculos",
    location: "Autopista 12 y Calle Roble, Zona A3",
    description:
      "Analisis de IA indica un choque multiple de 4 vehiculos bloqueando dos carriles. Se reporta posible fuga de combustible. Al menos 3 personas con lesiones aparentes segun imagenes.",
    priority: "critical",
    affectedPeople: 11,
    reportedAt: new Date("2026-08-01T15:39:00Z"),
    status: "unassigned",
  },
  {
    id: "RPT-0039",
    title: "Incendio Estructural — Residencial",
    location: "Av. Los Pinos 48, Zona B1",
    description:
      "Modelo de IA detecta incendio activo en el segundo piso de una vivienda de dos plantas. La densidad de humo indica propagacion rapida. Se recomienda evacuar las unidades adyacentes.",
    priority: "critical",
    affectedPeople: 6,
    reportedAt: new Date("2026-08-01T15:36:00Z"),
    status: "dispatched",
  },
  {
    id: "RPT-0038",
    title: "Alerta de Inundacion Repentina",
    location: "Distrito Ribera, Zona C2",
    description:
      "El sensor del Rio Kern supero el umbral de 2.4m. El modelo de IA proyecta inundacion de zonas residenciales bajas en 45 minutos.",
    priority: "critical",
    affectedPeople: 340,
    reportedAt: new Date("2026-08-01T15:31:00Z"),
    status: "in-progress",
  },
  {
    id: "RPT-0037",
    title: "Fuga de Gas — Bloque Comercial",
    location: "Blvd. Comercio 200-220, Zona D4",
    description:
      "Red de sensores detecto concentracion de metano a 2.1 veces el umbral seguro. Clasificacion IA: alto riesgo, peligro potencial de ignicion. Se aconseja evacuar 100m a la redonda.",
    priority: "high",
    affectedPeople: 55,
    reportedAt: new Date("2026-08-01T15:25:00Z"),
    status: "unassigned",
  },
  {
    id: "RPT-0036",
    title: "Emergencia Medica — Paro Cardiaco",
    location: "Pabellon Parque Central, Zona B3",
    description:
      "Reporte de adulto masculino inconsciente, aproximadamente 60 anos. RCP por transeuntes en curso. DEA disponible en escena. Puntuacion de gravedad IA: 9.1/10.",
    priority: "high",
    affectedPeople: 1,
    reportedAt: new Date("2026-08-01T15:21:00Z"),
    status: "dispatched",
  },
  {
    id: "RPT-0035",
    title: "Cable Electrico Caido",
    location: "Calle Olmo y 4a Av., Zona A1",
    description:
      "Cable electrico derribado por tormenta. Modelo de IA confirma riesgo de corriente activa. Interrupcion del trafico en dos intersecciones. Sin victimas reportadas.",
    priority: "high",
    affectedPeople: 0,
    reportedAt: new Date("2026-08-01T15:08:00Z"),
    status: "in-progress",
  },
  {
    id: "RPT-0034",
    title: "Derrame de Materiales Peligrosos — Menor",
    location: "Lote Industrial C, Zona E2",
    description:
      "Sensores ambientales detectaron ruptura menor de contenedor quimico. Clasificacion IA: baja volatilidad, no aereo. Respuesta del equipo de contencion adecuada.",
    priority: "medium",
    affectedPeople: 4,
    reportedAt: new Date("2026-08-01T14:55:00Z"),
    status: "in-progress",
  },
  {
    id: "RPT-0033",
    title: "Fallo de Semaforos",
    location: "Interseccion Principal y 5a, Zona A2",
    description:
      "Fallo total de semaforos en interseccion de alto trafico. Se recomienda control manual o despliegue de agentes para prevenir incidentes secundarios.",
    priority: "medium",
    affectedPeople: 0,
    reportedAt: new Date("2026-08-01T14:48:00Z"),
    status: "unassigned",
  },
  {
    id: "RPT-0032",
    title: "Persona Desaparecida — Menor",
    location: "Centro Comercial Westfield, Zona B2",
    description:
      "Menor de aproximadamente 7 anos reportado desaparecido por su tutor. Visto por ultima vez cerca del area de comidas. Revision de CCTV iniciada.",
    priority: "medium",
    affectedPeople: 1,
    reportedAt: new Date("2026-08-01T14:41:00Z"),
    status: "dispatched",
  },
  {
    id: "RPT-0031",
    title: "Incidente Vehicular Menor",
    location: "Estacionamiento 9, Zona D1",
    description:
      "Colision leve sin lesionados. Ambos conductores presentes en el lugar. Reporte policial solicitado para tramite de seguro.",
    priority: "low",
    affectedPeople: 2,
    reportedAt: new Date("2026-08-01T14:13:00Z"),
    status: "resolved",
  },
]

export const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export const STATUS_LABELS: Record<Status, string> = {
  unassigned: "Sin Asignar",
  dispatched: "Despachado",
  "in-progress": "En Curso",
  resolved: "Resuelto",
}
