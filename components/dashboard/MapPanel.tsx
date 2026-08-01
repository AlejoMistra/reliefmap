import { Map, MapPin } from "lucide-react"

const LEGEND = [
  { label: "N1 Rojo", colorClass: "bg-red-500" },
  { label: "N2 Naranja", colorClass: "bg-orange-500" },
  { label: "N3 Amarillo", colorClass: "bg-amber-500" },
  { label: "N4 Verde", colorClass: "bg-emerald-500" },
  { label: "N5 Azul", colorClass: "bg-sky-500" },
]

// Mock pin positions (% from top-left)
const MOCK_PINS = [
  { x: 22, y: 30, color: "text-red-500" },
  { x: 45, y: 55, color: "text-orange-500" },
  { x: 65, y: 25, color: "text-red-500" },
  { x: 75, y: 65, color: "text-amber-500" },
  { x: 35, y: 70, color: "text-orange-500" },
  { x: 55, y: 40, color: "text-emerald-500" },
  { x: 15, y: 58, color: "text-sky-500" },
  { x: 83, y: 45, color: "text-red-500" },
]

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
        <span className="rounded-full bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
          En Vivo (Georreferenciado)
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
            className={`absolute -translate-x-1/2 -translate-y-full ${pin.color}`}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          >
            <MapPin className="h-5 w-5 drop-shadow-md" fill="currentColor" />
          </div>
        ))}

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
          <Map className="h-10 w-10 text-muted-foreground opacity-20" />
          <p className="text-xs text-muted-foreground opacity-40 tracking-widest uppercase">
            Georreferenciación Agente 2 — Triaje 5 Niveles
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 border-t border-border px-4 py-2 flex-wrap">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
          Triaje:
        </span>
        {LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${l.colorClass}`} />
            <span className="text-[11px] text-muted-foreground font-medium">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
