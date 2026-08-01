import { Map, MapPin } from "lucide-react"

const LEGEND = [
  { label: "Critico", colorClass: "bg-em-critical" },
  { label: "Alto", colorClass: "bg-em-high" },
  { label: "Medio", colorClass: "bg-em-medium" },
  { label: "Bajo", colorClass: "bg-em-low" },
]

// Mock pin positions (% from top-left)
const MOCK_PINS = [
  { x: 22, y: 30, priority: "critical" },
  { x: 45, y: 55, priority: "high" },
  { x: 65, y: 25, priority: "critical" },
  { x: 75, y: 65, priority: "medium" },
  { x: 35, y: 70, priority: "high" },
  { x: 55, y: 40, priority: "low" },
  { x: 15, y: 58, priority: "medium" },
  { x: 83, y: 45, priority: "critical" },
]

const PIN_COLORS: Record<string, string> = {
  critical: "text-em-critical",
  high: "text-em-high",
  medium: "text-em-medium",
  low: "text-em-low",
}

export function MapPanel() {
  return (
    <div className="flex h-full flex-col">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <Map className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">
            Mapa de Emergencias en Vivo
          </span>
        </div>
        <span className="rounded-full bg-em-critical/15 px-2 py-0.5 text-[10px] font-semibold text-em-critical uppercase tracking-wider">
          En Vivo
        </span>
      </div>

      {/* Map area */}
      <div className="relative flex-1 overflow-hidden bg-[oklch(0.18_0.01_240)]">
        {/* Grid overlay for map feel */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.6 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.6 0 0) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Mock road lines */}
        <svg className="absolute inset-0 h-full w-full opacity-15" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="40%" x2="100%" y2="40%" stroke="oklch(0.65 0 0)" strokeWidth="2" />
          <line x1="0" y1="70%" x2="100%" y2="68%" stroke="oklch(0.65 0 0)" strokeWidth="1.5" />
          <line x1="30%" y1="0" x2="28%" y2="100%" stroke="oklch(0.65 0 0)" strokeWidth="2" />
          <line x1="60%" y1="0" x2="62%" y2="100%" stroke="oklch(0.65 0 0)" strokeWidth="1.5" />
          <line x1="0" y1="20%" x2="30%" y2="40%" stroke="oklch(0.65 0 0)" strokeWidth="1" />
          <line x1="60%" y1="40%" x2="100%" y2="55%" stroke="oklch(0.65 0 0)" strokeWidth="1" />
        </svg>

        {/* Mock pins */}
        {MOCK_PINS.map((pin, i) => (
          <div
            key={i}
            className={`absolute -translate-x-1/2 -translate-y-full ${PIN_COLORS[pin.priority]}`}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          >
            <MapPin className="h-5 w-5 drop-shadow-md" fill="currentColor" />
          </div>
        ))}

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
          <Map className="h-10 w-10 text-muted-foreground opacity-20" />
          <p className="text-xs text-muted-foreground opacity-40 tracking-widest uppercase">
            Integracion de Mapa en Vivo
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 border-t border-border px-4 py-2">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          Prioridad
        </span>
        {LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${l.colorClass}`} />
            <span className="text-[11px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
