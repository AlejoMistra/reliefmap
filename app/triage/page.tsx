import { EmergencyReportCard } from "@/components/dashboard/EmergencyReportCard"

// ─── Sample payloads simulating the AI triage agent output ────────────────────
const SAMPLE_REPORTS = [
  `Full Name: María González / DNI 12345678
Description Title: Colapso de edificio residencial con personas atrapadas
Risk Classification: Level 1 - RED
Reason: Estructura de cinco pisos colapsada parcialmente tras sismo de 6.2. Se reportan al menos 12 personas atrapadas en los escombros con signos vitales confirmados.
Problem Location: Calle Libertad 482, Barrio San Martín, Buenos Aires
Number of People Affected: 47`,

  `Full Name: Carlos Ruiz / DNI 87654321
Description Title: Incendio forestal avanzando hacia zona urbana
Risk Classification: Level 2 - ORANGE
Reason: Incendio activo con vientos de 60 km/h desplazándose hacia el perímetro de la ciudad. Riesgo alto de extensión a viviendas.
Problem Location: Ruta 9 km 34, Área Periurbana Norte
Number of People Affected: 200`,

  `Full Name: Lucía Fernández / 98712340
Description Title: Inundación moderada en zona residencial
Risk Classification: Level 3 - YELLOW
Reason: Desborde del arroyo Maldonado por lluvias intensas. Calles anegadas hasta 40 cm. Sin víctimas confirmadas pero vías cortadas.
Problem Location: Av. Corrientes y Monroe, CABA
Number of People Affected: 85`,

  `Full Name: Jorge Méndez / DNI 11223344
Description Title: Fuga de gas en local comercial
Risk Classification: Level 4 - GREEN
Reason: Fuga menor en gasoducto interno del local. Área evacuada preventivamente. Empresa de gas en camino. Sin heridos.
Problem Location: Galería Belgrano, Local 14, Córdoba
Number of People Affected: 8`,

  `Full Name: Ana Torres / DNI 55667788
Description Title: Accidente vehicular con heridos leves
Risk Classification: Level 5 - BLUE
Reason: Colisión entre dos vehículos. Tres ocupantes con contusiones menores. Sin riesgo vital. Requiere asistencia médica básica y retiro de vehículos.
Problem Location: Intersección Av. San Juan y Boedo, CABA
Number of People Affected: 3`,
]

export default function TriageDemoPage() {
  return (
    <div className="min-h-screen bg-zinc-950 py-8 px-4 font-sans">
      <header className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            ReliefMap
          </span>
          <span className="text-zinc-700">/</span>
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Agente de Triaje IA
          </span>
        </div>
        <h1 className="text-xl font-bold text-zinc-100">
          Reportes de Emergencia
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Tarjetas generadas automáticamente a partir del payload del agente de triaje.
        </p>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {SAMPLE_REPORTS.map((payload, i) => (
          <EmergencyReportCard key={i} rawPayload={payload} />
        ))}
      </main>
    </div>
  )
}
